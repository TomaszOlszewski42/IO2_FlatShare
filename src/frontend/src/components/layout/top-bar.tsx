import { appConfig } from '../../config/app-config'
import { AuthControls } from './auth-controls'

export function TopBar() {
  return (
    <header class="navbar border-b border-base-300/70 bg-base-100/85 px-4 shadow-sm backdrop-blur md:px-6">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between">
        <a class="text-lg font-semibold tracking-tight" href="/">
          {appConfig.name}
        </a>
        <AuthControls />
      </div>
    </header>
  )
}
