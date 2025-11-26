import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Removed Box, Flex from here as layouts handle them
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompareProvider, useCompare } from './context/compareContext'; 

// Layouts
import UserLayout from './components/layout/UserLayout'; // Import UserLayout
import AdminLayout from './components/layout/AdminLayout'; // Import AdminLayout

// User Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import PropertiesPage from './pages/PropertiesPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Project3DViewPage from './pages/user/Project3DViewPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import VisitRequestsPage from './pages/VisitRequestForm';
import ComparePropertiesPage  from './pages/ComparePropertiesPage';
import Auctions  from './pages/AuctionsPage';
import ContactPage from './pages/ContactPage'; 
import FutureProjectsListPage from './pages/user/FutureProjectsListPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 
import ProjectUnitsPage from './pages/user/ProjectUnitsPage';
import PreRegistrationForm from './pages/user/PreRegistrationForm';
import InquiryForm from './pages/user/InquiryForm';


// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import FutureApartmentAdminPage from './pages/admin/FutureProjectAdminPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage'; 
import AdminVisitRequestsPage from './pages/admin/AdminVisitRequestsPage'; 
import AdminUsersPage from './pages/admin/AdminUsersPage'; 
import AddPropertyPage from './pages/admin/AddPropertyPage';
import AdminAuctionsPage from './pages/admin/AdminAuctionsPage';
import EditAuctionPage from './pages/admin/EditAuctionPage';
import CompareDrawer from './components/CompareDrawer';
import EditPropertyPage from './pages/admin/EditPropertyPage';
import ApartmentUnitsList from './pages/admin/ApartmentUnitsList';
import ApartmentUnitsForm from './pages/admin/ApartmentUnitForm'; 
import FutureProjectDetailsPage from './pages/admin/FutureProjectDetailsPage';


function PublicRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();
    if (loading) return <div>Verifying session...</div>;
    if (isAuthenticated) {
        // Redirect to appropriate dashboard based on role
        const redirectTo = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'; // or '/'
        return <Navigate to={redirectTo} replace />;
    }
    return children;
}

function AppRoutesWithDrawer() {
    const location = useLocation();
    useCompare();
    const showCompareDrawer = location.pathname !== '/compare';
    return (
        <>
            {showCompareDrawer && <CompareDrawer />}
            <Routes>
                {/* Routes using UserLayout (Public and standard user authenticated routes) */}
                <Route element={<UserLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/properties" element={<PropertiesPage />} />
                    <Route path="/properties/:propertyId" element={<PropertyDetailsPage />} />
                    <Route path="/user/future-projects" element={<FutureProjectsListPage />} />  
                    <Route path="/future-projects/:projectId/view-3d" element={<Project3DViewPage />} />
                    <Route path="/future-projects/:projectId/units" element={<ProjectUnitsPage />} />
                    <Route path="/user/future-projects/:projectId/preregistration" element={<PreRegistrationForm/>} />
                    <Route path="/user/future-projects/:projectId/inquiry" element={<InquiryForm />} />
                    <Route path="/visit-requests" element={<VisitRequestsPage />} />
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    <Route path="/compare" element={<ComparePropertiesPage />} />
                    <Route path="/auctions" element={<Auctions />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Example: Generic User Dashboard (if you have one) */}
                    <Route element={<ProtectedRoute />}> {/* No adminOnly, for any authenticated user */}
                        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <UserDashboard />
                          </ProtectedRoute>
                        } />
                    </Route>
                </Route>

                {/* Routes using AdminLayout (Protected Admin Routes) */}
                <Route element={<ProtectedRoute adminOnly={true} />}> {/* Outer protection */}
                    <Route element={<AdminLayout />}> {/* Nested layout for admin section */}
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/properties" element={<AdminPropertiesPage />} />
                        <Route path="/admin/properties/add" element={<AddPropertyPage />} />
                        <Route path="/admin/future-project" element={<FutureApartmentAdminPage />} />
                        <Route path="/admin/visit-requests" element={<AdminVisitRequestsPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} /> 
                        <Route path="/admin/auctions" element={<AdminAuctionsPage />} />
                        <Route path="/admin/auctions/edit/:id" element={<EditAuctionPage />} />
                        <Route path="/admin/properties/edit/:id" element={<EditPropertyPage />} />
                        <Route path="/admin/apartment-units" element={<ApartmentUnitsList />} />
                        <Route path="/admin/apartment-units/add" element={<ApartmentUnitsForm />} />
                        <Route path="/admin/apartment-units/edit/:unitId" element={<ApartmentUnitsForm />} />
                        <Route path="/admin/future-projects/:projectId" element={<FutureProjectDetailsPage />} />
                        {/* Add other admin routes here:
                            <Route path="/admin/properties" element={<AdminPropertiesManagementPage />} />
                        */}
                    </Route>
                </Route>

                {/* Fallback for unknown routes - could be a 404 page within UserLayout */}
                <Route element={<UserLayout />}> {/* So 404 page also gets navbar */}
                    <Route path="*" element={<Navigate to="/" replace />} /> {/* Or your 404 component */}
                </Route>
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <CompareProvider>
                <Router>
                    <AppRoutesWithDrawer />
                </Router>
            </CompareProvider>
        </AuthProvider>
    );
}

export default App;
