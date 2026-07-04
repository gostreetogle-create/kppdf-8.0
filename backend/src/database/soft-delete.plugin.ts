import { Query, Schema } from 'mongoose';

const NOT_DELETED = { deletedAt: null };

interface SoftDeleteQueryHelpers {
  softDelete(): Query<unknown, unknown>;
  restore(): Query<unknown, unknown>;
}

/**
 * Mongoose plugin: soft-delete.
 *
 *  - All queries (find, findOne, findOneAndUpdate, countDocuments) auto-filter
 *    `{ deletedAt: null }` unless `includeSoftDeleted: true` is passed in options
 *    or `{ deletedAt: ... }` is explicitly present in the filter.
 *  - Adds query helpers `.softDelete()` (sets deletedAt = now) and
 *    `.restore()` (clears deletedAt).
 */
export function softDeletePlugin(schema: Schema): void {
  const applyNotDeletedFilter = function (
    this: Query<unknown, unknown>,
    next: (err?: Error) => void,
  ): void {
    const options = this.getOptions() as { includeSoftDeleted?: boolean };
    if (options.includeSoftDeleted) {
      return next();
    }
    const filter = this.getFilter() as Record<string, unknown>;
    if (filter.deletedAt === undefined) {
      this.where(NOT_DELETED);
    }
    next();
  };

  schema.pre('find', applyNotDeletedFilter);
  schema.pre('findOne', applyNotDeletedFilter);
  schema.pre('findOneAndUpdate', applyNotDeletedFilter);
  schema.pre('countDocuments', applyNotDeletedFilter);
  schema.pre('find', applyNotDeletedFilter);

  const queryHelpers = schema.query as SoftDeleteQueryHelpers;

  queryHelpers.softDelete = function softDelete(
    this: Query<unknown, unknown>,
  ): Query<unknown, unknown> {
    this.setUpdate({ $set: { deletedAt: new Date() } });
    return this;
  };

  queryHelpers.restore = function restore(
    this: Query<unknown, unknown>,
  ): Query<unknown, unknown> {
    this.setUpdate({ $unset: { deletedAt: 1 } });
    return this;
  };
}
