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
import StudentEdit from "./pages/students/StudentEdit";
import StudentDetails from "./pages/students/StudentDetails";
import TeacherList from "./pages/teachers/TeacherList";
import TeacherRegistration from "./pages/teachers/TeacherRegistration";
import TeacherEdit from "./pages/teachers/TeacherEdit";
import TeacherDetails from "./pages/teachers/TeacherDetails";
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
import SchoolCalendar from "./pages/settings/SchoolCalendar";
import MonitorSettings from "./pages/settings/MonitorSettings";
import DocumentSettings from "./pages/settings/DocumentSettings";
import NotFound from "./pages/NotFound";

// Attendance Pages
import StudentAttendance from "./pages/attendance/StudentAttendance";
import TeacherAttendance from "./pages/attendance/TeacherAttendance";
import ManualEntry from "./pages/attendance/ManualEntry";

// Fee Pages
import FeeSettings from "./pages/fees/FeeSettings";
import FeeCollection from "./pages/fees/FeeCollection";
import FeeReports from "./pages/fees/FeeReports";

// Inventory Page
import InventoryManagement from "./pages/inventory/InventoryManagement";

// Public Website Pages
import PublicLayout from "./pages/website/PublicLayout";
import WebsiteHome from "./pages/website/Home";
import WebsiteAbout from "./pages/website/About";
import WebsiteAcademics from "./pages/website/Academics";
import WebsiteAdmissions from "./pages/website/Admissions";
import WebsiteNotices from "./pages/website/Notices";
import WebsiteNoticeDetail from "./pages/website/NoticeDetail";
import WebsiteResults from "./pages/website/Results";
import WebsiteAlumni from "./pages/website/Alumni";
import WebsiteContact from "./pages/website/Contact";

// Admin Website CMS Pages
import WebsiteSettingsAdmin from "./pages/website/admin/WebsiteSettings";
import NoticesManager from "./pages/website/admin/NoticesManager";
import ResultsManager from "./pages/website/admin/ResultsManager";
import AlumniManager from "./pages/website/admin/AlumniManager";
import ContactsManager from "./pages/website/admin/ContactsManager";
import HeroSlidesManager from "./pages/website/admin/HeroSlidesManager";
import ParentTestimonialsManager from "./pages/website/admin/ParentTestimonialsManager";
import HomePageManager from "./pages/website/admin/HomePageManager";
import AboutManager from "./pages/website/admin/AboutManager";
import AcademicsManager from "./pages/website/admin/AcademicsManager";
import PopupNoticeManager from "./pages/website/admin/PopupNoticeManager";
import CTAButtonsManager from "./pages/website/admin/CTAButtonsManager";
import NavigationManager from "./pages/website/admin/NavigationManager";
import AdmissionsManager from "./pages/website/admin/AdmissionsManager";

// Help Pages
import Documentation from "./pages/help/Documentation";
import HelpContact from "./pages/help/HelpContact";

// Finance & Accounts Pages
import FinanceControlPanel from "./pages/finance/FinanceControlPanel";
import AdminFinanceDashboard from "./pages/finance/AdminFinanceDashboard";
import AdminFinanceReports from "./pages/finance/AdminFinanceReports";
import AdminFinanceControl from "./pages/finance/AdminFinanceControl";
import AccountsDashboard from "./pages/accounts/AccountsDashboard";

// User Management & Profile
import UserManagement from "./pages/settings/UserManagement";
import CompleteProfile from "./pages/auth/CompleteProfile";

