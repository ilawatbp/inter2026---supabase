import { useNavigate } from "react-router-dom";

export default function SubCateg({ info, setSubCategValue }) {

  const navigate = useNavigate();

  return (
    <div
      className="w-[260px] h-[130px] bg-[#2b2b2b] border-none rounded-xl overflow-hidden 
        grid grid-cols-[8fr_1fr] relative cursor-pointer
        shadow-md shadow-black/50 hover:shadow-black/50 hover:shadow-lg hover:scale-105
        transition-all duration-500 z-10"
        onClick={()=>{
          setSubCategValue("") ;
          navigate(`/query?group=${encodeURIComponent(info.id)}`);
        }}
    >
      <div className="bg-[#2f963c] text-white text-2xl pl-7 pr-8 capitalize flex items-center">
        {info.name}
      </div>
      <div className=""></div>
    </div>
  );
}



