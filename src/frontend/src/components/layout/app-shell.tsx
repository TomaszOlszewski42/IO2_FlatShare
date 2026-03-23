import type { ComponentChildren } from 'preact'

import { TopBar } from './top-bar'

type AppShellProps = {
  children: ComponentChildren
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div class="min-h-screen text-base-content" data-theme="flatshare">
      <TopBar />

      <main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  )
}