import { Injectable, Logger } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { MessageWorkspaceEntity } from 'src/modules/messaging/standard-objects/message.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageRepository } from 'src/modules/messaging/repositories/message.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageThreadService } from 'src/modules/messaging/services/message-thread/message-thread.service';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-thread.workspace-entity';
import { MessageThreadRepository } from 'src/modules/messaging/repositories/message-thread.repository';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(MessageWorkspaceEntity)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectObjectMetadataRepository(MessageThreadWorkspaceEntity)
    private readonly messageThreadRepository: MessageThreadRepository,
    private readonly messageThreadService: MessageThreadService,
  ) {}

  public async saveMessagesWithinTransaction(
    messages: GmailMessage[],
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    gmailMessageChannelId: string,
    workspaceId: string,
    transactionManager: EntityManager,
  ): Promise<Map<string, string>> {
    const messageExternalIdsAndIdsMap = new Map<string, string>();

    for (const message of messages) {
      const existingMessageChannelMessageAssociationsCount =
        await this.messageChannelMessageAssociationRepository.countByMessageExternalIdsAndMessageChannelId(
          [message.externalId],
          gmailMessageChannelId,
          workspaceId,
          transactionManager,
        );

      if (existingMessageChannelMessageAssociationsCount > 0) {
        continue;
      }

      // TODO: This does not handle all thread merging use cases and might create orphan threads.
      const savedOrExistingMessageThreadId =
        await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
          message.headerMessageId,
          message.messageThreadExternalId,
          workspaceId,
          transactionManager,
        );

      const savedOrExistingMessageId =
        await this.saveMessageOrReturnExistingMessage(
          message,
          savedOrExistingMessageThreadId,
          connectedAccount,
          workspaceId,
          transactionManager,
        );

      messageExternalIdsAndIdsMap.set(
        message.externalId,
        savedOrExistingMessageId,
      );

      await this.messageChannelMessageAssociationRepository.insert(
        gmailMessageChannelId,
        savedOrExistingMessageId,
        message.externalId,
        savedOrExistingMessageThreadId,
        message.messageThreadExternalId,
        workspaceId,
        transactionManager,
      );
    }

    return messageExternalIdsAndIdsMap;
  }

  public async saveMessages(
    messages: GmailMessage[],
    workspaceDataSource: DataSource,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    gmailMessageChannelId: string,
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const messageExternalIdsAndIdsMap = new Map<string, string>();

    try {
      let keepImporting = true;

      for (const message of messages) {
        if (!keepImporting) {
          break;
        }

        await workspaceDataSource?.transaction(
          async (manager: EntityManager) => {
            const gmailMessageChannel =
              await this.messageChannelRepository.getByIds(
                [gmailMessageChannelId],
                workspaceId,
                manager,
              );

            if (gmailMessageChannel.length === 0) {
              this.logger.error(
                `No message channel found for connected account ${connectedAccount.id} in workspace ${workspaceId} in saveMessages`,
              );

              keepImporting = false;

              return;
            }

            const existingMessageChannelMessageAssociationsCount =
              await this.messageChannelMessageAssociationRepository.countByMessageExternalIdsAndMessageChannelId(
                [message.externalId],
                gmailMessageChannelId,
                workspaceId,
                manager,
              );

            if (existingMessageChannelMessageAssociationsCount > 0) {
              return;
            }

            // TODO: This does not handle all thread merging use cases and might create orphan threads.
            const savedOrExistingMessageThreadId =
              await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
                message.headerMessageId,
                message.messageThreadExternalId,
                workspaceId,
                manager,
              );

            const savedOrExistingMessageId =
              await this.saveMessageOrReturnExistingMessage(
                message,
                savedOrExistingMessageThreadId,
                connectedAccount,
                workspaceId,
                manager,
              );

            messageExternalIdsAndIdsMap.set(
              message.externalId,
              savedOrExistingMessageId,
            );

            await this.messageChannelMessageAssociationRepository.insert(
              gmailMessageChannelId,
              savedOrExistingMessageId,
              message.externalId,
              savedOrExistingMessageThreadId,
              message.messageThreadExternalId,
              workspaceId,
              manager,
            );
          },
        );
      }
    } catch (error) {
      throw new Error(
        `Error saving connected account ${connectedAccount.id} messages to workspace ${workspaceId}: ${error.message}`,
      );
    }

    return messageExternalIdsAndIdsMap;
  }

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessage =
      await this.messageRepository.getFirstOrNullByHeaderMessageId(
        message.headerMessageId,
        workspaceId,
      );
    const existingMessageId = existingMessage?.id;

    if (existingMessageId) {
      return Promise.resolve(existingMessageId);
    }

    const newMessageId = v4();

    const messageDirection =
      connectedAccount.handle === message.fromHandle ? 'outgoing' : 'incoming';

    const receivedAt = new Date(parseInt(message.internalDate));

    await this.messageRepository.insert(
      newMessageId,
      message.headerMessageId,
      message.subject,
      receivedAt,
      messageDirection,
      messageThreadId,
      message.text,
      workspaceId,
      manager,
    );

    return Promise.resolve(newMessageId);
  }

  public async deleteMessages(
    messagesDeletedMessageExternalIds: string[],
    gmailMessageChannelId: string,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource?.transaction(async (manager: EntityManager) => {
      const messageChannelMessageAssociationsToDelete =
        await this.messageChannelMessageAssociationRepository.getByMessageExternalIdsAndMessageChannelId(
          messagesDeletedMessageExternalIds,
          gmailMessageChannelId,
          workspaceId,
          manager,
        );

      const messageChannelMessageAssociationIdsToDeleteIds =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.id,
        );

      await this.messageChannelMessageAssociationRepository.deleteByIds(
        messageChannelMessageAssociationIdsToDeleteIds,
        workspaceId,
        manager,
      );

      const messageIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageId,
        );

      const messageChannelMessageAssociationByMessageIds =
        await this.messageChannelMessageAssociationRepository.getByMessageIds(
          messageIdsFromMessageChannelMessageAssociationsToDelete,
          workspaceId,
          manager,
        );

      const messageIdsFromMessageChannelMessageAssociationByMessageIds =
        messageChannelMessageAssociationByMessageIds.map(
          (messageChannelMessageAssociation) =>
            messageChannelMessageAssociation.messageId,
        );

      const messageIdsToDelete =
        messageIdsFromMessageChannelMessageAssociationsToDelete.filter(
          (messageId) =>
            !messageIdsFromMessageChannelMessageAssociationByMessageIds.includes(
              messageId,
            ),
        );

      await this.messageRepository.deleteByIds(
        messageIdsToDelete,
        workspaceId,
        manager,
      );

      const messageThreadIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageThreadId,
        );

      const messagesByThreadIds =
        await this.messageRepository.getByMessageThreadIds(
          messageThreadIdsFromMessageChannelMessageAssociationsToDelete,
          workspaceId,
          manager,
        );

      const threadIdsToDelete =
        messageThreadIdsFromMessageChannelMessageAssociationsToDelete.filter(
          (threadId) =>
            !messagesByThreadIds.find(
              (message) => message.messageThreadId === threadId,
            ),
        );

      await this.messageThreadRepository.deleteByIds(
        threadIdsToDelete,
        workspaceId,
        manager,
      );
    });
  }
}
