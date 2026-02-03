import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSubdomainDetection, applyWhiteLabelConfig } from "@/hooks/useSubdomainDetection";
import { useEffect } from "react";

// Pages
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Tasks from "./pages/Tasks";
import Disputes from "./pages/Disputes";
import AIEngine from "./pages/AIEngine";
import DisputeLetters from "./pages/DisputeLetters";
import ScoreSimulator from "./pages/ScoreSimulator";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import Billing from "./pages/Billing";
import Agency from "./pages/Agency";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AIAutomation from "./pages/AIAutomation";
import RoundManager from "./pages/RoundManager";
import OutcomeTracker from "./pages/OutcomeTracker";
import WhiteLabel from "./pages/WhiteLabel";
import ResetPassword from "./pages/ResetPassword";

// Role-specific pages
import ClientDashboard from "./pages/ClientDashboard";
import VADashboard from "./pages/VADashboard";
import SmartCreditConnect from "./pages/SmartCreditConnect";

// Client pages
import ClientScores from "./pages/client/ClientScores";
import ClientDisputes from "./pages/client/ClientDisputes";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientMessages from "./pages/client/ClientMessages";
import ClientBilling from "./pages/client/ClientBilling";
import ClientNotifications from "./pages/client/ClientNotifications";
import ClientProfile from "./pages/client/ClientProfile";
import ClientAITools from "./pages/client/ClientAITools";

// VA pages
import VAClients from "./pages/va/VAClients";
import VATasks from "./pages/va/VATasks";
import VADisputes from "./pages/va/VADisputes";
import VADocuments from "./pages/va/VADocuments";
import VATraining from "./pages/va/VATraining";
import VAMessages from "./pages/va/VAMessages";
import VASettings from "./pages/va/VASettings";

const queryClient = new QueryClient();

// Router component that handles role-based redirects
function AppRouter() {
  const { user, role, loading } = useAuth();
  const { isWhiteLabeled, subdomain, config, isLoading: subdomainLoading } = useSubdomainDetection();

  // Apply white label config when detected
  useEffect(() => {
    if (isWhiteLabeled && config) {
      console.log('Applying white label config for subdomain:', subdomain);
      applyWhiteLabelConfig(config);
      
      // Show a subtle notification that white-label is active
      console.log(`🎨 White-label branding active for: ${config.company_name}`);
    }
  }, [isWhiteLabeled, config, subdomain]);

  if (loading || subdomainLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine default route based on role
  const getDefaultRoute = () => {
    if (!user) return '/';
    switch (role) {
      case 'client':
        return '/client-dashboard';
      case 'va_staff':
        return '/va-dashboard';
      case 'agency_owner':
      default:
        return '/dashboard';
    }
  };

  return (
    <Routes>
      {/* Public Landing Page - redirect to auth if white-labeled */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to={getDefaultRoute()} replace /> : 
          (isWhiteLabeled ? <Navigate to="/auth" replace /> : <Landing />)
        } 
      />

      {/* Auth */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <Auth />} 
      />

      {/* Public AI Automation Page */}
      <Route path="/ai-automation" element={<AIAutomation />} />
      
      {/* Password Reset */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Agency Owner Routes (Full Access) */}
      <Route path="/dashboard" element={
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
      <Route path="/dispute-letters" element={
        <ProtectedRoute allowedRoles={['agency_owner', 'va_staff']}>
          <DisputeLetters />
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
      <Route path="/round-manager" element={
        <ProtectedRoute allowedRoles={['agency_owner', 'va_staff']}>
          <RoundManager />
        </ProtectedRoute>
      } />
      <Route path="/outcome-tracker" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <OutcomeTracker />
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
      <Route path="/white-label" element={
        <ProtectedRoute allowedRoles={['agency_owner']}>
          <WhiteLabel />
        </ProtectedRoute>
      } />

      {/* Client Routes */}
      <Route path="/client-dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client-dashboard/scores" element={<ProtectedRoute allowedRoles={['client']}><ClientScores /></ProtectedRoute>} />
      <Route path="/client-dashboard/disputes" element={<ProtectedRoute allowedRoles={['client']}><ClientDisputes /></ProtectedRoute>} />
      <Route path="/client-dashboard/ai-tools" element={<ProtectedRoute allowedRoles={['client']}><ClientAITools /></ProtectedRoute>} />
      <Route path="/client-dashboard/documents" element={<ProtectedRoute allowedRoles={['client']}><ClientDocuments /></ProtectedRoute>} />
      <Route path="/client-dashboard/smartcredit" element={<ProtectedRoute allowedRoles={['client']}><SmartCreditConnect /></ProtectedRoute>} />
      <Route path="/client-dashboard/messages" element={<ProtectedRoute allowedRoles={['client']}><ClientMessages /></ProtectedRoute>} />
      <Route path="/client-dashboard/billing" element={<ProtectedRoute allowedRoles={['client']}><ClientBilling /></ProtectedRoute>} />
      <Route path="/client-dashboard/notifications" element={<ProtectedRoute allowedRoles={['client']}><ClientNotifications /></ProtectedRoute>} />
      <Route path="/client-dashboard/profile" element={<ProtectedRoute allowedRoles={['client']}><ClientProfile /></ProtectedRoute>} />

      {/* VA Routes */}
      <Route path="/va-dashboard" element={<ProtectedRoute allowedRoles={['va_staff']}><VADashboard /></ProtectedRoute>} />
      <Route path="/va-dashboard/clients" element={<ProtectedRoute allowedRoles={['va_staff']}><VAClients /></ProtectedRoute>} />
      <Route path="/va-dashboard/clients/:id" element={<ProtectedRoute allowedRoles={['va_staff']}><VAClients /></ProtectedRoute>} />
      <Route path="/va-dashboard/tasks" element={<ProtectedRoute allowedRoles={['va_staff']}><VATasks /></ProtectedRoute>} />
      <Route path="/va-dashboard/disputes" element={<ProtectedRoute allowedRoles={['va_staff']}><VADisputes /></ProtectedRoute>} />
      <Route path="/va-dashboard/documents" element={<ProtectedRoute allowedRoles={['va_staff']}><VADocuments /></ProtectedRoute>} />
      <Route path="/va-dashboard/training" element={<ProtectedRoute allowedRoles={['va_staff']}><VATraining /></ProtectedRoute>} />
      <Route path="/va-dashboard/messages" element={<ProtectedRoute allowedRoles={['va_staff']}><VAMessages /></ProtectedRoute>} />
      <Route path="/va-dashboard/settings" element={<ProtectedRoute allowedRoles={['va_staff']}><VASettings /></ProtectedRoute>} />
      <Route path="/va-dashboard/smartcredit/:clientId" element={<ProtectedRoute allowedRoles={['va_staff']}><SmartCreditConnect /></ProtectedRoute>} />

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
      <BrandProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </BrandProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
