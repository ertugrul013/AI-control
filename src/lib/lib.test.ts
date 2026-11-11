import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import nl from '../../messages/nl.json';
import { authorize, permissions, type Action } from '../server/authorize';
import { parseCsv, toCsv } from './csv';
import { parseMarkdown, splitBold } from './markdown';

const keys = (value: unknown, prefix = ''): string[] =>
  value !== null && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
    : [prefix];

describe('messages', () => {
  it('has the same keys in Dutch and English', () => {
    expect(keys(nl).sort()).toEqual(keys(en).sort());
  });
});

describe('csv', () => {
  it('round-trips quotes, commas, newlines and formula-like cells', () => {
    const rows = [{ name: 'A "quoted", name', note: 'line 1\nline 2', formula: '=SUM(A1)' }];
    const csv = toCsv(rows);
    expect(csv).toContain(`'=SUM(A1)`);
    expect(parseCsv(csv)).toEqual(rows);
  });

  it('serialises dates, objects and empty values, and skips blank lines', () => {
    expect(toCsv([{ d: new Date('2026-01-02T00:00:00Z'), o: { a: 1 }, n: null }])).toBe(
      'd,o,n\r\n2026-01-02T00:00:00.000Z,"{""a"":1}",\r\n',
    );
    expect(parseCsv('a,b\n1,2\n\n3')).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '' },
    ]);
  });
});

describe('markdown', () => {
  it('parses headings, lists and paragraphs', () => {
    expect(parseMarkdown('# T\n\ntext one\ntext two\n\n- a\n- b\n\n1. x\n2. y\n## H')).toEqual([
      { type: 'h1', text: 'T' },
      { type: 'p', text: 'text one text two' },
      { type: 'ul', items: ['a', 'b'] },
      { type: 'ol', items: ['x', 'y'] },
      { type: 'h2', text: 'H' },
    ]);
    expect(splitBold('a **b** c')).toEqual(['a ', 'b', ' c']);
  });
});

describe('authorize', () => {
  it('keeps employees out of the register, policy editing and settings', () => {
    const allowed = (Object.keys(permissions) as Action[]).filter((action) => authorize('EMPLOYEE', action));
    expect(allowed.sort()).toEqual(['policy:acknowledge', 'policy:read', 'self', 'training:read']);
  });

  it('lets only admins approve, publish and manage settings', () => {
    for (const action of ['assessments:approve', 'policy:write', 'settings:manage'] as const) {
      expect(authorize('ADMIN', action)).toBe(true);
      expect(authorize('EDITOR', action)).toBe(false);
      expect(authorize('VIEWER', action)).toBe(false);
    }
  });
});
