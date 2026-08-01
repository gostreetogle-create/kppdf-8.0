import { Module } from '@nestjs/common';
import { PermissionsBootValidator } from './permissions-boot-validator';

/**
 * TZ-255 §ШАГ 4 — NestJS module that wires the boot validator.
 *
 * Imported by `AppModule`. The validator's `OnApplicationBootstrap`
 * hook is the doorway for the catalog check; Nest runs it once after
 * all controllers are instantiated.
 *
 * The validator class itself lives in `permissions-boot-validator.ts`
 * (not in this file) to keep the `.module.ts` suffix reserved for
 * NestJS `@Module` declarations. This avoids a self-import cycle that
 * the earlier draft silently introduced.
 */
@Module({
  providers: [PermissionsBootValidator],
  exports: [PermissionsBootValidator],
})
export class PermissionsBootModule {}
