"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Eye, EyeOff, Mail, Lock, User, Edit, Hash } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export function EditorRegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [channelId, setChannelId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("パスワードが一致しません")
      return false
    }

    if (password.length < 8) {
      setPasswordError("パスワードは8文字以上である必要があります")
      return false
    }

    setPasswordError("")
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validatePassword()) {
      return
    }

    setIsLoading(true)

    try {

      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          mail_address: email,
          password,
          channel: channelId,
          role: "editor", // ← ここで "editor" を指定
        }),
      });
    
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "登録に失敗しました");
      }
      // 登録成功後、ログインページにリダイレクト
      window.location.href = "/editor/login"
      // 登録処理のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // ログイン情報を保存
      login(email)

      // 登録成功後、カレンダーページにリダイレクト
      navigate("/")
    } catch (error) {
      console.error("編集者登録エラー:", error)
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
        <h2 className="mt-6 text-3xl font-bold text-gray-900">編集者アカウント登録</h2>
        <p className="mt-2 text-sm text-gray-600">編集者権限で進捗管理システムを利用できます</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="pl-10"
              placeholder="お名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="channelId"
              name="channelId"
              type="text"
              required
              className="pl-10"
              placeholder="チャンネルID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className="pl-10 pr-10"
              placeholder="パスワード (8文字以上)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className="pl-10 pr-10"
              placeholder="パスワード (確認)"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
        </div>

        <div>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
            {isLoading ? "登録中..." : "編集者アカウント登録"}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          すでに編集者アカウントをお持ちの方は{" "}
          <Link to="/editor/login" className="font-medium text-green-500 hover:text-green-400">
            ログイン
          </Link>
        </p>
      </div>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-500">
          管理者として登録する場合は{" "}
          <Link to="/admin/register" className="font-medium text-gray-600 hover:text-gray-500">
            こちら
          </Link>
        </p>
      </div>
    </div>
  )
}

