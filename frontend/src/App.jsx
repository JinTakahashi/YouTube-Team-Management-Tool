import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import CalendarPage from "./pages/CalendarPage"
import PayrollPage from "./pages/PayrollPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminRegisterPage from "./pages/AdminRegisterPage"
import EditorLoginPage from "./pages/EditorLoginPage"
import EditorRegisterPage from "./pages/EditorRegisterPage"
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* 管理者用ログイン/登録ページ */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />

          {/* 編集者用ログイン/登録ページ */}
          <Route path="/editor/login" element={<EditorLoginPage />} />
          <Route path="/editor/register" element={<EditorRegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

