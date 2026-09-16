import { describe, it, expect } from 'vitest';
import { dedupeDocs } from '../../scripts/build-search-index.mjs';

describe('dedupeDocs', () => {
  it('drops later docs whose id already occurred (registry wins)', () => {
    const docs = [
      { id: 'tool:age-calculator', title: 'Age Calculator', popularity: 88 },
      { id: 'tool:age-calculator', title: 'Age Calculator content' },
      { id: 'tool:bmi-calculator', title: 'BMI' },
    ];
    expect(dedupeDocs(docs)).toEqual([docs[0], docs[2]]);
  });

  it('returns an empty array unchanged', () => {
    expect(dedupeDocs([])).toEqual([]);
  });
});
