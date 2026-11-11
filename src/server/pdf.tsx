import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import en from '../../messages/en.json';
import nl from '../../messages/nl.json';
import { actionTitle } from '@/domain/classification/rules';
import type { Locale } from '@/lib/enums';
import { parseMarkdown, splitBold } from '@/lib/markdown';
import { formatDate, pct } from '@/lib/utils';
import type { ReportData } from './services/report';

// PDFs use the built-in Helvetica so no font file has to be fetched or embedded,
// and ink-on-white only so they read well on A4 in black and white.
const INK = '#1C2430';
const RULE = '#D8DDE3';
const BOLD = 'Helvetica-Bold';

const s = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 10,
    lineHeight: 1.45,
    color: INK,
  },
  h1: { fontSize: 18, fontFamily: BOLD, marginBottom: 10 },
  h2: { fontSize: 13, fontFamily: BOLD, marginTop: 14, marginBottom: 5 },
  h3: { fontSize: 11, fontFamily: BOLD, marginTop: 8, marginBottom: 3 },
  p: { marginBottom: 6 },
  item: { flexDirection: 'row', marginBottom: 2 },
  marker: { width: 16 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: RULE, paddingVertical: 3 },
  cell: { flex: 1, paddingRight: 6 },
  head: { fontFamily: BOLD },
  footer: {
    marginTop: 18,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: RULE,
    fontSize: 8,
    color: '#5A6573',
  },
});

const messages = { nl, en };

function Rich({ text }: { text: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={s.head}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </>
  );
}

function MarkdownPdf({ source }: { source: string }) {
  return (
    <>
      {parseMarkdown(source).map((block, i) =>
        'items' in block ? (
          <View key={i} style={s.p}>
            {block.items.map((item, n) => (
              <View key={n} style={s.item}>
                <Text style={s.marker}>{block.type === 'ol' ? `${n + 1}.` : '•'}</Text>
                <Text style={{ flex: 1 }}>
                  <Rich text={item} />
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text key={i} style={s[block.type]} minPresenceAhead={block.type === 'p' ? 0 : 40}>
            <Rich text={block.text} />
          </Text>
        ),
      )}
    </>
  );
}

function Table({ head, rows, widths }: { head: string[]; rows: string[][]; widths?: number[] }) {
  const cell = (i: number) => [s.cell, { flex: widths?.[i] ?? 1 }];
  return (
    <View style={s.p}>
      <View style={s.row} fixed>
        {head.map((label, i) => (
          <Text key={i} style={[...cell(i), s.head]}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={s.row} wrap={false}>
          {row.map((value, i) => (
            <Text key={i} style={cell(i)}>
              {value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Sheet({ title, footer, children }: { title: string; footer: string; children: ReactNode }) {
  return (
    <Document title={title} creator="AIControl" producer="AIControl">
      <Page size="A4" style={s.page}>
        {children}
        {/* A closing note in the text flow: fixed, absolutely positioned footers did not render in @react-pdf 4.9. */}
        <Text style={s.footer}>{footer}</Text>
      </Page>
    </Document>
  );
}

export function renderPolicyPdf(policy: {
  title: string;
  contentMarkdown: string;
  version: number;
  locale: Locale;
}) {
  const m = messages[policy.locale];
  return renderToBuffer(
    <Sheet title={policy.title} footer={`${policy.title} · v${policy.version} · ${m.common.disclaimer}`}>
      <MarkdownPdf source={policy.contentMarkdown} />
    </Sheet>,
  );
}

export function renderReportPdf(data: ReportData, locale: Locale) {
  const m = messages[locale];
  const r = m.report;
  const { dashboard: d } = data;
  const ratio = ([part, total]: [number, number]) => `${part}/${total} (${pct(part, total)}%)`;
  const title = `${r.title} · ${data.organization.name}`;

  return renderToBuffer(
    <Sheet title={title} footer={`${title} · ${m.common.disclaimer}`}>
      <Text style={s.h1}>{r.title}</Text>
      <Text style={s.p}>
        {data.organization.name} · {formatDate(new Date(), locale)}
      </Text>

      <Text style={s.h2}>{r.summary}</Text>
      <Table
        head={[r.riskTier, r.systems]}
        widths={[3, 1]}
        rows={(['PROHIBITED', 'HIGH', 'LIMITED', 'MINIMAL', 'NONE'] as const).map((tier) => [
          m.tier[tier],
          String(d.counts[tier]),
        ])}
      />
      <Table
        head={[r.coverage, '']}
        widths={[3, 1]}
        rows={[
          [r.assessed, ratio(d.coverage.assessed)],
          [r.trained, ratio(d.coverage.trained)],
          [r.policySigned, ratio(d.coverage.policy)],
          [r.overdueReviews, String(d.overdueReviews)],
        ]}
      />
      {d.countdown && (
        <Text style={s.p}>
          {r.highRiskFrom} {formatDate(d.countdown.date, locale)}.
        </Text>
      )}

      <Text style={s.h2}>{r.register}</Text>
      <Table
        head={[r.system, r.department, r.riskTier, r.status, r.nextReview]}
        widths={[3, 2, 2, 2, 2]}
        rows={data.systems.map((sys) => [
          sys.name,
          sys.department,
          m.tier[sys.tier],
          m.enums.status[sys.status],
          formatDate(sys.nextReviewDate, locale),
        ])}
      />

      <Text style={s.h2}>{r.openActions}</Text>
      {d.openActions.length === 0 ? (
        <Text style={s.p}>{r.noOpenActions}</Text>
      ) : (
        <Table
          head={[r.action, r.system, r.due]}
          widths={[4, 2, 1.5]}
          rows={d.openActions.map((a) => [
            actionTitle(a, locale),
            a.systemName,
            formatDate(a.dueDate, locale),
          ])}
        />
      )}

      <Text style={s.h2}>{r.literacy}</Text>
      <Text style={s.p}>{r.literacyIntro}</Text>
      <Table
        head={[r.module, r.assigned, r.completed]}
        widths={[4, 1, 1.5]}
        rows={data.modules.map((mod) => [
          mod.title,
          String(mod.assigned),
          ratio([mod.completed, mod.assigned]),
        ])}
      />
      <Table
        head={[r.department, r.completed]}
        widths={[4, 2.5]}
        rows={d.trainingByDepartment.map((dep) => [dep.department, ratio([dep.done, dep.total])])}
      />

      <Text style={s.h2}>{r.policy}</Text>
      <Text style={s.p}>
        {data.policy
          ? `${data.policy.title} · v${data.policy.version} · ${r.publishedOn} ${formatDate(data.policy.publishedAt, locale)}`
          : r.noPolicy}
      </Text>
    </Sheet>,
  );
}
