import React from 'react';
import { Boxes, ArrowDownRight, ArrowUpRight, ShieldAlert, History } from 'lucide-react';
import { Material, StockMovement } from '../../types';

interface WarehouseManagerProps {
  materials: Material[];
  movements: StockMovement[];
}

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({ materials, movements }) => {
  return (
    <div className="py-6 space-y-6 font-mono">
      {/* Warehouse Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-1">
          <span className="eyebrow text-[var(--color-muted)]">ВСЕГО МАТЕРИАЛОВ НА СКЛАДЕ</span>
          <div className="text-xl font-bold font-display text-[var(--color-ink)]">
            {materials.reduce((acc, m) => acc + m.stockQuantity, 0).toLocaleString('ru-RU')} ед.
          </div>
          <p className="text-[10px] text-[var(--color-muted)]">По 42 активным номенклатурам</p>
        </div>

        <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-1 border-l-2 border-l-[var(--color-warning)]">
          <span className="eyebrow text-[var(--color-warning)]">ЗАРЕЗЕРВИРОВАНО ПОД КП/ЗАКАЗЫ</span>
          <div className="text-xl font-bold font-display text-[var(--color-warning)]">
            {materials.reduce((acc, m) => acc + m.reservedQuantity, 0).toLocaleString('ru-RU')} ед.
          </div>
          <p className="text-[10px] text-[var(--color-muted)]">Связанные коммерческие предложения</p>
        </div>

        <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-1 border-l-2 border-l-[var(--color-gold)]">
          <span className="eyebrow text-[var(--color-gold)]">СТОИМОСТЬ ОСТАТКОВ</span>
          <div className="text-xl font-bold font-display text-[var(--color-gold)]">
            4 820 000 ₽
          </div>
          <p className="text-[10px] text-[var(--color-muted)]">Базовая закупочная стоимость</p>
        </div>
      </div>

      {/* Stock Movement Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow flex items-center gap-1.5 text-[var(--color-ink)]">
            <History className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            ЖУРНАЛ ДВИЖЕНИЯ И РЕЗЕРВИРОВАНИЯ ТМЦ
          </span>
          <span className="text-xs text-[var(--color-muted)]">Последние 24 часа</span>
        </div>

        <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Дата и время</th>
                <th className="p-3">Материал / Номенклатура</th>
                <th className="p-3">Тип операции</th>
                <th className="p-3">Количество</th>
                <th className="p-3">Документ-основание</th>
                <th className="p-3">Оператор</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
              {movements.map((mov) => (
                <tr key={mov.id} className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 text-[var(--color-muted)]">{mov.date}</td>
                  <td className="p-3 font-medium text-[var(--color-ink)]">{mov.materialName}</td>
                  <td className="p-3">
                    {mov.type === 'reserve' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]">
                        РЕЗЕРВ
                      </span>
                    )}
                    {mov.type === 'in' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]">
                        ПРИХОД
                      </span>
                    )}
                    {mov.type === 'out' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]">
                        РАСХОД
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-[var(--color-ink)]">{mov.quantity}</td>
                  <td className="p-3 text-[var(--color-gold)] font-bold">{mov.documentRef}</td>
                  <td className="p-3 text-[var(--color-muted)]">{mov.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
