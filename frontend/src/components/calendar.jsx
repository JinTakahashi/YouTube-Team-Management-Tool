"use client"

import { useState } from "react"
import { useEffect } from "react";
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Plus,
  User,
  X,
  UserRound,
  Tag,
  Bell,
  LinkIcon,
  Paperclip,
  FileText,
  UploadCloud,
  ChevronRightIcon,
  Clock,
  History,
  CalendarDays,
  Wallet,
  BarChart,
} from "lucide-react"
import { cn } from "../lib/utils"
import { Link as RouterLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"



// APIのベースURL
const BASE_URL = "http://localhost:8000";

// メールアドレスから担当者IDを返す簡易マッピング関数
function getAssigneeId(email) {
  if (email === "admin@example.com") return 1;
  if (email === "editor@example.com") return 2;
  return 1; // デフォルト
}

// 選択された日付と時刻（例："午後 5:00"）を組み合わせてISO形式に変換する関数
function combineDateTime(selectedDate, eventTime) {
  let hour = 0, minute = 0;
  const timeMatch = eventTime.match(/(午前|午後)\s*(\d+):(\d+)/);
  if (timeMatch) {
    const meridiem = timeMatch[1];
    hour = parseInt(timeMatch[2], 10);
    minute = parseInt(timeMatch[3], 10);
    if (meridiem === "午後" && hour < 12) {
      hour += 12;
    }
    if (meridiem === "午前" && hour === 12) {
      hour = 0;
    }
  }
  const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day, hour, minute);
  return date.toISOString();
}

// バックエンドから取得したタスク情報を、カレンダー表示用のイベント形式に変換する関数
function convertTaskToEvent(task) {
  if (!task.deadline) return null;
  const d = new Date(task.deadline);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "午後" : "午前";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const timeStr = `${meridiem} ${hours}:${minutes}`;
  
  let email = "";
  if (task.assignee_id === 1) email = "admin@example.com";
  else if (task.assignee_id === 2) email = "editor@example.com";
  else email = "guest@example.com";
  
  return {
    id: task.id,
    title: task.title,
    date: d.getDate(),
    month: d.getMonth(),
    year: d.getFullYear(),
    time: timeStr,
    email: email,
    status: task.status,
    reminder: task.reminder,
    memo: task.note,
    url: "",
    file: "",
  };
}



