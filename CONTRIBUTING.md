# Contributing to AutomataLab

Thanks for your interest! This is a small personal OSS project — feedback, bug reports and PRs are all welcome.

## Quick start

```bash
git clone https://github.com/Akitaroh/automatalab.git
cd automatalab
npm install
npm run dev      # http://localhost:5173
npm test         # run unit tests
```

Node.js 18+ recommended.

## How to report a bug

Use [Issues](https://github.com/Akitaroh/automatalab/issues) with the bug report template. Include:
- What you tried (input string, sample selected, etc.)
- What you expected
- What actually happened
- Browser & OS

## How to suggest a feature

Open an Issue with the feature request template. Be concrete: what FSM concept does it teach? What does the UI look like?

## Code style

- TypeScript strict
- 4-space indentation in JSX, 2-space elsewhere (follow existing code)
- Tests go next to the source file (`foo.ts` + `foo.test.ts`)
- Run `npm test` and `npm run build` before opening a PR

## Architecture

This project uses [Zettel-Driven Development (ZDD)](https://github.com/akitaroh/zdd). Each feature is an "Atom" — a pure function module that can be tested in isolation. See `src/` directories:

- `simulator/` — DFA/NFA execution engine (pure functions, no React)
- `samples/` — Pre-built FSM examples
- `mermaid/` `store/` `canvas/` `graph/` `edge-router/` `persistence/` — shared with [MermaidMaker](https://github.com/Akitaroh/mermaid-maker)

When in doubt, ask in an Issue first before writing code.

## License

By contributing you agree your contributions will be licensed under the [MIT License](LICENSE).
