import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children }) {

  // lock body scroll
  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}