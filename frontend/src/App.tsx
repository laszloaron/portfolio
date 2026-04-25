import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ContactPage from '@/pages/ContactPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import ProjectFormPage from '@/pages/ProjectFormPage'
import ChatWidget from '@/components/chat/ChatWidget'
import { useAuthStore } from '@/store/useAuthStore'

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/edit/:id" element={<ProjectFormPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </>
  )
}
