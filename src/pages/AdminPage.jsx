
import { useAuth } from "../context/AuthContext";
import AddBranch from "../components/admin/AddBranch";
import { useState } from "react";

import { HousePlus } from 'lucide-react';

export default function AdminPage() {
  const { profile, signOut } = useAuth();

  const [adminView, setAdminView] = useState("default");

  return (
    <div className="bg-black w-full min-h-dvh overflow-hidden flex flex-col">
      <nav className={` bg-white transition-all duration-300 ease-in-out 
                        flex flex-col
                      ${adminView === "default" ? 'h-screen rounded-b-none' : 'h-36 rounded-b-2xl'}`
      }>

        <div className="px-10 flex justify-between items-center">
          <div className="flex flex-col justify-center h-20">
            <h1 className="text-2xl font-bold">Admin Page</h1>
            <p>Welcome, {profile?.fullname}</p>
          </div>
          <button onClick={signOut}>sign out</button>
        </div>

        <div className=" flex-1 flex justify-start items-center px-36">

          <div className="flex flex-col justify-center items-center cursor-pointer"
          
          onClick={() => {
              if (adminView === "default") {
                setAdminView("addBranch")
              } else {
                setAdminView("default")
              }
            }}
          >
            <HousePlus className={`bg-white transition-all duration-300 ease-in-out  ${adminView === "default" ? 'w-16 h-16':'w-8 h-8'} `}/>
            <p className={`text-sm ${adminView === "default" ? 'opacity-1':'opacity-0'}`}>Add Branch</p>
          </div>

        </div>
      </nav>
      <div className="flex-1 p-16">
        <AddBranch />
      </div>
    </div>
  );
}