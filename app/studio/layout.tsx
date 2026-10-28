// app/studio/layout.tsx
// Root layout nie renderuje <html> (robi to [locale]/layout.tsx), więc Studio potrzebuje własnego.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
