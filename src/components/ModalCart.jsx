import { useRef } from "react";
import { useShop } from "../context/ShopContext";
import { v4 as uuidv4 } from "uuid";
import { PhilippinePeso } from "lucide-react";

export default function ModalCart({ propshow, selectedItem }) {

  const {setCartValue} = useShop();

  function handleSubmit(item) {
    setCartValue((prev) => [
      ...prev,
      {
        uid: uuidv4(),
        itemcode: `${item.itemcode}`,
        Quantity: quantValue.current.value,
        Discount: discountValue.current.value,
        itemname:`${item.itemname}`,
        SRP: `${item.price}`,
        Area: `${areaValue.current.value}`,
        Rem: `${noteValue.current.value}`,
      },
    ]);

    propshow(false);
    quantValue.current.value = 1;
    discountValue.current.value = 0;
    areaValue.current.value = '';
    noteValue.current.value = '';
  }

  const quantValue = useRef();
  const discountValue = useRef();
  const areaValue = useRef();
  const noteValue = useRef();

  return (

        <div className="flex flex-col gap-4">
          <div className="flex-1 flex flex-col justify-start gap-2 sm:gap-3">
            <div className="break-words">{selectedItem.itemcode}</div>
            <div className="break-words">{selectedItem.itemname}</div>
            <div className="break-words flex flex-row itemsz-center"><PhilippinePeso className="h-4 w-4" />{selectedItem.price.toLocaleString()}</div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-24">
              <p>QUANTITY</p>
            </div>
            <input
              type="number" min="1"
              className="h-10 w-full sm:w-1/2 rounded-2xl px-4 shadow-md bg-white border border-[#dfdfdf]"
              ref={quantValue}
              defaultValue={1}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-24">
              <p>DISCOUNT</p>
            </div>
            <input
              type="number" min="0" max="100"
              className="h-10 w-full sm:w-1/2 rounded-2xl px-4 shadow-md bg-white border border-[#dfdfdf]"
              ref={discountValue}
              defaultValue={0}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-24">
              <p>AREA</p>
            </div>
            <input
              type="text"
              className="h-10 w-full sm:w-1/2 rounded-2xl px-4 shadow-md bg-white border border-[#dfdfdf]"
              ref={areaValue}
              defaultValue=''
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-24">
              <p>NOTE</p>
            </div>
            <textarea name="" id="" rows="4" 
            className="p-2 w-full sm:w-1/2 rounded-2xl px-4 shadow-md bg-white border border-[#dfdfdf]"
            ref={noteValue}
            defaultValue=''
            ></textarea>

            <button
              className="mt-auto h-10 w-full sm:w-auto bg-[#3cb54c] rounded-2xl px-6 shadow-xl sm:ml-auto text-white"
              onClick={() => handleSubmit(selectedItem)}
            >
              Submit
            </button>
          </div>
        </div>

  );
}
