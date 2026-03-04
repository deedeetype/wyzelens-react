import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/react'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { AlertsProvider } from '@/contexts/AlertsContext'
import { NewsFeedProvider } from '@/contexts/NewsFeedContext'
import Dashboard from '@/pages/Dashboard'
import LandingPage from '@/pages/LandingPage'
import Pricing from '@/pages/Pricing'
import Demo from '@/pages/Demo'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <Navigate to="/" />
  
  return <>{children}</>
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SettingsProvider>
        <AlertsProvider>
          <NewsFeedProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
                <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/pricing" element={<Pricing />} />
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