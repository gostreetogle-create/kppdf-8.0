/**
 * Validation barrel — re-exports class-validator decorators + custom IsObjectId
 * so that DTO files import from a single validation module (
 *   import { … } from '../../common/validation'
 * ) instead of mixing class-validator and local decorator paths.
 *
 * TZ-199+: used by contract + production-order DTOs. Add new re-exports here
 * when a DTO needs a decorator not yet listed.
 */

export {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export { IsObjectId } from './decorators/is-object-id.decorator';
