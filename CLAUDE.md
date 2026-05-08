# AutomataLab - Project CLAUDE.md

このプロジェクトは [Zettel駆動開発](../../10_Permanent/engineering/Zettel駆動開発.md)（ZDD）で開発される、**JFLAP の Web 版を目指す FSM 教育ツール**。

[[00_MermaidMaker|MermaidMaker]] の汎用 Atom を再利用 + FSM 特化 Atom（Simulator / SampleLibrary / SimulatorPanel）を載せた派生プロダクト。

## マスター指示

**実装する前に必ず Vault 側の設計ドキュメントを読む**：

- `../../50_Mission/AutomataLab/00_AutomataLab.md` — HOME
- `../../50_Mission/AutomataLab/10_Why.md` / `20_What.md` / `30_How.md`
- `../../50_Mission/AutomataLab/Atom-*.md` / `Arrow-*.md`
- 共通 Atom（Parser / Canvas 等）は `../../50_Mission/MermaidMaker/Atom-*.md` を参照

## 役割分担

- **設計（Vault 側）** = 人間の責任領域。AI は触らない
- **実装（このリポジトリ）** = AI の作業領域
- **AI 実装メモ** = `docs/ai/` 配下に決定 log 中心で書く

## 実装ガイドライン

- TypeScript + React + Vite + @xyflow/react + dagre
- ディレクトリ:
  - `src/types/` `src/mermaid/` `src/store/` `src/canvas/` `src/graph/` `src/edge-router/` `src/persistence/` ← MermaidMaker から同期
  - `src/simulator/` `src/samples/` `src/app/` ← AutomataLab 固有

## 共通 Atom の同期ルール

- 汎用 Atom の更新は MermaidMaker 側で行う（一次ソース）
- AutomataLab には変更を **手動コピー** で反映
- AutomataLab 固有の修正（FSM ハイライト等）は AL 内のみで完結
- divergence を防ぐため、汎用 Atom の **AL 側だけで修正は禁止**

## 設計を変えるとき

設計ドキュメント（Vault 側）を先に修正する。コードから先に直さない。
