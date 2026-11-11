'use client';

import { ChartColumn, FileText, GraduationCap, LayoutDashboard, Settings, Table2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Role } from '@/lib/enums';
import { cn } from '@/lib/utils';
import { authorize } from '@/server/authorize';

const items = [
  { href: '/', key: 'dashboard', icon: LayoutDashboard, action: 'dashboard:read' },
  { href: '/systems', key: 'systems', icon: Table2, action: 'systems:read' },
  { href: '/policy', key: 'policy', icon: FileText, action: 'policy:read' },
  { href: '/training', key: 'training', icon: GraduationCap, action: 'training:read' },
  { href: '/reports', key: 'reports', icon: ChartColumn, action: 'reports:read' },
  { href: '/settings', key: 'settings', icon: Settings, action: 'settings:manage' },
] as const;

export function Nav({ role }: { role: Role }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  return (
    <nav aria-label={t('label')}>
      <ul className="flex flex-wrap gap-0.5 px-2 pb-2 md:flex-col">
        {items
          .filter((item) => authorize(role, item.action))
          .map(({ href, key, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-ink hover:bg-rule/60 flex items-center gap-2 rounded px-2 py-1.5 no-underline transition-colors duration-150 ease-out',
                    active && 'bg-rule/60 font-semibold',
                  )}
                >
                  <Icon size={16} aria-hidden />
                  {t(key)}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
