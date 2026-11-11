// types/css.d.ts
// Importy plików CSS dla efektu ubocznego (np. `import '@/styles/globals.css'` w app/layout.tsx).
// TypeScript 6 domyślnie sprawdza takie importy (noUncheckedSideEffectImports) i bez tej deklaracji
// zgłasza TS2882. `npx tsc` uruchamia TS 6 z CLI Sanity, projektowy `npm run typecheck` — TS 5.9.
declare module '*.css'
