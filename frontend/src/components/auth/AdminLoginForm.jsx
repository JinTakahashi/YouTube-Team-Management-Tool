"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // ここに実際のログイン処理を実装
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました");
      }

      const data = await response.json();
      // 必要に応じて、アクセストークンを保存する（例: localStorage.setItem("access_token", data.access_token);）

      // ログイン情報を保存
      login(email)

      // ログイン成功後、カレンダーページにリダイレクト
      navigate("/")
    } catch (error) {
      console.error("管理者ログインエラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full overflow-hidden flex items-center justify-center">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">管理者ログイン</h2>
        <p className="mt-2 text-sm text-gray-600">管理者アカウントで進捗管理システムにログインします</p>
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
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          管理者アカウントをお持ちでない方は{" "}
          <Link to="/admin/register" className="font-medium text-blue-600 hover:text-blue-500">
            新規登録
          </Link>
        </p>
      </div>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-500">
          編集者としてログインする場合は{" "}
          <Link to="/editor/login" className="font-medium text-gray-600 hover:text-gray-500">
            こちら
          </Link>
        </p>
      </div>
    </div>
  )
}

