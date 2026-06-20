import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/login/page";
import ManagerDashboard from "../pages/manager/page";
import HRDashboard from "../pages/hr/page";
import EmployeeDashboard from "../pages/employee/page";
import ReportsPage from "../pages/reports/page";
import SurveyPage from "../pages/survey/page";
import AdminDashboard from "../pages/admin/page";
import AuditLogsPage from "../pages/audit-logs/page";
import BiasDetectionPage from "../pages/bias-detection/page";
import PerformanceEvaluationPage from "../pages/evaluation/page";
import EmployeeProfilePage from "../pages/profile/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/manager",
    element: <ManagerDashboard />,
  },
  {
    path: "/hr",
    element: <HRDashboard />,
  },
  {
    path: "/employee",
    element: <EmployeeDashboard />,
  },
  {
    path: "/evaluation",
    element: <PerformanceEvaluationPage />,
  },
  {
    path: "/profile",
    element: <EmployeeProfilePage />,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
  },
  {
    path: "/survey",
    element: <SurveyPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/audit-logs",
    element: <AuditLogsPage />,
  },
  {
    path: "/bias-detection",
    element: <BiasDetectionPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
