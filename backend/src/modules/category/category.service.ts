import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    const oldSlug = doc.slug;
    const oldParentId = doc.parentId ? doc.parentId.toString() : null;
    const oldFullPath = doc.fullPath;

    const newSlug = dto.slug ?? oldSlug;
    const newParentId = 'parentId' in dto
      ? (dto.parentId ? String(dto.parentId) : null)
      : oldParentId;

    const slugChanged = dto.slug !== undefined && dto.slug !== oldSlug;
    const parentChanged = newParentId !== oldParentId;

    Object.assign(doc, dto);
    await doc.save();

    if ((slugChanged || parentChanged) && oldFullPath) {
      // Cycle prevention: new parent must not be a descendant of this category
      if (newParentId) {
        const isDescendant = await this.isDescendantOf(newParentId, id);
        if (isDescendant) {
          throw new BadRequestException(
            `Cannot move category under its own descendant (would create a cycle)`,
          );
        }
      }

      let newFullPath: string;
      if (newParentId) {
        const parent = await this.findById(newParentId);
        newFullPath = parent.fullPath
          ? `${parent.fullPath}/${newSlug}`
          : `${parent.name}/${newSlug}`;
      } else {
        newFullPath = newSlug;
      }

      await this.model
        .updateOne({ _id: doc._id }, { $set: { fullPath: newFullPath } })
        .exec();

      const prefixRegex = new RegExp(`^${CategoryService.escapeRegex(oldFullPath)}/`);
      const descendants = await this.model.find({ fullPath: prefixRegex }).exec();

      if (descendants.length > 0) {
        const ops = descendants.map((desc) => {
          const suffix = desc.fullPath!.substring(oldFullPath.length);
          return {
            updateOne: {
              filter: { _id: desc._id },
              update: { $set: { fullPath: `${newFullPath}${suffix}` } },
            },
          };
        });
        await this.model.bulkWrite(ops);
      }
    }

    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.model
      .updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } })
      .exec();
  }

  /**
   * Atomic reorder. `categoryIds` must contain every category _id;
   * the backend recomputes `sortOrder = index` for each.
   */
  async reorder(categoryIds: string[]): Promise<CategoryDocument[]> {
    const invalid = categoryIds.find((id) => !Types.ObjectId.isValid(id));
    if (invalid) {
      throw new BadRequestException(`Invalid category id: ${invalid}`);
    }

    const session = await this.model.db.startSession();
    session.startTransaction();
    try {
      const ops = categoryIds.map((id, index) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(id) },
          update: { $set: { sortOrder: index } },
        },
      }));
      await this.model.bulkWrite(ops, { session });
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    return this.findAll();
  }

  /**
   * Reorder children within a specific parent (or root if parentId is null).
   * `childIds` must contain all direct children of the parent; the backend
   * recomputes `sortOrder = index` for each.
   */
  async reorderChildren(parentId: string | null, childIds: string[]): Promise<CategoryDocument[]> {
    if (parentId && !Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException(`Invalid parent id: ${parentId}`);
    }

    const invalidChild = childIds.find((id) => !Types.ObjectId.isValid(id));
    if (invalidChild) {
      throw new BadRequestException(`Invalid child category id: ${invalidChild}`);
    }

    const filter: Record<string, unknown> = parentId
      ? { parentId: new Types.ObjectId(parentId) }
      : { parentId: { $exists: false } };

    const existing = await this.model.find({ _id: { $in: childIds.map(id => new Types.ObjectId(id)) }, ...filter }).select('_id').exec();
    const validIds = new Set(existing.map((d: CategoryDocument) => d._id.toString()));
    const validChildIds = childIds.filter(id => validIds.has(id));
    const ops = validChildIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (ops.length > 0) {
      const session = await this.model.db.startSession();
      session.startTransaction();
      try {
        await this.model.bulkWrite(ops, { session });
        await session.commitTransaction();
      } catch (e) {
        await session.abortTransaction();
        throw e;
      } finally {
        session.endSession();
      }
    }

    return this.findAll();
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

  /**
   * Check if `candidateDescendantId` is a descendant of `ancestorId`.
   * Walks up the parentId chain from candidateDescendantId.
   */
  private async isDescendantOf(
    candidateDescendantId: string,
    ancestorId: string,
  ): Promise<boolean> {
    let currentId = candidateDescendantId;
    const visited = new Set<string>();
    while (currentId) {
      if (currentId === ancestorId) return true;
      if (visited.has(currentId)) break; // cycle guard
      visited.add(currentId);
      const doc = await this.model
        .findById(currentId)
        .select('parentId')
        .lean()
        .exec();
      if (!doc?.parentId) break;
      currentId = doc.parentId.toString();
    }
    return false;
  }

  private static escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
