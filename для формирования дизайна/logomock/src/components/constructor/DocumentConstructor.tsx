import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Printer,
  Download,
  Eye,
  Edit3,
  CheckCircle2,
  FileCode,
  Sparkles,
  Lock,
  RotateCcw,
  Building2,
  User,
  Calendar,
  Hash,
  Copy,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ProposalDocument, DocumentBlock, TableItem } from '../../types';

interface DocumentConstructorProps {
  proposal: ProposalDocument;
  onUpdateProposal: (updated: ProposalDocument) => void;
}

export const DocumentConstructor: React.FC<DocumentConstructorProps> = ({
  proposal,
  onUpdateProposal,
}) => {
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(proposal.blocks[0]?.id || '');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Recalculate Totals
  const calculateTotals = (blocks: DocumentBlock[]) => {
    let rawTotal = 0;
    let discountTotal = 0;

    blocks.forEach((b) => {
      if (b.type === 'table' && b.tableData) {
        b.tableData.forEach((row) => {
          rawTotal += row.quantity * row.price;
          discountTotal += row.quantity * row.price * (row.discount / 100);
        });
      }
    });

    const netTotal = rawTotal - discountTotal;
    const vat = netTotal * 0.2; // 20% VAT
    const grandTotal = netTotal + vat;

    return { netTotal, vat, grandTotal, discountTotal };
  };

  const totals = calculateTotals(proposal.blocks);

  // Block Manipulation Handlers
  const handleAddBlock = (type: DocumentBlock['type']) => {
    const newId = `blk-${Date.now()}`;
    let newBlock: DocumentBlock;

    if (type === 'text') {
      newBlock = {
        id: newId,
        type: 'text',
        title: 'Новый текстовый раздел',
        content: 'Введите описание условий, гарантий или технических характеристик...',
      };
    } else if (type === 'table') {
      newBlock = {
        id: newId,
        type: 'table',
        title: 'Дополнительная спецификация оборудования',
        tableData: [
          {
            id: `item-${Date.now()}`,
            code: 'NEW-001',
            name: 'Наименование новой позиции',
            unit: 'шт.',
            quantity: 1,
            price: 50000,
            discount: 0,
            total: 50000,
          },
        ],
      };
    } else {
      newBlock = {
        id: newId,
        type: 'terms',
        title: 'Дополнительные условия',
        content: 'Укажите специальный порядок оплаты или график поставок.',
      };
    }

    const updatedBlocks = [...proposal.blocks, newBlock];
    onUpdateProposal({
      ...proposal,
      blocks: updatedBlocks,
      totalAmount: totals.grandTotal,
    });
    setSelectedBlockId(newId);
  };

  const handleRemoveBlock = (id: string) => {
    const updatedBlocks = proposal.blocks.filter((b) => b.id !== id);
    onUpdateProposal({
      ...proposal,
      blocks: updatedBlocks,
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(updatedBlocks[0]?.id || '');
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...proposal.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    onUpdateProposal({
      ...proposal,
      blocks: newBlocks,
    });
  };

  const handleUpdateBlockTitle = (id: string, title: string) => {
    const updated = proposal.blocks.map((b) => (b.id === id ? { ...b, title } : b));
    onUpdateProposal({ ...proposal, blocks: updated });
  };

  const handleUpdateBlockContent = (id: string, content: string) => {
    const updated = proposal.blocks.map((b) => (b.id === id ? { ...b, content } : b));
    onUpdateProposal({ ...proposal, blocks: updated });
  };

  // Table Row Handlers
  const handleAddTableRow = (blockId: string) => {
    const updated = proposal.blocks.map((b) => {
      if (b.id === blockId && b.tableData) {
        const newRow: TableItem = {
          id: `item-${Date.now()}`,
          code: 'EQP-00' + (b.tableData.length + 1),
          name: 'Новый компонент / услуга',
          unit: 'шт.',
          quantity: 1,
          price: 10000,
          discount: 0,
          total: 10000,
        };
        return { ...b, tableData: [...b.tableData, newRow] };
      }
      return b;
    });
    onUpdateProposal({ ...proposal, blocks: updated });
  };

  const handleUpdateTableRow = (
    blockId: string,
    rowId: string,
    field: keyof TableItem,
    value: string | number
  ) => {
    const updated = proposal.blocks.map((b) => {
      if (b.id === blockId && b.tableData) {
        const newTableData = b.tableData.map((row) => {
          if (row.id === rowId) {
            const updatedRow = { ...row, [field]: value };
            const q = field === 'quantity' ? Number(value) : row.quantity;
            const p = field === 'price' ? Number(value) : row.price;
            const d = field === 'discount' ? Number(value) : row.discount;
            updatedRow.total = q * p * (1 - d / 100);
            return updatedRow;
          }
          return row;
        });
        return { ...b, tableData: newTableData };
      }
      return b;
    });
    onUpdateProposal({ ...proposal, blocks: updated });
  };

  const handleDeleteTableRow = (blockId: string, rowId: string) => {
    const updated = proposal.blocks.map((b) => {
      if (b.id === blockId && b.tableData) {
        return { ...b, tableData: b.tableData.filter((r) => r.id !== rowId) };
      }
      return b;
    });
    onUpdateProposal({ ...proposal, blocks: updated });
  };

  const handleSimulateExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3500);
  };

  const selectedBlock = proposal.blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="py-6 space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded bg-[var(--color-paper-2)] hairline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-display text-[var(--color-ink)]">
              {proposal.number} — {proposal.clientName}
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-[var(--color-gold-soft)] text-[var(--color-gold)] border border-[var(--color-gold)]">
              {proposal.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1 font-mono">
            Организация: {proposal.organizationName} | ИНН: {proposal.clientInn} | Дата:{' '}
            {proposal.date}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center p-1 rounded bg-[var(--color-paper-3)] hairline">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
                viewMode === 'editor'
                  ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm font-semibold'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>РЕДАКТОР (3-PANE)</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm font-semibold'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>ЖИВОЙ PDF ХОЛСТ</span>
            </button>
          </div>

          <button
            onClick={handleSimulateExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase rounded bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black transition-all cursor-pointer shadow-sm ml-auto lg:ml-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Сформировать PDF</span>
          </button>
        </div>
      </div>

      {/* Export notification alert */}
      {exportSuccess && (
        <div className="flex items-center justify-between p-3.5 rounded bg-[var(--color-success-soft)] border border-[var(--color-success)] text-[var(--color-success)] text-xs font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Документ <strong>{proposal.number}.pdf</strong> успешно сгенерирован с подписями и печатью!
            </span>
          </div>
          <span className="font-bold">2.4 MB PDF/A</span>
        </div>
      )}

      {/* View Mode 1: 3-Pane Editor */}
      {viewMode === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANE: Block Structure & Variables (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-3">
              <div className="flex items-center justify-between pb-2 hairline-b">
                <span className="eyebrow flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  СТРУКТУРА БЛОКОВ
                </span>
                <span className="text-[10px] font-mono text-[var(--color-muted)]">
                  {proposal.blocks.length} разделов
                </span>
              </div>

              {/* Add Block Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => handleAddBlock('text')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] hairline text-[var(--color-ink)] transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[var(--color-gold)]" />
                  + Текст
                </button>
                <button
                  onClick={() => handleAddBlock('table')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] hairline text-[var(--color-ink)] transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[var(--color-gold)]" />
                  + Таблица
                </button>
              </div>

              {/* Block List Items */}
              <div className="space-y-1.5 pt-2">
                {proposal.blocks.map((block, idx) => {
                  const isSelected = selectedBlockId === block.id;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`p-2.5 rounded text-xs font-mono transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[var(--color-paper)] border-[var(--color-gold)] font-semibold shadow-sm'
                          : 'bg-[var(--color-paper-2)] border-transparent hover:bg-[var(--color-paper-3)] text-[var(--color-muted-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] text-[var(--color-muted)] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="truncate">{block.title}</span>
                        </div>
                        {block.isLocked && <Lock className="w-3 h-3 text-[var(--color-muted)] shrink-0" />}
                      </div>

                      {/* Reorder & delete bar when selected */}
                      {isSelected && (
                        <div className="flex items-center justify-between mt-2 pt-2 hairline-t text-[11px] text-[var(--color-muted)]">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(idx, 'up');
                              }}
                              disabled={idx === 0}
                              className="p-1 hover:text-[var(--color-ink)] disabled:opacity-30 cursor-pointer"
                              title="Вверх"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(idx, 'down');
                              }}
                              disabled={idx === proposal.blocks.length - 1}
                              className="p-1 hover:text-[var(--color-ink)] disabled:opacity-30 cursor-pointer"
                              title="Вниз"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>

                          {!block.isLocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveBlock(block.id);
                              }}
                              className="p-1 text-[var(--color-destructive)] hover:opacity-80 cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variable Bindings Reference */}
            <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-2">
              <span className="eyebrow flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                ДИНАМИЧЕСКИЕ ПЕРЕМЕННЫЕ
              </span>
              <p className="text-[11px] text-[var(--color-muted)]">
                Кликните для копирования переменной в текст:
              </p>
              <div className="space-y-1 font-mono text-[11px]">
                {[
                  { tag: '{{proposal.number}}', label: 'Номер КП' },
                  { tag: '{{client.name}}', label: 'Заказчик' },
                  { tag: '{{proposal.total}}', label: 'Сумма Итого' },
                  { tag: '{{proposal.date}}', label: 'Дата документа' },
                ].map((v) => (
                  <button
                    key={v.tag}
                    onClick={() => navigator.clipboard?.writeText(v.tag)}
                    className="flex items-center justify-between w-full p-1.5 rounded bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] hairline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-[var(--color-gold)] font-bold">{v.tag}</span>
                    <span className="text-[10px] text-[var(--color-muted)]">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER PANE: Active Block Canvas & Inline Editor (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {selectedBlock ? (
              <div className="p-5 rounded bg-[var(--color-paper-2)] hairline space-y-4 executive-shadow">
                <div className="flex items-center justify-between pb-3 hairline-b">
                  <div className="flex items-center gap-2">
                    <span className="eyebrow">БЛОК: {selectedBlock.type.toUpperCase()}</span>
                    {selectedBlock.isLocked && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--color-paper-3)] text-[var(--color-muted)]">
                        Системный
                      </span>
                    )}
                  </div>
                </div>

                {/* Block Title Edit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[var(--color-muted)]">
                    Заголовок раздела
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => handleUpdateBlockTitle(selectedBlock.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold font-display rounded bg-[var(--color-paper)] hairline text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                  />
                </div>

                {/* Text Block Content Edit */}
                {(selectedBlock.type === 'text' || selectedBlock.type === 'terms') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[var(--color-muted)]">
                      Текст раздела
                    </label>
                    <textarea
                      rows={6}
                      value={selectedBlock.content || ''}
                      onChange={(e) => handleUpdateBlockContent(selectedBlock.id, e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-mono rounded bg-[var(--color-paper)] hairline text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] leading-relaxed"
                    />
                  </div>
                )}

                {/* Table Block Editor */}
                {selectedBlock.type === 'table' && selectedBlock.tableData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-[var(--color-muted)]">
                        Позиции спецификации ({selectedBlock.tableData.length})
                      </label>
                      <button
                        onClick={() => handleAddTableRow(selectedBlock.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-[var(--color-gold-soft)] text-[var(--color-gold)] border border-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-black transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        + Позиция
                      </button>
                    </div>

                    <div className="overflow-x-auto hairline rounded">
                      <table className="w-full text-xs font-mono text-left">
                        <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
                          <tr>
                            <th className="p-2">Артикул / Наименование</th>
                            <th className="p-2 w-16">Ед.</th>
                            <th className="p-2 w-20">Кол-во</th>
                            <th className="p-2 w-24">Цена, ₽</th>
                            <th className="p-2 w-16">Скд %</th>
                            <th className="p-2 w-24 text-right">Сумма, ₽</th>
                            <th className="p-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
                          {selectedBlock.tableData.map((row) => (
                            <tr key={row.id} className="hover:bg-[var(--color-paper-2)]">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) =>
                                    handleUpdateTableRow(selectedBlock.id, row.id, 'name', e.target.value)
                                  }
                                  className="w-full bg-transparent text-xs font-medium focus:outline-none focus:bg-[var(--color-paper-3)] px-1 rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.unit}
                                  onChange={(e) =>
                                    handleUpdateTableRow(selectedBlock.id, row.id, 'unit', e.target.value)
                                  }
                                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-[var(--color-paper-3)] px-1 rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.quantity}
                                  onChange={(e) =>
                                    handleUpdateTableRow(selectedBlock.id, row.id, 'quantity', e.target.value)
                                  }
                                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-[var(--color-paper-3)] px-1 rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) =>
                                    handleUpdateTableRow(selectedBlock.id, row.id, 'price', e.target.value)
                                  }
                                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-[var(--color-paper-3)] px-1 rounded"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.discount}
                                  onChange={(e) =>
                                    handleUpdateTableRow(selectedBlock.id, row.id, 'discount', e.target.value)
                                  }
                                  className="w-full bg-transparent text-xs focus:outline-none focus:bg-[var(--color-paper-3)] px-1 rounded text-[var(--color-gold)] font-bold"
                                />
                              </td>
                              <td className="p-2 text-right font-bold text-[var(--color-ink)]">
                                {Math.round(row.total).toLocaleString('ru-RU')}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => handleDeleteTableRow(selectedBlock.id, row.id)}
                                  className="text-[var(--color-destructive)] hover:opacity-80 cursor-pointer"
                                  title="Удалить позицию"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center rounded bg-[var(--color-paper-2)] hairline text-[var(--color-muted)] font-mono">
                Выберите блок из левой панели для редактирования
              </div>
            )}
          </div>

          {/* RIGHT PANE: Proposal Inspector & Totals (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-4">
              <span className="eyebrow flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                ИТОГОВЫЙ РАСЧЕТ КП
              </span>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Сумма без НДС:</span>
                  <span>{Math.round(totals.netTotal).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Скидка (акция):</span>
                  <span className="text-[var(--color-gold)] font-semibold">
                    -{Math.round(totals.discountTotal).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>НДС (20%):</span>
                  <span>{Math.round(totals.vat).toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="pt-3 hairline-t flex justify-between items-baseline font-display">
                  <span className="font-bold text-sm text-[var(--color-ink)]">ИТОГО К ОПЛАТЕ:</span>
                  <span className="font-extrabold text-lg text-[var(--color-gold)] font-mono">
                    {Math.round(totals.grandTotal).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSimulateExport}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-mono font-bold uppercase rounded bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  ПЕЧАТЬ / ЭКСПОРТ PDF
                </button>
              </div>
            </div>

            {/* Document Metadata Card */}
            <div className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-3 font-mono text-xs">
              <span className="eyebrow">РЕКВИЗИТЫ ДОКУМЕНТА</span>
              <div className="space-y-2 text-[var(--color-muted-strong)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">Номер:</span>
                  <span className="font-bold">{proposal.number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">Дата:</span>
                  <span>{proposal.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">Действует до:</span>
                  <span>{proposal.validUntil}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode 2: Live PDF Printable Canvas */
        <div className="p-8 rounded bg-[#1e232a] hairline flex justify-center overflow-x-auto">
          {/* A4 Sheet Simulation */}
          <div className="w-[800px] min-h-[1050px] bg-white text-slate-900 p-12 shadow-2xl font-sans relative text-xs leading-relaxed space-y-6">
            {/* Printable Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  {proposal.contractorName}
                </h1>
                <p className="text-[11px] text-slate-600 mt-1">
                  119049, г. Москва, ул. Донская, д. 8, стр. 2 | ИНН 7705910294
                </p>
                <p className="text-[11px] text-slate-600">
                  Тел: +7 (495) 780-00-11 | Email: sales@kppdf-executive.ru
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-slate-900">
                  КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
                </div>
                <div className="text-base font-extrabold text-amber-700 font-mono mt-0.5">
                  № {proposal.number}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  от {proposal.date} (действительно до {proposal.validUntil})
                </div>
              </div>
            </div>

            {/* Client Info Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">
                  ЗАКАЗЧИК:
                </span>
                <strong className="text-slate-900 text-xs">{proposal.clientName}</strong>
                <div className="text-slate-600">ИНН: {proposal.clientInn}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">
                  УСЛОВИЯ ПОСТАВКИ:
                </span>
                <span className="text-slate-800">
                  Предоплата 50% / Изготовление 18 дней / Гарантия 24 мес.
                </span>
              </div>
            </div>

            {/* Document Blocks Render */}
            {proposal.blocks.map((block) => (
              <div key={block.id} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  {block.title}
                </h3>

                {block.content && (
                  <p className="text-slate-700 whitespace-pre-line text-[11px] leading-normal">
                    {block.content}
                  </p>
                )}

                {block.tableData && (
                  <table className="w-full border-collapse text-[11px] text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-y border-slate-300 font-semibold">
                        <th className="p-2 border-r border-slate-200">#</th>
                        <th className="p-2 border-r border-slate-200">Наименование оборудования / работ</th>
                        <th className="p-2 border-r border-slate-200 text-center">Ед.</th>
                        <th className="p-2 border-r border-slate-200 text-center">Кол-во</th>
                        <th className="p-2 border-r border-slate-200 text-right">Цена, ₽</th>
                        <th className="p-2 text-right">Сумма, ₽</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {block.tableData.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="p-2 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-medium">{row.name}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{row.unit}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">
                            {row.quantity}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {row.price.toLocaleString('ru-RU')}
                          </td>
                          <td className="p-2 text-right font-bold font-mono">
                            {Math.round(row.total).toLocaleString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}

            {/* Total Summary Box */}
            <div className="pt-4 border-t-2 border-slate-900 flex justify-end">
              <div className="w-64 space-y-1.5 text-right font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Итого без НДС:</span>
                  <span>{Math.round(totals.netTotal).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>НДС (20%):</span>
                  <span>{Math.round(totals.vat).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-300">
                  <span>ВСЕГО К ОПЛАТЕ:</span>
                  <span className="text-amber-800">
                    {Math.round(totals.grandTotal).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Stamp & Signatures */}
            <div className="pt-12 grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <p className="font-bold text-slate-900">ОТ ПОСТАВЩИКА:</p>
                <div className="mt-8 border-b border-slate-400 pb-1 flex justify-between items-end">
                  <span>Генеральный директор</span>
                  <span className="font-serif italic font-bold text-slate-700">/ Иванов С.В. /</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">М.П.</p>
              </div>

              <div>
                <p className="font-bold text-slate-900">ОТ ЗАКАЗЧИКА:</p>
                <div className="mt-8 border-b border-slate-400 pb-1 flex justify-between items-end">
                  <span>Директор по закупкам</span>
                  <span className="font-serif italic font-bold text-slate-700">/ Петров А.Н. /</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">М.П.</p>
              </div>
            </div>

            {/* Footer page number */}
            <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
              <span>КП PDF 8.0 Executive Edition • Документ № {proposal.number}</span>
              <span>Стр. 1 из 1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
