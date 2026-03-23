import type { ComponentChildren } from 'preact'

import { TopBar } from './top-bar'
import { ToastContainer } from '../ui/toast-container'
import { ErrorHandlerProvider } from '../../services/error-handler-context'

type AppShellProps = {
  children: ComponentChildren
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ErrorHandlerProvider>
      <div class="min-h-screen text-base-content" data-theme="flatshare">
        <TopBar />

        <main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>

        <ToastContainer />
      </div>
    </ErrorHandlerProvider>
  )
}