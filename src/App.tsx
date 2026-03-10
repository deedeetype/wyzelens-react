import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/react'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { AlertsProvider } from '@/contexts/AlertsContext'
import { NewsFeedProvider } from '@/contexts/NewsFeedContext'
import Dashboard from '@/pages/Dashboard'
import NewLandingPage from '@/pages/NewLandingPage'
import Pricing from '@/pages/Pricing'
import Onboarding from '@/pages/Onboarding'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import TermsOfService from '@/pages/TermsOfService'
import BlogList from '@/pages/blog/BlogList'
import BestCITools2026 from '@/pages/blog/BestCITools2026'
import CrayonKlueWyzeLens from '@/pages/blog/CrayonKlueWyzeLens'
import AICompetitorTracking from '@/pages/blog/AICompetitorTracking'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser()
  
  if (!isLoaded) return <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="text-white">Loading...</div>
  </div>
  if (!isSignedIn) return <Navigate to="/" replace />
  
  return <>{children}</>
}

function RootRedirect() {
  const { isSignedIn, isLoaded } = useUser()
  
  if (!isLoaded) return <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="text-white">Loading...</div>
  </div>
  
  // If signed in, redirect to dashboard
  if (isSignedIn) return <Navigate to="/dashboard" replace />
  
  // Otherwise show landing page
  return <NewLandingPage />
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SettingsProvider>
        <AlertsProvider>
          <NewsFeedProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />} />
                <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/best-competitive-intelligence-tools-2026" element={<BestCITools2026 />} />
                <Route path="/blog/crayon-vs-klue-vs-wyzelens" element={<CrayonKlueWyzeLens />} />
                <Route path="/blog/how-to-track-competitors-with-ai" element={<AICompetitorTracking />} />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </NewsFeedProvider>
        </AlertsProvider>
      </SettingsProvider>
    </ClerkProvider>
  )
}

export default App