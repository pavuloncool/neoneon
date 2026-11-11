// lib/useHydrated.ts
// false na serwerze i w czasie hydracji, true po hydracji (oraz od razu przy montażu po hydracji).
// Zamiennik wzorca `useEffect(() => setMounted(true), [])` bez setState w efekcie: React sam renderuje
// najpierw wersję serwerową (getServerSnapshot), a po hydracji — kliencką. Używane tam, gdzie wynik zależy
// od czegoś znanego dopiero w przeglądarce (np. motyw z next-themes), żeby nie było błędu hydracji.

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
