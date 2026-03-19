import type { ComponentChildren } from 'preact'

import { appConfig } from '../../config/app-config'

type AppShellProps = {
  children: ComponentChildren
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div class="min-h-screen text-base-content" data-theme="flatshare">
      <header class="navbar border-b border-base-300/70 bg-base-100/85 px-4 shadow-sm backdrop-blur md:px-6">
        <div class="mx-auto flex w-full max-w-6xl items-center justify-between">
          <a class="text-lg font-semibold tracking-tight" href="/">
            {appConfig.name}
          </a>
        </div>
      </header>

      <main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  )
}