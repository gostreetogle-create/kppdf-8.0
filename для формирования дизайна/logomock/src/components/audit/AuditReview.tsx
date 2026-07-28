import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Paintbrush, Layers, Code2, Eye, Zap, ArrowRight } from 'lucide-react';
import { AUDIT_ISSUES } from '../../data/mockData';

export const AuditReview: React.FC = () => {
  return (
    <div className="py-6 space-y-8 font-mono max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded bg-[var(--color-paper-2)] hairline space-y-3 executive-shadow">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="eyebrow flex items-center gap-1.5 text-[var(--color-gold)]">
            <Sparkles className="w-4 h-4" />
            ПОЛНЫЙ АРХИТЕКТУРНЫЙ И UI/UX АУДИТ KP PDF 8.0
          </span>
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-[var(--color-gold)] text-black">
            EXECUTIVE UPGRADE 8.0
          </span>
        </div>

        <h2 className="text-xl font-extrabold font-display text-[var(--color-ink)]">
          Экспертный разбор проекта, детальный аудит интерфейсов и тёмной темы
        </h2>
        <p className="text-xs text-[var(--color-muted-strong)] leading-relaxed">
          Мы тщательно изучили исходный репозиторий <code className="text-[var(--color-gold)] font-bold">kppdf-8.0</code>, доменную модель из 11 доменов и 89 сущностей, текущий Angular/Tailwind стек и систему стилей Paper &amp; Ink. Ниже представлен полный отчет об обнаруженных слабых местах, ошибках проектирования и выполненном нами апгрейде.
        </p>
      </div>

      {/* Key Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. What was weak & done incorrectly */}
        <div className="p-5 rounded bg-[var(--color-paper-2)] hairline space-y-3 border-l-4 border-l-[var(--color-destructive)]">
          <div className="flex items-center gap-2 text-[var(--color-destructive)] font-bold text-sm font-display">
            <AlertTriangle className="w-4 h-4" />
            Что было сделано неверно или слабо в дизайне:
          </div>
          <ul className="space-y-2 text-xs text-[var(--color-muted-strong)] list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--color-ink)]">Совершенно плоский и тусклый Dark Mode:</strong> Тёмная тема использовала единый цвет <code className="text-[var(--color-gold)]">#1A1A1A</code> без слоев высоты (elevation), с размытыми границами и мутным серым текстом, не проходившим WCAG AA.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Фрагментация интерфейса:</strong> 89 сущностей доменной модели были разделены на десятки мелких справочников без единого удобного конструктора КП.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Отсутствие живого PDF Canvas:</strong> Коммерческие предложения не имели режима моментального предпросмотра печати (Print-Ready A4).
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Нестабильная типографика:</strong> Заголовки Eyebrow и кнопки имели разрозненные значения letter-spacing и радиусы скругления.
            </li>
          </ul>
        </div>

        {/* 2. What was upgraded & improved */}
        <div className="p-5 rounded bg-[var(--color-paper-2)] hairline space-y-3 border-l-4 border-l-[var(--color-success)]">
          <div className="flex items-center gap-2 text-[var(--color-success)] font-bold text-sm font-display">
            <CheckCircle2 className="w-4 h-4" />
            Как это исправлено в текущей версии v8.0 Executive:
          </div>
          <ul className="space-y-2 text-xs text-[var(--color-muted-strong)] list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--color-ink)]">5-уровневая архитектура Dark Mode:</strong> Obsidian Slate (#0B0E11 → #12161A → #181D23) с контрастными волосяными границами (1px hairline) и шлифованным золотом (#E2B842).
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">3-Pane Конструктор КП:</strong> Библиотека блоков → Живой холст → Инспектор расчетов и метаданных.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Мгновенная калькуляция маржи и НДС:</strong> Автоматический перерасчет специфиций, скидок и полных затрат в реальном времени.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Строгая микро-типографика:</strong> Зафиксированы шрифты Hanken Grotesk + Inter + JetBrains Mono с едиными правилами отступов (4px/8px).
            </li>
          </ul>
        </div>
      </div>

      {/* Detailed Issue Breakdown */}
      <div className="space-y-4">
        <span className="eyebrow flex items-center gap-2 text-[var(--color-ink)]">
          <Code2 className="w-4 h-4 text-[var(--color-gold)]" />
          РЕЕСТР УСТРАНЕННЫХ ПРОБЛЕМ И АРХИТЕКТУРНЫХ РЕКОМЕНДАЦИЙ
        </span>

        <div className="space-y-3">
          {AUDIT_ISSUES.map((issue) => (
            <div key={issue.id} className="p-4 rounded bg-[var(--color-paper-2)] hairline space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[var(--color-gold-soft)] text-[var(--color-gold)] border border-[var(--color-gold)]">
                    {issue.category.toUpperCase()}
                  </span>
                  <h4 className="text-xs font-bold text-[var(--color-ink)] font-display">
                    {issue.title}
                  </h4>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]">
                  ИСПРАВЛЕНО
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 rounded bg-[var(--color-paper)] hairline">
                  <span className="text-[10px] text-[var(--color-destructive)] font-bold uppercase block mb-1">
                    Проблема (Было):
                  </span>
                  <p className="text-[var(--color-muted-strong)] leading-relaxed">{issue.problem}</p>
                </div>

                <div className="p-3 rounded bg-[var(--color-paper)] hairline border-l-2 border-l-[var(--color-success)]">
                  <span className="text-[10px] text-[var(--color-success)] font-bold uppercase block mb-1">
                    Решение (Стало в v8.0 Executive):
                  </span>
                  <p className="text-[var(--color-muted-strong)] leading-relaxed">{issue.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Palette & Dark Theme Inspection */}
      <div className="p-5 rounded bg-[var(--color-paper-2)] hairline space-y-4">
        <span className="eyebrow flex items-center gap-2 text-[var(--color-ink)]">
          <Paintbrush className="w-4 h-4 text-[var(--color-gold)]" />
          СРАВНЕНИЕ ПАЛИТРЫ И ЭЛЕВАЦИИ ТЁМНОЙ ТЕМЫ
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0b0e11] text-white hairline space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">ELEVATION 0 (PAPER)</span>
            <div className="font-mono text-amber-400 font-bold">#0B0E11</div>
            <p className="text-[10px] text-slate-400">Глубокий архитектурный холст</p>
          </div>

          <div className="p-3 rounded bg-[#12161a] text-white hairline space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">ELEVATION 1 (SURFACE)</span>
            <div className="font-mono text-amber-400 font-bold">#12161A</div>
            <p className="text-[10px] text-slate-400">Карточки, панели, таблицы</p>
          </div>

          <div className="p-3 rounded bg-[#181d23] text-white hairline space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">ELEVATION 2 (CONTAINER)</span>
            <div className="font-mono text-amber-400 font-bold">#181D23</div>
            <p className="text-[10px] text-slate-400">Инпута, фокусные блоки</p>
          </div>

          <div className="p-3 rounded bg-[#e2b842] text-black hairline space-y-1 font-bold">
            <span className="text-[10px] text-slate-900 block font-bold">PRIMARY ACCENT (GOLD)</span>
            <div className="font-mono">#E2B842</div>
            <p className="text-[10px] text-slate-900">Шлифованное золото</p>
          </div>
        </div>
      </div>
    </div>
  );
};
