import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FlowrevLayout } from "@/components/flowrev/Layout";
import FlowrevDashboard from "@/pages/flowrev/Dashboard";
import ProductionLine from "@/pages/flowrev/ProductionLine";
import ProductPage from "@/pages/flowrev/ProductPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/flowrev" replace />} />
          <Route path="/flowrev" element={<FlowrevLayout />}>
            <Route index element={<FlowrevDashboard />} />
            <Route path="production" element={<ProductionLine />} />
            <Route path="produto/:slug" element={<ProductPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
