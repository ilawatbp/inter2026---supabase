import SubCateg from "../components/SubCateg";
import categories from "../data/categories";


export default function SubCategoryPage({subCategValue, setSubCategValue}) {

const cname = subCategValue;
    return (
        <div
            className={`max-w-6xl mx-auto px-4 py-10 pt-20 md:p-0  flex flex-wrap justify-center items-center gap-6 
                        transition-all duration-500 ease-in-out
                         ${subCategValue !== "" ? "opacity-1" : "opacity-0"}
                        `}
        >
            {categories
                .filter((value) => value.cname == cname)
                .map((categ) =>
                    categ.subcategories.map((sub, index) => (
                        <SubCateg
                            info={sub}
                            key={index}
                            setSubCategValue={setSubCategValue}
                        ></SubCateg>
                    ))
                )}
        </div>
    );
}













    // // QUERY TO BACKEND WHEN CHOOSING CATEGORY
    // const handleSubCategoryClick = (id) => {
    //     navigate(`/loading`)

    //     fetch(`http://192.168.1.100:3001/api/db2/items?group=${id}`) // Fetch from backend
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setItems(data);

    //             navigate(`/items`)
    //         })

    //         .catch((err) => {
    //             console.error("Error fetching:", err);
    //             setView("category");
    //         });

    //     return () => {
    //         if (timeoutId) {
    //             clearTimeout(timeoutId);
    //         }
    //     };

    // };
