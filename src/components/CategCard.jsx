

export default function CategCard({ info, setSubCategValue }) {

    return (
        <div className="w-[260px] max-h-[130px] bg-[#2b2b2b] border-none rounded-xl overflow-hidden 
        grid grid-cols-[2fr_12fr] relative cursor-pointer
        shadow-md shadow-black/50 hover:shadow-black/50 hover:shadow-lg hover:scale-105
        transition-all duration-500 z-10"
        onClick={()=> setSubCategValue(info.cname)}
        >
            <div className="bg-[#2f963c]"></div>
            <div className="w-full relative">
                <div className="absolute inset-0 bg-black/50"></div>
                <img className="object-cover min-h-[130px]" src={info.image} alt={info.cname} />
            </div>
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white text-3xl pl-7 pr-8 capitalize">
                {info.cname}
            </div>
        </div>
    )
}