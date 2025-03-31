"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Eye, EyeOff, Mail, Lock, Edit } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export function EditorLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ログイン処理のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // ログイン成功後、ホームページにリダイレクト
      window.location.href = "/"
    } catch (error) {
      console.error("編集者ログインエラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-500 rounded-full overflow-hidden flex items-center justify-center">
            <Edit className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">編集者ログイン</h2>
        <p className="mt-2 text-sm text-gray-600">編集者アカウントで進捗管理システムにログインします</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="pl-10"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="pl-10 pr-10"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          編集者アカウントをお持ちでない方は{" "}
          <Link to="/editor/register" className="font-medium text-green-500 hover:text-green-400">
            新規登録
          </Link>
        </p>
      </div>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-500">
          管理者としてログインする場合は{" "}
          <Link to="/admin/login" className="font-medium text-gray-600 hover:text-gray-500">
            こちら
          </Link>
        </p>
      </div>
    </div>
  )
}

