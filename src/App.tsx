import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/toast-container";
import { ToastProgressBar } from "@/components/ui/toast-progress-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TicketProvider } from "@/contexts/TicketContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetForm from "./pages/AssetForm";
import AssetDetails from "./pages/AssetDetails";
import Licenses from "./pages/Licenses";
import LicenseForm from "./pages/LicenseForm";
import Maintenance from "./pages/Maintenance";
import MaintenanceForm from "./pages/MaintenanceForm";
import Tickets from "./pages/Tickets";
import TicketForm from "./pages/TicketForm";
import TicketDetails from "./pages/TicketDetails";
import TicketsDashboard from "./pages/TicketsDashboard";
import Settings from "./pages/Settings";
import TicketSuppliers from "./pages/TicketSuppliers";
import Categories from "./pages/Categories";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/assets/new" element={<AssetForm />} />
                <Route path="/assets/:id" element={<AssetDetails />} />
                <Route path="/assets/:id/edit" element={<AssetForm />} />
                <Route path="/licenses" element={<Licenses />} />
                <Route path="/licenses/new" element={<LicenseForm />} />
                <Route path="/licenses/:id/edit" element={<LicenseForm />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/maintenance/new" element={<MaintenanceForm />} />
                <Route path="/maintenance/:id/edit" element={<MaintenanceForm />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/tickets/new" element={<TicketForm />} />
                <Route path="/tickets/:id" element={<TicketDetails />} />
                <Route path="/tickets/:id/edit" element={<TicketForm />} />
                <Route path="/tickets/dashboard" element={<TicketsDashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/suppliers" element={<TicketSuppliers />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <TicketProvider>
            <ToastProvider>
              {/* Sistema de Toast: Card no canto + Barra de progresso no header */}
              <ToastProgressBar />
              <ToastContainer />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ToastProvider>
          </TicketProvider>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;