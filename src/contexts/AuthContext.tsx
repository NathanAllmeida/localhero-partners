import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  avatar: string | null
  role: string
  partner_company_name: string | null
  partner_fee_rate: number | null
  partner_verified_at: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      api<User>('/partner/auth/me')
        .then((res) => {
          setUser(res.data)
        })
        .catch(() => {
          clearTokens()
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await api<{ access_token: string; refresh_token: string; user: User }>(
      '/partner/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )

    setTokens(res.data.access_token, res.data.refresh_token)
    setUser(res.data.user)
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
