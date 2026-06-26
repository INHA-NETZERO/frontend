import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import AICopilot from "../components/chatbot/AICopilot";

function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-content">
        <Header />

        <div className="page-wrapper">
          <Outlet />
        </div>
      </div>

      <AICopilot />
    </div>
  );
}

export default MainLayout;