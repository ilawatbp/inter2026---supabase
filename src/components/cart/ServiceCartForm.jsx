import SignOff from "./SignOff";
import TermsAndConditions from "./TermsAndConditions";
import CartHead from "./CartHead";
import ServiceTable from "./ServiceTable.JSX";

export default function ServiceCartForm({ printRef }) {
  return (
    <>
      <main ref={printRef} className="max-w-[8.5in] mx-auto bg-white p-10 rounded-xl">
        <CartHead />
        <ServiceTable />
        <TermsAndConditions viewMode="serviceForm" />
        <SignOff />
      </main>
    </>
  );
}