import { useShop } from "../../context/ShopContext";

export default function SignOff(){

      const {handleCustomerDetailsOnchange, quoteDetails, quoteStatus } = useShop();

    return(
        <>
            {/* CLOSING MESSAGE */}
<section className="mt-6 text-[10px] leading-tight">
  <p>Let&apos;s light up your projects together!</p>
  <p className="mt-3">Sincerely,</p>

  <div className="flex flex-col gap-1" >
    {/* <input type="text" className={`w-[180px] h-4 px-2 py-1 m-0  bg-white`}
          onChange={(e)=> handleCustomerDetailsOnchange( 'prepby', e.target.value)}
          defaultValue = {quoteDetails?.prepby}
          placeholder="Name"
          disabled="true"
    />
    <input type="text" className={`w-[180px] h-4 px-2 py-1 m-0 bg-white`}
          onChange={(e)=> handleCustomerDetailsOnchange('designationOfUser', e.target.value)}
          defaultValue = {quoteDetails?.designationOfUser}
          placeholder="Designation"
          disabled="true"
    /> */}
    
    <input type="text" className={`w-[180px] h-4 px-2 py-1 m-0  ${quoteStatus ==="locked" ? "bg-white" : "bg-gray-200/60"}`}
          onChange={(e)=> handleCustomerDetailsOnchange( 'prepby', e.target.value)}
          defaultValue = {quoteDetails?.prepby}
          placeholder="Name"
          disabled={quoteStatus ==="locked"}
    />
    <input type="text" className={`w-[180px] h-4 px-2 py-1 m-0  ${quoteStatus ==="locked" ? "bg-white" : "bg-gray-200/60"}`}
          onChange={(e)=> handleCustomerDetailsOnchange('designationOfUser', e.target.value)}
          defaultValue = {quoteDetails?.designationOfUser}
          placeholder="Designation"
          disabled={quoteStatus ==="locked"}
    />




  </div>
</section>

{/* CONFIDENTIALITY */}
<section className="mt-6 text-[10px] leading-tight">
  <h3 className="font-bold underline mb-2">
    CONFIDENTIALITY STATEMENT
  </h3>
  <p>
    This document contains proprietary, confidential information about Ilaw atbp.
    products, programs and services. By accepting, the recipient agrees not to
    disclose it outside their organization, nor duplicate, use or disclose it
    for any other purposes.
  </p>
</section>

{/* PRIVACY NOTICE */}
<section className="mt-4 text-[10px] leading-tight">
  <h3 className="font-bold underline mb-2">
    PRIVACY NOTICE
  </h3>
  <p>
    By signing, I agree for my personal data to be utilized within the
    arrangements of this document.
  </p>
</section>

{/* QUOTATION ACCEPTANCE */}
<section className="mt-4 text-[10px] leading-tight">
  <h3 className="font-bold underline mb-2">
    QUOTATION ACCEPTANCE
  </h3>
  <p>
    By signing this quotation, all parties acknowledge and agree to the terms
    and conditions outlined herein. Upon acceptance, this quotation shall
    constitute a binding agreement between{" "}
    <input type="text" className="inline-block border-b border-black min-w-[120px] px-1 " defaultValue={quoteDetails?.Comp} disabled="true"/>
    and{" "}
 <input type="text" className="inline-block border-b border-black min-w-[120px] px-1"  defaultValue={quoteDetails?.frName} disabled="true"/>
    , subject to the terms specified.
  </p>
</section>

{/* SIGNATURE BLOCKS */}
<section className="mt-6 grid grid-cols-2 gap-6 text-[10px]">
  
  {/* ILAW SIDE */}
  <div className="space-y-[2px]">
    <input
      type="text"
      placeholder="Ilaw Authorized Representative Name"
      className={`w-full px-2 py-1 outline-none h-4 ${quoteStatus ==="locked" ? "bg-white" : "bg-gray-200/60"}`}
        onChange={(e)=> handleCustomerDetailsOnchange('authName', e.target.value)}
        defaultValue = {quoteDetails?.authName}
        disabled={quoteStatus ==="locked"}
    />
    <input
      type="text"
      placeholder="Designation"
      className={`w-full px-2 py-1 outline-none h-4 ${quoteStatus ==="locked" ? "bg-white" : "bg-gray-200/60"}`}
        onChange={(e)=> handleCustomerDetailsOnchange('authDesig', e.target.value)}
        defaultValue = {quoteDetails?.authDesig}
        disabled={quoteStatus ==="locked"}
    />
    <input
      type="text"
      placeholder="ilaw atbp"
      className="w-full px-2 py-1 outline-none h-4 bg-white"
      defaultValue={quoteDetails?.frName}
      disabled="true"
    />
  </div>

  {/* CLIENT SIDE */}
  <div className="space-y-[2px]">
    <input
      type="text"
      placeholder="Client Authorized Representative Name"
      className={`w-full px-2 py-1 outline-none h-4 ${quoteStatus ==="locked" ? "bg-white" : "bg-gray-200/60"}`}
        onChange={(e)=> handleCustomerDetailsOnchange('cliName', e.target.value)}
        defaultValue = {quoteDetails?.cliName}
        disabled={quoteStatus ==="locked"}
    />
    <input
      type="text"
      placeholder="Designation"
      className={`w-full px-2 py-1 outline-none h-4 ${quoteStatus ==="locked" ? "bg-white" : "bg-gray-200/60"}`}
        onChange={(e)=> handleCustomerDetailsOnchange('cliDesig', e.target.value)}
        defaultValue = {quoteDetails?.cliDesig}
        disabled={quoteStatus ==="locked"}
    />
    <input
      type="text"
      placeholder="Business Name"
      className="w-full px-2 py-1 outline-none h-4 bg-white"
      defaultValue={quoteDetails?.Comp}
      disabled="true"
      
    />
  </div>

</section>


        </>
    );
}