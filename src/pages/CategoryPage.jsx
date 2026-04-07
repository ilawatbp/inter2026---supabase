import categories from "../data/categories";
import CategCard from "../components/CategCard";


export default function CategoryPage({setSubCategValue, subCategValue}) {



    return (
            <div
                className={`max-w-6xl mx-auto px-4 py-10 pt-20 md:p-0 flex flex-wrap justify-center items-center gap-6
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
            </div>
                    );
}