import { SelectResults } from '../repository';

export function leftJustify(text: string, width: number) {
  if (text.length >= width) {
    return text;
  } else {
    const paddingWidth = width - text.length;
    const padding = new Array(paddingWidth + 1).join(' ');
    return text + padding;
  }
}

export function rightJustify(text: string, width: number) {
  if (text.length >= width) {
    return text;
  } else {
    const paddingWidth = width - text.length;
    const padding = new Array(paddingWidth + 1).join(' ');
    return padding + text;
  }
}

export function* formatTable(
  alignments: string[],
  rows: string[][]
): IterableIterator<string> {
  const widths = new Array(alignments.length).fill(0);
  for (const row of rows) {
    for (let i = 0; i < row.length; ++i) {
      widths[i] = Math.max(widths[i], row[i].length);
    }
  }
  for (const row of rows) {
    const fields = row.map((column, i) => {
      if (alignments[i] === 'left') {
        return leftJustify(row[i], widths[i]);
      } else if (alignments[i] === 'right') {
        return rightJustify(row[i], widths[i]);
      } else {
        return row[i];
      }
    });

    yield fields.join('   ');
  }
}

export function* formatSelectResults(
  results: SelectResults
): IterableIterator<string> {
  const { columns, rows } = results;

  const alignments = columns.map(column =>
    column.type === 'number' ? 'right' : 'left'
  );

  const data: string[][] = [columns.map(column => column.name)];

  for (const row of rows) {
    data.push(row.map(x => x.toString()));
  }

  yield* formatTable(alignments, data);
}
