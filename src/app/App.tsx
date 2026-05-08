/**
 * Arrow-SyncDispatcher + Arrow-SimulatorPanel
 * Phase 2/3/3.5: 同期ボタン
 * Phase 4: シミュレーション UI
 * Phase 5: クリップボード / サンプル / URL / LocalStorage
 */

import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { emptyGraph } from '../types/schema';
import type {
  EdgeControlMap,
  Graph,
  ParseError,
  PositionMap,
} from '../types/schema';
import { parseMermaid } from '../mermaid/parser';
import { emitMermaid } from '../mermaid/emitter';
import { fillMissingPositions } from '../canvas/layout';
import { Canvas } from '../canvas/canvas';
import {
  initialSimulation,
  stepSimulation,
  runSimulation,
  type SimulationState,
} from '../simulator/simulator';
import { copyToClipboard } from '../persistence/clipboard';
import {
  setURLState,
  readURLState,
} from '../persistence/url-state';
import { saveText, loadText } from '../persistence/local-store';
import { SAMPLES, getSample } from '../samples/samples';
import './app.css';

const DEFAULT_TEXT = `graph LR
    q0((q0))
    q1(((q1)))
    q0 -->|a| q0
    q0 -->|b| q1
    q1 -->|a| q0
    q1 -->|b| q1
%% mm-pos: q0=80,80 q1=320,80`;

function getInitialText(): string {
  // 優先順: URL hash > LocalStorage > DEFAULT
  const fromUrl = readURLState();
  if (fromUrl) return fromUrl;
  const fromLocal = loadText();
  if (fromLocal) return fromLocal;
  return DEFAULT_TEXT;
}

export function App() {
  const [text, setText] = useState<string>(getInitialText);
  const [graph, setGraph] = useState<Graph>(emptyGraph);
  const [positions, setPositions] = useState<PositionMap>({});
  const [edgeControls, setEdgeControls] = useState<EdgeControlMap>({});
  const [parseError, setParseError] = useState<ParseError | null>(null);

  // Simulator state
  const [simInput, setSimInput] = useState<string>('abb');
  const [simState, setSimState] = useState<SimulationState | null>(null);

  // Clipboard feedback
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  // 初回マウント時に自動で text→GUI 同期
  useEffect(() => {
    syncTextToGui(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // text 変更を LocalStorage に debounce 保存
  useEffect(() => {
    const t = setTimeout(() => saveText(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  function syncTextToGui(target?: string) {
    const src = target ?? text;
    const result = parseMermaid(src);
    if (!result.ok) {
      setParseError(result.error);
      return;
    }
    setParseError(null);
    const filled = fillMissingPositions(result.graph, result.positions);
    setGraph(result.graph);
    setPositions(filled);
    setEdgeControls(result.edgeControls);
    // シミュレーション中なら一旦停止
    setSimState(null);
  }

  function syncGuiToText() {
    const next = emitMermaid(graph, positions, { edgeControls });
    setText(next);
  }

  // ----- Simulator actions -----
  function simReset() {
    setSimState(initialSimulation(graph, simInput));
  }

  function simStep() {
    if (!simState) {
      setSimState(initialSimulation(graph, simInput));
      return;
    }
    setSimState(stepSimulation(graph, simState));
  }

  function simRun() {
    setSimState(runSimulation(graph, simInput));
  }

  function simStop() {
    setSimState(null);
  }

  // ----- Phase 5 actions -----
  async function handleCopy() {
    const result = await copyToClipboard(text);
    setCopyFeedback(result.ok ? '✓ コピー済み' : '✗ コピー失敗');
    setTimeout(() => setCopyFeedback(''), 2000);
  }

  function handleShareURL() {
    setURLState(text);
    // URL もクリップボードにコピー
    copyToClipboard(location.href).then((r) => {
      setCopyFeedback(r.ok ? '✓ URL をコピー済み' : '✗ URL コピー失敗');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  }

  function handleSelectSample(id: string) {
    if (!id) return;
    const sample = getSample(id);
    if (!sample) return;
    setText(sample.text);
    syncTextToGui(sample.text);
  }

  return (
    <div className="mm-app">
      <div className="mm-panes">
        <div className="mm-pane mm-pane-text">
          <textarea
            className="mm-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="mm-pane mm-pane-canvas">
          <ReactFlowProvider>
            <Canvas
              graph={graph}
              positions={positions}
              onPositionsChange={setPositions}
              onGraphChange={setGraph}
              edgeControls={edgeControls}
              onEdgeControlsChange={setEdgeControls}
              highlightStates={simState?.current}
              highlightStatus={simState?.status}
            />
          </ReactFlowProvider>
        </div>
      </div>

      <div className="mm-toolbar">
        <button className="mm-btn" onClick={() => syncTextToGui()}>
          テキスト → GUI 同期 ▶
        </button>
        <button className="mm-btn" onClick={syncGuiToText}>
          ◀ GUI → テキスト 同期
        </button>
        <span className="mm-toolbar-divider" />
        <button className="mm-btn" onClick={handleCopy} title="Mermaid テキストをコピー">
          📋 コピー
        </button>
        <button className="mm-btn" onClick={handleShareURL} title="共有 URL を生成">
          🔗 URL 共有
        </button>
        <span className="mm-toolbar-divider" />
        <span>サンプル:</span>
        <select
          className="mm-sample-select"
          value=""
          onChange={(e) => handleSelectSample(e.target.value)}
        >
          <option value="">選択...</option>
          {SAMPLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.regex})
            </option>
          ))}
        </select>
        {copyFeedback && <span className="mm-sim-status mm-sim-status-accepted">{copyFeedback}</span>}
        {parseError && (
          <span className="mm-error">
            {parseError.line ? `Line ${parseError.line}: ` : ''}
            {parseError.message}
          </span>
        )}
      </div>

      <div className="mm-toolbar mm-sim-toolbar">
        <span>シミュレーション:</span>
        <input
          className="mm-sim-input"
          type="text"
          value={simInput}
          onChange={(e) => setSimInput(e.target.value)}
          placeholder="入力文字列（例: abb）"
        />
        <button className="mm-btn" onClick={simReset}>
          リセット
        </button>
        <button className="mm-btn" onClick={simStep} disabled={simState?.status !== 'running' && simState !== null}>
          Step ▶
        </button>
        <button className="mm-btn" onClick={simRun}>
          Run ▶▶
        </button>
        <button className="mm-btn" onClick={simStop} disabled={!simState}>
          停止
        </button>
        {simState && (
          <span
            className={`mm-sim-status mm-sim-status-${simState.status}`}
          >
            {simState.status === 'accepted' && '✓ 受理'}
            {simState.status === 'rejected' && '✗ 拒否'}
            {simState.status === 'running' && '実行中'}
            {' | '}
            消費: <code>{simState.consumed || 'ε'}</code>
            {' | '}
            残り: <code>{simState.remaining || 'ε'}</code>
            {' | '}
            状態: <code>{[...simState.current].join(',') || '∅'}</code>
          </span>
        )}
      </div>
    </div>
  );
}
