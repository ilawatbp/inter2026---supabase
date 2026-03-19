import ProductGallery from "../components/ProductGallery"
import logo from "../assets/logo.png";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function PrestigePage() {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL ?? "http://192.168.1.100:3001";
    const { cartValue } = useShop();
    const product = {
        code: "00000234",
        title: "Aella T45 Table Lamp",
        description:
            "Leucos Aella T45 Table Lamp is a fusion of contemporary design and artisanal excellence. This lamp features a handblown Murano glass diffuser and metal structure. Whether adorning a bedside table or gracing a living room, the Aella T45 Table Light illuminates your home with a warm, inviting glow, while also serving as a stunning work of art.",
        technical: [
            { label: "Light Source", value: "LED 1*16.6W" },
            { label: "Color Temp", value: "3000K" },
            { label: "Lumen", value: "2624LM" },
            {
                label: "Diffuser",
                value:
                    "Alabaster w/ Brush Strike (Murano Glass), Transparent w/ White Spot (Murano Glass), White Shaded Pink (Murano Glass)",
            },
            {
                label: "Structure",
                value:
                    "Matte Black (Metal Frame), Matte Bronze (Metal Frame), Matte White (Metal Frame)",
            },
            { label: "CRI", value: "≥90" },
            { label: "Voltage", value: "AC220V (Dimmer on cord)" },
            { label: "IP Rating", value: "IP20" },
            { label: "Dimension", value: "Ø450*H:4060mm(max)" },
            { label: "Weight", value: "8.3kg" },
        ],
    };


    return (
        <div className="bg-white">
            <div className="p-4 flex justify-between">
                <img src={logo} alt="" className={`h-[30px] transition-all duration-300 ease-in-out`} />
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
                                CODE: <span className="font-semibold text-neutral-700">{product.code}</span>
                            </p>

                            {/* TITLE */}
                            <h1 className="mt-3 text-4xl font-light leading-tight tracking-tight text-neutral-900 md:text-5xl">
                                {product.title}
                            </h1>

                            {/* DESCRIPTION */}
                            <p className="mt-6 max-w-3xl tracking-tight text-base leading-7 text-neutral-700">
                                {product.description}
                            </p>

                            {/* SECTION */}
                            <h2 className="mt-12 text-lg font-semibold text-neutral-900">
                                Technical Information
                            </h2>
                            <div className="mt-4 h-px w-full bg-neutral-200" />

                            {/* TECH LIST */}
                            <dl className="mt-6 space-y-3">
                                {product.technical.map((row) => (
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
                                ))}
                            </dl>
                        </div>
                        <div>
                            <button>Add To Ca</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}