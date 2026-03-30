import logo from "../../assets/logo.png";
import ItemTable from "./ItemTable";
import SignOff from "./SignOff";
import TermsAndConditions from "./TermsAndConditions";

import { useShop } from "../../context/ShopContext";
import { useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";




export default function CartForm({ printRef }) {

    const { cartValue, setCartValue, handleCustomerDetailsOnchange, quoteDetails, setQuoteDetails, quoteNum, quoteStatus } = useShop();
    const { branch } = useAuth();
    const [pendingDeleteUid, setPendingDeleteUid] = useState(null)

    const delItemModal = useRef();

    const sensors = useSensors(
    useSensor(MouseSensor, {
        activationConstraint: {
        distance: 8,
        },
    }),
    useSensor(TouchSensor, {
        activationConstraint: {
        delay: 150,
        tolerance: 8,
        },
    })
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setCartValue((items) => {
            const oldIndex = items.findIndex((item) => item.uid === active.id);
            const newIndex = items.findIndex((item) => item.uid === over.id);

            if (oldIndex === -1 || newIndex === -1) return items;

            return arrayMove(items, oldIndex, newIndex);
        });
    }


    function calculatePrice(quantity, price, discount = 0) {
        const subtotal = quantity * price;
        const discountAmount = subtotal * (discount / 100);
        const total = subtotal - discountAmount;

        return Math.round(total * 100) / 100;
    }
    const totalAmount = cartValue?.reduce((acc, item) => {
        const itemTotal = calculatePrice(
            item.Quantity,
            item.SRP,
            item.Discount
        );

        return acc + itemTotal;
    }, 0);

    const grandTotalAmount = totalAmount + Number(quoteDetails?.ins_charge) + Number(quoteDetails?.del_charge);

    function handleConfirmDelete() {
        setCartValue(prev => prev.filter(x => x.uid !== pendingDeleteUid))
        delItemModal.current.close();
        setPendingDeleteUid(null);
    }

    function openDelModal(uid) {
        delItemModal.current.showModal();
        setPendingDeleteUid(uid);
    }

    return (
        <>
            <main ref={printRef} className="max-w-[8.5in] mx-auto bg-white p-10 rounded-xl">
                {/* Header Part */}
                <section className="flex flex-row mb-2">
                    <div className="flex-1">
                        <img src={logo} alt="ilaw atbp" className="w-[150px]" />
                    </div>
                    <div className="flex-1 flex justify-end">
                        <div className="">
                            <h1 className="text-[#3bb44b] font-bold">{branch.company_name}</h1>
                            <p className="text-[9px] max-w-64 leading-[1.1]">{branch.address}</p>
                            <p className="text-[9px] max-w-64 leading-[1.1]">Tel No : {branch.branch_contact_no}</p>
                            <p className="text-[9px] max-w-64 leading-[1.1]">Email : {branch.branch_email}</p>
                            <p className="text-[9px] max-w-64 leading-[1.1]">Website : www.ilawatbp.com</p>
                        </div>
                    </div>

                </section>

                <hr className="h-[1px] bg-black border-0 mb-2" />

                {/* CUSTOMER DETAILS */}
                <section className="flex flex-row mb-1 text-[9px] leading-none">
                    {/* LEFT SIDE */}
                    <div className="flex-1 p-1">
                        <div className="space-y-[1px]">
                            {[
                                { label: "ATTENTION", name: "Attn", },
                                { label: "DESIGNATION", name: "Desig" },
                                { label: "COMPANY", name: "Comp" },
                                { label: "LOCATION", name: "Loc" },
                                { label: "PROJECT", name: "Proj" },
                            ].map((f) => (
                                <div key={f.name} className="flex items-center gap-1">
                                    <div className="w-20 font-semibold">{f.label}</div>
                                    <input
                                        name={f.name}
                                        type="text"
                                        className={`flex-1 h-4  outline-none px-1 ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                                        defaultValue={quoteDetails?.[f.name] || ""}
                                        onChange={(e) => handleCustomerDetailsOnchange(f.name, e.target.value)}
                                        disabled={quoteStatus === "locked"}
                                    />
                                </div>
                            ))}
                        </div>


                        {/* FROM / SUBJECT */}
                        <div className="mt-3 space-y-[1px]">
                            <div className="flex items-center gap-1">
                                <div className="w-20 font-semibold">FROM</div>
                                <input
                                    name="from"
                                    type="text"
                                    onChange={(e) => {
                                        handleCustomerDetailsOnchange("frName", e.target.value);
                                    }}
                                    defaultValue={quoteDetails?.frName || ""}
                                    className={`flex-1 h-4 outline-none px-1 ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                                    disabled={quoteStatus === "locked"}
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <div className="w-20 font-semibold">SUBJECT</div>
                                <input
                                    name="subject"
                                    type="text"
                                    defaultValue="Quotation"
                                    className="flex-1 h-4 outline-none px-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="p-1 ">
                        <div className="space-y-[1px]">
                            <div className="flex items-center gap-1">
                                <div className="w-28 font-semibold" >DATE</div>
                                <input
                                    name="date"
                                    type="date"
                                    value={quoteDetails.Qdate}
                                    className="flex-1 h-4 px-1 outline-none bg-white"
                                    disabled
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <div className="w-28 font-semibold">QUOTATION NO.</div>
                                <input
                                    name="quotationNo"
                                    type="text"
                                    className="flex-1 h-4 px-1 outline-none bg-white"
                                    value={quoteNum}
                                    disabled
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <div className="w-28 font-semibold">VALID UNTIL</div>
                                <input
                                    name="validUntil"
                                    type="date"
                                    className={`flex-1 h-4 px-1 outline-none ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                                    value={quoteDetails.validUntil}
                                    disabled={quoteStatus === "locked"}
                                    onChange={(e) =>
                                        setQuoteDetails((prev) => ({ ...prev, validUntil: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </section>


                <hr className="h-[1px] bg-black border-0 mb-2" />


                {/* GREETING / INTRO */}
                <section className="mt-2 text-[10px] leading-tight">
                    <p>Dear Sir/Madam,</p>
                    <p className="mt-2">We&apos;re excited to present you to our proposal.</p>
                    <p className="mt-2">Have a bright day ahead!</p>
                </section>

                {/* ITEMS TABLE */}
                <section className="mt-4">
                    <div className="w-full overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="w-full border-collapse text-[10px]">
                                <thead>
                                    <tr className="border-y border-black">
                                        {quoteStatus !== "locked" && (
                                            <th className="py-1 font-semibold text-center w-[30px]"></th>
                                        )}
                                        <th className="py-1 font-semibold text-center w-[180px]">Picture</th>
                                        <th className="py-1 font-semibold text-center w-[70px]">Quantity</th>
                                        <th className="py-1 font-semibold text-left">Description</th>
                                        <th className="py-1 font-semibold text-left w-[70px]">Discount</th>
                                        <th className="py-1 font-semibold text-right w-[70px]">SRP</th>
                                        <th className="py-1 font-semibold text-right w-[70px]">Total</th>
                                        {quoteStatus !== "locked" ? (<th className="py-1 w-[30px]"></th>) : (<th className="py-1 w-[10px]"></th>)}

                                    </tr>
                                </thead>

                                <tbody>
                                    <SortableContext
                                        items={cartValue.map((item) => item.uid)}
                                        strategy={verticalListSortingStrategy}
                                    >

                                        {cartValue.map(p => <ItemTable key={p.uid} openDelModal={openDelModal} calculatePrice={calculatePrice} p={p} />)}
                                    </SortableContext>
                                </tbody>

                            </table>
                        </DndContext>

                        {/* TOTAL FOOTER */}
                        <div className="flex justify-between px-4 items-center gap-6 border-b border-black py-2 text-[10px]">
                            <div className="font-semibold">Total Amount</div>
                            <div className="w-[110px] text-right font-semibold">{
                                totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2, })
                            }
                            </div>
                        </div>

                        <div className="flex justify-between pl-4 items-center gap-6 border-b border-black py-2 text-[10px]">
                            <div className="font-semibold">Delivery Charges</div>
                            <input type="number" min="0" className={`w-[110px] text-right font-semibold ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60 px-2 "}`}
                                onChange={(e) => handleCustomerDetailsOnchange('del_charge', e.target.value.toString())}
                                defaultValue={Number(quoteDetails?.del_charge)}
                                disabled={quoteStatus === "locked"}
                            />

                        </div>

                        <div className="flex justify-between pl-4 items-center gap-6 border-b border-black py-2 text-[10px]">
                            <div className="font-semibold">Installation Charges</div>
                            <input type="number" min="0" className={`w-[110px] text-right font-semibold ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60 px-2"}`}
                                onChange={(e) => handleCustomerDetailsOnchange('ins_charge', e.target.value.toString())}
                                defaultValue={Number(quoteDetails?.ins_charge)}
                                disabled={quoteStatus === "locked"}
                            />
                        </div>

                        <div className="flex justify-between px-4 items-center gap-6 py-2 text-[10px]">
                            <div className="font-semibold">Grand Total</div>
                            <div className="w-[110px] text-right font-semibold">{grandTotalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</div>
                        </div>

                    </div>
                </section>
                <TermsAndConditions></TermsAndConditions>
                <SignOff></SignOff>
            </main>
            <dialog
                ref={delItemModal}
                className="rounded-2xl shadow-xl p-0 backdrop:bg-black/40 w-[420px] max-w-[90vw]"
            >
                <div className="p-6 flex flex-col gap-6">

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-center">
                        Delete Item
                    </h2>

                    {/* Message */}
                    <p className="text-center text-gray-600">
                        Are you sure you want to delete this item?
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-center gap-4 pt-2">
                        <button
                            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                            onClick={() => { delItemModal.current.close(), setPendingDeleteUid(null) }}
                        >
                            Cancel
                        </button>

                        <button
                            className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                            onClick={handleConfirmDelete}
                        >
                            Confirm
                        </button>
                    </div>

                </div>
            </dialog>
        </>
    )
}