import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/get-flattened-values-and-values-string-for-batch-raw-query.util';

@Injectable()
export class CalendarChannelEventAssociationRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByEventExternalIdsAndCalendarChannelId(
    eventExternalIds: string[],
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationWorkspaceEntity>[]> {
    if (eventExternalIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "eventExternalId" = ANY($1) AND "calendarChannelId" = $2`,
      [eventExternalIds, calendarChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByEventExternalIdsAndCalendarChannelId(
    eventExternalIds: string[],
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation" WHERE "eventExternalId" = ANY($1) AND "calendarChannelId" = $2`,
      [eventExternalIds, calendarChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async getByCalendarChannelIds(
    calendarChannelIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationWorkspaceEntity>[]> {
    if (calendarChannelIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "calendarChannelId" = ANY($1)`,
      [calendarChannelIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByCalendarChannelIds(
    calendarChannelIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (calendarChannelIds.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation" WHERE "calendarChannelId" = ANY($1)`,
      [calendarChannelIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (ids.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }

  public async getByCalendarEventIds(
    calendarEventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationWorkspaceEntity>[]> {
    if (calendarEventIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "calendarEventId" = ANY($1)`,
      [calendarEventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async saveCalendarChannelEventAssociations(
    calendarChannelEventAssociations: Omit<
      ObjectRecord<CalendarChannelEventAssociationWorkspaceEntity>,
      'id' | 'createdAt' | 'updatedAt' | 'calendarChannel' | 'calendarEvent'
    >[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (calendarChannelEventAssociations.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const {
      flattenedValues: calendarChannelEventAssociationValues,
      valuesString,
    } = getFlattenedValuesAndValuesStringForBatchRawQuery(
      calendarChannelEventAssociations,
      {
        calendarChannelId: 'uuid',
        calendarEventId: 'uuid',
        eventExternalId: 'text',
      },
    );

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarChannelEventAssociation" ("calendarChannelId", "calendarEventId", "eventExternalId")
      VALUES ${valuesString}`,
      calendarChannelEventAssociationValues,
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByCalendarEventParticipantHandleAndCalendarChannelIds(
    calendarEventParticipantHandle: string,
    calendarChannelIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const isHandleDomain = calendarEventParticipantHandle.startsWith('@');

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation"
      WHERE "id" IN (
      SELECT "calendarChannelEventAssociation"."id"
      FROM ${dataSourceSchema}."calendarChannelEventAssociation" "calendarChannelEventAssociation"
      JOIN ${dataSourceSchema}."calendarEvent" "calendarEvent" ON "calendarChannelEventAssociation"."calendarEventId" = "calendarEvent"."id"
      JOIN ${dataSourceSchema}."calendarEventParticipant" "calendarEventParticipant" ON "calendarEvent"."id" = "calendarEventParticipant"."calendarEventId"
      WHERE "calendarEventParticipant"."handle" ${
        isHandleDomain ? 'ILIKE' : '='
      } $1 AND "calendarChannelEventAssociation"."calendarChannelId" = ANY($2)
      )`,
      [
        isHandleDomain
          ? `%${calendarEventParticipantHandle}`
          : calendarEventParticipantHandle,
        calendarChannelIds,
      ],
      workspaceId,
      transactionManager,
    );
  }
}
