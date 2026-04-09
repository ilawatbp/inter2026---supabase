import SignOff from "./SignOff";
import TermsAndConditions from "./TermsAndConditions";
import CartHead from "./CartHead";



export default function ServiceCartForm(){


    return (
        <>
            <main className="max-w-[8.5in] mx-auto bg-white p-10 rounded-xl">
              

                <CartHead />
                <TermsAndConditions viewMode="serviceForm" />
                <SignOff></SignOff>
            </main>
         
        </>
    )

}