export enum Alignment {
  LEFT = 'left',
  RIGHT = 'right',
}

export function* formatTable(
  alignments: Alignment[],
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
      if (alignments[i] === Alignment.LEFT) {
        return leftJustify(row[i], widths[i]);
      } else if (alignments[i] === Alignment.RIGHT) {
        return rightJustify(row[i], widths[i]);
      } else {
        return row[i];
      }
    });

    yield fields.join('   ');
  }
}

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

export function formatChoices(choices: string[]) {
  if (choices.length === 0) {
    throw new TypeError('internal error');
  } else if (choices.length === 1) {
    return choices[0];
  } else {
    return (
      choices.slice(0, -1).join(', ') + ', or ' + choices[choices.length - 1]
    );
  }
}
