import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { StorageItem, StorageItemDocument } from './storage-item.schema';
import { CreateStorageItemDto } from './dto/create-storage-item.dto';
import { UpdateStorageItemDto } from './dto/update-storage-item.dto';
import { AdjustStorageItemDto } from './dto/adjust-storage-item.dto';
import {
  StockMovement,
  StockMovementDocument,
} from '../stock-movement/stock-movement.schema';

@Injectable()
export class StorageItemService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(StorageItem.name)
    private readonly model: Model<StorageItemDocument>,
    @InjectModel(StockMovement.name)
    private readonly movementModel: Model<StockMovementDocument>,
  ) {}

  async create(dto: CreateStorageItemDto): Promise<StorageItemDocument> {
    return this.model.create({
      ...dto,
      warehouseId: new Types.ObjectId(dto.warehouseId),
      productId: new Types.ObjectId(dto.productId),
      isActive: dto.isActive ?? true,
      quantity: dto.quantity ?? 0,
      reservedQty: dto.reservedQty ?? 0,
      minQuantity: dto.minQuantity ?? 0,
    });
  }

  async findAll(
    warehouseId?: string,
    productId?: string,
    lowStock?: boolean,
  ): Promise<StorageItemDocument[]> {
    const filter: Record<string, unknown> = {};
    if (warehouseId) {
      if (!Types.ObjectId.isValid(warehouseId)) return [];
      filter.warehouseId = new Types.ObjectId(warehouseId);
    }
    if (productId) {
      if (!Types.ObjectId.isValid(productId)) return [];
      filter.productId = new Types.ObjectId(productId);
    }
    if (lowStock) {
      filter.$expr = { $lt: ['$quantity', '$minQuantity'] };
    }
    return this.model
      .find(filter)
      .populate('productId')
      .populate('warehouseId')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<StorageItemDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`StorageItem ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`StorageItem ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: UpdateStorageItemDto,
  ): Promise<StorageItemDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.zoneName !== undefined) doc.zoneName = dto.zoneName;
    if (dto.minQuantity !== undefined) doc.minQuantity = dto.minQuantity;
    if (dto.weightKg !== undefined) doc.weightKg = dto.weightKg;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    if (dto.photos !== undefined) doc.photos = dto.photos;
    return doc.save();
  }

  async adjust(
    id: string,
    dto: AdjustStorageItemDto,
  ): Promise<StorageItemDocument> {
    const session = await this.connection.startSession();
    let result: StorageItemDocument | undefined;
    try {
      await session.withTransaction(async () => {
        if (!Types.ObjectId.isValid(id)) {
          throw new NotFoundException(`StorageItem ${id} not found`);
        }
        const doc = await this.model.findById(id).session(session).exec();
        if (!doc) throw new NotFoundException(`StorageItem ${id} not found`);
        const newQty = (doc.quantity ?? 0) + dto.delta;
        if (newQty < 0) {
          throw new BadRequestException(
            `Cannot adjust: resulting quantity would be ${newQty}`,
          );
        }
        doc.quantity = newQty;
        await doc.save({ session });
        await this.movementModel.create(
          [
            {
              type: 'adjust',
              productId: doc.productId,
              warehouseId: doc.warehouseId,
              zoneName: doc.zoneName,
              qty: Math.abs(dto.delta),
              documentRef: `ADJUST:${dto.reason}`,
              date: new Date(),
            },
          ],
          { session },
        );
        result = doc;
      });
    } finally {
      await session.endSession();
    }
    if (!result) throw new NotFoundException('Adjust failed');
    return result;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
