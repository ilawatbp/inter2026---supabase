import ItemTable from "./ItemTable";
import SignOff from "./SignOff";
import TermsAndConditions from "./TermsAndConditions";
import CartHead from "./CartHead";

import { useShop } from "../../context/ShopContext";
import { useRef, useState } from "react";



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

    const { cartValue, setCartValue, handleCustomerDetailsOnchange, quoteDetails, quoteStatus } = useShop();

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

                <CartHead />

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
                <TermsAndConditions viewMode={"quotationForm"} />
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