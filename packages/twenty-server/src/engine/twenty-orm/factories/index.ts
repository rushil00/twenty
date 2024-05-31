import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { ScopedWorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-datasource.factory';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';

export const entitySchemaFactories = [
  EntitySchemaColumnFactory,
  EntitySchemaRelationFactory,
  EntitySchemaFactory,
  WorkspaceDatasourceFactory,
  ScopedWorkspaceDatasourceFactory,
];
