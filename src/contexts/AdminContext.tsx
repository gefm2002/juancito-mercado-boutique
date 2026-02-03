import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const ADMIN_TOKEN_KEY = 'juancito_admin_token'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
    }
  }, [token])

  const login = (newToken: string) => {
    setToken(newToken)
  }

  const logout = () => {
    setToken(null)
  }

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
