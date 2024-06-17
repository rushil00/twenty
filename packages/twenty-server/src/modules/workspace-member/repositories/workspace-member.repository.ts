import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class WorkspaceMemberRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByIds(
    userIds: string[],
    workspaceId: string,
  ): Promise<ObjectRecord<WorkspaceMemberWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = ANY($1)`,
      [userIds],
      workspaceId,
    );

    return result;
  }

  public async find(workspaceMemberId: string, workspaceId: string) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "id" = $1`,
        [workspaceMemberId],
        workspaceId,
      );

    return workspaceMembers?.[0];
  }

  public async getByIdOrFail(
    userId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<WorkspaceMemberWorkspaceEntity>> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = $1`,
        [userId],
        workspaceId,
      );

    if (!workspaceMembers || workspaceMembers.length === 0) {
      throw new NotFoundException(
        `No workspace member found for user ${userId} in workspace ${workspaceId}`,
      );
    }

    return workspaceMembers[0];
  }

  public async getAllByWorkspaceId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<WorkspaceMemberWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember"`,
        [],
        workspaceId,
        transactionManager,
      );

    return workspaceMembers;
  }
}
