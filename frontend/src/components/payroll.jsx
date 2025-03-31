"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  User,
  X,
  RefreshCw,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  Wallet,
  BarChart,
} from "lucide-react"
import { cn } from "../lib/utils"
import { Link } from "react-router-dom"

export default function Payroll() {
  // 現在の日付を取得
  const today = new Date()

  // 年月の状態管理
  const [currentYear, setCurrentYear] = useState(2025)
  const [currentMonth, setCurrentMonth] = useState(3)

  // サイドバーの表示状態
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showRowsDropdown, setShowRowsDropdown] = useState(false)

  // 追加: データ取得用の useState
  const [payrollData, setPayrollData] = useState([
    {
        date: "2025/3/1",
        title: "動画A",
        views: 100000,
        adStatus: "収益化済み",
        videoReward: 2000,
        incentive: "100,000 × 0.1円=1,000円",
        totalReward: 3000,
    },
    {
        date: "2025/3/2",
        title: "動画B",
        views: 300000,
        adStatus: "未収益化",
        videoReward: 2000,
        incentive: "-",
        totalReward: "-",
    },
  ])

  // 合計報酬を計算（現在の月のデータのみ）
  const calculateTotalReward = () => {
    return filteredData.reduce((total, item) => {
      if (typeof item.totalReward === "number") {
        return total + item.totalReward
      }
      return total
    }, 0)
  }

  // 前月へ
  const prevMonth = () => {
    if (currentMonth === 1) {
      // 1月の場合は前年の12月に
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      // それ以外は単純に月を1つ減らす
      setCurrentMonth(currentMonth - 1)
    }
    // ページをリセット
    setCurrentPage(1)
  }

  // 次月へ
  const nextMonth = () => {
    if (currentMonth === 12) {
      // 12月の場合は翌年の1月に
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      // それ以外は単純に月を1つ増やす
      setCurrentMonth(currentMonth + 1)
    }
    // ページをリセット
    setCurrentPage(1)
  }

  // 現在の年月に基づいてデータをフィルタリング
  const filteredData = payrollData.filter((item) => {
    const dateParts = item.date.split("/")
    const itemYear = Number.parseInt(dateParts[0])
    const itemMonth = Number.parseInt(dateParts[1])
    return itemYear === currentYear && itemMonth === currentMonth
  })

  // ページネーション関連
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems)
  const currentItems = filteredData.slice(startIndex, endIndex)

  const goToFirstPage = () => setCurrentPage(1)
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const goToLastPage = () => setCurrentPage(totalPages)

  // 1ページあたりの行数を変更
  const changeRowsPerPage = (rows) => {
    setRowsPerPage(rows)
    setShowRowsDropdown(false)
    setCurrentPage(1) // ページをリセット
  }

  // 追加: データ取得処理
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/videos") // ← 適宜URLを修正（本番環境なら.envなどで管理）
        const data = await res.json()
        if (data.videos) {
          // video_id や title などをフロント側の形式に合わせて加工
          const formatted = data.videos.map((video) => {
            const views = Number(video.views)
            const incentive = video.assignee && views >= 100000
              ? `${views.toLocaleString()} × 0.1円=${Math.floor(views * 0.1).toLocaleString()}円`
              : "-"
            const totalReward = incentive === "-" ? "-" : 2000 + Math.floor(views * 0.1)
            return {
              date: new Date(video.published_at).toLocaleDateString("ja-JP"),
              title: video.title,
              views: views,
              adStatus: "収益化済み", // ← API側で持っていれば video.ad_status に変更
              videoReward: 2000,
              incentive: incentive,
              totalReward: totalReward,
            }
          })
          setPayrollData(formatted)
        }
      } catch (err) {
        console.error("動画データの取得に失敗しました", err)
      }
    }

    fetchData()
  }, [])


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

          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="font-bold text-[#020817]">給与管理</div>
            <div className="ml-auto">
              <ChevronRight size={16} />
            </div>
          </div>

          <Link to="/analytics" className="block cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <div className="font-bold text-[#696969]">アナリティクス</div>
              <div className="ml-auto">
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-col w-full">
        {/* ヘッダー */}
        <header className="flex items-center p-2 border-b">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="メニュー">
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center ml-2">
            <span className="text-primary font-bold text-xl">給与管理</span>
          </div>

          <div className="ml-auto flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="ml-2" aria-label="検索">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full" aria-label="ユーザー">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="flex-1 py-4 px-20">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">給与計算</h1>
          </div>

          <div className="flex items-center mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="前月">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="font-medium mx-2">
              {currentYear}年{currentMonth}月
            </div>

            <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="次月">
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              最新情報を取得
            </Button>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">投稿日時</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">タイトル</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">視聴回数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">広告状況</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">動画報酬</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">インセンティブ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">合計報酬</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-[#f0f9f0]" : "bg-white"}>
                      <td className="px-4 py-3 text-sm">{item.date}</td>
                      <td className="px-4 py-3 text-sm">{item.title}</td>
                      <td className="px-4 py-3 text-sm">{item.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{item.adStatus}</td>
                      <td className="px-4 py-3 text-sm">{item.videoReward.toLocaleString()}円</td>
                      <td className="px-4 py-3 text-sm">{item.incentive}</td>
                      <td className="px-4 py-3 text-sm">
                        {typeof item.totalReward === "number"
                          ? `${item.totalReward.toLocaleString()}円`
                          : item.totalReward}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      この月のデータはありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-lg font-medium">
              {currentMonth}月の総報酬: {calculateTotalReward().toLocaleString()}円
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="flex items-center gap-1 cursor-pointer border rounded px-2 py-1"
                  onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                >
                  <ChevronDown className="h-4 w-4" />
                  <span className="font-medium">{rowsPerPage}</span>
                  <span className="text-sm">件を表示</span>
                </div>

                {showRowsDropdown && (
                  <div className="absolute left-0 mt-1 bg-white border rounded shadow-md z-10">
                    {[10, 20, 30, 40, 50].map((rows) => (
                      <div
                        key={rows}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => changeRowsPerPage(rows)}
                      >
                        {rows}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm">{totalItems > 0 ? `${currentPage} / ${totalPages}` : "0 / 0"}</div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1 || totalItems === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || totalItems === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalItems === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || totalItems === 0}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* サイドバーが開いている時のオーバーレイ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

