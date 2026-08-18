export interface User {
  id: number
  username: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}
