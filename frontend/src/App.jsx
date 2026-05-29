import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminLogin from './pages/AdminLogin';

// Admin routes are loaded lazily so they don't ship to public visitors.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminFaculty   = lazy(() => import('./pages/AdminFaculty'));
const AdminStudents  = lazy(() => import('./pages/AdminStudents'));
const AdminUsers       = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings    = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPages       = lazy(() => import('./pages/admin/AdminPages'));
const AdminMedia       = lazy(() => import('./pages/admin/AdminMedia'));
const AdminDepartments = lazy(() => import('./pages/admin/AdminDepartments'));
const AdminPlacements  = lazy(() => import('./pages/admin/AdminPlacements'));
const AdminResearch    = lazy(() => import('./pages/admin/AdminResearch'));
const AdminEvents      = lazy(() => import('./pages/admin/AdminEvents'));
const AdminGallery     = lazy(() => import('./pages/admin/AdminGallery'));
const AdminLeads       = lazy(() => import('./pages/admin/AdminLeads'));
const AdminCompliance  = lazy(() => import('./pages/admin/AdminCompliance'));
const ChangePassword   = lazy(() => import('./pages/admin/ChangePassword'));

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#020617] text-xs uppercase tracking-widest text-gray-400">
      Loading admin…
    </div>
  );
}
import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Placements from "./components/Placements";
import CampusLife from "./components/CampusLife";
import Departments from "./components/Departments";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import WhyITM from "./components/WhyITM";
import RecruiterMarquee from "./components/RecruiterMarquee";
import AdmissionCTA from "./components/AdmissionCTA";
import DirectorVision from "./components/DirectorVision";
import Distinctiveness from "./components/Distinctiveness";
import CSDepartment from './pages/CSDepartment';
import ECDepartment from './pages/ECDepartment';
import ITDepartment from './pages/ITDepartment';
import CEDepartment from './pages/CEDepartment';
import MEDepartment from './pages/MEDepartment';
import MBADepartment from './pages/MBADepartment';
import ESHDepartment from './pages/ESHDepartment';
import TapPage from './pages/TapPage';
import PACPage from './pages/PACPage';
import DynamicDepartmentPage from './pages/DynamicDepartmentPage';
import CentralLibrary from './pages/CentralLibrary';
import EmergingBranches from './pages/EmergingBranches';
import DepartmentPage from './pages/DepartmentPage';
import AIMLPage from './pages/AIMLPage';
import CloudComputingPage from './pages/CloudComputingPage';
import CyberSecurityPage from './pages/CyberSecurityPage';
import FloatingSidebar from "./components/FloatingSidebar";
import ScrollToTop from "./components/ScrollToTop";
import ClubsCells from "./components/ClubsCells";
import AdminPACEventForm from "./components/AdminPACEventForm";
import AdminEventForm from "./components/AdminEventForm";
import Admissions from "./pages/Admissions";
import UGCourses from "./pages/UGCourses";
import PGCourses from "./pages/PGCourses";
import SeekAdmission from "./pages/SeekAdmission";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import Research from "./pages/Research";
import ResearchRDCell from "./pages/ResearchRDCell";
import ResearchInnovation from "./pages/ResearchInnovation";
import ResearchJournal from "./pages/ResearchJournal";
import ResearchConference from "./pages/ResearchConference";
import ResearchFDP from "./pages/ResearchFDP";
import {
  CellsAndCommittees,
  UpcomingEvents,
  QuickLinks,
  AlumniSection,
  GalleryPreview,
  ContactSection,
} from "./components/HomeExtras";
import {
  AboutInstitutePage, MissionVisionPage, OfficialsPage, BoardOfGovernorsPage,
  DirectorMessagePage, ProgrammesPage, InfrastructurePage, BestPracticesPage,
  MagazinePage, PoliciesPage, DistinctivenessPageRoute, GwaliorPage,
} from "./pages/AboutPages";
import {
  NSSPage, UBAPage, WECPage, SportsPage, IQACPage, AntiRaggingPage, OtherClubsPage,
} from "./pages/CellsPages";
import {
  AlumniSpeaksPage, MentorshipPage, MembershipPage, ChaptersPage,
} from "./pages/AlumniPages";
import {
  NAACPolicyPage, CommitteesPage, MOUsPage, AppreciationPage, NIRFPage,
  CareersPage, JRFPage,
} from "./pages/CompliancePages";
import {
  GalleryHubPage, CulturalGalleryPage, ExpertsGalleryPage, InfraGalleryPage,
  SportsGalleryPage, StudentsGalleryPage, LifeAtITMPage, VideoGalleryPage,
} from "./pages/GalleryPages";
import ContactPage from "./pages/ContactPage";
import OpenPositionsPage from "./pages/OpenPositionsPage";
import { ChatbotWidget } from "./components/AIChatbot";

