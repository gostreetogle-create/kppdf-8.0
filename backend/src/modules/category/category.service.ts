import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './category.schema';

export interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  type: string;
  parentId?: string;
  fullPath?: string;
  skuPrefix: string;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  children: CategoryNode[];
}

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(Category.name) private readonly model: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    let fullPath: string | undefined;
    if (dto.parentId) {
      const parent = await this.findById(dto.parentId);
      fullPath = parent.fullPath ? `${parent.fullPath}/${dto.slug}` : `${parent.name}/${dto.slug}`;
    } else {
      fullPath = dto.slug;
    }
    return this.model.create({ ...dto, fullPath });
  }

  async findAll(type?: string): Promise<CategoryDocument[]> {
    const filter = type ? { type } : {};
    return this.model.find(filter).sort({ type: 1, fullPath: 1 }).exec();
  }

  async findById(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Category ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Category ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const doc = await this.findById(id);
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  /**
   * Build a recursive tree from a flat list of categories.
   * Used by GET /categories/tree?type=material
   */
  async buildTree(type?: string): Promise<CategoryNode[]> {
    const flat = await this.findAll(type);
    const map = new Map<string, CategoryNode>();
    flat.forEach((c) => {
      const obj = c.toObject() as {
        name: string;
        slug: string;
        type: string;
        parentId?: Types.ObjectId;
        fullPath?: string;
        skuPrefix: string;
        sortOrder: number;
        isActive: boolean;
        description?: string;
      };
      map.set(c.id, {
        _id: c.id,
        name: obj.name,
        slug: obj.slug,
        type: obj.type,
        parentId: obj.parentId?.toString(),
        fullPath: obj.fullPath,
        skuPrefix: obj.skuPrefix,
        sortOrder: obj.sortOrder,
        isActive: obj.isActive,
        description: obj.description,
        children: [],
      });
    });
    const roots: CategoryNode[] = [];
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
