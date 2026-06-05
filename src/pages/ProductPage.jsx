import ProductGallery from "../components/ProductGallery"
import logo from "../assets/logo.png";
import { ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProductPage() {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL ?? "http://192.168.1.100:3001";
    const { cartValue } = useShop();

    const [searchParams] = useSearchParams();
    const selectedItemCode = searchParams.get("id");

    const [productDescription, setProductDescription] = useState({});
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    useEffect(()=>{
        async function loadProduct(){
            setIsLoading(true);
            
            if(!selectedItemCode){
                setProductDescription({});
                setIsLoading(false);
                return;
            }

            let dbQuery = supabase
            .from("items")
            .select(`
                itemcode,
                itemname,
                price,
                tech_info: tech_info(
                    long_description,
                    short_description,
                    color_temp,
                    cri,
                    diffuser,
                    dimension,
                    ip_rating,
                    itemcode,
                    light_source,
                    lumen,
                    structure,
                    voltage,
                    weight
                )
            `)
            .eq("itemcode", selectedItemCode).single();

            const {data, error} = await dbQuery;

            if (error) {
                setError(error.message);
                setProductDescription({});
                setIsLoading(false);
                return;
            }

            setProductDescription( data || []);

            setIsLoading(false);
        }


        loadProduct();
        

    }, [selectedItemCode])


    function getTechInfo() {
        const techInfo = productDescription?.tech_info?.[0] || productDescription?.tech_info || {};
        if (techInfo.length) {
            return [
                { label: "Light Source", value: techInfo.light_source },
                { label: "Color Temp", value: techInfo.color_temp },
                { label: "Lumen", value: techInfo.lumen },
                { label: "Diffuser", value: techInfo.diffuser },
                { label: "Structure", value: techInfo.structure },
                { label: "CRI", value: techInfo.cri },
                { label: "Voltage", value: techInfo.voltage },
                { label: "IP Rating", value: techInfo.ip_rating },
                { label: "Dimension", value: techInfo.dimension },
                { label: "Weight", value: techInfo.weight },
            ];

        }

        return false;

    }


const product = getTechInfo();
    

    return (
        <div className="bg-white">
            <div className="p-4 flex justify-between">
                <img src={logo} alt="" className={`h-[30px] transition-all duration-300 ease-in-out`} 
                        onClick={()=> navigate("/home")}
                />
                <div className={`relative transition-all duration-300 ease-in-out`}
                    onClick={() => navigate(`/cart`)}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <div className="absolute top-[-8px] right-[-8px] bg-red-500/90 h-4 w-4 rounded-full overflow-hidden text-[8px] text-white flex justify-center items-center">{cartValue.length}</div>
                </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] h-dvh">

                <div className="flex justify-end pr-32 items-center">

                    <ProductGallery
                        images={[
                            `${API_URL}/images/samp1.webp`,
                            `${API_URL}/images/samp2.webp`,
                            `${API_URL}/images/samp3.webp`,
                            `${API_URL}/images/samp4.webp`,
                            `${API_URL}/images/samp5.webp`,
                            `${API_URL}/images/samp6.webp`,
                            `${API_URL}/images/samp7.webp`,
                            `${API_URL}/images/samp8.webp`,

                        ]}
                        alt="asdf"
                    />
                </div>
                <div className="flex justify-start">
                    <div className="w-2/3 lg:w-5/6">
                        <div className="mx-auto max-w-4xl p-10 md:py-14">
                            {/* CODE */}
                            <p className="text-[11px] tracking-[0.2em] text-neutral-500">
                                CODE: <span className="font-semibold text-neutral-700">{productDescription.itemcode}</span>
                            </p>

                            {/* TITLE */}
                            <h1 className="mt-3 text-4xl font-light leading-tight tracking-tight text-neutral-900 md:text-5xl">
                                {productDescription.itemname}
                            </h1>

                            {/* DESCRIPTION */}
                            <p className="mt-6 max-w-3xl tracking-tight text-base leading-7 text-neutral-700">
                                {productDescription.tech_info?.long_description || ""}
                            </p>

                            {/* SECTION */}
                            <h2 className="mt-12 text-lg font-semibold text-neutral-900">
                                Technical Information
                            </h2>
                            <div className="mt-4 h-px w-full bg-neutral-200" />

                            {/* TECH LIST */}
                            <dl className="mt-6 space-y-3">
        
                                {product && product.map((row) => {
                                    if (row.value || row.value !== ""){
                                        return(
                                    <div
                                        key={row.label}
                                        className="grid grid-cols-1 gap-1 md:grid-cols-[190px_1fr]"
                                    >
                                        <dt className="text-sm font-semibold text-neutral-900">
                                            {row.label}:
                                        </dt>
                                        <dd className="text-sm leading-6 text-neutral-700 break-words">
                                            {row.value}
                                        </dd>
                                    </div>
                                )
                                    }
                                })}

                            </dl>
                        </div>
                        <div>
                            <button>Add To Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}