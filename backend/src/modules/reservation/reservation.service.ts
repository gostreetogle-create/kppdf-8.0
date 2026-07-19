import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from './reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { StorageItem, StorageItemDocument } from '../storage-item/storage-item.schema';
import { StockMovement, StockMovementDocument } from '../stock-movement/stock-movement.schema';

@Injectable()
export class ReservationService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Reservation.name)
    private readonly model: Model<ReservationDocument>,
    @InjectModel(StorageItem.name)
    private readonly storageModel: Model<StorageItemDocument>,
    @InjectModel(StockMovement.name)
    private readonly movementModel: Model<StockMovementDocument>,
  ) {}

  async create(dto: CreateReservationDto, externalSession?: ClientSession): Promise<ReservationDocument> {
    const filter: Record<string, unknown> = {
      warehouseId: new Types.ObjectId(dto.warehouseId),
      productId: new Types.ObjectId(dto.productId),
    };
    if (dto.zoneName) filter.zoneName = dto.zoneName;
    else filter.$or = [{ zoneName: { $exists: false } }, { zoneName: null }];

    if (externalSession) {
      const item = await this.storageModel.findOne(filter).session(externalSession).exec();
      if (!item) {
        throw new NotFoundException(
          `No storage item for product ${dto.productId} in warehouse ${dto.warehouseId}`,
        );
      }
      const available = (item.quantity ?? 0) - (item.reservedQty ?? 0);
      if (available < dto.qty) {
        throw new BadRequestException(
          `Insufficient available stock: have ${available}, requested ${dto.qty}`,
        );
      }
      item.reservedQty = (item.reservedQty ?? 0) + dto.qty;
      await item.save({ session: externalSession });
      const [doc] = await this.model.create(
        [
          {
            orderId: dto.orderId,
            productId: new Types.ObjectId(dto.productId),
            warehouseId: new Types.ObjectId(dto.warehouseId),
            qty: dto.qty,
            zoneName: dto.zoneName,
            status: 'active',
            isActive: true,
            notes: dto.notes,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          },
        ],
        { session: externalSession },
      );
      if (!doc) throw new BadRequestException('Reservation failed');
      return doc;
    }

    const session = await this.connection.startSession();
    let result: ReservationDocument | undefined;
    try {
      await session.withTransaction(async () => {
        const item = await this.storageModel
          .findOne(filter)
          .session(session)
          .exec();
        if (!item) {
          throw new NotFoundException(
            `No storage item for product ${dto.productId} in warehouse ${dto.warehouseId}`,
          );
        }
        const available = (item.quantity ?? 0) - (item.reservedQty ?? 0);
        if (available < dto.qty) {
          throw new BadRequestException(
            `Insufficient available stock: have ${available}, requested ${dto.qty}`,
          );
        }
        item.reservedQty = (item.reservedQty ?? 0) + dto.qty;
        await item.save({ session });
        const [doc] = await this.model.create(
          [
            {
              orderId: dto.orderId,
              productId: new Types.ObjectId(dto.productId),
              warehouseId: new Types.ObjectId(dto.warehouseId),
              qty: dto.qty,
              zoneName: dto.zoneName,
              status: 'active',
              isActive: true,
              notes: dto.notes,
              expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            },
          ],
          { session },
        );
        result = doc;
      });
    } finally {
      await session.endSession();
    }
    if (!result) throw new BadRequestException('Reservation failed');
    return result;
  }

  async findAll(orderId?: string): Promise<ReservationDocument[]> {
    const filter: Record<string, unknown> = {};
    if (orderId) filter.orderId = orderId;
    return this.model
      .find(filter)
      .populate('productId')
      .populate('warehouseId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<ReservationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Reservation ${id} not found`);
    return doc;
  }

  async release(id: string): Promise<ReservationDocument> {
    const session = await this.connection.startSession();
    let result: ReservationDocument | undefined;
    try {
      await session.withTransaction(async () => {
        const doc = await this.findById(id);
        if (doc.status !== 'active') {
          throw new BadRequestException(`Reservation already ${doc.status}`);
        }
        const filter: Record<string, unknown> = {
          warehouseId: doc.warehouseId,
          productId: doc.productId,
        };
        if (doc.zoneName) filter.zoneName = doc.zoneName;
        else filter.$or = [{ zoneName: { $exists: false } }, { zoneName: null }];

        const item = await this.storageModel
          .findOne(filter)
          .session(session)
          .exec();
        if (item) {
          item.reservedQty = Math.max(0, (item.reservedQty ?? 0) - doc.qty);
          await item.save({ session });
        }
        doc.status = 'released';
        doc.isActive = false;
        const saved = await doc.save({ session });
        result = saved;
      });
    } finally {
      await session.endSession();
    }
    if (!result) throw new NotFoundException('Release failed');
    return result;
  }

  async fulfill(id: string): Promise<ReservationDocument> {
    const doc = await this.findById(id);
    if (doc.status !== 'active') {
      throw new BadRequestException(`Reservation already ${doc.status}`);
    }
    // Manual startTransaction + inline movementModel.create to avoid nested transactions
    const session = await this.connection.startSession();
    let result: ReservationDocument | undefined;
    try {
      session.startTransaction();
      const filter: Record<string, unknown> = {
        warehouseId: doc.warehouseId,
        productId: doc.productId,
      };
      if (doc.zoneName) filter.zoneName = doc.zoneName;
      else filter.$or = [{ zoneName: { $exists: false } }, { zoneName: null }];
      const item = await this.storageModel.findOne(filter).session(session).exec();
      if (!item) {
        throw new NotFoundException(
          `No storage item for product ${doc.productId} in warehouse ${doc.warehouseId}`,
        );
      }
      if ((item.quantity ?? 0) < doc.qty) {
        throw new BadRequestException(
          `Insufficient stock: have ${item.quantity}, requested ${doc.qty}`,
        );
      }
      item.quantity = (item.quantity ?? 0) - doc.qty;
      item.reservedQty = Math.max(0, (item.reservedQty ?? 0) - doc.qty);
      await item.save({ session });
      // Inline movement creation via Mongoose model in the same session
      await this.movementModel.create(
        [
          {
            type: 'out',
            date: new Date(),
            productId: doc.productId,
            warehouseId: doc.warehouseId,
            zoneName: doc.zoneName,
            qty: doc.qty,
            cost: 0,
            orderId: doc.orderId,
            documentRef: `RES:${id}`,
          },
        ],
        { session },
      );
      doc.status = 'fulfilled';
      doc.isActive = false;
      const saved = await doc.save({ session });
      await session.commitTransaction();
      result = saved;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
    if (!result) throw new NotFoundException('Fulfill failed');
    return result;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }
}
