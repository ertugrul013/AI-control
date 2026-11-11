'use client';

import { ArrowDown, ArrowUp, Download, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { catalogue } from '@/lib/catalogue';
import { SYSTEM_STATUSES, TIERS_AND_NONE, type TierOrNone } from '@/lib/enums';
import { formatDate } from '@/lib/utils';
import { SystemForm } from './system-form';
import { TierBadge } from './tier-badge';
import { Button } from './ui/button';
import { Input, Select } from './ui/form';

interface Row {
  id: string;
  name: string;
  vendor: string;
  department: string;
  owner: string;
  tier: TierOrNone;
  status: (typeof SYSTEM_STATUSES)[number];
  nextReviewDate: string;
}

const COLUMNS = ['name', 'vendor', 'department', 'owner', 'tier', 'status', 'nextReviewDate'] as const;
type Column = (typeof COLUMNS)[number];

interface Props {
  rows: Row[];
  users: { id: string; name: string }[];
  canWrite: boolean;
}

export function SystemsTable({ rows, users, canWrite }: Props) {
  const t = useTranslations('systems');
  const te = useTranslations('enums');
  const tt = useTranslations('tier');
  const tc = useTranslations('common');
  const locale = useLocale();
  const call = useApi();
  const fileInput = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [sort, setSort] = useState<{ column: Column; ascending: boolean }>({
    column: 'name',
    ascending: true,
  });

  const departments = [...new Set(rows.map((row) => row.department).filter(Boolean))].sort();
  const needle = query.trim().toLowerCase();
  const sortValue = (row: Row) =>
    sort.column === 'tier' ? String(TIERS_AND_NONE.indexOf(row.tier)) : row[sort.column];
  const visible = rows
    .filter(
      (row) =>
        (!needle ||
          [row.name, row.vendor, row.owner, row.department].some((v) => v.toLowerCase().includes(needle))) &&
        (!tier || row.tier === tier) &&
        (!status || row.status === status) &&
        (!department || row.department === department),
    )
    .sort((a, b) => sortValue(a).localeCompare(sortValue(b), locale) * (sort.ascending ? 1 : -1));

  async function importCsv(file: File | undefined) {
    if (!file) return;
    const result = await call<{ imported: number }>('/systems/import', 'POST', { csv: await file.text() });
    // The success text needs the count, so it is shown here instead of by call().
    if (result) toast.success(t('imported', { count: result.imported }));
    if (fileInput.current) fileInput.current.value = '';
  }

  const addPreset = (preset: (typeof catalogue)[number]) =>
    call(
      '/systems',
      'POST',
      {
        name: preset.name,
        vendor: preset.vendor,
        description: '',
        purpose: preset.purpose[locale],
        department: '',
        usageType: 'THIRD_PARTY_TOOL',
        dataCategories: [],
        userGroup: 'INTERNAL',
        status: 'IN_USE',
        nextReviewDate: null,
      },
      t('added'),
    );

  return (
    <div className="grid gap-3">
      <div role="toolbar" aria-label={t('toolbar')} className="flex flex-wrap items-end gap-2">
        <Input
          type="search"
          aria-label={tc('search')}
          placeholder={tc('search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-52"
        />
        <Select
          aria-label={t('tier')}
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="w-44"
        >
          <option value="">{t('allTiers')}</option>
          {TIERS_AND_NONE.map((value) => (
            <option key={value} value={value}>
              {tt(value)}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t('status')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-40"
        >
          <option value="">{t('allStatuses')}</option>
          {SYSTEM_STATUSES.map((value) => (
            <option key={value} value={value}>
              {te(`status.${value}`)}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t('department')}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-44"
        >
          <option value="">{t('allDepartments')}</option>
          {departments.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href="/api/v1/systems/export" download>
              <Download size={16} aria-hidden />
              {t('exportCsv')}
            </a>
          </Button>
          {canWrite && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                aria-label={t('importCsv')}
                tabIndex={-1}
                onChange={(e) => importCsv(e.target.files?.[0])}
              />
              <Button variant="secondary" onClick={() => fileInput.current?.click()}>
                <Upload size={16} aria-hidden />
                {t('importCsv')}
              </Button>
              <SystemForm
                users={users}
                trigger={
                  <Button>
                    <Plus size={16} aria-hidden />
                    {t('add')}
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        canWrite && (
          <section className="border-rule border-t pt-4">
            <h2>{t('quickAdd')}</h2>
            <p className="text-muted mt-1">{t('quickAddHint')}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {catalogue.map((preset) => (
                <li key={preset.name}>
                  <Button variant="secondary" onClick={() => addPreset(preset)}>
                    <Plus size={16} aria-hidden />
                    {preset.name}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const sorted = sort.column === column;
                  const Icon = sort.ascending ? ArrowUp : ArrowDown;
                  return (
                    <th
                      key={column}
                      scope="col"
                      aria-sort={sorted ? (sort.ascending ? 'ascending' : 'descending') : undefined}
                    >
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-1 font-semibold"
                        onClick={() => setSort({ column, ascending: sorted ? !sort.ascending : true })}
                      >
                        {t(column === 'nextReviewDate' ? 'nextReview' : column)}
                        {sorted && <Icon size={16} aria-hidden />}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/systems/${row.id}`}>{row.name}</Link>
                  </td>
                  <td>{row.vendor}</td>
                  <td>{row.department}</td>
                  <td>{row.owner}</td>
                  <td>
                    <TierBadge tier={row.tier} />
                  </td>
                  <td>{te(`status.${row.status}`)}</td>
                  <td>{formatDate(row.nextReviewDate, locale)}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length}>{t('noMatches')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
