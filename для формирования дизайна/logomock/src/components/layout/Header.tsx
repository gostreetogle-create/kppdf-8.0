import React from 'react';
import { FileText, Package, Briefcase, Boxes, ShieldCheck, Layers, FileCode } from 'lucide-react';
import { ActiveTab, ThemeMode } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  themeMode,
  toggleTheme,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'constructor', label: 'Конструктор КП', icon: <FileText className="w-4 h-4" /> },
    { id: 'catalog', label: 'Каталог & BOM', icon: <Package className="w-4 h-4" /> },
    { id: 'deals', label: 'Сделки & Договоры', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'warehouse', label: 'Склад & Заказы', icon: <Boxes className="w-4 h-4" /> },
    {
      id: 'audit',
      label: 'Аудит & Улучшения',
      icon: <ShieldCheck className="w-4 h-4 text-[var(--color-gold)]" />,
      badge: 'FIXED',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-paper)] hairline-b transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 hairline-b py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[var(--color-gold-soft)] border border-[var(--color-gold)]">
              <Layers className="w-4 h-4 text-[var(--color-gold)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight font-display text-[var(--color-ink)]">
                  КП PDF <span className="text-[var(--color-gold)] font-mono text-xs">v8.0</span>
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] border hairline">
                  Executive Architectural
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)] font-mono hidden md:block">
                ERP-система коммерческих предложений, конструктора документов и производства
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-paper-2)] hairline text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-[var(--color-muted)]">БД: MongoDB / Node.js Engine</span>
            </div>

            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium font-display transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[var(--color-gold)] text-[var(--color-ink)] bg-[var(--color-paper-2)] font-semibold'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-[var(--color-gold)] text-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
