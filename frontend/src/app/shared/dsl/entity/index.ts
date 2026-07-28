/**
 * Barrel re-exports for the `defineEntity` module so consumers can
 * import everything from one path:
 *
 *   import { defineEntity, type User, type PaginatedResponse } from '../../shared/dsl/entity';
 */

export {
  defineEntity,
  paramsToHttpParams,
  type DefineEntity,
  type EntitySchema,
  type EntityService,
  type PaginatedResponse,
} from './entity-service';
