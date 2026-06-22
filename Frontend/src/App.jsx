import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from "./components/MainLayout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import RequireRole from "./components/RequireRole/RequireRole";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tickets from "./pages/Tickets/Tickets";
import Reports from "./pages/Reports/Reports";
import Users from "./pages/Users/Users";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route
            path="reports"
            element={
              <RequireRole roles={["admin"]}>
                <Reports />
              </RequireRole>
            }
          />
          <Route
            path="users"
            element={
              <RequireRole roles={["admin"]}>
                <Users />
              </RequireRole>
            }
          />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
