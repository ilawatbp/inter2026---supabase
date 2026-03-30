export default function SkelitonCard(){
  return(
    <div className="w-full h-[90dvh] px-20 pt-20 mt-20 flex gap-4 flex-wrap justify-evenly animate-pulse">
      {[...Array(15)].map((_,index)=>(
      <div key={index} className="h-[40%] rounded-2xl overflow-hidden flex flex-col gap-2
        w-full md:w-[calc(50%-10px)] lg:w-[calc(33%-10px)] xl:w-[calc(25%-20px)] 2xl:w-[calc(20%-20px)]
      ">
        <div className="bg-[#c8c6c6] flex-[5] rounded-2xl"></div>
        <div className="flex-[2] rounded-2xl p-4 flex flex-col justify-evenly gap-2">
          <div className="bg-[#b4b2b2] rounded-2xl flex-1 w-1/4"></div>
          <div className="bg-[#b4b2b2] rounded-2xl flex-1"></div>
          <div className="bg-[#b4b2b2] rounded-2xl flex-1 w-1/2"></div>
        </div>
      </div>
      ))}
    </div>
  )
}