// Optimized QueryClient with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data won't refetch if younger
      gcTime: 30 * 60 * 1000, // 30 minutes - keep unused data in cache
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnMount: true, // Refetch on mount if data is stale (fixes missing data bug)
      refetchOnReconnect: true, // Refetch on reconnect to get fresh data
      retry: 2, // Retry twice on failure
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AcademicYearProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Website at root */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<WebsiteHome />} />
                <Route path="/about" element={<WebsiteAbout />} />
                <Route path="/academics" element={<WebsiteAcademics />} />
                <Route path="/admissions" element={<WebsiteAdmissions />} />
                <Route path="/notices" element={<WebsiteNotices />} />
                <Route path="/notices/:id" element={<WebsiteNoticeDetail />} />
                <Route path="/results" element={<WebsiteResults />} />
                <Route path="/alumni" element={<WebsiteAlumni />} />
                <Route path="/contact" element={<WebsiteContact />} />
              </Route>
              
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={
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
              <Route path="/students/:id/edit" element={
                <ProtectedRoute requireAdmin>
                  <StudentEdit />
                </ProtectedRoute>
              } />
              <Route path="/students/:id" element={
                <ProtectedRoute>
                  <StudentDetails />
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
              <Route path="/teachers/:id/edit" element={
                <ProtectedRoute requireAdmin>
                  <TeacherEdit />
                </ProtectedRoute>
              } />
              <Route path="/teachers/:id" element={
                <ProtectedRoute>
                  <TeacherDetails />
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
              
              {/* Fees */}
              <Route path="/fees/settings" element={
                <ProtectedRoute requireAdmin>
                  <FeeSettings />
                </ProtectedRoute>
              } />
              <Route path="/fees/collection" element={
                <ProtectedRoute requireAdmin>
                  <FeeCollection />
                </ProtectedRoute>
              } />
              <Route path="/fees/reports" element={
                <ProtectedRoute>
                  <FeeReports />
                </ProtectedRoute>
              } />
              
              {/* Inventory */}
              <Route path="/inventory" element={
                <ProtectedRoute requireAdmin>
                  <InventoryManagement />
                </ProtectedRoute>
              } />
              
              {/* Settings */}
              <Route path="/academic-year" element={
                <ProtectedRoute requireAdmin>
                  <AcademicYearPage />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute requireAdmin>
                  <SchoolCalendar />
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
              <Route path="/settings/monitor" element={
                <ProtectedRoute requireAdmin>
                  <MonitorSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/documents" element={
                <ProtectedRoute requireAdmin>
                  <DocumentSettings />
                </ProtectedRoute>
              } />
              <Route path="/settings/users" element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* Website CMS Admin */}
              <Route path="/website/admin/settings" element={
                <ProtectedRoute requireAdmin>
                  <WebsiteSettingsAdmin />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/navigation" element={
                <ProtectedRoute requireAdmin>
                  <NavigationManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/notices" element={
                <ProtectedRoute requireAdmin>
                  <NoticesManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/results" element={
                <ProtectedRoute requireAdmin>
                  <ResultsManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/alumni" element={
                <ProtectedRoute requireAdmin>
                  <AlumniManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/contacts" element={
                <ProtectedRoute requireAdmin>
                  <ContactsManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/hero-slides" element={
                <ProtectedRoute requireAdmin>
                  <HeroSlidesManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/parent-testimonials" element={
                <ProtectedRoute requireAdmin>
                  <ParentTestimonialsManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/home-page" element={
                <ProtectedRoute requireAdmin>
                  <HomePageManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/about" element={
                <ProtectedRoute requireAdmin>
                  <AboutManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/academics" element={
                <ProtectedRoute requireAdmin>
                  <AcademicsManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/popup-notice" element={
                <ProtectedRoute requireAdmin>
                  <PopupNoticeManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/cta-buttons" element={
                <ProtectedRoute requireAdmin>
                  <CTAButtonsManager />
                </ProtectedRoute>
              } />
              <Route path="/website/admin/admissions" element={
                <ProtectedRoute requireAdmin>
                  <AdmissionsManager />
                </ProtectedRoute>
              } />
              
              {/* Finance & Accounts */}
              <Route path="/finance/control-panel" element={
                <ProtectedRoute requireAdmin>
                  <FinanceControlPanel />
                </ProtectedRoute>
              } />
              <Route path="/finance/admin-dashboard" element={
                <ProtectedRoute requireAdmin>
                  <AdminFinanceDashboard />
                </ProtectedRoute>
              } />
              <Route path="/finance/admin-reports" element={
                <ProtectedRoute requireAdmin>
                  <AdminFinanceReports />
                </ProtectedRoute>
              } />
              <Route path="/finance/admin-control" element={
                <ProtectedRoute requireAdmin>
                  <AdminFinanceControl />
                </ProtectedRoute>
              } />
              <Route path="/accounts/dashboard" element={
                <ProtectedRoute>
                  <AccountsDashboard />
                </ProtectedRoute>
              } />

              {/* Help */}
              <Route path="/help/documentation" element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              } />
              <Route path="/help/contact" element={
                <ProtectedRoute>
                  <HelpContact />
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
