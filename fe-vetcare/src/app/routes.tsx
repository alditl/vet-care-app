import { createBrowserRouter, Navigate } from "react-router";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Map from "./components/Map";
import Profile from "./components/Profile";
import MisMascotas from "./components/MisMascotas";
import BookAppointment from "./components/BookAppointment";
import MyAppointments from "./components/MyAppointments";
import History from "./components/History";
import VirtualGuard from "./components/VirtualGuard";
import VetDashboard from "./components/VetDashboard";
import Notifications from "./components/Notifications";
import Register from "./components/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register", 
    Component: Register,
  },
  {
    path: "/home",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "map", Component: Map },
      { path: "pets", Component: MisMascotas },
      { path: "profile", Component: Profile },
      { path: "book", Component: BookAppointment },
      { path: "appointments", Component: MyAppointments },
      { path: "history", Component: History },
      { path: "guard", Component: VirtualGuard },
      { path: "vet-dashboard", Component: VetDashboard },
      { path: "notifications", Component: Notifications },
    ],
  },
]);
