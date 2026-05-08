import { describe, it, expect } from 'vitest';
import {
  parseEdgeLabel,
  epsilonClosure,
  initialSimulation,
  stepSimulation,
  runSimulation,
} from './simulator';
import type { Graph } from '../types/schema';

// (a|b)*b の最小DFA
// q0 (start, non-accept): a->q0, b->q1
// q1 (accept): a->q0, b->q1
const aOrBEndsWithB: Graph = {
  direction: 'LR',
  nodes: [
    { id: 'q0', label: 'q0', shape: 'circle' },
    { id: 'q1', label: 'q1', shape: 'doubleCircle' },
  ],
  edges: [
    { id: 'e0', source: 'q0', target: 'q0', label: 'a' },
    { id: 'e1', source: 'q0', target: 'q1', label: 'b' },
    { id: 'e2', source: 'q1', target: 'q0', label: 'a' },
    { id: 'e3', source: 'q1', target: 'q1', label: 'b' },
  ],
};

// ε遷移を含む NFA: q0 -ε-> q1 -a-> q2 (accept)
const nfaWithEpsilon: Graph = {
  direction: 'LR',
  nodes: [
    { id: 'q0', label: 'q0', shape: 'circle' },
    { id: 'q1', label: 'q1', shape: 'circle' },
    { id: 'q2', label: 'q2', shape: 'doubleCircle' },
  ],
  edges: [
    { id: 'e0', source: 'q0', target: 'q1', label: 'ε' },
    { id: 'e1', source: 'q1', target: 'q2', label: 'a' },
  ],
};

describe('parseEdgeLabel', () => {
  it('単一文字', () => {
    expect(parseEdgeLabel('a')).toEqual({ chars: new Set(['a']), isEpsilon: false });
  });

  it('カンマ区切り複数', () => {
    const r = parseEdgeLabel('a, b');
    expect(r.chars).toEqual(new Set(['a', 'b']));
    expect(r.isEpsilon).toBe(false);
  });

  it('ε', () => {
    expect(parseEdgeLabel('ε')).toEqual({ chars: new Set(), isEpsilon: true });
  });

  it('label 未指定はε扱い', () => {
    expect(parseEdgeLabel(undefined)).toEqual({ chars: new Set(), isEpsilon: true });
  });

  it('混在: a, ε', () => {
    const r = parseEdgeLabel('a, ε');
    expect(r.chars).toEqual(new Set(['a']));
    expect(r.isEpsilon).toBe(true);
  });
});

describe('epsilonClosure', () => {
  it('ε遷移なしなら自身のみ', () => {
    expect(epsilonClosure(aOrBEndsWithB, new Set(['q0']))).toEqual(new Set(['q0']));
  });

  it('ε遷移で到達可能な全状態を含む', () => {
    expect(epsilonClosure(nfaWithEpsilon, new Set(['q0']))).toEqual(
      new Set(['q0', 'q1']),
    );
  });
});

describe('runSimulation: (a|b)*b', () => {
  it('"b" は受理', () => {
    expect(runSimulation(aOrBEndsWithB, 'b').status).toBe('accepted');
  });

  it('"abb" は受理', () => {
    expect(runSimulation(aOrBEndsWithB, 'abb').status).toBe('accepted');
  });

  it('"aba" は拒否', () => {
    expect(runSimulation(aOrBEndsWithB, 'aba').status).toBe('rejected');
  });

  it('空文字列は拒否（q0 は非受理）', () => {
    expect(runSimulation(aOrBEndsWithB, '').status).toBe('rejected');
  });

  it('"a" は拒否', () => {
    expect(runSimulation(aOrBEndsWithB, 'a').status).toBe('rejected');
  });

  it('未定義文字は拒否', () => {
    expect(runSimulation(aOrBEndsWithB, 'c').status).toBe('rejected');
  });
});

describe('stepSimulation: 1ステップずつ', () => {
  it('"ab" を 2 ステップで受理', () => {
    let s = initialSimulation(aOrBEndsWithB, 'ab');
    expect(s.current).toEqual(new Set(['q0']));
    expect(s.status).toBe('running');

    s = stepSimulation(aOrBEndsWithB, s);
    expect(s.current).toEqual(new Set(['q0'])); // a → q0 self
    expect(s.consumed).toBe('a');

    s = stepSimulation(aOrBEndsWithB, s);
    expect(s.current).toEqual(new Set(['q1']));
    expect(s.status).toBe('accepted');
  });

  it('受理後は変化しない', () => {
    let s = runSimulation(aOrBEndsWithB, 'b');
    const before = s;
    s = stepSimulation(aOrBEndsWithB, s);
    expect(s).toBe(before); // same reference
  });
});

describe('NFA with ε', () => {
  it('"a" は受理（ε で q1 に進んでから a で q2）', () => {
    const r = runSimulation(nfaWithEpsilon, 'a');
    expect(r.status).toBe('accepted');
  });

  it('initial に ε-閉包が反映される', () => {
    const s = initialSimulation(nfaWithEpsilon, 'a');
    expect(s.current).toEqual(new Set(['q0', 'q1']));
  });
});

describe('history', () => {
  it('history に各ステップの状態が記録される', () => {
    const r = runSimulation(aOrBEndsWithB, 'ab');
    expect(r.history.length).toBe(3); // initial + 2 steps
  });
});
