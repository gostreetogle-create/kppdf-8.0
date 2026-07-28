import React, { useState } from 'react';
import { Package, Layers, Hammer, Wrench, Search, Plus, Filter, Calculator, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Product, Material, WorkType } from '../../types';

interface CatalogManagerProps {
  products: Product[];
  materials: Material[];
  workTypes: WorkType[];
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  products,
  materials,
  workTypes,
}) => {
  const [activeCategory, setActiveCategory] = useState<'products' | 'materials' | 'workTypes'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaterials = materials.filter(
    (m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkTypes = workTypes.filter(
    (w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="py-6 space-y-6 font-mono">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded bg-[var(--color-paper-2)] hairline">
        <div className="flex items-center gap-1 bg-[var(--color-paper-3)] p-1 rounded hairline">
          <button
            onClick={() => setActiveCategory('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeCategory === 'products'
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            <span>ПРОДУКЦИЯ ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('materials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeCategory === 'materials'
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>МАТЕРИАЛЫ ({materials.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('workTypes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeCategory === 'workTypes'
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>ВИДЫ РАБОТ ({workTypes.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Поиск по артикулу или названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--color-paper)] hairline rounded text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeCategory === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Products List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Артикул</th>
                    <th className="p-3">Наименование</th>
                    <th className="p-3">Себестоимость</th>
                    <th className="p-3">Продажная цена</th>
                    <th className="p-3">Маржа</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
                  {filteredProducts.map((prod) => {
                    const isSelected = selectedProductId === prod.id;
                    return (
                      <tr
                        key={prod.id}
                        onClick={() => setSelectedProductId(prod.id)}
                        className={`hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[var(--color-gold-soft)] border-l-2 border-l-[var(--color-gold)] font-semibold' : ''
                        }`}
                      >
                        <td className="p-3 text-[var(--color-gold)] font-bold">{prod.code}</td>
                        <td className="p-3">
                          <div className="font-medium text-[var(--color-ink)]">{prod.name}</div>
                          <div className="text-[10px] text-[var(--color-muted)]">{prod.category}</div>
                        </td>
                        <td className="p-3">{prod.costPrice.toLocaleString('ru-RU')} ₽</td>
                        <td className="p-3 font-bold text-[var(--color-ink)]">
                          {prod.sellingPrice.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="p-3 text-[var(--color-success)] font-bold">
                          +{prod.marginPercent}%
                        </td>
                        <td className="p-3 text-right">
                          <ArrowUpRight className="w-4 h-4 text-[var(--color-muted)] inline" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product BOM Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedProduct && (
              <div className="p-5 rounded bg-[var(--color-paper-2)] hairline space-y-4 executive-shadow">
                <div className="pb-3 hairline-b flex justify-between items-start">
                  <div>
                    <span className="eyebrow">КАЛЬКУЛЯЦИЯ СЕБЕСТОИМОСТИ (BOM)</span>
                    <h3 className="text-sm font-bold font-display text-[var(--color-ink)] mt-1">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--color-paper-3)] text-[var(--color-gold)] border border-[var(--color-gold)]">
                    {selectedProduct.code}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-[var(--color-paper)] hairline">
                    <span className="text-[var(--color-muted)]">Базовая себестоимость материалов:</span>
                    <span className="font-bold">
                      {Math.round(selectedProduct.costPrice * 0.75).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded bg-[var(--color-paper)] hairline">
                    <span className="text-[var(--color-muted)]">Затраты на сборку и трудоемкость:</span>
                    <span className="font-bold">
                      {Math.round(selectedProduct.costPrice * 0.25).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded bg-[var(--color-paper-3)] hairline font-bold">
                    <span>Итого полная себестоимость:</span>
                    <span>{selectedProduct.costPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>

                  <div className="p-3 rounded bg-[var(--color-gold-soft)] border border-[var(--color-gold)] space-y-1">
                    <div className="flex justify-between text-[var(--color-ink)] font-bold">
                      <span>Рекомендуемая цена реализации:</span>
                      <span className="text-[var(--color-gold)] text-sm">
                        {selectedProduct.sellingPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--color-muted)]">
                      <span>Валовая маржа:</span>
                      <span className="text-[var(--color-success)] font-bold">
                        +{(selectedProduct.sellingPrice - selectedProduct.costPrice).toLocaleString('ru-RU')} ₽ ({selectedProduct.marginPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Materials View */}
      {activeCategory === 'materials' && (
        <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Артикул</th>
                <th className="p-3">Наименование материала</th>
                <th className="p-3">Тип</th>
                <th className="p-3">Остаток на складе</th>
                <th className="p-3">Зарезервировано</th>
                <th className="p-3">Цена закупки</th>
                <th className="p-3">Поставщик</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
              {filteredMaterials.map((mat) => (
                <tr key={mat.id} className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 text-[var(--color-gold)] font-bold">{mat.code}</td>
                  <td className="p-3 font-medium text-[var(--color-ink)]">{mat.name}</td>
                  <td className="p-3 uppercase text-[10px] text-[var(--color-muted)]">{mat.type}</td>
                  <td className="p-3 font-bold text-[var(--color-ink)]">
                    {mat.stockQuantity} {mat.unit}
                  </td>
                  <td className="p-3 text-[var(--color-warning)] font-bold">
                    {mat.reservedQuantity} {mat.unit}
                  </td>
                  <td className="p-3 font-bold">{mat.purchasePrice.toLocaleString('ru-RU')} ₽</td>
                  <td className="p-3 text-[var(--color-muted)]">{mat.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Work Types View */}
      {activeCategory === 'workTypes' && (
        <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Артикул</th>
                <th className="p-3">Наименование технологической операции</th>
                <th className="p-3">Рабочий центр / Цех</th>
                <th className="p-3">Нормо-часы</th>
                <th className="p-3">Часовая ставка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
              {filteredWorkTypes.map((work) => (
                <tr key={work.id} className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 text-[var(--color-gold)] font-bold">{work.code}</td>
                  <td className="p-3 font-medium text-[var(--color-ink)]">{work.name}</td>
                  <td className="p-3 text-[var(--color-muted)]">{work.workCenter}</td>
                  <td className="p-3 font-bold">{work.standardHours} ч</td>
                  <td className="p-3 font-bold text-[var(--color-ink)]">
                    {work.hourlyRate.toLocaleString('ru-RU')} ₽ / ч
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
