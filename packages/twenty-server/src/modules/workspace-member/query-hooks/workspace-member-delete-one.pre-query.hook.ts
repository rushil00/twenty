import { Injectable } from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CommentRepository } from 'src/modules/activity/repositories/comment.repository';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentRepository } from 'src/modules/attachment/repositories/attachment.repository';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Injectable()
export class WorkspaceMemberDeleteOnePreQueryHook
  implements WorkspacePreQueryHook
{
  constructor(
    @InjectObjectMetadataRepository(AttachmentWorkspaceEntity)
    private readonly attachmentRepository: AttachmentRepository,
    @InjectObjectMetadataRepository(CommentWorkspaceEntity)
    private readonly commentRepository: CommentRepository,
  ) {}

  // There is no need to validate the user's access to the workspace member since we don't have permission yet.
  async execute(
    userId: string,
    workspaceId: string,
    payload: DeleteOneResolverArgs,
  ): Promise<void> {
    const workspaceMemberId = payload.id;

    await this.attachmentRepository.deleteByAuthorId(
      workspaceMemberId,
      workspaceId,
    );

    await this.commentRepository.deleteByAuthorId(
      workspaceMemberId,
      workspaceId,
    );
  }
}
