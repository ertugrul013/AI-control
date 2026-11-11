function cell(value: unknown): string {
  let text =
    value == null
      ? ''
      : value instanceof Date
        ? value.toISOString()
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
  // Spreadsheet programs execute cells that start with these characters as formulas.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Serialises rows to CSV; columns default to the keys of the first row. */
export function toCsv(rows: Record<string, unknown>[], columns = Object.keys(rows[0] ?? {})): string {
  return (
    [columns.join(','), ...rows.map((row) => columns.map((c) => cell(row[c])).join(','))].join('\r\n') +
    '\r\n'
  );
}

/** Parses CSV (quoted fields, escaped quotes, CRLF or LF) into records keyed by the header row. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length > 0) rows.push([...row, field]);

  const [header = [], ...lines] = rows;
  return lines
    .filter((line) => line.some((value) => value.trim() !== ''))
    .map((line) =>
      Object.fromEntries(
        header.map((name, i) => [name.trim(), (line[i] ?? '').replace(/^'(?=[=+\-@])/, '')]),
      ),
    );
}
