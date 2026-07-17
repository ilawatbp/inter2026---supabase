import { useState } from "react";

import CategoryPage from "./CategoryPage";
import SubCategoryPage from "./SubCategoryPage";
import Header from "../components/Header";
import SmartSearchBar from "../components/SmartSearchBar";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { signOut, profile } = useAuth();

  const [subCategValue, setSubCategValue] = useState("");



  const email = profile?.email ?? "Loading profile...";
  const branchName =
    profile?.branches?.branch_name ?? "Loading branch...";

  return (
    <div className="min-h-dvh w-full bg-[#f8f8f8] flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col justify-center">
        {subCategValue === "" ? (
          <CategoryPage
            setSubCategValue={setSubCategValue}
            subCategValue={subCategValue}
          />
        ) : (
          <SubCategoryPage
            subCategValue={subCategValue}
            setSubCategValue={setSubCategValue}
          />
        )}
      </div>

      <div
        className="
          md:fixed bottom-8 z-40 px-4
          w-full flex flex-col-reverse md:flex-row
          justify-between items-center
        "
      >
        <div>
          <button
            type="button"
            onClick={signOut}
            className="
              text-gray-400 hover:text-gray-600
              z-50 my-10 md:my-0
            "
          >
            Sign Out
          </button>

          <p className="text-gray-300 text-sm">
            {email} | {branchName}
          </p>
        </div>

        <SmartSearchBar />
      </div>

    </div>
  );
}