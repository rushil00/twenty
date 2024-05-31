import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';
import { MessageService } from 'src/modules/messaging/services/message/message.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import {
  GmailMessage,
  ParticipantWithMessageId,
} from 'src/modules/messaging/types/gmail-message';
import {
  CreateCompanyAndContactJobData,
  CreateCompanyAndContactJob,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class SaveMessagesAndEnqueueContactCreationService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageService: MessageService,
    private readonly messageParticipantService: MessageParticipantService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async saveMessagesAndEnqueueContactCreationJob(
    messagesToSave: GmailMessage[],
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const isContactCreationForSentAndReceivedEmailsEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: workspaceId,
        key: FeatureFlagKeys.IsContactCreationForSentAndReceivedEmailsEnabled,
        value: true,
      });

    const isContactCreationForSentAndReceivedEmailsEnabled =
      isContactCreationForSentAndReceivedEmailsEnabledFeatureFlag?.value;

    const participantsWithMessageId = await workspaceDataSource?.transaction(
      async (transactionManager: EntityManager) => {
        const messageExternalIdsAndIdsMap =
          await this.messageService.saveMessagesWithinTransaction(
            messagesToSave,
            connectedAccount,
            messageChannel.id,
            workspaceId,
            transactionManager,
          );

        const participantsWithMessageId: (ParticipantWithMessageId & {
          shouldCreateContact: boolean;
        })[] = messagesToSave.flatMap((message) => {
          const messageId = messageExternalIdsAndIdsMap.get(message.externalId);

          return messageId
            ? message.participants.map((participant) => ({
                ...participant,
                messageId,
                shouldCreateContact:
                  messageChannel.isContactAutoCreationEnabled &&
                  (isContactCreationForSentAndReceivedEmailsEnabled ||
                    message.participants.find((p) => p.role === 'from')
                      ?.handle === connectedAccount.handle),
              }))
            : [];
        });

        await this.messageParticipantService.saveMessageParticipants(
          participantsWithMessageId,
          workspaceId,
          transactionManager,
        );

        return participantsWithMessageId;
      },
    );

    if (messageChannel.isContactAutoCreationEnabled) {
      const contactsToCreate = participantsWithMessageId.filter(
        (participant) => participant.shouldCreateContact,
      );

      await this.messageQueueService.add<CreateCompanyAndContactJobData>(
        CreateCompanyAndContactJob.name,
        {
          workspaceId,
          connectedAccountHandle: connectedAccount.handle,
          contactsToCreate,
        },
      );
    }
  }
}
