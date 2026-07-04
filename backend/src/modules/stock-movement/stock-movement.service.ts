import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import {
  StockMovement,
  StockMovementDocument,
} from './stock-movement.schema';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StorageItem, StorageItemDocument } from '../storage-item/storage-item.schema';

@Injectable()
export class StockMovementService {
  private readonly logger = new Logger(StockMovementService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(StockMovement.name)
    private readonly model: Model<StockMovementDocument>,
    @InjectModel(StorageItem.name)
    private readonly storageModel: Model<StorageItemDocument>,
  ) {}

  async create(
    dto: CreateStockMovementDto,
  ): Promise<StockMovementDocument> {
    if (dto.type === 'transfer' && !dto.toWarehouseId) {
      throw new BadRequestException('Transfer requires toWarehouseId');
    }

    const session = await this.connection.startSession();
    let movement: StockMovementDocument | undefined;
    try {
      await session.withTransaction(async () => {
        if (dto.type === 'in') {
          await this.applyIn(
            dto.warehouseId,
            dto.productId,
            dto.zoneName,
            dto.qty,
            session,
          );
        } else if (dto.type === 'out') {
          await this.applyOut(
            dto.warehouseId,
            dto.productId,
            dto.zoneName,
            dto.qty,
            session,
          );
        } else if (dto.type === 'transfer') {
          await this.applyTransfer(
            dto.warehouseId,
            dto.toWarehouseId!,
            dto.productId,
            dto.zoneName,
            dto.toZoneName,
            dto.qty,
            session,
          );
        }

        const [doc] = await this.model.create(
          [
            {
              type: dto.type,
              date: new Date(),
              productId: new Types.ObjectId(dto.productId),
              warehouseId: new Types.ObjectId(dto.warehouseId),
              toWarehouseId: dto.toWarehouseId
                ? new Types.ObjectId(dto.toWarehouseId)
                : undefined,
              zoneName: dto.zoneName,
              toZoneName: dto.toZoneName,
              qty: dto.qty,
              cost: dto.cost ?? 0,
              orderId: dto.orderId,
              documentRef: dto.documentRef,
              createdBy: dto.createdBy
                ? new Types.ObjectId(dto.createdBy)
                : undefined,
            },
          ],
          { session },
        );
        movement = doc;
      });
    } finally {
      await session.endSession();
    }
    if (!movement) throw new BadRequestException('Movement failed');
    return movement;
  }

  private async applyIn(
    warehouseId: string,
    productId: string,
    zoneName: string | undefined,
    qty: number,
    session: unknown,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      warehouseId: new Types.ObjectId(warehouseId),
      productId: new Types.ObjectId(productId),
    };
    if (zoneName) filter.zoneName = zoneName;
    else filter.$or = [{ zoneName: { $exists: false } }, { zoneName: null }];

    let item = await this.storageModel.findOne(filter).session(session as never).exec();
    if (!item) {
      const [created] = await this.storageModel.create(
        [
          {
            warehouseId: new Types.ObjectId(warehouseId),
            productId: new Types.ObjectId(productId),
            zoneName: zoneName ?? undefined,
            quantity: qty,
          },
        ],
        { session: session as never },
      );
      item = created;
    } else {
      item.quantity = (item.quantity ?? 0) + qty;
      await item.save({ session: session as never });
    }
  }

  private async applyOut(
    warehouseId: string,
    productId: string,
    zoneName: string | undefined,
    qty: number,
    session: unknown,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      warehouseId: new Types.ObjectId(warehouseId),
      productId: new Types.ObjectId(productId),
    };
    if (zoneName) filter.zoneName = zoneName;
    else filter.$or = [{ zoneName: { $exists: false } }, { zoneName: null }];

    const item = await this.storageModel.findOne(filter).session(session as never).exec();
    if (!item) {
      throw new BadRequestException(
        `No storage item for product ${productId} in warehouse ${warehouseId}`,
      );
    }
    if ((item.quantity ?? 0) < qty) {
      throw new BadRequestException(
        `Insufficient stock: have ${item.quantity}, requested ${qty}`,
      );
    }
    item.quantity = (item.quantity ?? 0) - qty;
    if ((item.reservedQty ?? 0) > 0) {
      item.reservedQty = Math.max(0, (item.reservedQty ?? 0) - qty);
    }
    await item.save({ session: session as never });
  }

  private async applyTransfer(
    fromWarehouseId: string,
    toWarehouseId: string,
    productId: string,
    fromZone: string | undefined,
    toZone: string | undefined,
    qty: number,
    session: unknown,
  ): Promise<void> {
    await this.applyOut(fromWarehouseId, productId, fromZone, qty, session);
    await this.applyIn(toWarehouseId, productId, toZone, qty, session);
  }

  async findAll(
    warehouseId?: string,
    productId?: string,
    type?: string,
    from?: Date,
    to?: Date,
  ): Promise<StockMovementDocument[]> {
    const filter: Record<string, unknown> = {};
    if (warehouseId) {
      if (!Types.ObjectId.isValid(warehouseId)) return [];
      filter.$or = [
        { warehouseId: new Types.ObjectId(warehouseId) },
        { toWarehouseId: new Types.ObjectId(warehouseId) },
      ];
    }
    if (productId) {
      if (!Types.ObjectId.isValid(productId)) return [];
      filter.productId = new Types.ObjectId(productId);
    }
    if (type) filter.type = type;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = from;
      if (to) range.$lte = to;
      filter.date = range;
    }
    return this.model
      .find(filter)
      .populate('productId')
      .populate('warehouseId')
      .populate('toWarehouseId')
      .sort({ date: -1 })
      .exec();
  }

  async summary(
    period: 'day' | 'week' | 'month' = 'month',
  ): Promise<{ type: string; totalQty: number; totalAmount: number }[]> {
    const now = new Date();
    const from = new Date(now);
    if (period === 'day') from.setDate(from.getDate() - 1);
    else if (period === 'week') from.setDate(from.getDate() - 7);
    else from.setMonth(from.getMonth() - 1);
    const result = await this.model
      .aggregate([
        { $match: { date: { $gte: from } } },
        {
          $group: {
            _id: '$type',
            totalQty: { $sum: '$qty' },
            totalAmount: { $sum: { $multiply: ['$qty', '$cost'] } },
          },
        },
      ])
      .exec();
    return result.map((r) => ({
      type: r._id,
      totalQty: r.totalQty,
      totalAmount: r.totalAmount,
    }));
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.model
      .updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { deletedAt: new Date() } },
      )
      .exec();
  }
}
