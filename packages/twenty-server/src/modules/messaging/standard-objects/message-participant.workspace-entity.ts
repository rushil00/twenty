import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageWorkspaceEntity } from 'src/modules/messaging/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageParticipant,
  namePlural: 'messageParticipants',
  labelSingular: 'Message Participant',
  labelPlural: 'Message Participants',
  description: 'Message Participants',
  icon: 'IconUserCircle',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.role,
    type: FieldMetadataType.SELECT,
    label: 'Role',
    description: 'Role',
    icon: 'IconAt',
    options: [
      { value: 'from', label: 'From', position: 0, color: 'green' },
      { value: 'to', label: 'To', position: 1, color: 'blue' },
      { value: 'cc', label: 'Cc', position: 2, color: 'orange' },
      { value: 'bcc', label: 'Bcc', position: 3, color: 'red' },
    ],
    defaultValue: "'from'",
  })
  role: string;

  @WorkspaceField({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @WorkspaceRelation({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.message,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message',
    description: 'Message',
    icon: 'IconMessage',
    joinColumn: 'messageId',
    inverseSideTarget: () => MessageWorkspaceEntity,
    inverseSideFieldKey: 'messageParticipants',
  })
  message: Relation<MessageWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.person,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Person',
    description: 'Person',
    icon: 'IconUser',
    joinColumn: 'personId',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'messageParticipants',
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workspace Member',
    description: 'Workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'messageParticipants',
  })
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;
}
