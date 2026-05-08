# AutomataLab

> **JFLAP の Web 版を目指す DFA/NFA エディタ + シミュレータ**。
> オートマトン理論・コンパイラ授業の学生向け。Mermaid テキスト出力で図を Markdown / Obsidian / Notion にそのまま貼れる。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## なぜ作ったか

JFLAP は業界標準の教育ツールだが Java で UI が古く、Web 化されていない。一方、汎用 Mermaid エディタには FSM 特化機能（実行アニメ・受理判定）がない。
**「Web で動く JFLAP + Mermaid 出力」**の交差点が欲しかった。

## 機能

### FSM 特化（AutomataLab 固有）

- ✅ **DFA / NFA シミュレーション**: 入力文字列を流して状態遷移をアニメーション
- ✅ **ε-閉包 + 部分集合追跡**: NFA の ε 遷移も正しく扱う
- ✅ **Step / Run / Reset**: 1 文字ずつ進める / 一気に実行
- ✅ **受理判定**: ✓ 受理（緑）/ ✗ 拒否（赤）/ 実行中（青）の状態ハイライト
- ✅ **典型サンプル集**: `(a|b)*b` / `(a|b)*ab` / `(a|bb)*b` / `abb を含む` / 3で割切 / ε-NFA

### 汎用エディタ機能（[MermaidMaker](https://github.com/akitaroh/mermaid-maker) と共通）

- ✅ テキスト ↔ GUI 双方向同期
- ✅ ノード/エッジを GUI から追加・編集・削除
- ✅ 平行エッジの自動分離・形状切替・中間点ドラッグ
- ✅ クリップボードコピー / URL 共有 / LocalStorage 自動保存

## 使い方

```bash
npm install
npm run dev
```

ブラウザを開くと `(a|b)*b` の DFA が初期表示される。

1. **シミュレーション欄**に入力文字列（例: `abb`）を入れる
2. **[Run ▶▶]** で一気に実行 → 緑ハイライト + ✓ 受理
3. **[Step ▶]** で 1 文字ずつ進めて状態遷移を観察
4. **[サンプル ▼]** から 6 種類の典型 FSM を試せる
5. **[🔗 URL 共有]** で図のリンクをクリップボードにコピー

## サポートする FSM 構文（Mermaid 互換）

- ノード: 通常状態 `((q0))` / 受理状態 `(((q1)))`
- エッジ: `q0 -->|a| q1` / 自己ループ `q0 -->|a, b| q0`
- ε 遷移: ラベルを `ε` または `eps` または空にする
- 開始状態: グラフ内の**最初のノード**

## 開発

```bash
npm test          # 単体テスト（88/88）
npm run build     # production build
npm run preview   # build を確認
```

## 関連プロダクト

- **[MermaidMaker](https://github.com/akitaroh/mermaid-maker)** — AutomataLab の土台になっている汎用 Mermaid エディタ

## 設計メソドロジー

[Zettel駆動開発（ZDD）](https://github.com/akitaroh/zdd) で開発。各機能（Atom）が独立した純関数として設計されている。シミュレータは React・reactflow に非依存の純関数で、Node.js / CLI でも動く。

## License

MIT — see [LICENSE](LICENSE).
