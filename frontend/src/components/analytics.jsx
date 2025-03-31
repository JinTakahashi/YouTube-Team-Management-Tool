"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { ChevronLeft, ChevronRight, Menu, Search, Plus, User, X, CalendarDays, Wallet, BarChart } from "lucide-react"
import { cn } from "../lib/utils"
import { Link } from "react-router-dom"

export default function Analytics() {
  // 現在の日付を取得
  const today = new Date()

  // 今日の年月を取得
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  // サイドバーの表示状態
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* サイドバー */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-100 bg-white border-r transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 space-y-4">
          {/* 閉じるボタンを追加 */}
          <div className="flex justify-end h-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              aria-label="閉じる"
              className="mb-2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Link to="/" className="block cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <div className="font-bold text-[#696969]">納期進捗管理</div>
              <div className="ml-auto">
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          <Link to="/payroll" className="block cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="font-bold text-[#696969]">給与管理</div>
              <div className="ml-auto">
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div className="font-bold text-[#020817]">アナリティクス</div>
            <div className="ml-auto">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="flex items-center p-2 border-b">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="メニュー">
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center ml-2">
          <span className="text-primary font-bold text-xl">アナリティクス</span>
        </div>

        <Button variant="ghost" size="icon" aria-label="前月">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="次月">
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="ml-2 font-medium">
          {currentYear}年{currentMonth}月
        </div>

        <div className="ml-auto flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="ユーザー">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">アナリティクスダッシュボード</h1>
        <p className="text-gray-600">ここにアナリティクスのコンテンツが表示されます。</p>
      </div>

      {/* サイドバーが開いている時のオーバーレイ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

