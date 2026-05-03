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

        <main class="flex-1 w-full">
          {children}
        </main>

        <ToastContainer />
      </div>
    </ErrorHandlerProvider>
  )
}