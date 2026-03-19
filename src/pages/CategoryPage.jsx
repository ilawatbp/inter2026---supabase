import categories from "../data/categories";
import CategCard from "../components/CategCard";
import { useAuth } from "../context/AuthContext";

export default function CategoryPage({setSubCategValue, subCategValue}) {

    const {signOut, profile} = useAuth();

    return (
            <div
                className={`max-w-6xl mx-auto px-4 py-10 flex flex-wrap justify-center items-center gap-6
                            transition-all duration-300 ease-in-out
                            ${subCategValue === "" ? "opacity-1" : "opacity-0"}
                            `}
            >
                {categories.map((categ, index) => (
                    // <div>{categ.image}</div>
                    <CategCard
                        info={categ}
                        key={index}
                        setSubCategValue={setSubCategValue}
                    ></CategCard>
                ))}
                <div className="fixed bottom-4 left-4 ">
                    <button onClick={signOut} className="text-gray-400 hover:text-gray-600">Sign Out</button>
                </div>
            </div>
                    );
}