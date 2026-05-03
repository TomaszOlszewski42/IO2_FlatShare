import type { RoutableProps } from 'preact-router'
import { useAuth } from '../hooks/use-auth'
import { RoleBoundary } from '../components/auth/role-boundary'
import { UserRole } from '../types/user'

export function HomePage(_: RoutableProps) {
  const { isLandlord, isTenant, isAuthenticated } = useAuth()

  return (
    <div class="flex flex-col w-full min-h-screen -mt-4">
      {/* Hero Section */}
      <section class="hero min-h-[75vh] rounded-b-[4rem] overflow-hidden relative mb-16 shadow-2xl">
        <div class="hero-content flex-col lg:flex-row-reverse gap-12 max-w-7xl mx-auto px-6 py-12 lg:py-24">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="/hero-image.png" 
              class="relative max-w-sm md:max-w-md lg:max-w-lg rounded-2xl shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02]" 
              alt="Modern apartment interior"
            />
          </div>
          <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div class="badge badge-primary badge-outline mb-4 px-4 py-3 font-semibold uppercase tracking-widest text-xs">Premium Flat Sharing</div>
            <h1 class="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Find your <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">dream</span> home
            </h1>
            <p class="text-xl md:text-2xl text-base-content/70 max-w-xl mb-10 leading-relaxed font-medium">
              FlatShare connects students and young professionals with the best living spaces. Simple, secure, and smart matching.
            </p>
            <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
              {!isAuthenticated ? (
                <>
                  <a href="/register" class="btn btn-primary btn-lg px-10 shadow-lg shadow-primary/20">Get Started</a>
                  <a href="/login" class="btn btn-outline btn-lg px-10">Sign In</a>
                </>
              ) : (
                <a href={isLandlord ? "/listings/create" : "/listings"} class="btn btn-primary btn-lg px-10 shadow-lg shadow-primary/20">
                  {isLandlord ? 'Post a Listing' : 'Browse Listings'}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class="container mx-auto px-6 py-20">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4">Everything you need</h2>
          <div class="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6"></div>
          <p class="text-xl text-base-content/60 max-w-2xl mx-auto">Our platform is designed to make your housing search or management as smooth as possible.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1: Tenants */}
          <div class="card bg-base-100 shadow-xl border border-base-200 hover:border-primary/40 transition-all hover:-translate-y-2 group">
            <div class="card-body p-10">
              <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-primary group-hover:text-primary-content transition-colors">
                🏠
              </div>
              <h3 class="card-title text-2xl font-bold mb-4">Find a Room</h3>
              <p class="text-base-content/70 text-lg leading-relaxed">Browse hundreds of verified listings in your favorite areas. Filter by price, amenities, and more.</p>
              <div class="card-actions mt-8">
                <a href="/listings" class="btn btn-link btn-lg text-primary p-0 no-underline hover:underline">Explore listings →</a>
              </div>
            </div>
          </div>

          {/* Card 2: Landlords */}
          <div class="card bg-base-100 shadow-xl border border-base-200 hover:border-secondary/40 transition-all hover:-translate-y-2 group">
            <div class="card-body p-10">
              <div class="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-secondary group-hover:text-secondary-content transition-colors">
                🔑
              </div>
              <h3 class="card-title text-2xl font-bold mb-4">List Property</h3>
              <p class="text-base-content/70 text-lg leading-relaxed">Reach thousands of potential tenants in minutes. Manage your applications and viewings easily.</p>
              <div class="card-actions mt-8">
                <a href="/listings/create" class="btn btn-link btn-lg text-secondary p-0 no-underline hover:underline">Start listing →</a>
              </div>
            </div>
          </div>

          {/* Card 3: Matching */}
          <div class="card bg-base-100 shadow-xl border border-base-200 hover:border-accent/40 transition-all hover:-translate-y-2 group">
            <div class="card-body p-10">
              <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-accent group-hover:text-accent-content transition-colors">
                ✨
              </div>
              <h3 class="card-title text-2xl font-bold mb-4">Smart Match</h3>
              <p class="text-base-content/70 text-lg leading-relaxed">Tell us your preferences and we'll find the perfect roommates and flats that match your lifestyle.</p>
              <div class="card-actions mt-8">
                <a href="/preferences" class="btn btn-link btn-lg text-accent p-0 no-underline hover:underline">Set preferences →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authenticated Quick Access - Floating Glass Dashboard */}
      {isAuthenticated && (
        <section class="container mx-auto px-6 py-12 mb-24">
          <div class="bg-base-100/60 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            
            <div class="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div>
                <h2 class="text-4xl font-black mb-4">Welcome back!</h2>
                <p class="text-xl text-base-content/60 font-medium">Ready to continue your journey?</p>
              </div>
              <div class="flex flex-wrap gap-6 justify-center">
                <RoleBoundary requiredRole={UserRole.Landlord}>
                  <a href="/listings/create" class="btn btn-primary btn-lg px-8 shadow-xl shadow-primary/20">New Listing</a>
                  <a href="/listings" class="btn btn-ghost btn-lg border border-base-300">My Dashboard</a>
                </RoleBoundary>
                <RoleBoundary requiredRole={UserRole.Tenant}>
                  <a href="/listings" class="btn btn-primary btn-lg px-8 shadow-xl shadow-primary/20">Find Rooms</a>
                  <a href="/preferences" class="btn btn-ghost btn-lg border border-base-300">Preferences</a>
                </RoleBoundary>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Footer */}
      {!isAuthenticated && (
        <section class="py-24 px-6 text-center">
          <h2 class="text-4xl font-black mb-8">Ready to find your next space?</h2>
          <a href="/register" class="btn btn-primary btn-wide btn-lg shadow-2xl">Create Free Account</a>
        </section>
      )}
    </div>
  )
}
