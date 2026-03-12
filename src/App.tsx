import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { EventsPage } from '@/pages/Events'
import { EventFormPage } from '@/pages/EventForm'
import { EventDetailPage } from '@/pages/EventDetail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<EventFormPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/:id/edit" element={<EventFormPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
