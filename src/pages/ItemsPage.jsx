import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag, PhilippinePeso } from "lucide-react";

import Header from "../components/Header";
import Modal from "../components/Modal"; // the “proper modal” component (portal + unmount when closed)
import notavail from "../assets/notavail.webp";
import ModalCart from "../components/ModalCart";

const API_URL = import.meta.env.VITE_API_URL ?? "http://192.168.1.100:3001";

/** ✅ Card extracted + memoized to reduce re-renders */
const ItemCard = memo(function ItemCard({ itm, onOpen, onAddToCart }) {
  return (
    <div
      onClick={() => onOpen(itm)}
      className="
        rounded-2xl overflow-hidden flex flex-col gap-2
        w-full md:w-[calc(50%-10px)] lg:w-[calc(33%-10px)] xl:w-[calc(25%-20px)] 2xl:w-[calc(20%-20px)]
        mb-10 relative
      "
      style={{ contentVisibility: "auto", containIntrinsicSize: "300px 420px" }}
    >
      {/* Fixed height prevents layout shifting while images load */}
      <div className="bg-[#c8c6c6] rounded-2xl overflow-hidden shadow-md"> {/*add height if you want fix height every card  h-64 */}
        <img
          decoding="async"
          loading="lazy"
          src={`${API_URL}/images/${itm.ItemCode}.webp`}
          alt={itm.ItemName}
          onError={(e) => {
            const img = e.currentTarget;

            // retry once
            if (!img.dataset.retried) {
              img.dataset.retried = "1";
              img.src = `${API_URL}/images/${itm.ItemCode}.webp?retry=${Date.now()}`;
              return;
            }
            img.onerror = null;
            img.src = notavail;
          }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="rounded-2xl px-6 flex flex-col gap-1 mb-2">
        <p className="truncate">{itm.ItemName}</p>

        <div className="flex items-center gap-1">
          <PhilippinePeso className="h-3 w-3" />
          <p>{itm.Price.toLocaleString()}</p>
        </div>
        <div
          className="flex justify-end items-center"
          onClick={(e) => e.stopPropagation()}
        >
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

  // ✅ One “effective” search value: query OR group
  const requestUrl = useMemo(() => {
    if (query) return `${API_URL}/api/db2/items?q=${encodeURIComponent(query)}`;
    if (groupQuery) return `${API_URL}/api/db2/items?group=${encodeURIComponent(groupQuery)}`;
    return null;
  }, [query, groupQuery]);

  useEffect(() => {
    const controller = new AbortController();
    if (!requestUrl) {
      setItems([]);
      return;
    }

    (async () => {
      try {
        const response = await fetch(requestUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("failed api");
        setItems(await response.json());
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      }
    })();

    return () => controller.abort();
  }, [requestUrl]);

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
    <div className="h-dvh w-full overflow-hidden flex flex-col">
      <Header />

      {/* ✅ Only the list scrolls (header stays stable) */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="w-full px-20 py-4 pt-36 flex gap-4 flex-wrap justify-evenly">
          {items.map((itm) => (
            <ItemCard
              key={itm.ItemCode}
              itm={itm}
              onOpen={handleOpen}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {/* ✅ Modal is mounted ONLY when open (no invisible overlay blocking scroll) */}
      <Modal open={openItemModal} onClose={() => setOpenItemModal(false)}>
        {selectedItem && (
          <div className="flex flex-col items-center gap-3">
            <img
              decoding="async"
              loading="lazy"
              src={`${API_URL}/images/${selectedItem.ItemCode}.webp`}
              alt={selectedItem.ItemName}
              onError={(e) => {
                const img = e.currentTarget;

                // retry once
                if (!img.dataset.retried) {
                  img.dataset.retried = "1";
                  img.src = `${API_URL}/images/${selectedItem.ItemCode}.webp?retry=${Date.now()}`;
                  return;
                }
                img.onerror = null;
                img.src = notavail;
              }}
              className="rounded-2xl max-h-[60vh] object-cover"
            />
            <div className="w-full px-2">
              <h4 className="text-xs text-neutral-600">{selectedItem.ItemCode}</h4>
              <p className="text-lg font-semibold">{selectedItem.ItemName}</p>
              <div className="mt-10 flex items-center justify-center">
                <PhilippinePeso className="h-4 w-4" />
                <p>{selectedItem.Price.toLocaleString()}</p>
                <ShoppingBag
                  className="text-[#3cb54c] cursor-pointer ml-auto h-5 w-5"
                  onClick={() => { setOpenItemModal(false); handleAddToCart(selectedItem) }}
                />
              </div>

            </div>
          </div>
        )}
      </Modal>

      <Modal open={openCartModal} onClose={() => setOpenCartModal(false)}>
        <ModalCart propshow={setOpenCartModal} selectedItem={selectedItem}></ModalCart>
      </Modal>
    </div>
  );
}