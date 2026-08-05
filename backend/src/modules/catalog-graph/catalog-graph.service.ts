import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material, MaterialDocument } from '../material/material.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { ProductModule, ProductModuleDocument } from '../product-module/product-module.schema';

export const MAX_DEPTH = 8;
export type ParentKind = 'product' | 'module';
export type LineType = 'module' | 'material' | 'product';
export interface ProposedEdge { lineType: LineType; refId: string; }
export interface TreeNode { _id: string; name: string; kind: ParentKind | 'material'; lineType?: LineType; quantity: number; unit?: string; children: TreeNode[]; }
export type WhereUsedKind = 'product' | 'module' | 'material' | 'workType';
export interface WhereUsedItem { id: string; kind: ParentKind; name: string; relation: WhereUsedKind; quantity: number; unit?: string; sortOrder?: number; }
export interface WhereUsedPage { items: WhereUsedItem[]; total: number; page: number; limit: number; }
type ChildRef = { refId: string; lineType: LineType; quantity: number; unit?: string; lineId?: string };
type IgnoredEdge = { parentId: string; parentKind: ParentKind; lineId: string };
type LeanLine = { _id?: Types.ObjectId; refId: Types.ObjectId; lineType: string; quantity: number; unit?: string; sortOrder?: number };
type LeanParent = {
  _id: Types.ObjectId;
  name?: string;
  composition?: LeanLine[];
  productModuleIds?: Types.ObjectId[];
  materials?: Array<{ materialId: Types.ObjectId; quantity?: number; unit?: string; sortOrder?: number }>;
  workTypes?: Array<{ workTypeId: Types.ObjectId; estimatedHours?: number; sortOrder?: number }>;
};
type QueryResult<T> = { select: (fields: string) => QueryResult<T>; lean: () => QueryResult<T>; exec: () => Promise<T> };
type FindModel = { find: (filter: Record<string, unknown>) => QueryResult<unknown[]> };

