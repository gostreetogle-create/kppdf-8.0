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
type ChildRef = { refId: string; lineType: LineType; quantity: number; unit?: string; lineId?: string };
type IgnoredEdge = { parentId: string; parentKind: ParentKind; lineId: string };
type LeanLine = { _id?: Types.ObjectId; refId: Types.ObjectId; lineType: string; quantity: number; unit?: string };
type LeanParent = { _id: Types.ObjectId; composition?: LeanLine[] };

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
      for (const parent of await this.findParents(current.id, current.kind, ignoredEdge)) queue.push({ id: parent.id, kind: parent.kind, depth: current.depth + 1 });
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

  private async findParents(childId: string, childKind: ParentKind, ignoredEdge?: IgnoredEdge): Promise<Array<{ id: string; kind: ParentKind }>> {
    if (!Types.ObjectId.isValid(childId)) return [];
    const objectId = new Types.ObjectId(childId);
    const parents: Array<{ id: string; kind: ParentKind }> = [];
    if (childKind === 'module') {
      const products = await this.productModel.find({
        $or: [
          { composition: { $elemMatch: { lineType: 'module', refId: objectId } } },
          { productModuleIds: objectId },
        ],
      }).select('_id composition productModuleIds').lean().exec() as unknown as LeanParent[];
      const modules = await this.moduleModel.find({
        composition: { $elemMatch: { lineType: 'module', refId: objectId } },
      }).select('_id composition').lean().exec() as unknown as LeanParent[];
      for (const row of products) if (!this.isIgnoredParent(row, childId, 'product', ignoredEdge)) parents.push({ id: String(row._id), kind: 'product' });
      for (const row of modules) if (!this.isIgnoredParent(row, childId, 'module', ignoredEdge)) parents.push({ id: String(row._id), kind: 'module' });
    } else {
      const products = await this.productModel.find({
        composition: { $elemMatch: { lineType: 'product', refId: objectId } },
      }).select('_id composition').lean().exec() as unknown as LeanParent[];
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
      if (module.composition?.length) {
        return (module.composition as unknown as LeanLine[])
          .filter((line) => !this.isIgnoredLine(refId, 'module', line, ignoredEdge))
          .map((line) => ({ refId: String(line.refId), lineType: line.lineType as LineType, quantity: line.quantity, unit: line.unit, lineId: line._id ? String(line._id) : undefined }));
      }
      return (module.materials ?? []).map((row) => ({ refId: String(row.materialId), lineType: 'material' as const, quantity: row.quantity ?? 1, unit: row.unit }));
    }
    const product = await this.productModel.findById(refId).select('composition productModuleIds').lean().exec();
    if (!product) return [];
    if (product.composition?.length) {
      return (product.composition as unknown as LeanLine[])
        .filter((line) => !this.isIgnoredLine(refId, 'product', line, ignoredEdge))
        .map((line) => ({ refId: String(line.refId), lineType: line.lineType as LineType, quantity: line.quantity, unit: line.unit, lineId: line._id ? String(line._id) : undefined }));
    }
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
