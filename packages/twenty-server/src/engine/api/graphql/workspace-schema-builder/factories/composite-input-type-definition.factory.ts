import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';

import { InputTypeFactory } from './input-type.factory';

@Injectable()
export class CompositeInputTypeDefinitionFactory {
  private readonly logger = new Logger(
    CompositeInputTypeDefinitionFactory.name,
  );
  constructor(private readonly inputTypeFactory: InputTypeFactory) {}

  public create(
    compositeType: CompositeType,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): InputTypeDefinition {
    const name = pascalCase(compositeType.type.toString().toLowerCase());

    return {
      target: compositeType.type.toString(),
      kind,
      type: new GraphQLInputObjectType({
        name: `${pascalCase(name)}${kind.toString()}Input`,
        fields: this.generateFields(compositeType, kind, options),
      }),
    };
  }

  private generateFields(
    compositeType: CompositeType,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const property of compositeType.properties) {
      // Relation fields are not supported in composite types
      if (isRelationFieldMetadataType(property.type)) {
        this.logger.error(
          'Relation fields are not supported in composite types',
          { compositeType, property },
        );

        throw new Error('Relation fields are not supported in composite types');
      }

      // Skip hidden fields
      if (property.hidden === true || property.hidden === 'input') {
        continue;
      }

      const type = this.inputTypeFactory.create(
        property.name,
        property.type,
        kind,
        options,
        {
          nullable: !property.isRequired,
          isArray:
            property.type === FieldMetadataType.MULTI_SELECT ||
            property.isArray,
        },
      );

      fields[property.name] = {
        type,
        description: property.description,
      };
    }

    return fields;
  }
}