export function Calendar() {
  const [videoId, setVideoId] = useState("")
  const [assigneeEmail, setAssigneeEmail] = useState("")

  // 認証コンテキストからユーザー情報を取得
  const { user } = useAuth()

  // 現在の日付を取得
  const today = new Date()

  // 表示する年月の状態
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  // サイドバーの表示状態
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 選択された日付を管理する状態を追加
  const [selectedDate, setSelectedDate] = useState({
    day: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear(),
  })

  // 予定追加メニューの表示状態
  const [showEventForm, setShowEventForm] = useState(false)

  // 編集モードかどうか
  const [isEditMode, setIsEditMode] = useState(false)

  // 編集中のイベントのインデックス
  const [editingEventIndex, setEditingEventIndex] = useState(-1)

  // 新しい予定のタイトル
  const [eventTitle, setEventTitle] = useState("")

  // 予定の時間
  const [eventTime, setEventTime] = useState("午後 5:00")

  // 時間選択モーダルの表示状態
  const [showTimeModal, setShowTimeModal] = useState(false)

  // イベントの状態管理
  const [events, setEvents] = useState([]);

  // サーバーからタスクを取得し、カレンダーに表示する処理
  async function fetchTasks() {
    try {
      const res = await fetch(`${BASE_URL}/tasks`);
      if (!res.ok) throw new Error("タスクの取得に失敗");
      const data = await res.json();
      const fetchedEvents = data.tasks
        .map(convertTaskToEvent)
        .filter(event => event !== null);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error(error);
    }
  }

  // 新しいタスクをサーバーに送信して登録する処理
  async function createTask(payload) {
    try {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("タスクの作成に失敗しました");
    } catch (error) {
      console.error(error);
    }
  }
  
// 初回マウント時だけfetchTasks関数を実行
  useEffect(() => {
    fetchTasks();
  }, []);


  // リマインダー選択モーダルの表示状態を追加
  const [showReminderModal, setShowReminderModal] = useState(false)

  // メモ選択モーダルの表示状態を追加
  const [showMemoModal, setShowMemoModal] = useState(false)

  // メモの内容を保存する状態
  const [eventMemo, setEventMemo] = useState("")

  // URLを保存する状態
  const [eventUrl, setEventUrl] = useState("")

  // ファイル名を保存する状態
  const [eventFile, setEventFile] = useState("")

  // リマインダーの選択肢を追加
  const reminderOptions = ["通知なし", "1日前", "2日前", "3日前", "4日前", "5日前", "6日前", "7日前"]

  // 新しい予定のリマインダー
  const [eventReminder, setEventReminder] = useState("3日前")

  // リマインダー選択モーダルを開く
  const openReminderModal = () => {
    setShowReminderModal(true)
  }

  // メモ選択モーダルを開く
  const openMemoModal = () => {
    setShowMemoModal(true)
  }

  // メモを保存
  const saveMemo = () => {
    if (isEditMode && editingEventIndex >= 0) {
      // 既存の予定を更新
      const updatedEvents = [...events]
      updatedEvents[editingEventIndex] = {
        ...updatedEvents[editingEventIndex],
        memo: eventMemo,
        url: eventUrl,
        file: eventFile,
      }
      setEvents(updatedEvents)
    }
    setShowMemoModal(false)
  }

  // メモモーダルをキャンセル
  const cancelMemo = () => {
    // 編集中の場合は元の値に戻す
    if (isEditMode && editingEventIndex >= 0) {
      setEventMemo(events[editingEventIndex].memo || "")
      setEventUrl(events[editingEventIndex].url || "")
      setEventFile(events[editingEventIndex].file || "")
    }
    setShowMemoModal(false)
  }

  // リマインダーを選択
  const selectReminder = (reminder) => {
    // 常にeventReminderを更新して、UIに反映されるようにする
    setEventReminder(reminder)

    if (isEditMode && editingEventIndex >= 0) {
      // 既存の予定を更新
      const updatedEvents = [...events]
      updatedEvents[editingEventIndex] = {
        ...updatedEvents[editingEventIndex],
        reminder: reminder,
      }
      setEvents(updatedEvents)
    }
    setShowReminderModal(false)
  }

  // ステータス選択モーダルの表示状態
  const [showStatusModal, setShowStatusModal] = useState(false)

  // ステータスの選択肢
  const statusOptions = [
    { name: "未着手", color: "#f44336" },
    { name: "編集中", color: "#ff9800" },
    { name: "チェック待ち", color: "#2196f3" },
    { name: "修正中", color: "#ffeb3b" },
    { name: "公開待ち", color: "#4caf50" },
    { name: "公開済み", color: "#a9a9a9" },
  ]

  // ステータス選択モーダルを開く
  const openStatusModal = () => {
    setShowStatusModal(true)
  }

  // ステータスを選択
  const selectStatus = (status) => {
    // 常にeventStatusを更新して、UIに反映されるようにする
    setEventStatus(status)

    if (isEditMode && editingEventIndex >= 0) {
      // 既存の予定を更新
      const updatedEvents = [...events]
      updatedEvents[editingEventIndex] = {
        ...updatedEvents[editingEventIndex],
        status: status,
      }
      setEvents(updatedEvents)
    }
    setShowStatusModal(false)
  }

  // 新しい予定のステータス
  const [eventStatus, setEventStatus] = useState("未着手")

  // ステータスに基づく背景色を取得
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((option) => option.name === status)
    return statusOption ? statusOption.color : "#f44336" // デフォルトは未着手の色
  }

  const saveEvent = async () => {
    if (eventTitle.trim() === "") {
      setEventTitle("無題の予定");
    }

    if (isEditMode && editingEventIndex >= 0) {
      // 編集の場合は、ローカル state の更新（将来的にAPI連携追加の予定）
      const updatedEvents = [...events];
      updatedEvents[editingEventIndex] = {
        ...updatedEvents[editingEventIndex],
        title: eventTitle.trim() === "" ? "無題の予定" : eventTitle,
        time: eventTime,
        status: eventStatus,
        reminder: eventReminder,
        memo: eventMemo,
        url: eventUrl,
        file: eventFile,
      };
      setEvents(updatedEvents);
    } else {
      // 新規作成の場合：API にPOST送信し、最新のタスク一覧を再取得
      const deadline = combineDateTime(selectedDate, eventTime);
      const payload = {
        title: eventTitle.trim() === "" ? "無題の予定" : eventTitle,
        assignee_id: getAssigneeId(user?.email || "guest@example.com"),
        status: eventStatus,
        reminder: eventReminder,
        note: eventMemo,
        channel: "",
        deadline: deadline,
      };
      await createTask(payload);
      await fetchTasks();
    }

    // フォームリセット
    setShowEventForm(false);
    setIsEditMode(false);
    setEditingEventIndex(-1);
    setEventTitle("");
    setEventStatus("未着手");
    setEventReminder("3日前");
    setEventMemo("");
    setEventUrl("");
    setEventFile("");
  }

  // 予定を選択して編集モードにする関数を修正
  const editEvent = (event, index) => {
    // イベントの伝播を止める
    event.stopPropagation()

    // 選択された予定の日付を設定
    setSelectedDate({
      day: events[index].date,
      month: events[index].month,
      year: events[index].year,
    })

    // 編集モードに設定
    setIsEditMode(true)
    setEditingEventIndex(index)

    // フォームに予定の情報を設定
    setEventTitle(events[index].title)
    setEventTime(events[index].time)
    setEventStatus(events[index].status || "未着手") // ステータスを設定
    setEventReminder(events[index].reminder || "3日前") // リマインダーを設定
    setEventMemo(events[index].memo || "") // メモを設定
    setEventUrl(events[index].url || "") // URLを設定
    setEventFile(events[index].file || "") // ファイルを設定

    // フォームを表示
    setShowEventForm(true)
  }

  // 日付を選択する処理を修正
  const selectDate = (day, month, year, showForm = false) => {
    setSelectedDate({
      day,
      month,
      year,
    })
    // 編集モードをリセット
    setIsEditMode(false)
    setEditingEventIndex(-1)
    setEventTitle("")
    setEventTime("午後 5:00")
    setEventStatus("未着手") // ステータスをリセット
    setEventReminder("3日前") // リマインダーをリセット
    setEventMemo("") // メモをリセット
    setEventUrl("") // URLをリセット
    setEventFile("") // ファイルをリセット

    // showFormがtrueの場合のみフォームを表示（ダブルクリック時）
    if (showForm) {
      setShowEventForm(true)
    }
  }

  // 新規予定追加フォームを表示する関数を修正
  const showNewEventForm = () => {
    // 編集モードをリセット
    setIsEditMode(false)
    setEditingEventIndex(-1)
    setEventTitle("")
    setEventTime("午後 5:00")
    setEventStatus("未着手") // ステータスをリセット
    setEventReminder("3日前") // リマインダーをリセット
    setEventMemo("") // メモをリセット
    setEventUrl("") // URLをリセット
    setEventFile("") // ファイルをリセット

    // フォームを表示
    setShowEventForm(true)
  }

  // 予定追加フォームを閉じる
  const closeEventForm = () => {
    setShowEventForm(false)
    setIsEditMode(false)
    setEditingEventIndex(-1)
    setEventTitle("")
  }

  // 時間選択モーダルを開く
  const openTimeModal = () => {
    setShowTimeModal(true)
  }

  // 時間を選択
  const selectTime = (time) => {
    setEventTime(time)
    setShowTimeModal(false)
  }

  // 予定を削除
  const deleteEvent = () => {
    if (isEditMode && editingEventIndex >= 0) {
      // 予定を削除
      const updatedEvents = events.filter((_, index) => index !== editingEventIndex)
      setEvents(updatedEvents)

      // フォームを閉じる
      setShowEventForm(false)
      setIsEditMode(false)
      setEditingEventIndex(-1)
      setEventTitle("")
    }
  }

  // 月の日数を取得
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // 月の最初の日の曜日を取得 (0: 日曜日, 1: 月曜日, ...)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // 月の最後の日の曜日を取得
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, getDaysInMonth(year, month)).getDay()
  }

  // 前月の日数を取得
  const getDaysInPrevMonth = (year, month) => {
    if (month === 0) {
      return getDaysInMonth(year - 1, 11)
    }
    return getDaysInMonth(year, month - 1)
  }

  // カレンダーグリッドを生成
  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
    const lastDayOfMonth = getLastDayOfMonth(currentYear, currentMonth)
    const daysInPrevMonth = getDaysInPrevMonth(currentYear, currentMonth)

    const days = []

    // 前月の日を追加
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDay = daysInPrevMonth - firstDayOfMonth + i + 1
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

      days.push({
        day: prevMonthDay,
        month: prevMonth,
        year: prevYear,
        currentMonth: false,
        isToday: false,
        events: events.filter(
          (event) => event.date === prevMonthDay && event.month === prevMonth && event.year === prevYear,
        ),
      })
    }

    // 現在の月の日を追加
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

      // この日のイベントを検索
      const dayEvents = events.filter(
        (event) => event.date === i && event.month === currentMonth && event.year === currentYear,
      )

      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        currentMonth: true,
        isToday,
        events: dayEvents,
      })
    }

    // 次月の日を追加
    const remainingDays = 7 - ((firstDayOfMonth + daysInMonth) % 7)
    if (remainingDays < 7) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          month: nextMonth,
          year: nextYear,
          currentMonth: false,
          isToday: false,
          events: events.filter((event) => event.date === i && event.month === nextMonth && event.year === nextYear),
        })
      }
    }

    return days
  }

  // 月名を日本語で取得
  const getMonthName = (month) => {
    return `${month + 1}月`
  }

  // 曜日を日本語で取得
  const getDayOfWeek = (year, month, day) => {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    const days = ["日", "月", "火", "水", "木", "金", "土"]
    return days[dayOfWeek]
  }

  // 曜日の配列
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"]

  // 時間の選択肢
  const timeOptions = [
    "午前 0:00",
    "午前 1:00",
    "午前 2:00",
    "午前 3:00",
    "午前 4:00",
    "午前 5:00",
    "午前 6:00",
    "午前 7:00",
    "午前 8:00",
    "午前 9:00",
    "午前 10:00",
    "午前 11:00",
    "午後 0:00",
    "午後 1:00",
    "午後 2:00",
    "午後 3:00",
    "午後 4:00",
    "午後 5:00",
    "午後 6:00",
    "午後 7:00",
    "午後 8:00",
    "午後 9:00",
    "午後 10:00",
    "午後 11:00",
  ]

  // カレンダーグリッドを生成
  const calendarDays = generateCalendarGrid()

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // ファイル選択ハンドラー
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEventFile(e.target.files[0].name)
    }
  }

  // 動画アップロードモーダルの状態
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false)

  // 動画アップロードモーダルを開く
  const openVideoUploadModal = () => {
    setShowVideoUploadModal(true)
  }

  // 動画アップロードモーダルを閉じる
  const closeVideoUploadModal = () => {
    setShowVideoUploadModal(false)
  }

  // 動画ファイル選択ハンドラー
  const handleVideoFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      // ここでは実際にはサーバーにアップロードせず、ファイル名だけを保存
      const fileName = e.target.files[0].name

      if (isEditMode && editingEventIndex >= 0) {
        // 既存の予定を更新
        const updatedEvents = [...events]
        updatedEvents[editingEventIndex] = {
          ...updatedEvents[editingEventIndex],
          videoFile: fileName,
        }
        setEvents(updatedEvents)
      }

      // モーダルを閉じる
      setShowVideoUploadModal(false)
    }
  }

    // 追加: 動画を登録するAPI呼び出し関数
  async function registerVideo(videoId, assignee) {
    try {
      const res = await fetch(`${BASE_URL}/video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_id: videoId, assignee: assignee }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "動画の登録に失敗しました");
      }

      const data = await res.json();
      console.log("動画登録成功:", data);
      return data;
    } catch (err) {
      console.error("動画登録エラー:", err.message);
    }
  }


  return (
    <div className="flex h-screen w-full overflow-hidden">
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

          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div className="font-bold text-[#020817]">納期進捗管理</div>
            <div className="ml-auto">
              <ChevronRightIcon size={16} />
            </div>
          </div>

          <RouterLink to="/payroll" className="block cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="font-bold text-[#696969]">給与管理</div>
              <div className="ml-auto">
                <ChevronRightIcon size={16} />
              </div>
            </div>
          </RouterLink>

          <RouterLink to="/analytics" className="block cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-400 rounded-full overflow-hidden flex items-center justify-center">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <div className="font-bold text-[#696969]">アナリティクス</div>
              <div className="ml-auto">
                <ChevronRightIcon size={16} />
              </div>
            </div>
          </RouterLink>
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
            <span className="text-primary font-bold text-xl">納期進捗管理</span>
          </div>

          <Button variant="ghost" size="sm" onClick={goToToday} className="ml-4">
            今日
          </Button>

          <div className="ml-2 font-medium">
            {currentYear}年{getMonthName(currentMonth)}
          </div>

          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="前月">
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="次月">
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="ml-2" aria-label="検索">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="追加" onClick={showNewEventForm}>
              <Plus className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full" aria-label="ユーザー">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* カレンダーとイベントフォーム */}
        <div className="flex flex-1 overflow-hidden">
          {/* カレンダー */}
          <div className={cn("flex-1 overflow-auto", showEventForm ? "w-1/4" : "w-full")}>
            <div className="grid grid-cols-7 border-b">
              {weekdays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 text-center font-medium",
                    index === 0 ? "text-red-500" : "",
                    index === 6 ? "text-blue-500" : "",
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const isSunday = index % 7 === 0
                const isSaturday = index % 7 === 6
                const isSelected =
                  day.day === selectedDate.day && day.month === selectedDate.month && day.year === selectedDate.year

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] p-2 border-b border-r cursor-pointer",
                      !day.currentMonth ? "text-gray-400" : "",
                      day.isToday ? "bg-blue-50" : "",
                      isSelected ? "bg-[#E7FDF6]" : "",
                    )}
                    onClick={() => selectDate(day.day, day.month, day.year)}
                    onDoubleClick={() => selectDate(day.day, day.month, day.year, true)}
                  >
                    <div
                      className={cn(
                        "font-medium",
                        isSunday && day.currentMonth ? "text-red-500" : "",
                        isSaturday && day.currentMonth ? "text-blue-500" : "",
                      )}
                    >
                      {day.day}
                    </div>

                    {isSelected && showEventForm && !isEditMode && (
                      <div className="mt-2">
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded text-center">新規追加</div>
                      </div>
                    )}

                    {day.events.map((event, eventIndex) => {
                      // 全イベントの中でのインデックスを計算
                      const globalIndex = events.findIndex(
                        (e) =>
                          e.title === event.title &&
                          e.date === event.date &&
                          e.month === event.month &&
                          e.year === event.year &&
                          e.time === event.time,
                      )

                      // ステータスに基づく背景色を取得
                      const bgColor = getStatusColor(event.status || "未着手")

                      return (
                        <div
                          key={eventIndex}
                          className={cn(
                            "text-white text-xs px-2 py-1 rounded mt-1 cursor-pointer hover:opacity-90",
                            isEditMode && editingEventIndex === globalIndex ? "ring-2 ring-yellow-400" : "",
                          )}
                          style={{ backgroundColor: bgColor }}
                          onClick={(e) => editEvent(e, globalIndex)}
                        >
                          {event.title}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 予定追加/編集フォーム */}
          {showEventForm && (
            <div className="w-1/4 border-l overflow-auto">
              <div className="p-6 space-y-6">
                <div>
                  <Input
                    placeholder="タイトル"
                    className="text-xl font-medium border-none focus-visible:ring-0 px-0"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">納期</div>
                  <div className="text-sm font-medium">
                    {selectedDate.year}年{selectedDate.month + 1}月{selectedDate.day}日(
                    {getDayOfWeek(selectedDate.year, selectedDate.month, selectedDate.day)})
                  </div>
                  <div className="text-sm font-medium cursor-pointer hover:text-primary" onClick={openTimeModal}>
                    {eventTime}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* ユーザー */}
                  <div className="flex items-center gap-4">
                    <UserRound className="w-5 h-5 text-gray-500" />
                    <div className="text-sm">
                      {isEditMode && editingEventIndex >= 0
                        ? `ユーザー: ${events[editingEventIndex].email || "不明"}`
                        : `ユーザー: ${user?.email || "ゲスト"}`}
                    </div>
                  </div>

                  {/* ステータス */}
                  <div className="flex items-center gap-4 group cursor-pointer" onClick={openStatusModal}>
                    <Tag className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                    <div className="text-sm cursor-pointer group-hover:text-primary">{eventStatus}</div>
                    <div className="ml-auto group-hover:text-primary">
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* リマインダー */}
                  <div className="flex items-center gap-4 group cursor-pointer" onClick={openReminderModal}>
                    <Bell className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                    <div className="text-sm cursor-pointer group-hover:text-primary">{eventReminder}</div>
                    <div className="ml-auto group-hover:text-primary">
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* メモ */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={openMemoModal}>
                      <FileText className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                      <div className="text-sm group-hover:text-primary">メモ</div>
                      <div className="ml-auto group-hover:text-primary">
                        <ChevronRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                    {eventMemo && <div className="ml-9 text-xs text-gray-600 line-clamp-2">{eventMemo}</div>}
                    {eventUrl && (
                      <div className="ml-9 text-xs text-blue-500 hover:underline">
                        <a href={eventUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          {eventUrl}
                        </a>
                      </div>
                    )}
                    {eventFile && (
                      <div className="ml-9 text-xs text-blue-500 hover:underline">
                        <a href="#" className="flex items-center">
                          <Paperclip className="w-3 h-3 mr-1" />
                          {eventFile}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 動画アップロード */}
                  <div className="flex items-center gap-4 group cursor-pointer" onClick={openVideoUploadModal}>
                    <UploadCloud className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                    <div className="text-sm group-hover:text-primary">動画アップロード</div>
                    <div className="ml-auto group-hover:text-primary">
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* ステータスログ */}
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <History className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                    <div className="text-sm group-hover:text-primary">ステータスログ</div>
                    <div className="ml-auto group-hover:text-primary">
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="ghost" onClick={closeEventForm}>
                    キャンセル
                  </Button>
                  {isEditMode && (
                    <Button className="bg-[#ECECEE] text-gray-700 hover:bg-gray-200" onClick={deleteEvent}>
                      削除
                    </Button>
                  )}
                  <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={saveEvent}>
                    {isEditMode ? "更新" : "保存"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 時間選択モーダル */}
          {showTimeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-64 max-h-96 overflow-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">時間を選択</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowTimeModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2">
                  {timeOptions.map((time, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => selectTime(time)}
                    >
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ステータス選択モーダル */}
          {showStatusModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-64 max-h-96 overflow-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">ステータスを選択</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowStatusModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2">
                  {statusOptions.map((status, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center"
                      onClick={() => selectStatus(status.name)}
                    >
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                      <span>{status.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* リマインダー選択モーダル */}
          {showReminderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-64 max-h-96 overflow-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">リマインダーを選択</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowReminderModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2">
                  {reminderOptions.map((reminder, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center"
                      onClick={() => selectReminder(reminder)}
                    >
                      <Bell className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{reminder}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* メモ入力モーダル */}
          {showMemoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">メモを入力</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={cancelMemo}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <textarea
                    className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="メモを入力してください..."
                    value={eventMemo}
                    onChange={(e) => setEventMemo(e.target.value)}
                  />

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                      <Input
                        type="url"
                        placeholder="URLを入力"
                        value={eventUrl}
                        onChange={(e) => setEventUrl(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                      <Input type="file" onChange={handleFileChange} className="flex-1" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-4">
                    <Button variant="ghost" onClick={cancelMemo}>
                      キャンセル
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={saveMemo}>
                      保存
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* サイドバーが開いている時のオーバーレイ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 動画アップロードモーダル */}
      {showVideoUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">動画のアップロード</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={closeVideoUploadModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 w-full flex flex-col items-center justify-center mb-6">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <UploadCloud className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-center mb-2">アップロードする動画ファイルをドラッグ＆ドロップします</p>
                <p className="text-center text-sm text-gray-500 mb-6">
                  公開するまで、動画は非公開になります。
                </p>
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
                    ファイルを選択
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoFileSelect}
                  />
                </label>
              </div>

              {/* 新規入力フォームを追加 */}
              <div className="w-full mt-6 space-y-4">
                <Input
                  placeholder="動画IDを入力"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                />
                <Input
                  placeholder="担当者のメールアドレスを入力"
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                />
                <Button
                  className="bg-blue-600 text-white w-full hover:bg-blue-700"
                  onClick={() => registerVideo(videoId, assigneeEmail)}
                >
                  動画を登録
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center w-full mt-8">
                <p>
                  YouTube に動画を公開することにより、YouTube の
                  <a href="#" className="text-blue-500">
                    利用規約
                  </a>
                  と
                  <a href="#" className="text-blue-500">
                    コミュニティ ガイドライン
                  </a>
                  に同意したものとみなされます。
                </p>
                <p className="mt-2">
                  他者の著作権やプライバシー権を侵害しないようにしてください。
                  <a href="#" className="text-blue-500">
                    詳細
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

