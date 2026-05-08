import { describe, it, expect } from 'vitest';
import { SAMPLES, getSample } from './samples';
import { parseMermaid } from '../mermaid/parser';
import { runSimulation } from '../simulator/simulator';

describe('SAMPLES', () => {
  it('5 個以上のサンプルがある', () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(5);
  });

  it('各サンプルが parseMermaid で ok', () => {
    for (const sample of SAMPLES) {
      const result = parseMermaid(sample.text);
      expect(result.ok, `sample "${sample.id}" failed to parse`).toBe(true);
    }
  });

  it('getSample で id 検索', () => {
    expect(getSample('ends-with-b')?.title).toBe('末尾 b');
    expect(getSample('nonexistent')).toBeUndefined();
  });

  it('"末尾 b" サンプルが "abb" を受理する', () => {
    const sample = getSample('ends-with-b')!;
    const result = parseMermaid(sample.text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(runSimulation(result.graph, 'abb').status).toBe('accepted');
    expect(runSimulation(result.graph, 'aba').status).toBe('rejected');
  });

  it('"末尾 ab" サンプルが "bab" を受理する', () => {
    const sample = getSample('ends-with-ab')!;
    const result = parseMermaid(sample.text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(runSimulation(result.graph, 'bab').status).toBe('accepted');
    expect(runSimulation(result.graph, 'ba').status).toBe('rejected');
  });
});