function RouteShell({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className={isHome ? '' : 'pt-[88px] md:pt-[140px]'}>
      {children}
    </div>
  );
}

function ProtectedRoute({ children, allowPasswordChange = false }) {
  const { isAdmin, user } = useAuth();
  if (!isAdmin) return <Navigate to="/login" replace />;
  if (user?.must_change_password && !allowPasswordChange) {
    return <Navigate to="/account/change-password" replace />;
  }
  return <Suspense fallback={<AdminFallback />}>{children}</Suspense>;
}

function StudentRoute({ children }) {
  const { isStudent } = useAuth();
  return isStudent ? children : <Navigate to="/login" replace />;
}

function FacultyRoute({ children }) {
  const { isFaculty } = useAuth();
  return isFaculty ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <Router>
      <ScrollToTop />
      <div className="bg-white dark:bg-[#020617] min-h-screen transition-colors duration-500">
        <Header />

        <FloatingSidebar />

        <RouteShell>
          <Routes>
            {/* HOME PAGE ROUTE */}
            <Route path="/" element={
              <>
                <Hero />
                <Stats />
                <DirectorVision />
                <WhyITM />
                <section id="schools"><Departments /></section>
                <Distinctiveness />
                <RecruiterMarquee />
                <CampusLife />
                <section id="clubs"><ClubsCells /></section>
                <section id="cells"><CellsAndCommittees /></section>
                <Placements />
                <section id="events"><UpcomingEvents /></section>
                <Testimonials />
                <section id="alumni"><AlumniSection /></section>
                <section id="gallery"><GalleryPreview /></section>
                <QuickLinks />
                <AdmissionCTA />
                <section id="contact"><ContactSection /></section>
              </>
            } />

            {/* DYNAMIC DEPARTMENT & BRANCH ROUTES */}
            <Route path="/department/:deptId" element={<DynamicDepartmentPage />} />
            <Route path="/department/:deptId/:branchId" element={<DynamicDepartmentPage />} />

            {/* DIRECT DEPARTMENT ROUTES */}
            <Route path="/cs" element={<CSDepartment />} />
            <Route path="/it" element={<ITDepartment />} />
            <Route path="/ece" element={<ECDepartment />} />
            <Route path="/ce" element={<CEDepartment />} />
            <Route path="/me" element={<MEDepartment />} />
            <Route path="/mba" element={<MBADepartment />} />
            <Route path="/esh" element={<ESHDepartment />} />

            {/* EMERGING BRANCH ROUTES */}
            <Route path="/aiml" element={<AIMLPage />} />
            <Route path="/cyber-security" element={<CyberSecurityPage />} />
            <Route path="/cloud-computing" element={<CloudComputingPage />} />

            {/* DYNAMIC DEPARTMENT DEEP DIVE ROUTES */}
            <Route path="/department/cse/aiml" element={<AIMLPage />} />
            <Route path="/department/cse/cyber-security" element={<CyberSecurityPage />} />
            <Route path="/department/cse/cloud-computing" element={<CloudComputingPage />} />

            {/* LEGACY REDIRECTS for old deep-link consistency */}
            <Route path="/department/cse" element={<Navigate to="/cs" replace />} />
            <Route path="/department/it" element={<Navigate to="/it" replace />} />
            <Route path="/department/ece" element={<Navigate to="/ece" replace />} />
            <Route path="/department/civil" element={<Navigate to="/ce" replace />} />

            {/* ADMISSION ROUTES */}
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/admissions/ug" element={<UGCourses />} />
            <Route path="/admissions/pg" element={<PGCourses />} />
            <Route path="/admissions/how-to-apply" element={<SeekAdmission />} />

            {/* RESEARCH */}
            <Route path="/research" element={<Research />} />
            <Route path="/research/rd-cell" element={<ResearchRDCell />} />
            <Route path="/research/innovation-ecosystem" element={<ResearchInnovation />} />
            <Route path="/research/journal" element={<ResearchJournal />} />
            <Route path="/research/conference" element={<ResearchConference />} />
            <Route path="/research/fdp" element={<ResearchFDP />} />

            {/* CLUBS ROUTES */}
            <Route path="/pac" element={<PACPage />} />
            <Route path="/uba" element={<UBAPage />} />
            <Route path="/nss" element={<NSSPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/wec" element={<WECPage />} />

            {/* ONBOARDING */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* OTHER PAGE ROUTES */}
            <Route path="/tap" element={<TapPage />} />
            <Route path="/library" element={<CentralLibrary />} />
            <Route path="/central-library" element={<CentralLibrary />} />
            <Route path="/emerging-branches" element={<EmergingBranches />} />
            {/* AUTH & ROLE ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
            <Route path="/faculty/dashboard" element={<FacultyRoute><FacultyDashboard /></FacultyRoute>} />

            {/* ADMIN ROUTES */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/faculty" element={<ProtectedRoute><AdminFaculty /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/pages" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute><AdminMedia /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute><AdminDepartments /></ProtectedRoute>} />
            <Route path="/admin/placements-cell" element={<ProtectedRoute><AdminPlacements /></ProtectedRoute>} />
            <Route path="/admin/research" element={<ProtectedRoute><AdminResearch /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute><AdminGallery /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
            <Route path="/admin/compliance" element={<ProtectedRoute><AdminCompliance /></ProtectedRoute>} />
            <Route path="/account/change-password" element={<ProtectedRoute allowPasswordChange><ChangePassword /></ProtectedRoute>} />
            <Route path="/admin/pac" element={<ProtectedRoute><AdminPACEventForm /></ProtectedRoute>} />
            <Route path="/admin/tap" element={<ProtectedRoute><AdminEventForm /></ProtectedRoute>} />
            <Route path="/admin/placements" element={<ProtectedRoute><AdminPACEventForm /></ProtectedRoute>} />
            <Route path="/department" element={<DepartmentPage />} />

            {/* ABOUT (12 routes) */}
            <Route path="/about" element={<AboutInstitutePage />} />
            <Route path="/about/mission-vision" element={<MissionVisionPage />} />
            <Route path="/about/officials" element={<OfficialsPage />} />
            <Route path="/about/board-of-governors" element={<BoardOfGovernorsPage />} />
            <Route path="/about/director-message" element={<DirectorMessagePage />} />
            <Route path="/about/programmes" element={<ProgrammesPage />} />
            <Route path="/about/infrastructure" element={<InfrastructurePage />} />
            <Route path="/about/best-practices" element={<BestPracticesPage />} />
            <Route path="/about/distinctiveness" element={<DistinctivenessPageRoute />} />
            <Route path="/about/magazine" element={<MagazinePage />} />
            <Route path="/about/policies" element={<PoliciesPage />} />
            <Route path="/about/gwalior" element={<GwaliorPage />} />

            {/* CELLS (7 routes) */}
            <Route path="/cells/nss" element={<NSSPage />} />
            <Route path="/cells/uba" element={<UBAPage />} />
            <Route path="/cells/wec" element={<WECPage />} />
            <Route path="/cells/sports" element={<SportsPage />} />
            <Route path="/iqac" element={<IQACPage />} />
            <Route path="/anti-ragging" element={<AntiRaggingPage />} />
            <Route path="/clubs" element={<OtherClubsPage />} />

            {/* ALUMNI (4 routes) */}
            <Route path="/alumni/speaks" element={<AlumniSpeaksPage />} />
            <Route path="/alumni/mentorship" element={<MentorshipPage />} />
            <Route path="/alumni/membership" element={<MembershipPage />} />
            <Route path="/alumni/chapters" element={<ChaptersPage />} />

            {/* COMPLIANCE (7 routes) */}
            <Route path="/naac" element={<NAACPolicyPage />} />
            <Route path="/committees" element={<CommitteesPage />} />
            <Route path="/mous" element={<MOUsPage />} />
            <Route path="/appreciation" element={<AppreciationPage />} />
            <Route path="/nirf" element={<NIRFPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/open-positions" element={<OpenPositionsPage />} />
            <Route path="/careers/open-positions/:positionId" element={<OpenPositionsPage />} />
            <Route path="/jrf" element={<JRFPage />} />

            {/* GALLERY (8 routes) */}
            <Route path="/gallery" element={<GalleryHubPage />} />
            <Route path="/gallery/cultural" element={<CulturalGalleryPage />} />
            <Route path="/gallery/experts" element={<ExpertsGalleryPage />} />
            <Route path="/gallery/infrastructure" element={<InfraGalleryPage />} />
            <Route path="/gallery/sports" element={<SportsGalleryPage />} />
            <Route path="/gallery/students" element={<StudentsGalleryPage />} />
            <Route path="/gallery/life" element={<LifeAtITMPage />} />
            <Route path="/gallery/videos" element={<VideoGalleryPage />} />

            {/* CONTACT */}
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </RouteShell>

        {/* Global Footer — appears on every page */}
        <section id="footer"><Footer /></section>

        {/* AI Chatbot — floating in bottom-right corner on every page */}
        <ChatbotWidget />
      </div>
    </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
