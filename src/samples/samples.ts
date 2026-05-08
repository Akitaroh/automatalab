/**
 * Atom-SampleLibrary
 * 出来合いの DFA/NFA サンプル集
 * 設計: ../../../50_Mission/Mermaid Maker/Atom-SampleLibrary.md
 */

export type Sample = {
  id: string;
  title: string;
  regex: string;
  description: string;
  text: string;
};

export const SAMPLES: Sample[] = [
  {
    id: 'ends-with-b',
    title: '末尾 b',
    regex: '(a|b)*b',
    description: '末尾が b で終わる文字列の最小 DFA',
    text: `graph LR
    q0((q0))
    q1(((q1)))
    q0 -->|a| q0
    q0 -->|b| q1
    q1 -->|a| q0
    q1 -->|b| q1
%% mm-pos: q0=80,80 q1=320,80`,
  },
  {
    id: 'ends-with-ab',
    title: '末尾 ab',
    regex: '(a|b)*ab',
    description: '末尾が ab で終わる文字列の最小 DFA',
    text: `graph LR
    q0((q0))
    q1((q1))
    q2(((q2)))
    q0 -->|b| q0
    q0 -->|a| q1
    q1 -->|a| q1
    q1 -->|b| q2
    q2 -->|a| q1
    q2 -->|b| q0
%% mm-pos: q0=80,80 q1=280,80 q2=480,80`,
  },
  {
    id: 'a-then-bb',
    title: 'a または bb の繰返し+末尾b',
    regex: '(a|bb)*b',
    description: 'a または bb を繰り返し、最後に b。最小 DFA は 2 状態',
    text: `graph LR
    q0((q0))
    q1(((q1)))
    q0 -->|a| q0
    q0 -->|b| q1
    q1 -->|b| q0
%% mm-pos: q0=80,80 q1=320,80`,
  },
  {
    id: 'contains-abb',
    title: 'abb を部分文字列として含む',
    regex: '(a|b)*abb(a|b)*',
    description: '"abb" が文字列のどこかに含まれる DFA',
    text: `graph LR
    q0((q0))
    q1((q1))
    q2((q2))
    q3(((q3)))
    q0 -->|a| q1
    q0 -->|b| q0
    q1 -->|a| q1
    q1 -->|b| q2
    q2 -->|a| q1
    q2 -->|b| q3
    q3 -->|a| q3
    q3 -->|b| q3
%% mm-pos: q0=60,80 q1=220,80 q2=380,80 q3=540,80`,
  },
  {
    id: 'binary-divisible-by-3',
    title: '3で割り切れる2進数',
    regex: '—',
    description: '2 進整数を読んで 3 の倍数なら受理する DFA（典型例）',
    text: `graph LR
    q0(((q0)))
    q1((q1))
    q2((q2))
    q0 -->|0| q0
    q0 -->|1| q1
    q1 -->|0| q2
    q1 -->|1| q0
    q2 -->|0| q1
    q2 -->|1| q2
%% mm-pos: q0=80,80 q1=280,80 q2=480,80`,
  },
  {
    id: 'epsilon-nfa',
    title: 'ε-NFA サンプル',
    regex: 'a*b',
    description: 'ε 遷移を含む NFA の例（DFA 化のお題に使える）',
    text: `graph LR
    q0((q0))
    q1((q1))
    q2(((q2)))
    q0 -->|ε| q1
    q1 -->|a| q1
    q1 -->|b| q2
%% mm-pos: q0=60,80 q1=240,80 q2=420,80`,
  },
];

export function getSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
