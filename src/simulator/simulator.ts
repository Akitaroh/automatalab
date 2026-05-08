/**
 * Atom-Simulator
 * DFA/NFA 実行エンジン（純関数）
 * 設計: ../../../50_Mission/Mermaid Maker/Atom-Simulator.md
 */

import type { Graph } from '../types/schema';

export type SimulationStatus = 'running' | 'accepted' | 'rejected';

export type SimulationState = {
  current: Set<string>;
  consumed: string;
  remaining: string;
  status: SimulationStatus;
  history: Array<Set<string>>;
};

/**
 * Edge label を分解して { 文字集合, ε遷移か } を返す
 */
export function parseEdgeLabel(label?: string): {
  chars: Set<string>;
  isEpsilon: boolean;
} {
  if (label === undefined || label === null) {
    return { chars: new Set(), isEpsilon: true };
  }
  const tokens = label.split(',').map((t) => t.trim());
  const chars = new Set<string>();
  let isEpsilon = false;
  for (const t of tokens) {
    if (t === 'ε' || t === 'eps' || t === '') {
      isEpsilon = true;
    } else if (t.length === 1) {
      chars.add(t);
    } else {
      // 多文字トークンは 1 文字目を採用するのは混乱のもとなので無視
      // ただし '\\n' などの記法は将来対応
    }
  }
  return { chars, isEpsilon };
}

/**
 * ε-閉包: states から ε 遷移で到達可能な全状態
 */
export function epsilonClosure(graph: Graph, states: Set<string>): Set<string> {
  const closure = new Set(states);
  const queue = [...states];
  while (queue.length > 0) {
    const q = queue.shift()!;
    for (const edge of graph.edges) {
      if (edge.source !== q) continue;
      const { isEpsilon } = parseEdgeLabel(edge.label);
      if (isEpsilon && !closure.has(edge.target)) {
        closure.add(edge.target);
        queue.push(edge.target);
      }
    }
  }
  return closure;
}

/**
 * 受理状態を含むかチェック
 */
function containsAccept(graph: Graph, states: Set<string>): boolean {
  for (const id of states) {
    const node = graph.nodes.find((n) => n.id === id);
    if (node?.shape === 'doubleCircle') return true;
  }
  return false;
}

/**
 * 入力文字列を空白除去して 1 文字配列に
 */
function tokenize(input: string): string {
  return input.replace(/\s+/g, '');
}

/**
 * 初期状態（start ノード = 最初のノード の ε-閉包）
 */
export function initialSimulation(graph: Graph, input: string): SimulationState {
  const cleanInput = tokenize(input);
  if (graph.nodes.length === 0) {
    return {
      current: new Set(),
      consumed: '',
      remaining: cleanInput,
      status: 'rejected',
      history: [],
    };
  }
  const start = graph.nodes[0].id;
  const initial = epsilonClosure(graph, new Set([start]));
  let status: SimulationStatus = 'running';
  if (cleanInput.length === 0) {
    status = containsAccept(graph, initial) ? 'accepted' : 'rejected';
  }
  return {
    current: initial,
    consumed: '',
    remaining: cleanInput,
    status,
    history: [initial],
  };
}

/**
 * 1 ステップ進める
 */
export function stepSimulation(
  graph: Graph,
  state: SimulationState,
): SimulationState {
  if (state.status !== 'running' || state.remaining.length === 0) return state;
  const ch = state.remaining[0];
  const nextRaw = new Set<string>();
  for (const q of state.current) {
    for (const edge of graph.edges) {
      if (edge.source !== q) continue;
      const { chars } = parseEdgeLabel(edge.label);
      if (chars.has(ch)) nextRaw.add(edge.target);
    }
  }
  const closed = epsilonClosure(graph, nextRaw);
  const consumed = state.consumed + ch;
  const remaining = state.remaining.slice(1);
  let status: SimulationStatus;
  if (closed.size === 0) {
    status = 'rejected';
  } else if (remaining.length === 0) {
    status = containsAccept(graph, closed) ? 'accepted' : 'rejected';
  } else {
    status = 'running';
  }
  return {
    current: closed,
    consumed,
    remaining,
    status,
    history: [...state.history, closed],
  };
}

/**
 * 全ステップを一気に実行
 */
export function runSimulation(graph: Graph, input: string): SimulationState {
  let state = initialSimulation(graph, input);
  while (state.status === 'running' && state.remaining.length > 0) {
    state = stepSimulation(graph, state);
  }
  return state;
}

/**
 * リセット（initialSimulation と同じ）
 */
export function resetSimulation(graph: Graph, input: string): SimulationState {
  return initialSimulation(graph, input);
}
