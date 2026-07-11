import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { CounterModule } from './modules/counter/counter.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingModule } from './modules/setting/setting.module';
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';
import { StatusModule } from './modules/status/status.module';
import { AuditModule } from './modules/audit/audit.module';
import { PersonModule } from './modules/person/person.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { CounterpartyModule } from './modules/counterparty/counterparty.module';
import { RoleOrgModule } from './modules/role-org/role-org.module';
import { RoleCounterpartyModule } from './modules/role-counterparty/role-counterparty.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { CategoryModule } from './modules/category/category.module';
import { UnitModule } from './modules/unit/unit.module';
import { MaterialModule } from './modules/material/material.module';
import { ProductModule } from './modules/product/product.module';
import { ProductPhotoModule } from './modules/product-photo/product-photo.module';
import { ProductModuleModule } from './modules/product-module/product-module.module';
import { ProductModulePhotoModule } from './modules/product-module-photo/product-module-photo.module';
import { PhotosModule } from './modules/photos/photos.module';
import { BomModule } from './modules/bom/bom.module';
import { WorkCenterModule } from './modules/work-center/work-center.module';
import { WorkTypeModule } from './modules/work-type/work-type.module';
import { WorkerModule } from './modules/worker/worker.module';
import { RoutingStepModule } from './modules/routing-step/routing-step.module';
import { TechProcessModule } from './modules/tech-process/tech-process.module';
import { OrderTaskModule } from './modules/order-task/order-task.module';
import { ProductionOrderModule } from './modules/production-order/production-order.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { WorkOrderOperationModule } from './modules/work-order-operation/work-order-operation.module';
import { CostCalculationModule } from './modules/cost-calculation/cost-calculation.module';
import { ActualCostModule } from './modules/actual-cost/actual-cost.module';
import { OrderClosingModule } from './modules/order-closing/order-closing.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { StorageItemModule } from './modules/storage-item/storage-item.module';
import { StockMovementModule } from './modules/stock-movement/stock-movement.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseRequestModule } from './modules/purchase-request/purchase-request.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { TenderModule } from './modules/tender/tender.module';
import { RppModule } from './modules/rpp/rpp.module';
import { QuotationModule } from './modules/quotation/quotation.module';
import { ContractModule } from './modules/contract/contract.module';
import { OrderModule } from './modules/order/order.module';
import { ShipmentModule } from './modules/shipment/shipment.module';
import { CartSessionModule } from './modules/cart-session/cart-session.module';
import { CartItemModule } from './modules/cart-item/cart-item.module';
import { DocTypeModule } from './modules/doc-type/doc-type.module';
import { DocumentTemplateModule } from './modules/document-template/document-template.module';
import { TemplateBlockModule } from './modules/template-block/template-block.module';
import { TableTemplateModule } from './modules/table-template/table-template.module';
import { DocumentTableTypeModule } from './modules/document-table-type/document-table-type.module';
import { ReconciliationActModule } from './modules/reconciliation-act/reconciliation-act.module';
import { FinancialReportModule } from './modules/financial-report/financial-report.module';
import { ImportJobsModule } from './modules/import-jobs/import-jobs.module';
import { CommentModule } from './modules/comment/comment.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindAuthGuard } from './common/guards/throttler-behind-auth.guard';
import { AttributeDefinitionModule } from './modules/attribute-definition/attribute-definition.module';
import { EntityAttributeValueModule } from './modules/entity-attribute-value/entity-attribute-value.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { ComplianceRuleModule } from './modules/compliance-rule/compliance-rule.module';
import { ProductPassportModule } from './modules/product-passport/product-passport.module';
import { InventorFileModule } from './modules/inventor-file/inventor-file.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UserContextInterceptor } from './common/interceptors/user-context.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AdminSeed } from './common/seed/admin.seed';
import { SettingsSeed } from './common/seed/settings.seed';
import { FeatureFlagsSeed } from './common/seed/feature-flags.seed';
import { StatusesSeed } from './common/seed/statuses.seed';
import { OrgRolesSeed } from './common/seed/org-roles.seed';
import { CounterpartyRolesSeed } from './common/seed/counterparty-roles.seed';
import { UnitsSeed } from './common/seed/units.seed';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.LOG_LEVEL ?? 'info',
          transport:
            process.env.NODE_ENV === 'production'
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: { singleLine: true, colorize: true },
                },
        },
      }),
    }),
    DatabaseModule,
    CounterModule,
    PermissionsModule,
    RoleModule,
    UserModule,
    AuthModule,
    SettingModule,
    FeatureFlagModule,
    StatusModule,
    AuditModule,
    PersonModule,
    OrganizationModule,
    CounterpartyModule,
    RoleOrgModule,
    RoleCounterpartyModule,
    InteractionModule,
    CategoryModule,
    UnitModule,
    MaterialModule,
    ProductModule,
    ProductPhotoModule,
    ProductModuleModule,
    ProductModulePhotoModule, // TZ-83 Фаза A.7: новая entity
    PhotosModule,
    BomModule,
    WorkCenterModule,
    WorkTypeModule,
    WorkerModule,
    RoutingStepModule,
    TechProcessModule,
    OrderTaskModule,
    ProductionOrderModule,
    WorkOrderModule,
    WorkOrderOperationModule,
    CostCalculationModule,
    ActualCostModule,
    OrderClosingModule,
    WarehouseModule,
    StorageItemModule,
    StockMovementModule,
    ReservationModule,
    InventoryModule,
    PurchaseRequestModule,
    PurchaseOrderModule,
    InvoiceModule,
    TenderModule,
    RppModule,
    QuotationModule,
    ContractModule,
    OrderModule,
    ShipmentModule,
    CartSessionModule,
    CartItemModule,
    DocTypeModule,
    DocumentTemplateModule,
    TemplateBlockModule,
    TableTemplateModule,
    DocumentTableTypeModule,
    ReconciliationActModule,
    FinancialReportModule,
    ImportJobsModule,
    CommentModule,
    RateLimitModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    AttributeDefinitionModule,
    EntityAttributeValueModule,
    CertificateModule,
    ComplianceRuleModule,
    ProductPassportModule,
    InventorFileModule,
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: UserContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    ThrottlerBehindAuthGuard,
    AdminSeed,
    SettingsSeed,
    FeatureFlagsSeed,
    StatusesSeed,
    OrgRolesSeed,
    CounterpartyRolesSeed,
    UnitsSeed,
  ],
})
export class AppModule {}
