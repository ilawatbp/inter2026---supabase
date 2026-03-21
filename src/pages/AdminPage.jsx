import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { HousePlus, Store, UserRoundPlus, UserRoundSearch, Image } from "lucide-react";

import AddBranch from "../components/admin/AddBranch";
import BranchList from "../components/admin/BranchList";
import AddUser from "../components/admin/AddUser";
import ImageUploader from "../components/admin/ImageUploader";

export default function AdminPage() {
  const { profile, signOut } = useAuth();
  const [adminView, setAdminView] = useState("default");

  const handleViewChange = (view) => {
    setAdminView((prev) => (prev === view ? "default" : view));
  };

  return (
    <div className="bg-black w-full h-screen overflow-hidden flex flex-col">
      <nav
        className={`
          bg-white flex flex-col transition-all duration-500 ease-in-out overflow-hidden
          ${adminView === "default" ? "h-screen rounded-b-none" : "h-36 rounded-b-2xl"}
        `}
      >
        <div className="px-10 flex justify-between items-center">
          <div className="flex flex-col justify-center h-20">
            <h1 className="text-2xl font-bold">Admin Page</h1>
            <p>Welcome, {profile?.full_name}</p>
          </div>
          <button onClick={signOut}>sign out</button>
        </div>

        <div className="flex-1 flex justify-between items-center gap-20 px-36">
          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={() => handleViewChange("addBranch")}
          >
            <HousePlus
              className={`
                transition-all duration-300 ease-in-out
                ${adminView === "default" ? "w-16 h-16" : "w-8 h-8"}
              `}
            />
            <p
              className={`
                text-sm transition-opacity duration-300
                ${adminView === "default" ? "opacity-100" : "opacity-0"}
              `}
            >
              Add Branch
            </p>
          </div>

          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={() => handleViewChange("branchList")}
          >
            <Store
              className={`
                transition-all duration-300 ease-in-out
                ${adminView === "default" ? "w-16 h-16" : "w-8 h-8"}
              `}
            />
            <p
              className={`
                text-sm transition-opacity duration-300
                ${adminView === "default" ? "opacity-100" : "opacity-0"}
              `}
            >
              Branch List
            </p>
          </div>

          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={() => handleViewChange("addUser")}
          >
            <UserRoundPlus
              className={`
                transition-all duration-300 ease-in-out
                ${adminView === "default" ? "w-16 h-16" : "w-8 h-8"}
              `}
            />
            <p
              className={`
                text-sm transition-opacity duration-300
                ${adminView === "default" ? "opacity-100" : "opacity-0"}
              `}
            >
              Add User
            </p>
          </div>

          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={() => handleViewChange("userList")}
          >
            <UserRoundSearch
              className={`
                transition-all duration-300 ease-in-out
                ${adminView === "default" ? "w-16 h-16" : "w-8 h-8"}
              `}
            />
            <p
              className={`
                text-sm transition-opacity duration-300
                ${adminView === "default" ? "opacity-100" : "opacity-0"}
              `}
            >
              Users
            </p>
          </div>

          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={() => handleViewChange("imageUploader")}
          >
            <Image
              className={`
                transition-all duration-300 ease-in-out
                ${adminView === "default" ? "w-16 h-16" : "w-8 h-8"}
              `}
            />
            <p
              className={`
                text-sm transition-opacity duration-300
                ${adminView === "default" ? "opacity-100" : "opacity-0"}
              `}
            >
              Upload Image
            </p>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative overflow-hidden">
        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${
              adminView === "addBranch"
                ? "opacity-100 translate-y-0 p-16 pointer-events-auto"
                : "opacity-0 translate-y-4 p-0 pointer-events-none"
            }
          `}
        >
          <AddBranch />
        </div>

        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${
              adminView === "branchList"
                ? "opacity-100 translate-y-0 p-16 pointer-events-auto"
                : "opacity-0 translate-y-4 p-0 pointer-events-none"
            }
          `}
        >
          <BranchList />
        </div>

        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${
              adminView === "addUser"
                ? "opacity-100 translate-y-0 p-16 pointer-events-auto"
                : "opacity-0 translate-y-4 p-0 pointer-events-none"
            }
          `}
        >
          <AddUser />
        </div>

        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${
              adminView === "userList"
                ? "opacity-100 translate-y-0 p-16 pointer-events-auto"
                : "opacity-0 translate-y-4 p-0 pointer-events-none"
            }
          `}
        >
          <div className="bg-white h-full w-full rounded-2xl p-8 overflow-auto">
            <h2 className="text-2xl font-bold mb-6">Users</h2>
            <p>User list placeholder</p>
          </div>
        </div>

        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${
              adminView === "imageUploader"
                ? "opacity-100 translate-y-0 p-16 pointer-events-auto"
                : "opacity-0 translate-y-4 p-0 pointer-events-none"
            }
          `}
        >
          <div className="bg-white h-full w-full rounded-2xl p-8 overflow-auto">
            <ImageUploader/>
          </div>
        </div>
      </div>
    </div>
  );
}