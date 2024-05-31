import { Module } from '@nestjs/common';

import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceSchemaStorageService } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.service';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule, WorkspaceCacheVersionModule],
  providers: [WorkspaceSchemaStorageService],
  exports: [WorkspaceSchemaStorageService],
})
export class WorkspaceSchemaStorageModule {}
