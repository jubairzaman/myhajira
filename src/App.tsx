import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import StudentList from "./pages/students/StudentList";
import StudentRegistration from "./pages/students/StudentRegistration";
import TeacherList from "./pages/teachers/TeacherList";
import TeacherRegistration from "./pages/teachers/TeacherRegistration";
import GateMonitor from "./pages/monitor/GateMonitor";
import OfficeMonitor from "./pages/monitor/OfficeMonitor";
import DeviceManagement from "./pages/devices/DeviceManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard */}
          <Route path="/" element={<Index />} />
          
          {/* Students */}
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<StudentRegistration />} />
          
          {/* Teachers */}
          <Route path="/teachers" element={<TeacherList />} />
          <Route path="/teachers/new" element={<TeacherRegistration />} />
          
          {/* Live Monitors */}
          <Route path="/monitor/gate" element={<GateMonitor />} />
          <Route path="/monitor/office" element={<OfficeMonitor />} />
          
          {/* Devices */}
          <Route path="/devices" element={<DeviceManagement />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
