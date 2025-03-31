"use client"

import { createContext, useContext, useState, useEffect } from "react"

// 認証コンテキストを作成
export const AuthContext = createContext()

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }) {
  // ユーザー情報の状態
  const [user, setUser] = useState(null)

  // コンポーネントがマウントされたときにlocalStorageからユーザー情報を取得
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // ログイン処理
  const login = (email) => {
    const userData = { email }
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    return userData
  }

  // ログアウト処理
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // コンテキストの値
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// カスタムフック
export const useAuth = () => useContext(AuthContext)