@Injectable()
export class CatalogGraphService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductModule.name) private readonly moduleModel: Model<ProductModuleDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async assertNoCycleAndDepth(parentId: string, parentKind: ParentKind, edge: ProposedEdge, skipLineId?: string): Promise<void> {
    const childKind = edge.lineType === 'product' ? 'product' : edge.lineType === 'module' ? 'module' : 'material';
    if (childKind === parentKind && parentId === edge.refId) {
      throw new BadRequestException('Нельзя добавить элемент в состав самого себя (self-reference)');
    }
    const ignoredEdge = skipLineId ? { parentId, parentKind, lineId: skipLineId } : undefined;
    const parentDepth = await this.maxAncestorDepth(parentId, parentKind, ignoredEdge);
    const activePath = new Set<string>([`${parentKind}:${parentId}`]);
    const maxChildDepth = await this.maxDescendantDepth(edge.refId, edge.lineType, activePath, `${parentKind}:${parentId}`, ignoredEdge);
    if (parentDepth + 1 + maxChildDepth > MAX_DEPTH) {
      throw new UnprocessableEntityException(`Глубина состава превышает лимит (${MAX_DEPTH}). Текущая глубина родителя: ${parentDepth}, максимальная глубина потомка: ${maxChildDepth}.`);
    }
  }

  /**
   * Returns direct catalog parents that reference a target. Missing target
   * documents are intentionally tolerated: backlinks describe stored edges,
   * including legacy/orphan edges, without dereferencing the child.
   */
  async getWhereUsed(
    kind: WhereUsedKind,
    id: string,
    options: { page?: number; limit?: number; organizationId?: string | null } = {},
  ): Promise<WhereUsedPage> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const objectId = new Types.ObjectId(id);
    const scope = this.organizationScope(options.organizationId);
    const rows: WhereUsedItem[] = [];

    if (kind === 'product') {
      const parents = await this.findParents(this.productModel, {
        composition: { $elemMatch: { lineType: 'product', refId: objectId } },
      }, scope, '_id name composition') as LeanParent[];
      for (const parent of parents) {
        for (const line of (parent.composition ?? []).filter((item) => item.lineType === 'product' && String(item.refId) === id)) {
          rows.push(this.toWhereUsedItem(parent, 'product', kind, line.quantity, line.unit, line.sortOrder));
        }
      }
    } else if (kind === 'module') {
      const [products, modules] = await Promise.all([
        this.findParents(this.productModel, {
          $or: [
            { composition: { $elemMatch: { lineType: 'module', refId: objectId } } },
            { productModuleIds: objectId },
          ],
        }, scope, '_id name composition productModuleIds') as Promise<LeanParent[]>,
        this.findParents(this.moduleModel, {
          composition: { $elemMatch: { lineType: 'module', refId: objectId } },
        }, undefined, '_id name composition') as Promise<LeanParent[]>,
      ]);
      for (const parent of products) {
        const lines = parent.composition?.length
          ? parent.composition.filter((item) => item.lineType === 'module' && String(item.refId) === id)
          : (parent.productModuleIds ?? []).filter((refId) => String(refId) === id).map(() => ({ quantity: 1, sortOrder: 0, unit: undefined }));
        for (const line of lines) rows.push(this.toWhereUsedItem(parent, 'product', kind, line.quantity, line.unit, line.sortOrder));
      }
      for (const parent of modules) {
        for (const line of (parent.composition ?? []).filter((item) => item.lineType === 'module' && String(item.refId) === id)) {
          rows.push(this.toWhereUsedItem(parent, 'module', kind, line.quantity, line.unit, line.sortOrder));
        }
      }
    } else if (kind === 'material') {
      const [modules, products] = await Promise.all([
        this.findParents(this.moduleModel, {
          $or: [
            { composition: { $elemMatch: { lineType: 'material', refId: objectId } } },
            { 'materials.materialId': objectId },
          ],
        }, undefined, '_id name composition materials') as Promise<LeanParent[]>,
        this.findParents(this.productModel, {
          composition: { $elemMatch: { lineType: 'material', refId: objectId } },
        }, scope, '_id name composition') as Promise<LeanParent[]>,
      ]);
      for (const parent of modules) {
        const lines = parent.composition?.length
          ? parent.composition.filter((item) => item.lineType === 'material' && String(item.refId) === id)
          : (parent.materials ?? []).filter((item) => String(item.materialId) === id).map((item) => ({ quantity: item.quantity ?? 1, unit: item.unit, sortOrder: item.sortOrder ?? 0 }));
        for (const line of lines) rows.push(this.toWhereUsedItem(parent, 'module', kind, line.quantity, line.unit, line.sortOrder));
      }
      for (const parent of products) {
        for (const line of (parent.composition ?? []).filter((item) => item.lineType === 'material' && String(item.refId) === id)) {
          rows.push(this.toWhereUsedItem(parent, 'product', kind, line.quantity, line.unit, line.sortOrder));
        }
      }
    } else {
      // WorkType is currently a shared dictionary without organizationId.
      // Therefore no org predicate is added until the schema gains ownership.
      const parents = await this.findParents(this.moduleModel, { 'workTypes.workTypeId': objectId }, undefined, '_id name workTypes') as LeanParent[];
      for (const parent of parents) {
        for (const workType of (parent.workTypes ?? []).filter((item) => String(item.workTypeId) === id)) {
          rows.push(this.toWhereUsedItem(parent, 'module', kind, 1, undefined, workType.sortOrder));
        }
      }
    }

    rows.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
    const total = rows.length;
    return { items: rows.slice((page - 1) * limit, page * limit), total, page, limit };
  }

  private async findParents(model: FindModel, baseFilter: Record<string, unknown>, scope: Record<string, unknown> | undefined, select: string): Promise<unknown[]> {
    const filter = scope ? { $and: [baseFilter, scope] } : baseFilter;
    return model.find(filter).select(select).lean().exec();
  }

  private organizationScope(organizationId?: string | null): Record<string, unknown> | undefined {
    if (!organizationId) return undefined;
    if (!Types.ObjectId.isValid(organizationId)) throw new BadRequestException('Invalid organizationId');
    const value = new Types.ObjectId(organizationId);
    return { $or: [{ organizationId: value }, { organizationId: null }, { organizationId: { $exists: false } }] };
  }

  private toWhereUsedItem(parent: LeanParent, kind: ParentKind, relation: WhereUsedKind, quantity: number, unit?: string, sortOrder?: number): WhereUsedItem {
    return { id: String(parent._id), kind, name: parent.name ?? String(parent._id), relation, quantity: quantity ?? 1, unit, sortOrder: sortOrder ?? 0 };
  }

  async getTree(kind: ParentKind, id: string, maxDepth = MAX_DEPTH): Promise<TreeNode> {
    if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > MAX_DEPTH) throw new BadRequestException(`maxDepth must be an integer from 1 to ${MAX_DEPTH}`);
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    const root = kind === 'product'
      ? await this.productModel.findById(id).select('name unit composition productModuleIds').lean().exec()
      : await this.moduleModel.findById(id).select('name composition materials').lean().exec();
    if (!root) throw new BadRequestException(`${kind} ${id} not found`);
    return this.buildNode(id, root.name ?? '', kind, root, maxDepth, 0, new Set());
  }

  private async maxAncestorDepth(id: string, kind: ParentKind, ignoredEdge?: IgnoredEdge): Promise<number> {
    const visited = new Set<string>();
    const queue: Array<{ id: string; kind: ParentKind; depth: number }> = [{ id, kind, depth: 0 }];
    let maxDepth = 0;
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.kind}:${current.id}`;
      if (visited.has(key)) continue;
      visited.add(key);
      maxDepth = Math.max(maxDepth, current.depth);
      for (const parent of await this.findParentsLegacy(current.id, current.kind, ignoredEdge)) queue.push({ id: parent.id, kind: parent.kind, depth: current.depth + 1 });
    }
    return maxDepth;
  }

  private async maxDescendantDepth(refId: string, lineType: LineType, activePath: Set<string>, cycleCheckKey: string, ignoredEdge?: IgnoredEdge): Promise<number> {
    if (lineType === 'material') return 0;
    const key = `${lineType}:${refId}`;
    if (key === cycleCheckKey || activePath.has(key)) throw new BadRequestException('Цикл в составе: дочерний элемент ссылается на элемент текущего пути');
    const nextPath = new Set(activePath).add(key);
    let maxChild = 0;
    for (const child of await this.getChildren(refId, lineType, ignoredEdge)) {
      maxChild = Math.max(maxChild, (await this.maxDescendantDepth(child.refId, child.lineType, nextPath, cycleCheckKey, ignoredEdge)) + 1);
    }
    return maxChild;
  }

  private async findParentsLegacy(childId: string, childKind: ParentKind, ignoredEdge?: IgnoredEdge): Promise<Array<{ id: string; kind: ParentKind }>> {
    if (!Types.ObjectId.isValid(childId)) return [];
    const objectId = new Types.ObjectId(childId);
    const parents: Array<{ id: string; kind: ParentKind }> = [];
    if (childKind === 'module') {
      const products = await this.productModel.find({ $or: [{ composition: { $elemMatch: { lineType: 'module', refId: objectId } } }, { productModuleIds: objectId }] }).select('_id composition productModuleIds').lean().exec() as unknown as LeanParent[];
      const modules = await this.moduleModel.find({ composition: { $elemMatch: { lineType: 'module', refId: objectId } } }).select('_id composition').lean().exec() as unknown as LeanParent[];
      for (const row of products) if (!this.isIgnoredParent(row, childId, 'product', ignoredEdge)) parents.push({ id: String(row._id), kind: 'product' });
      for (const row of modules) if (!this.isIgnoredParent(row, childId, 'module', ignoredEdge)) parents.push({ id: String(row._id), kind: 'module' });
    } else {
      const products = await this.productModel.find({ composition: { $elemMatch: { lineType: 'product', refId: objectId } } }).select('_id composition').lean().exec() as unknown as LeanParent[];
      for (const row of products) if (!this.isIgnoredParent(row, childId, 'product', ignoredEdge)) parents.push({ id: String(row._id), kind: 'product' });
    }
    return parents;
  }

  private isIgnoredParent(row: LeanParent, childId: string, parentKind: ParentKind, ignoredEdge?: IgnoredEdge): boolean {
    if (!ignoredEdge || String(row._id) !== ignoredEdge.parentId || parentKind !== ignoredEdge.parentKind) return false;
    return Boolean(row.composition?.some((line) => String(line._id) === ignoredEdge.lineId && String(line.refId) === childId));
  }

  private async getChildren(refId: string, lineType: LineType, ignoredEdge?: IgnoredEdge): Promise<ChildRef[]> {
    if (!Types.ObjectId.isValid(refId) || lineType === 'material') return [];
    if (lineType === 'module') {
      const module = await this.moduleModel.findById(refId).select('composition materials').lean().exec();
      if (!module) return [];
      if (module.composition?.length) return (module.composition as unknown as LeanLine[]).filter((line) => !this.isIgnoredLine(refId, 'module', line, ignoredEdge)).map((line) => ({ refId: String(line.refId), lineType: line.lineType as LineType, quantity: line.quantity, unit: line.unit, lineId: line._id ? String(line._id) : undefined }));
      return (module.materials ?? []).map((row) => ({ refId: String(row.materialId), lineType: 'material' as const, quantity: row.quantity ?? 1, unit: row.unit }));
    }
    const product = await this.productModel.findById(refId).select('composition productModuleIds').lean().exec();
    if (!product) return [];
    if (product.composition?.length) return (product.composition as unknown as LeanLine[]).filter((line) => !this.isIgnoredLine(refId, 'product', line, ignoredEdge)).map((line) => ({ refId: String(line.refId), lineType: line.lineType as LineType, quantity: line.quantity, unit: line.unit, lineId: line._id ? String(line._id) : undefined }));
    return (product.productModuleIds ?? []).map((moduleId) => ({ refId: String(moduleId), lineType: 'module' as const, quantity: 1 }));
  }

  private isIgnoredLine(parentId: string, parentKind: ParentKind, line: LeanLine, ignoredEdge?: IgnoredEdge): boolean {
    return Boolean(ignoredEdge && parentId === ignoredEdge.parentId && parentKind === ignoredEdge.parentKind && String(line._id) === ignoredEdge.lineId);
  }

  private async buildNode(id: string, name: string, kind: ParentKind | 'material', raw: Record<string, unknown> | null, maxDepth: number, currentDepth: number, visited: Set<string>): Promise<TreeNode> {
    const quantity = typeof raw?.quantity === 'number' ? raw.quantity : 1;
    const unit = typeof raw?.unit === 'string' ? raw.unit : undefined;
    const node: TreeNode = { _id: id, name, kind, quantity, unit, children: [] };
    if (currentDepth >= maxDepth || visited.has(`${kind}:${id}`)) return node;
    const nextVisited = new Set(visited).add(`${kind}:${id}`);
    for (const child of kind === 'material' ? [] : await this.getChildren(id, kind)) {
      const childKind: ParentKind | 'material' = child.lineType === 'material' ? 'material' : child.lineType;
      const childRaw = childKind === 'material' ? await this.lookupMaterial(child.refId) : await this.lookupEntity(childKind, child.refId);
      const childNode = await this.buildNode(child.refId, childRaw?.name ?? child.refId, childKind, { ...(childRaw ?? {}), quantity: child.quantity, unit: child.unit }, maxDepth, currentDepth + 1, nextVisited);
      childNode.quantity = child.quantity;
      childNode.unit = child.unit;
      childNode.lineType = child.lineType;
      node.children.push(childNode);
    }
    return node;
  }

  private async lookupEntity(kind: ParentKind, id: string): Promise<{ name?: string; unit?: string } | null> {
    const row = kind === 'product' ? await this.productModel.findById(id).select('name unit').lean().exec() : await this.moduleModel.findById(id).select('name').lean().exec();
    return row ? { name: row.name, unit: 'unit' in row ? row.unit : undefined } : null;
  }

  private async lookupMaterial(id: string): Promise<{ name?: string; unit?: string } | null> {
    const row = await this.materialModel.findById(id).select('name unit').lean().exec();
    return row ? { name: row.name, unit: row.unit } : null;
  }
}
