import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './locales/i18n';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

import { Home } from './components/Home';
import BookingSuccess from './components/BookingTicketUser/BookingSuccess';
import LoginPage from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import MemberListPage from './pages/UserProfileAdmin/MemberListPage';
import MoviesAdminPage from './pages/MovieManagement/MoviesAdminPage'
import TheaterAdminPage from './pages/TheaterManagement/TheaterAdminPage';
import EmployeeAdminPage from './pages/EmployeeManagement/EmployeeAdminPage';
import PromotionManagementPage from './pages/PromotionManagement/PromotionManagementPage';
import TicketList from './components/TicketManagement';
import ShowtimesAdminPage from './pages/ScheduleManagement/ShowtimesAdminPage';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import { RouteConst } from './constants/RouteConst';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#d91c0f',
          colorPrimaryHover: '#b91c1c',
          borderRadius: 8,
        },
      }}
    >
      <I18nextProvider i18n={i18n}>
        <Suspense fallback="Loading...">
          <BrowserRouter>
            <Routes>
              <Route path={RouteConst.HOME} element={<Home />} />
              <Route path={RouteConst.LOGIN} element={<LoginPage />} />
              <Route path={RouteConst.REGISTER} element={<RegisterPage />} />

              {/* Admin routes */}
              <Route path={RouteConst.ADMIN.ROOT} element={<AdminDashboard />}>
                <Route path={RouteConst.ADMIN.USERS.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<MemberListPage />} />
                <Route path={RouteConst.ADMIN.MOVIES.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<MoviesAdminPage />} />
                <Route path={RouteConst.ADMIN.THEATERS.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<TheaterAdminPage />} />
                <Route path={RouteConst.ADMIN.EMPLOYEES.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<EmployeeAdminPage />} />
                <Route path={RouteConst.ADMIN.PROMOTIONS.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<PromotionManagementPage />} />
                <Route path={RouteConst.ADMIN.TICKETS.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<TicketList />} />
                <Route path={RouteConst.ADMIN.SHOWTIMES.replace(`${RouteConst.ADMIN.ROOT}/`, '')} element={<ShowtimesAdminPage />} />
              </Route>

              <Route path={RouteConst.BOOKING_SUCCESS} element={<BookingSuccess />} />
              <Route path={RouteConst.EMPLOYEE} element={<EmployeeDashboard />} />
              <Route
                path={RouteConst.FORGOT_PASSWORD}
                element={<ForgotPasswordForm onClose={() => window.history.back()} />}
              />
              <Route path="*" element={<Navigate to={RouteConst.HOME} replace />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </I18nextProvider>
    </ConfigProvider>
  );
}

export default App;