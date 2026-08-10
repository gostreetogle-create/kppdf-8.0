import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CreateImportMappingProfileDto,
  UpdateImportMappingProfileDto,
} from './dto/import-mapping-profile.dto';
import {
  ImportMappingProfile,
  ImportMappingProfileDocument,
} from './import-mapping-profile.schema';

@Injectable()
export class ImportMappingProfileService {
  constructor(
    @InjectModel(ImportMappingProfile.name)
    private readonly model: Model<ImportMappingProfileDocument>,
  ) {}

  async list(user: AuthenticatedUser) {
    const organizationId = this.requireOrganization(user);
    return this.model
      .find({ organizationId })
      .sort({ isDefault: -1, name: 1 })
      .exec();
  }

  async create(dto: CreateImportMappingProfileDto, user: AuthenticatedUser) {
    const organizationId = this.requireOrganization(user);
    const createdByUserId = this.requireUser(user);
    if (dto.isDefault) await this.clearDefault(organizationId);
    try {
      return await this.model.create({
        ...dto,
        name: dto.name.trim(),
        targetEntity: dto.targetEntity ?? 'material',
        isDefault: dto.isDefault === true,
        organizationId,
        createdByUserId,
      });
    } catch (error) {
      this.throwDuplicate(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateImportMappingProfileDto, user: AuthenticatedUser) {
    const organizationId = this.requireOrganization(user);
    const doc = await this.findScoped(id, organizationId);
    if (dto.isDefault === true) await this.clearDefault(organizationId, doc._id);
    if (dto.name !== undefined) doc.name = dto.name.trim();
    if (dto.columnMap !== undefined) doc.columnMap = dto.columnMap;
    if (dto.targetEntity !== undefined) doc.targetEntity = dto.targetEntity;
    if (dto.isDefault !== undefined) doc.isDefault = dto.isDefault;
    try {
      return await doc.save();
    } catch (error) {
      this.throwDuplicate(error);
      throw error;
    }
  }

  async remove(id: string, user: AuthenticatedUser) {
    const organizationId = this.requireOrganization(user);
    const doc = await this.findScoped(id, organizationId);
    await doc.deleteOne();
    return { ok: true, id: String(doc._id) };
  }

  private async clearDefault(organizationId: Types.ObjectId, exceptId?: Types.ObjectId) {
    const filter: Record<string, unknown> = { organizationId, isDefault: true };
    if (exceptId) filter._id = { $ne: exceptId };
    await this.model.updateMany(filter, { $set: { isDefault: false } }).exec();
  }

  private async findScoped(id: string, organizationId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Профиль не найден');
    const doc = await this.model.findOne({ _id: new Types.ObjectId(id), organizationId }).exec();
    if (!doc) throw new NotFoundException('Профиль не найден');
    return doc;
  }

  private requireOrganization(user: AuthenticatedUser): Types.ObjectId {
    if (!user?.organizationId || !Types.ObjectId.isValid(user.organizationId)) {
      throw new ForbiddenException('Профиль импорта требует организацию');
    }
    return new Types.ObjectId(user.organizationId);
  }

  private requireUser(user: AuthenticatedUser): Types.ObjectId {
    if (!user?.id || !Types.ObjectId.isValid(user.id)) {
      throw new ForbiddenException('Authenticated user required');
    }
    return new Types.ObjectId(user.id);
  }

  private throwDuplicate(error: unknown): void {
    if ((error as { code?: number })?.code === 11000) {
      throw new ConflictException('Профиль с таким именем уже существует');
    }
    if (error instanceof Error && error.message.includes('columnMap')) {
      throw new BadRequestException('Некорректное сопоставление колонок');
    }
  }
}
