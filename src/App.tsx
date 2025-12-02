import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Tasks from "./pages/Tasks";
import Disputes from "./pages/Disputes";
import AIEngine from "./pages/AIEngine";
import ScoreSimulator from "./pages/ScoreSimulator";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import Billing from "./pages/Billing";
import Agency from "./pages/Agency";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Role-specific pages
import ClientDashboard from "./pages/ClientDashboard";
import VADashboard from "./pages/VADashboard";
import SmartCreditConnect from "./pages/SmartCreditConnect";

const queryClient = new QueryClient();

// Router component that handles role-based redirects
function AppRouter() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine default route based on role
  const getDefaultRoute = () => {
    if (!user) return '/auth';
    switch (role) {
      case 'client':
        return '/client-dashboard';
      case 'va_staff':
        return '/va-dashboard';
      case 'agency_owner':
      default:
        return '/';
    }
  };

  return (
    <Routes>
      {/* Auth */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <Auth />} 
      />

      {/* Agency Owner Routes (Full Access) */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Clients />
        </ProtectedRoute>
      } />
      <Route path="/clients/:id" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <ClientDetail />
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Tasks />
        </ProtectedRoute>
      } />
      <Route path="/disputes" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Disputes />
        </ProtectedRoute>
      } />
      <Route path="/ai-engine" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <AIEngine />
        </ProtectedRoute>
      } />
      <Route path="/simulator" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <ScoreSimulator />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Billing />
        </ProtectedRoute>
      } />
      <Route path="/agency" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Agency />
        </ProtectedRoute>
      } />
      <Route path="/compliance" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <Compliance />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      {/* Client Routes */}
      <Route path="/client-dashboard" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/scores" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/disputes" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/documents" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/smartcredit" element={
        <ProtectedRoute allowedRoles={['client']}>
          <SmartCreditConnect />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/messages" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/billing" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/notifications" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client-dashboard/profile" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />

      {/* VA Routes */}
      <Route path="/va-dashboard" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/clients" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/clients/:id" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/tasks" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/disputes" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/documents" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/training" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/messages" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/settings" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <VADashboard />
        </ProtectedRoute>
      } />
      <Route path="/va-dashboard/smartcredit/:clientId" element={
        <ProtectedRoute allowedRoles={['va_staff']}>
          <SmartCreditConnect />
        </ProtectedRoute>
      } />

      {/* Agency Owner SmartCredit Management */}
      <Route path="/smartcredit" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <SmartCreditConnect />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
