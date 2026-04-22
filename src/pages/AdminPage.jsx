import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  HousePlus,
  Store,
  UserRoundPlus,
  UserRoundSearch,
  Image,
  UserCheck,
} from "lucide-react";

import AddBranch from "../components/admin/AddBranch";
import BranchList from "../components/admin/BranchList";
import AddUser from "../components/admin/AddUser";
import UserList from "../components/admin/UserList";
import ImageUploader from "../components/admin/ImageUploader";
import AdminLoginReports from "../components/admin/AdminLoginReports";

export default function AdminPage() {
  const { profile, signOut } = useAuth();
  const [adminView, setAdminView] = useState("default");

  const displayName =
    profile?.fullname || profile?.full_name || profile?.email || "Admin";

  const isAdmin = profile?.role === "admin";

  const handleViewChange = (view) => {
    setAdminView((prev) => (prev === view ? "default" : view));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading admin page...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="bg-white/10 border border-white/10 rounded-2xl p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-3">Unauthorized</h1>
          <p className="text-white/80">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  function MenuCard({ icon: Icon, label, viewKey }) {
    const isActive = adminView === viewKey;

    return (
      <button
        type="button"
        onClick={() => handleViewChange(viewKey)}
        className={`
          flex flex-col items-center justify-center rounded-2xl transition-all duration-300
          ${
            adminView === "default"
              ? "w-full h-36 hover:bg-black/5"
              : "w-full h-full hover:bg-black/5"
          }
          ${isActive ? "bg-black text-white" : "text-black"}
        `}
      >
        <Icon
          className={`transition-all duration-300 ${
            adminView === "default" ? "w-12 h-12 mb-3" : "w-7 h-7 mb-1"
          }`}
        />
        <span
          className={`font-medium transition-all duration-300 ${
            adminView === "default" ? "text-sm opacity-100" : "text-xs opacity-100"
          }`}
        >
          {label}
        </span>
      </button>
    );
  }

  function PanelWrapper({ show, children, dark = true }) {
    return (
      <div
        className={`
          absolute inset-0 transition-all duration-300 ease-in-out
          ${
            show
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }
        `}
      >
        <div
          className={`
            h-full w-full rounded-2xl overflow-auto p-6
            ${dark ? "bg-[#111827] text-white" : "bg-white text-black"}
          `}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen w-full flex flex-col">
      <nav
        className={`
          bg-white transition-all duration-500 ease-in-out overflow-hidden
          ${
            adminView === "default"
              ? "min-h-[320px] rounded-b-none"
              : "h-auto rounded-b-2xl"
          }
        `}
      >
        <div className="px-6 md:px-10 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Admin Page</h1>
            <p className="text-sm text-gray-600">Welcome, {displayName}</p>
          </div>

          <div className="flex items-center gap-3">
            {adminView !== "default" && (
              <button
                type="button"
                onClick={() => setAdminView("default")}
                className="px-4 py-2 rounded-xl border border-black text-black hover:bg-black hover:text-white transition"
              >
                Back to Menu
              </button>
            )}

            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div
          className={`
            px-6 md:px-10 pb-6 transition-all duration-300
            ${
              adminView === "default"
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
                : "grid grid-cols-3 md:grid-cols-6 gap-3"
            }
          `}
        >
          <MenuCard icon={HousePlus} label="Add Branch" viewKey="addBranch" />
          <MenuCard icon={Store} label="Branch List" viewKey="branchList" />
          <MenuCard icon={UserRoundPlus} label="Add User" viewKey="addUser" />
          <MenuCard icon={UserRoundSearch} label="Users" viewKey="userList" />
          <MenuCard icon={UserCheck} label="Login Reports" viewKey="loginReport" />
          <MenuCard icon={Image} label="Upload Image" viewKey="imageUploader" />
        </div>
      </nav>

      <div className="flex-1 relative p-4 md:p-6 min-h-0">
        <PanelWrapper show={adminView === "addBranch"}>
          <AddBranch />
        </PanelWrapper>

        <PanelWrapper show={adminView === "branchList"}>
          <BranchList />
        </PanelWrapper>

        <PanelWrapper show={adminView === "addUser"}>
          <AddUser />
        </PanelWrapper>

        <PanelWrapper show={adminView === "userList"}>
          <UserList />
        </PanelWrapper>

        <PanelWrapper show={adminView === "loginReport"} dark={false}>
          <AdminLoginReports />
        </PanelWrapper>

        <PanelWrapper show={adminView === "imageUploader"} dark={false}>
          <ImageUploader />
        </PanelWrapper>

        {adminView === "default" && (
          <div className="h-full w-full rounded-2xl border border-white/10 bg-[#111827] text-white flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Admin Dashboard</h2>
              <p className="text-white/70">
                Select a tool above to manage branches, users, login reports, and
                images.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}