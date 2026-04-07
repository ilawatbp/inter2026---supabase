import CategoryPage from "./CategoryPage"
import SubCategoryPage from "./SubCategoryPage"
import Header from "../components/Header"
import { useState } from "react"
import SmartSearchBar from "../components/SmartSearchBar"
import { useAuth } from "../context/AuthContext"

export default function Home() {
    const {signOut, profile} = useAuth();
    const [subCategValue, setSubCategValue] = useState("");

    return (
        <div className="min-h-dvh w-full bg-[#f8f8f8] flex flex-col">
            <Header></Header>
            <div className="flex-1 flex flex-col justify-center">
                {subCategValue === "" ? (
                    <CategoryPage setSubCategValue={setSubCategValue} subCategValue={subCategValue}></CategoryPage>
                ) : (<SubCategoryPage subCategValue={subCategValue} setSubCategValue={setSubCategValue}></SubCategoryPage>)}
            </div>


            <div className="md:fixed bottom-8 z-50 px-4
                            w-full flex flex-col-reverse md:flex-row justify-between items-center ">
                <button onClick={signOut} className="text-gray-400 hover:text-gray-600 z-50 my-10 md:my-0">Sign Out</button>
                <SmartSearchBar />
            </div>

        </div>
    )
}