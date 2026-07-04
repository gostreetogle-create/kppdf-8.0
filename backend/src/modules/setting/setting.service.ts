import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './setting.schema';

@Injectable()
export class SettingService {
  private readonly logger = new Logger(SettingService.name);

  constructor(
    @InjectModel(Setting.name)
    private readonly model: Model<SettingDocument>,
  ) {}

  async findAll(group?: string): Promise<SettingDocument[]> {
    const filter = group ? { group } : {};
    return this.model.find(filter).sort({ group: 1, key: 1 }).exec();
  }

  async findByKey(key: string): Promise<SettingDocument> {
    const doc = await this.model.findOne({ key }).exec();
    if (!doc) throw new NotFoundException(`Setting "${key}" not found`);
    return doc;
  }

  async get<T = unknown>(key: string, fallback?: T): Promise<T> {
    const doc = await this.model.findOne({ key }).lean().exec();
    return (doc?.value as T) ?? (fallback as T);
  }

  async set(key: string, value: unknown, group?: string, description?: string): Promise<SettingDocument> {
    const doc = await this.model
      .findOneAndUpdate(
        { key },
        { $set: { value, ...(group ? { group } : {}) } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();
    if (description) {
      doc.description = description;
      await doc.save();
    }
    this.logger.log(`Setting "${key}" updated`);
    return doc as SettingDocument;
  }

  async bulkSet(items: Array<{ key: string; value: unknown; group?: string }>): Promise<number> {
    const ops = items.map((it) => ({
      updateOne: {
        filter: { key: it.key },
        update: { $set: { value: it.value, ...(it.group ? { group: it.group } : {}) } },
        upsert: true,
      },
    }));
    const result = await this.model.bulkWrite(ops);
    this.logger.log(`Bulk set ${items.length} settings`);
    return result.upsertedCount + result.modifiedCount;
  }

  async remove(key: string): Promise<void> {
    const res = await this.model.deleteOne({ key }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
  }

  /** Convenience: read a boolean setting (defaults to fallback). */
  async isEnabled(key: string, fallback = false): Promise<boolean> {
    const v = await this.get<unknown>(key, fallback);
    return Boolean(v);
  }
}
