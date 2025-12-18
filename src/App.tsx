import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FlowrevLayout } from "@/components/flowrev/Layout";
import FlowrevDashboard from "@/pages/flowrev/Dashboard";
import ProductionLine from "@/pages/flowrev/ProductionLine";
import ProductPage from "@/pages/flowrev/ProductPage";
import CalendarPage from "@/pages/flowrev/CalendarPage";
import NotFound from "./pages/NotFound";
import LoginPage from "@/pages/flowrev/LoginPage";
import { ProtectedRoute } from "@/components/flowrev/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/flowrev" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected FlowRev Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/flowrev" element={<FlowrevLayout />}>
              <Route index element={<FlowrevDashboard />} />
              <Route path="production" element={<ProductionLine />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="produto/:slug" element={<ProductPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
