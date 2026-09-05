import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ClientsPage } from '../pages/ClientsPage'
import { CompliancePage } from '../pages/CompliancePage'
import { FilingPage } from '../pages/FilingPage'
import { DocumentsPage } from '../pages/DocumentsPage'
import { TasksPage } from '../pages/TasksPage'
import { BillingPage } from '../pages/BillingPage'
import { CommunicationsPage } from '../pages/CommunicationsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Application Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:clientId" element={<ClientsPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="compliance/:complianceId" element={<CompliancePage />} />
        <Route path="filing" element={<FilingPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="communications" element={<CommunicationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
