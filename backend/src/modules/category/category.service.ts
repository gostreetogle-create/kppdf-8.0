import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  children: CategoryNode[];
}

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(@InjectModel(Category.name) private readonly model: Model<CategoryDocument>) {}

  async create(dto: CreateCategoryDto, organizationId?: string | null): Promise<CategoryDocument> {
    let fullPath: string | undefined;
    if (dto.parentId) {
      const parent = await this.findById(dto.parentId, organizationId);
      fullPath = parent.fullPath ? `${parent.fullPath}/${dto.slug}` : `${parent.name}/${dto.slug}`;
    } else fullPath = dto.slug;
    return this.model.create({ ...dto, fullPath, ...this.organizationWrite(organizationId) });
  }

  async findAll(type?: string, organizationId?: string | null): Promise<CategoryDocument[]> {
    const filter: Record<string, unknown> = { deletedAt: null, ...this.organizationFilter(organizationId) };
    if (type) filter.type = type;
    return this.model.find(filter).sort({ type: 1, fullPath: 1 }).exec();
  }

  async findById(id: string, organizationId?: string | null): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`Category ${id} not found`);
    const doc = await this.model.findOne({ _id: new Types.ObjectId(id), deletedAt: null, ...this.organizationFilter(organizationId) }).exec();
    if (!doc) throw new NotFoundException(`Category ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateCategoryDto, organizationId?: string | null): Promise<CategoryDocument> {
    const doc = await this.findById(id, organizationId);
    const oldSlug = doc.slug;
    const oldParentId = doc.parentId ? doc.parentId.toString() : null;
    const oldFullPath = doc.fullPath;
    const newSlug = dto.slug ?? oldSlug;
    const newParentId = 'parentId' in dto ? (dto.parentId ? String(dto.parentId) : null) : oldParentId;
    const slugChanged = dto.slug !== undefined && dto.slug !== oldSlug;
    const parentChanged = newParentId !== oldParentId;
    Object.assign(doc, dto);
    await doc.save();
    if ((slugChanged || parentChanged) && oldFullPath) {
      if (newParentId) {
        const isDescendant = await this.isDescendantOf(newParentId, id, organizationId);
        if (isDescendant) throw new BadRequestException('Cannot move category under its own descendant (would create a cycle)');
      }
      let newFullPath: string;
      if (newParentId) {
        const parent = await this.findById(newParentId, organizationId);
        newFullPath = parent.fullPath ? `${parent.fullPath}/${newSlug}` : `${parent.name}/${newSlug}`;
      } else newFullPath = newSlug;
      await this.model.updateOne({ _id: doc._id, ...this.organizationFilter(organizationId) }, { $set: { fullPath: newFullPath } }).exec();
      const prefixRegex = new RegExp(`^${CategoryService.escapeRegex(oldFullPath)}/`);
      const descendants = await this.model.find({ fullPath: prefixRegex, deletedAt: null, ...this.organizationFilter(organizationId) }).exec();
      if (descendants.length > 0) {
        const ops = descendants.map((desc) => ({ updateOne: { filter: { _id: desc._id }, update: { $set: { fullPath: `${newFullPath}${desc.fullPath!.substring(oldFullPath.length)}` } } } }));
        await this.model.bulkWrite(ops);
      }
    }
    return doc;
  }

  async remove(id: string, organizationId?: string | null): Promise<void> {
    const doc = await this.findById(id, organizationId);
    const child = await this.model.findOne({ parentId: doc._id, deletedAt: null, ...this.organizationFilter(organizationId) }).select('_id').exec();
    const refs = await Promise.all([
      this.model.db.collection('products').findOne({ categoryId: doc._id }),
      this.model.db.collection('materials').findOne({ categoryId: doc._id }),
    ]);
    if (child || refs.some(Boolean)) throw new ConflictException('Category has active children or catalog references and cannot be archived');
    await this.model.updateOne({ _id: doc._id, deletedAt: null, ...this.organizationFilter(organizationId) }, { $set: { deletedAt: new Date(), isActive: false } }).exec();
  }

  async reorder(categoryIds: string[], organizationId?: string | null): Promise<CategoryDocument[]> {
    const invalid = categoryIds.find((id) => !Types.ObjectId.isValid(id));
    if (invalid) throw new BadRequestException(`Invalid category id: ${invalid}`);
    const session = await this.model.db.startSession(); session.startTransaction();
    try {
      const ops = categoryIds.map((id, index) => ({ updateOne: { filter: { _id: new Types.ObjectId(id), deletedAt: null, ...this.organizationFilter(organizationId) }, update: { $set: { sortOrder: index } } } }));
      await this.model.bulkWrite(ops, { session }); await session.commitTransaction();
    } catch (e) { await session.abortTransaction(); throw e; } finally { session.endSession(); }
    return this.findAll(undefined, organizationId);
  }

  async reorderChildren(parentId: string | null, childIds: string[], organizationId?: string | null): Promise<CategoryDocument[]> {
    if (parentId && !Types.ObjectId.isValid(parentId)) throw new BadRequestException(`Invalid parent id: ${parentId}`);
    const invalidChild = childIds.find((id) => !Types.ObjectId.isValid(id));
    if (invalidChild) throw new BadRequestException(`Invalid child category id: ${invalidChild}`);
    const filter: Record<string, unknown> = parentId ? { parentId: new Types.ObjectId(parentId) } : { parentId: { $exists: false } };
    const existing = await this.model.find({ _id: { $in: childIds.map((id) => new Types.ObjectId(id)) }, ...filter, deletedAt: null, ...this.organizationFilter(organizationId) }).select('_id').exec();
    const validIds = new Set(existing.map((d: CategoryDocument) => d._id.toString()));
    const ops = childIds.filter((id) => validIds.has(id)).map((id, index) => ({ updateOne: { filter: { _id: new Types.ObjectId(id) }, update: { $set: { sortOrder: index } } } }));
    if (ops.length > 0) { const session = await this.model.db.startSession(); session.startTransaction(); try { await this.model.bulkWrite(ops, { session }); await session.commitTransaction(); } catch (e) { await session.abortTransaction(); throw e; } finally { session.endSession(); } }
    return this.findAll(undefined, organizationId);
  }

  async buildTree(type?: string, organizationId?: string | null): Promise<CategoryNode[]> {
    const flat = await this.findAll(type, organizationId);
    const map = new Map<string, CategoryNode>();
    flat.forEach((c) => { const obj = c.toObject() as { name: string; slug: string; type: string; parentId?: Types.ObjectId; fullPath?: string; skuPrefix: string; sortOrder: number; isActive: boolean; description?: string }; map.set(c.id, { _id: c.id, name: obj.name, slug: obj.slug, type: obj.type, parentId: obj.parentId?.toString(), fullPath: obj.fullPath, skuPrefix: obj.skuPrefix, sortOrder: obj.sortOrder, isActive: obj.isActive, children: [] }); });
    const roots: CategoryNode[] = [];
    for (const node of map.values()) { if (node.parentId && map.has(node.parentId)) map.get(node.parentId)!.children.push(node); else roots.push(node); }
    return roots;
  }

  private async isDescendantOf(candidateDescendantId: string, ancestorId: string, organizationId?: string | null): Promise<boolean> {
    let currentId = candidateDescendantId; const visited = new Set<string>();
    while (currentId) {
      if (currentId === ancestorId) return true;
      if (visited.has(currentId)) break;
      visited.add(currentId);
      const doc = await this.model.findOne({ _id: new Types.ObjectId(currentId), deletedAt: null, ...this.organizationFilter(organizationId) }).select('parentId').lean().exec();
      if (!doc?.parentId) break;
      currentId = doc.parentId.toString();
    }
    return false;
  }

  private organizationFilter(organizationId?: string | null): Record<string, unknown> {
    if (!organizationId) return {};
    if (!Types.ObjectId.isValid(organizationId)) throw new BadRequestException('Invalid organization scope');
    const id = new Types.ObjectId(organizationId);
    return { $or: [{ organizationId: id }, { organizationId: null }, { organizationId: { $exists: false } }] };
  }
  private organizationWrite(organizationId?: string | null): Record<string, unknown> {
    if (!organizationId) return {};
    if (!Types.ObjectId.isValid(organizationId)) throw new BadRequestException('Invalid organization scope');
    return { organizationId: new Types.ObjectId(organizationId) };
  }
  private static escapeRegex(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}
