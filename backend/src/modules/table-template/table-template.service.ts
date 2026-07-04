import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableTemplate, TableTemplateDocument } from './table-template.schema';
import { CreateTableTemplateDto } from './dto/create-table-template.dto';
import { UpdateTableTemplateDto } from './dto/update-table-template.dto';

@Injectable()
export class TableTemplateService {
  constructor(
    @InjectModel(TableTemplate.name)
    private readonly model: Model<TableTemplateDocument>,
  ) {}

  async create(dto: CreateTableTemplateDto): Promise<TableTemplateDocument> {
    return this.model.create({
      name: dto.name,
      description: dto.description,
      columns: dto.columns,
      isActive: true,
    });
  }

  async findAll(): Promise<TableTemplateDocument[]> {
    return this.model.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<TableTemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`TableTemplate ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`TableTemplate ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateTableTemplateDto): Promise<TableTemplateDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.columns !== undefined) doc.columns = dto.columns as never;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model.updateOne({ _id: doc._id }, { $set: { deletedAt: new Date(), isActive: false } }).exec();
  }
}
