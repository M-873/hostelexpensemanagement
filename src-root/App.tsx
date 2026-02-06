import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HostelManagement from "./pages/HostelManagement";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Deposit from "./pages/Deposit";
import IndividualBalance from "./pages/IndividualBalance";
import Summary from "./pages/Summary";
import ControlPanel from "./pages/ControlPanel";
import NoticeBoard from "./pages/NoticeBoard";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/hostel-management" element={<HostelManagement />} />
              <Route path="/home" element={<Home />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/individual-balance" element={<IndividualBalance />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/control-panel" element={<ControlPanel />} />
              <Route path="/notice-board" element={<NoticeBoard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
