import CategoryPage from "./CategoryPage"
import SubCategoryPage from "./SubCategoryPage"
import Header from "../components/Header"
import { useState } from "react"

export default function Home() {

    const [subCategValue, setSubCategValue] = useState("");

    return (
        <div className="min-h-dvh w-full bg-[#f8f8f8] flex flex-col">
            <Header></Header>
            <div className="flex-1 flex flex-col justify-center">
                {subCategValue === "" ? (
                    <CategoryPage setSubCategValue={setSubCategValue} subCategValue={subCategValue}></CategoryPage>
                ) : (<SubCategoryPage subCategValue={subCategValue} setSubCategValue={setSubCategValue}></SubCategoryPage>)}
            </div>

        </div>
    )
}