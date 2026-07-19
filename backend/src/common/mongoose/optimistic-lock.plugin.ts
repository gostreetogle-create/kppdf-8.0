import { Schema } from 'mongoose';

export function optimisticLockPlugin(schema: Schema): void {
  schema.pre('save', function (next) {
    if (this.isNew) return next();
    this.set('__v', ((this.get('__v') as number) || 0) + 1);
    next();
  });
}
