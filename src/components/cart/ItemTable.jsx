import { Trash2, GripVertical } from "lucide-react";
import notavail from "../../assets/notavail.webp";
import { useShop } from "../../context/ShopContext";
import { supabase } from "../../lib/supabase";

// for editable row
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getItemImageUrl(itemcode) {
  if (!itemcode) return notavail;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(`items/${itemcode}.webp`);

  return data?.publicUrl || notavail;
}

export default function ItemTable({ p, openDelModal, calculatePrice }) {

  const { setCartValue, quoteStatus } = useShop();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: p.uid,
    disabled: quoteStatus === "locked",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };


  function handleChange(uid, field, value) {
    setCartValue(prev => prev.map(x => x.uid === uid ? { ...x, [field]: value } : x))
  }

  return (
    //  <tr className="border-b border-black align-middle" key={p.uid}>
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-black align-middle ${isDragging ? "bg-gray-50" : ""}`}
    >
      {quoteStatus !== "locked" && (
        <td className="py-2 px-2 align-middle text-center">
<button
  type="button"
  {...attributes}
  {...listeners}
  className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-black touch-none"
  title="Drag to reorder"
>
  <GripVertical className="w-4 h-4" />
</button>
        </td>
      )}
      {/* Picture */}
      <td className="py-2 pr-2 align-middle">

        <img
          decoding="async"
          loading="lazy"
          src={getItemImageUrl(p.itemcode)}
          alt={p.itemname}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = notavail;
          }}
          className="w-full h-full object-cover"
        />
      </td>

      {/* Quantity */}
      <td className="py-2 text-center align-middle">
        <input type="number" min="1"
          className={`text-center w-[50px] p-2 bg-white flex-1 h-4 bg-gray-200/60 outline-none px-1  ${quoteStatus !== "locked" && "border-b"}`}
          value={Number(p.Quantity ?? 1)}
          onChange={(e) => handleChange(p.uid, "Quantity", e.target.value)}
          disabled={quoteStatus === "locked"}
        />
      </td>

      {/* Description */}
      <td className="py-2">
        <div className="font-semibold">{p.id_no}</div>
        <div className="mt-2">
          {p.itemcode}
        </div>
        <div className="mt-2">
          {p.itemname}
        </div>
        <div className="mt-2">Area:
          <input type="text" className={`w-full px-2 bg-white ${quoteStatus !== "locked" && "border-b"}`}
            value={p.Area}
            onChange={(e) => handleChange(p.uid, "Area", e.target.value)}
            disabled={quoteStatus === "locked"}
          />
        </div>

        <div>Notes:
          <textarea name="" id="" className={`w-full p-2  bg-white ${quoteStatus !== "locked" && "border"}`}
            value={p.Rem}
            onChange={(e) => handleChange(p.uid, "Rem", e.target.value)}
            disabled={quoteStatus === "locked"}
          ></textarea>
        </div>
      </td>

      {/* DISCOUNT */}
      <td className="py-2 text-right align-middle">
        <input type="number" min="0" max="100" className={`text-center w-[50px] p-2  bg-white ${quoteStatus !== "locked" && "border-b"}`}
          value={Number(p.Discount ?? 0)}
          onChange={(e) => handleChange(p.uid, "Discount", e.target.value)}
          disabled={quoteStatus === "locked"}
        />
      </td>

      {/* SRP */}
      <td className="py-2 text-right align-middle">
        {Number(p.SRP).toLocaleString()}
      </td>

      {/* Total */}
      <td className="py-2 text-right align-middle">
        {
          Number(calculatePrice(p.Quantity, p.SRP, p.Discount)).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }
      </td>

      {/* Actions */}
      {quoteStatus !== "locked" && (
        <td className="">
          <div className="flex flex-col items-end gap-4">
            <button
              type="button"
              className="text-red-200 hover:text-red-700"
              onClick={() => openDelModal(p.uid)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      )}


    </tr>
  );
}