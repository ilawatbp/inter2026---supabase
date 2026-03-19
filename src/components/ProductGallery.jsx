import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ChevronLeft} from 'lucide-react';

export default function ProductGallery({ images = [], alt = "Product image" }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [mainRef, mainApi] = useEmblaCarousel({ loop: false });
    const [thumbRef, thumbApi] = useEmblaCarousel({
        dragFree: true,
        containScroll: "trimSnaps",
    });

    const onSelect = useCallback(() => {
        if (!mainApi) return;
        const i = mainApi.selectedScrollSnap();
        setSelectedIndex(i);
        thumbApi?.scrollTo(i);
    }, [mainApi, thumbApi]);

    useEffect(() => {
        if (!mainApi) return;
        onSelect();
        mainApi.on("select", onSelect);
        mainApi.on("reInit", onSelect);
        return () => {
            mainApi.off("select", onSelect);
            mainApi.off("reInit", onSelect);
        };
    }, [mainApi, onSelect]);

    const scrollTo = useCallback(
        (i) => mainApi?.scrollTo(i),
        [mainApi]
    );

    if (!images.length) return null;

    return (
        <div className="w-full max-w-xl">
            {/* MAIN */}
            <div className="group relative rounded-2xl overflow-hidden bg-gray-100">
                <div ref={mainRef} className="overflow-hidden">
                    <div className="flex">
                        {images.map((src, i) => (
                            <div key={src + i} className="flex-[0_0_100%]">
                                <div className="aspect-[3/4] w-full">
                                    <img
                                        src={src}
                                        alt={`${alt} ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        loading={i === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Arrows */}
                <button
                    type="button"
                    onClick={() => mainApi?.scrollPrev()}
                    className="absolute left-8 top-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-50 group-hover:left-3
                    transition-all duration-300
                    p-2 rounded-full "
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>

                <button
                    type="button"
                    onClick={() => mainApi?.scrollNext()}
                    className="absolute right-8 top-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-50 group-hover:right-3
                    transition-all duration-300
                    p-2 rounded-full "
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            </div>

            {/* THUMBS */}
            <div className="mt-3">
                <div ref={thumbRef} className="overflow-hidden">
                    <div className="flex gap-2">
                        {images.map((src, i) => {
                            const active = i === selectedIndex;
                            return (
                                <button
                                    key={`thumb-${src}-${i}`}
                                    type="button"
                                    onClick={() => scrollTo(i)}
                                    className={[
                                        "shrink-0",                 // ✅ don’t compress
                                        "h-16 w-12 md:h-16 md:w-16", // ✅ fixed size (adjust)
                                        "rounded-xl overflow-hidden",
                                        "border-2",
                                        active ? "border-green-500" : "border-transparent",
                                        "bg-gray-100",
                                    ].join(" ")}
                                >
                                    <img
                                        src={src}
                                        alt={`Thumbnail ${i + 1}`}
                                        className="h-full w-full object-cover"  // ✅ key line
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}