/* eslint-disable @typescript-eslint/ban-types */

import { WorkspaceDynamicRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';
import { WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import { WorkspaceExtendedEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-extended-entity-metadata-args.interface';

export class MetadataArgsStorage {
  private readonly entities: WorkspaceEntityMetadataArgs[] = [];
  private readonly extendedEntities: WorkspaceExtendedEntityMetadataArgs[] = [];
  private readonly fields: WorkspaceFieldMetadataArgs[] = [];
  private readonly relations: WorkspaceRelationMetadataArgs[] = [];
  private readonly dynamicRelations: WorkspaceDynamicRelationMetadataArgs[] =
    [];

  addEntities(...entities: WorkspaceEntityMetadataArgs[]): void {
    this.entities.push(...entities);
  }

  addExtendedEntities(
    ...extendedEntities: WorkspaceExtendedEntityMetadataArgs[]
  ): void {
    this.extendedEntities.push(...extendedEntities);
  }

  addFields(...fields: WorkspaceFieldMetadataArgs[]): void {
    this.fields.push(...fields);
  }

  addRelations(...relations: WorkspaceRelationMetadataArgs[]): void {
    this.relations.push(...relations);
  }

  addDynamicRelations(
    ...dynamicRelations: WorkspaceDynamicRelationMetadataArgs[]
  ): void {
    this.dynamicRelations.push(...dynamicRelations);
  }

  filterEntities(
    target: Function | string,
  ): WorkspaceEntityMetadataArgs | undefined;

  filterEntities(target: (Function | string)[]): WorkspaceEntityMetadataArgs[];

  filterEntities(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceEntityMetadataArgs | undefined | WorkspaceEntityMetadataArgs[] {
    const objects = this.filterByTarget(this.entities, target);

    return Array.isArray(objects) ? objects[0] : objects;
  }

  filterExtendedEntities(
    target: Function | string,
  ): WorkspaceExtendedEntityMetadataArgs | undefined;

  filterExtendedEntities(
    target: (Function | string)[],
  ): WorkspaceExtendedEntityMetadataArgs[];

  filterExtendedEntities(
    target: (Function | string) | (Function | string)[],
  ):
    | WorkspaceExtendedEntityMetadataArgs
    | undefined
    | WorkspaceExtendedEntityMetadataArgs[] {
    const objects = this.filterByTarget(this.extendedEntities, target);

    return Array.isArray(objects) ? objects[0] : objects;
  }

  filterFields(target: Function | string): WorkspaceFieldMetadataArgs[];

  filterFields(target: (Function | string)[]): WorkspaceFieldMetadataArgs[];

  filterFields(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceFieldMetadataArgs[] {
    return this.filterByTarget(this.fields, target);
  }

  filterRelations(target: Function | string): WorkspaceRelationMetadataArgs[];

  filterRelations(
    target: (Function | string)[],
  ): WorkspaceRelationMetadataArgs[];

  filterRelations(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceRelationMetadataArgs[] {
    return this.filterByTarget(this.relations, target);
  }

  filterDynamicRelations(
    target: Function | string,
  ): WorkspaceDynamicRelationMetadataArgs[];

  filterDynamicRelations(
    target: (Function | string)[],
  ): WorkspaceDynamicRelationMetadataArgs[];

  filterDynamicRelations(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceDynamicRelationMetadataArgs[] {
    return this.filterByTarget(this.dynamicRelations, target);
  }

  protected filterByTarget<T extends { target: Function | string }>(
    array: T[],
    target: (Function | string) | (Function | string)[],
  ): T[] {
    if (Array.isArray(target)) {
      return target.flatMap((targetItem) => {
        if (typeof targetItem === 'function') {
          return this.collectFromClass(array, targetItem);
        }

        return this.collectFromString(array, targetItem);
      });
    } else {
      return typeof target === 'function'
        ? this.collectFromClass(array, target)
        : this.collectFromString(array, target);
    }
  }

  // Private helper to collect metadata from class prototypes
  private collectFromClass<T extends { target: Function | string }>(
    array: T[],
    cls: Function,
  ): T[] {
    const collectedMetadata: T[] = [];
    let currentTarget = cls;

    // Collect metadata from the current class and all its parent classes
    while (currentTarget !== Function.prototype) {
      collectedMetadata.push(
        ...array.filter((item) => item.target === currentTarget),
      );
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return collectedMetadata;
  }

  // Private helper to collect metadata directly by string comparison
  private collectFromString<T extends { target: Function | string }>(
    array: T[],
    targetString: string,
  ): T[] {
    return array.filter((item) => item.target === targetString);
  }
}

export const metadataArgsStorage = new MetadataArgsStorage();
