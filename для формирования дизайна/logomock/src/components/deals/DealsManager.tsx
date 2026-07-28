import React, { useState } from 'react';
import { Briefcase, Building2, FileCheck, Search, Plus, Filter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Organization, Contract, ProposalDocument } from '../../types';

interface DealsManagerProps {
  proposal: ProposalDocument;
  organizations: Organization[];
  contracts: Contract[];
}

export const DealsManager: React.FC<DealsManagerProps> = ({
  proposal,
  organizations,
  contracts,
}) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'contracts' | 'organizations'>('proposals');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrgs = organizations.filter(
    (o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.inn.includes(searchTerm)
  );

  const filteredContracts = contracts.filter(
    (c) => c.number.toLowerCase().includes(searchTerm.toLowerCase()) || c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-6 space-y-6 font-mono">
      {/* Deals Header Nav & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded bg-[var(--color-paper-2)] hairline">
        <div className="flex items-center gap-1 bg-[var(--color-paper-3)] p-1 rounded hairline">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeTab === 'proposals'
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            <span>КОММЕРЧЕСКИЕ ПРЕДЛОЖЕНИЯ (КП)</span>
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeTab === 'contracts'
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>ДОГОВОРЫ ({contracts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeTab === 'organizations'
                ? 'bg-[var(--color-paper)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ОРГАНИЗАЦИИ ({organizations.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Поиск по ИНН или названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--color-paper)] hairline rounded text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </div>

      {/* Proposals Pipeline */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Номер КП</th>
                  <th className="p-3">Дата</th>
                  <th className="p-3">Заказчик</th>
                  <th className="p-3">ИНН</th>
                  <th className="p-3">Сумма КП, ₽</th>
                  <th className="p-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
                <tr className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 font-bold text-[var(--color-gold)]">{proposal.number}</td>
                  <td className="p-3 text-[var(--color-muted)]">{proposal.date}</td>
                  <td className="p-3 font-medium text-[var(--color-ink)]">{proposal.clientName}</td>
                  <td className="p-3 text-[var(--color-muted)]">{proposal.clientInn}</td>
                  <td className="p-3 font-extrabold text-[var(--color-ink)]">
                    {Math.round(proposal.totalAmount).toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]">
                      <CheckCircle2 className="w-3 h-3" />
                      УТВЕРЖДЁН
                    </span>
                  </td>
                </tr>

                {/* Additional Sample Proposal */}
                <tr className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 font-bold text-[var(--color-gold)]">КП-2026/062</td>
                  <td className="p-3 text-[var(--color-muted)]">2026-07-02</td>
                  <td className="p-3 font-medium text-[var(--color-ink)]">ООО "СТРОЙТЕХ-ИНВЕСТ"</td>
                  <td className="p-3 text-[var(--color-muted)]">7810928374</td>
                  <td className="p-3 font-extrabold text-[var(--color-ink)]">940 000 ₽</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[var(--color-gold-soft)] text-[var(--color-gold)] border border-[var(--color-gold)]">
                      <Clock className="w-3 h-3" />На согласовании
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contracts View */}
      {activeTab === 'contracts' && (
        <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Номер Договора</th>
                <th className="p-3">Дата подписи</th>
                <th className="p-3">Заказчик</th>
                <th className="p-3">Основание (КП)</th>
                <th className="p-3">Сумма Договора</th>
                <th className="p-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
              {filteredContracts.map((cnt) => (
                <tr key={cnt.id} className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 font-bold text-[var(--color-gold)]">{cnt.number}</td>
                  <td className="p-3 text-[var(--color-muted)]">{cnt.date}</td>
                  <td className="p-3 font-medium text-[var(--color-ink)]">{cnt.clientName}</td>
                  <td className="p-3 text-[var(--color-muted)]">{cnt.proposalRef}</td>
                  <td className="p-3 font-extrabold">{cnt.amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]">
                      {cnt.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Organizations Directory */}
      {activeTab === 'organizations' && (
        <div className="overflow-x-auto rounded bg-[var(--color-paper-2)] hairline">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-paper-3)] text-[var(--color-muted-strong)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Наименование организации</th>
                <th className="p-3">ИНН / КПП</th>
                <th className="p-3">Город</th>
                <th className="p-3">Контактное лицо</th>
                <th className="p-3">Email / Телефон</th>
                <th className="p-3">Роль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper)]">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-[var(--color-paper-2)]">
                  <td className="p-3 font-bold text-[var(--color-ink)]">{org.name}</td>
                  <td className="p-3 text-[var(--color-muted)]">
                    {org.inn} / {org.kpp}
                  </td>
                  <td className="p-3">{org.city}</td>
                  <td className="p-3">{org.contactPerson}</td>
                  <td className="p-3 text-[var(--color-gold)]">{org.email}</td>
                  <td className="p-3 uppercase text-[10px] font-bold text-[var(--color-muted)]">
                    {org.role}
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
