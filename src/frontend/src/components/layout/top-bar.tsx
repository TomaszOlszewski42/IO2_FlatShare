import { appConfig } from '../../config/app-config'
import { AuthControls } from './auth-controls'

export function TopBar() {
  return (
    <header class="border-b border-base-300/70 bg-base-100/85 shadow-sm backdrop-blur">
      <div class="navbar mx-auto w-full max-w-6xl px-4 md:px-6">
        <div class="navbar-start">
          <a class="link link-hover text-lg font-semibold tracking-tight no-underline" href="/">
            {appConfig.name}
          </a>
        </div>
        <div class="navbar-end">
          <AuthControls />
        </div>
      </div>
    </header>
  )
}
