import { ENTITIES, type Entity } from './enums';

/** Audit entries store the entity type as free text; unknown values are shown as "Other". */
export const asEntity = (value: string): Entity | 'Other' =>
  ENTITIES.find((entity) => entity === value) ?? 'Other';
