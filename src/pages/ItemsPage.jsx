import { useEffect, useState, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag, PhilippinePeso } from "lucide-react";

import { supabase } from "../lib/supabase";

import Header from "../components/Header";
import Modal from "../components/Modal"; // the “proper modal” component (portal + unmount when closed)
import notavail from "../assets/notavail.webp";
import ModalCart from "../components/ModalCart";

import SkelitonCard from "../components/SkelitonCard";

function getItemImageUrl(itemcode) {
  if (!itemcode) return notavail;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(`items/${itemcode}.webp`);

  return data?.publicUrl || notavail;
}

/** ✅ Card extracted + memoized to reduce re-renders */
const ItemCard = memo(function ItemCard({ itm, onOpen, onAddToCart }) {
  return (
    <div
      className="
        rounded-2xl overflow-hidden flex flex-col gap-2
        w-full md:w-[calc(50%-10px)] lg:w-[calc(33%-10px)] xl:w-[calc(25%-20px)] 2xl:w-[calc(20%-20px)]
        mb-10 relative
      "
      style={{ contentVisibility: "auto", containIntrinsicSize: "300px 420px" }}
    >
      {/* Fixed height prevents layout shifting while images load */}
      <div className="bg-[#c8c6c6] rounded-2xl overflow-hidden shadow-md">
        <img
          onClick={() => onOpen(itm)}
          decoding="async"
          loading="lazy"
          src={getItemImageUrl(itm.itemcode)}
          alt={itm.itemname}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = notavail;
          }}
          className="w-full h-full object-cover"
        />
      </div>


      <div className="rounded-2xl px-6 flex flex-col gap-1 mb-2">
        <p className="truncate">{itm.itemname}</p>
        <div className="flex items-center gap-1">
          {/* <p >{itm.promo?.pm_discval}</p> */}
          <PhilippinePeso className="h-3 w-3" />
          <p>{itm.price.toLocaleString()}</p>
        </div>
        <div
          className="flex justify-between items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`h-1 w-1 rounded-full ${itm.promo?.pm_discval && "bg-green-300"}`}></div>
          <ShoppingBag
            className="text-[#3cb54c] cursor-pointer h-5 w-5 "
            onClick={() => onAddToCart(itm)}
          />
        </div>
      </div>
    </div>
  );
});

export default function ItemsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const groupQuery = searchParams.get("group");



  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    let ignore = false;
    let timeoutId;

    async function loadItems() {
      setError("");
      setIsLoading(true);

      if (!query && !groupQuery) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      let dbQuery = supabase
        .from("items")
        .select(`
        itemcode,
        itemname,
        price,
        promo:promo_discount (
          pm_discval
        )
      `)
        .order("price", { ascending: false });

      if (query) {
        dbQuery = dbQuery.or(
          `itemcode.ilike.%${query}%,itemname.ilike.%${query}%`
        );
      }

      if (groupQuery) {
        dbQuery = dbQuery.eq("activeqrygroup", groupQuery);
      }

      dbQuery = dbQuery.order("itemname", { ascending: true });

      const { data, error } = await dbQuery;

      if (ignore) return;

      if (error) {
        setError(error.message);
        setItems([]);
        setIsLoading(false);
        return;
      }

      setItems(data || []);
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }

    loadItems();

    return () => {
      ignore = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [query, groupQuery]);


  useEffect(() => {
    if (error) alert(error);
  }, [error]);

  const handleOpen = useCallback((itm) => {
    setSelectedItem(itm);
    setOpenItemModal(true);
  }, []);

  const handleAddToCart = useCallback((itm) => {
    setSelectedItem(itm);
    setOpenCartModal(true);
  }, []);


  return (
    <>
      <div className={`fixed w-full h-screen bg-white
                        transition-all duration-300 ease-out
                      ${isLoading ? 'opacity-100 z-50' : 'opacity-0 z-0'}`}>
        <SkelitonCard />
      </div>
      <div className="h-dvh w-full overflow-hidden flex flex-col">
        <Header />

        {/* ✅ Only the list scrolls (header stays stable) */}
        <div className="flex-1 overflow-auto scrollbar-hide z-10">
          <div className="w-full px-10 md:px-20 py-4 pt-20 md:pt-36 flex gap-4 flex-wrap justify-evenly">
            {!isLoading && items.length === 0 ? (
              <div className="w-full flex justify-center items-center py-20">
                <p className="text-gray-500 text-lg font-medium">No items found.</p>
              </div>
            ) : (
              items.map((itm) => (
                <ItemCard
                  key={itm.itemcode}
                  itm={itm}
                  onOpen={handleOpen}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>
        </div>

        {/* ✅ Modal is mounted ONLY when open (no invisible overlay blocking scroll) */}
        <Modal open={openItemModal} onClose={() => setOpenItemModal(false)}>
          {selectedItem && (
            <div className="flex flex-col items-center gap-3">
              <img
                decoding="async"
                loading="lazy"
                src={getItemImageUrl(selectedItem.itemcode)}
                alt={selectedItem.itemname}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = notavail;
                }}
                className="rounded-2xl max-h-[60vh] object-cover"
              />

              <div className="w-full px-2">
                <h4 className="text-xs text-neutral-600">
                  {selectedItem.itemcode}
                </h4>
                <p className="text-lg font-semibold">{selectedItem.itemname}</p>
                <div className="mt-10 flex items-center justify-center">
                  <PhilippinePeso className="h-4 w-4" />
                  <p>{selectedItem.price.toLocaleString()}</p>
                  <ShoppingBag
                    className="text-[#3cb54c] cursor-pointer ml-auto h-5 w-5"
                    onClick={() => {
                      setOpenItemModal(false);
                      handleAddToCart(selectedItem);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal open={openCartModal} onClose={() => setOpenCartModal(false)}>
          <ModalCart
            propshow={setOpenCartModal}
            selectedItem={selectedItem}
          ></ModalCart>
        </Modal>
      </div>
    </>
  );
}