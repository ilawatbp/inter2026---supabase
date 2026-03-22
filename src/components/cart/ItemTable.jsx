import { Trash2, Pencil } from "lucide-react";
import notavail from "../../assets/notavail.webp";
import { useShop } from "../../context/ShopContext";
import { supabase } from "../../lib/supabase";
                    // {id_no, quant, discount, price, ItemName, area, note}

  function getItemImageUrl(itemcode) {
  if (!itemcode) return notavail;
  
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(`items/${itemcode}.webp`);

  return data?.publicUrl || notavail;
}

export default function ItemTable({p, openDelModal, calculatePrice}){

    const {setCartValue, quoteStatus} = useShop();
      const API_URL = import.meta.env.VITE_API_URL ?? "http://192.168.1.100:3001";

    function handleChange(uid, field, value ){
      setCartValue(prev => prev.map(x => x.uid === uid ? {...x, [field]: value } : x))
    }

    return(
         <tr className="border-b border-black align-middle" key={p.uid}>
                      {/* Picture */}
                      <td className="py-2 pr-2 align-middle">
                        {/* <img
                          // src={notavail}
                          src={`${API_URL}/images/${p.ItemCode}.webp`}
                          onError={(e) => (e.currentTarget.src = notavail)}
                          alt="item"
                          className="w-full h-auto object-contain"
                        /> */}

          
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
                        className={`text-center w-[50px] p-2 bg-white flex-1 h-4 bg-gray-200/60 outline-none px-1  ${quoteStatus !=="locked" && "border-b"}`} 
                        value={Number(p.Quantity ?? 1)}
                                onChange={(e)=> handleChange(p.uid, "Quantity", e.target.value )}
                                disabled={quoteStatus ==="locked"}
                        />
                      </td>

                      {/* Description */}
                      <td className="py-2">
                        <div className="font-semibold">{p.id_no}</div>
                        <div className="mt-2">
                          {p.ItemName}
                        </div>
                        <div className="mt-2">Area:  
                          <input type="text" className={`w-full px-2 bg-white ${quoteStatus !=="locked" && "border-b"}`} 
                          defaultValue={p.Area}
                             onChange={(e)=> handleChange(p.uid, "Area", e.target.value )}
                             disabled={quoteStatus ==="locked"}
                        />
                        </div>
                        
                        <div>Notes: 
                            <textarea name="" id=""className={`w-full p-2  bg-white ${quoteStatus !=="locked" && "border"}`}
                             defaultValue={p.Rem} 
                              onChange={(e)=> handleChange(p.uid, "Rem", e.target.value )}
                              disabled={quoteStatus ==="locked"}
                            ></textarea>
                        </div>
                      </td>

                      {/* DISCOUNT */}
                      <td className="py-2 text-right align-middle">
                        <input type="number" min="0" max="100" className={`text-center w-[50px] p-2  bg-white ${quoteStatus !=="locked" && "border-b"}`} 
                        value={Number(p.Discount ?? 0)}
                        onChange={(e)=> handleChange(p.uid, "Discount", e.target.value )}
                        disabled={quoteStatus ==="locked"}
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
                      {quoteStatus !=="locked" && (
                      <td className="">
                        <div className="flex flex-col items-end gap-4">
                          <button
                            type="button"
                            className="text-red-200 hover:text-red-700"
                            onClick={()=> openDelModal(p.uid)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      )}


                    </tr>
    );
}