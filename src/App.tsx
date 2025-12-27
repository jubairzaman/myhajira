import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AcademicYearProvider } from "@/hooks/useAcademicYear";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
import AcademicYearPage from "./pages/settings/AcademicYear";
import ShiftsPage from "./pages/settings/Shifts";
import ClassesPage from "./pages/settings/Classes";
import SectionsPage from "./pages/settings/Sections";
import SmsSettings from "./pages/settings/SmsSettings";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import NotFound from "./pages/NotFound";

// Attendance Pages
import StudentAttendance from "./pages/attendance/StudentAttendance";
import TeacherAttendance from "./pages/attendance/TeacherAttendance";
import ManualEntry from "./pages/attendance/ManualEntry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AcademicYearProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              
              {/* Dashboard */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Students */}
              <Route path="/students" element={
                <ProtectedRoute>
                  <StudentList />
                </ProtectedRoute>
              } />
              <Route path="/students/new" element={
                <ProtectedRoute requireAdmin>
                  <StudentRegistration />
                </ProtectedRoute>
              } />
              
              {/* Teachers */}
              <Route path="/teachers" element={
                <ProtectedRoute>
                  <TeacherList />
                </ProtectedRoute>
              } />
              <Route path="/teachers/new" element={
                <ProtectedRoute requireAdmin>
                  <TeacherRegistration />
                </ProtectedRoute>
              } />

              {/* Attendance */}
              <Route path="/attendance/students" element={
                <ProtectedRoute>
                  <StudentAttendance />
                </ProtectedRoute>
              } />
              <Route path="/attendance/teachers" element={
                <ProtectedRoute>
                  <TeacherAttendance />
                </ProtectedRoute>
              } />
              <Route path="/attendance/manual" element={
                <ProtectedRoute requireAdmin>
                  <ManualEntry />
                </ProtectedRoute>
              } />
              
              {/* Live Monitors */}
              <Route path="/monitor/gate" element={<GateMonitor />} />
              <Route path="/monitor/office" element={<OfficeMonitor />} />
              
              {/* Devices */}
              <Route path="/devices" element={
                <ProtectedRoute requireAdmin>
                  <DeviceManagement />
                </ProtectedRoute>
              } />
              
              {/* Settings */}
              <Route path="/academic-year" element={
                <ProtectedRoute requireAdmin>
                  <AcademicYearPage />
                </ProtectedRoute>
              } />
              <Route path="/shifts" element={
                <ProtectedRoute requireAdmin>
                  <ShiftsPage />
                </ProtectedRoute>
              } />
              <Route path="/classes" element={
                <ProtectedRoute requireAdmin>
                  <ClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/sections" element={
                <ProtectedRoute requireAdmin>
                  <SectionsPage />
                </ProtectedRoute>
              } />
              <Route path="/sms" element={
                <ProtectedRoute requireAdmin>
                  <SmsSettings />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute requireAdmin>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AcademicYearProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
