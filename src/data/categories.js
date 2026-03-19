// AUTO LOAD ALL IMAGES
const rawImages = import.meta.glob("../assets/categories/*.{jpg,png,jpeg}", {
  eager: true,
  import: "default"
});

const categoryImages = Object.fromEntries(
  Object.entries(rawImages).map(([path, module]) => {
    const fileName = path.split("/").pop().split(".")[0];
    return [fileName, module];
  })
);

const categories = [
  {
    cname: "auxiliary Lighting",
    image: categoryImages["auxiliary"],
    subcategories: [
      { id: 21, name: "accessories" },
      { id: 64, name: "electrical systems" },
      { id: 19, name: "uvc germicidal lamps" }
    ]
  },
  {
    cname: "decorative Lighting",
    image: categoryImages["decorative"],
    subcategories: [
      { id: 22, name: "bestsellers" },
      { id: 24, name: "ceiling lamp set" },
      { id: 61, name: "ceiling fans" },
      { id: 25, name: "crystals" },
      { id: 27, name: "droplights" },
      { id: 31, name: "floor and table lamps" },
      { id: 17, name: "furniture lamps" },
      { id: 32, name: "hanging lamps" },
      { id: 45, name: "low ceiling lamps" },
      { id: 59, name: "vanity lamps" },
      { id: 60, name: "wall lamps" }
    ]
  },
  {
    cname: "designer Lighting",
    image: categoryImages["designer"],
    subcategories: [
      { id: 18, name: "gabi peretto" }
    ]
  },
  {
    cname: "general Lighting",
    image: categoryImages["general"],
    subcategories: [
      { id: 23, name: "bulbs" },
      { id: 26, name: "downlight" },
      { id: 38, name: "led ropelight" },
      { id: 39, name: "led slim pinlight" },
      { id: 41, name: "led striplight" },
      { id: 42, name: "led and t8 lights" },
      { id: 44, name: "lighting fixtures" },
      { id: 58, name: "tracklights and spotlights" }
    ]
  },
  {
    cname: "industrial Lighting",

    image: categoryImages["industrial"],
    subcategories: [
      { id: 37, name: "led floodlights" },
      { id: 51, name: "roadlights" }
    ]
  },
  {
    cname: "outdoor Lighting",
    image: categoryImages["outdoor"],
    subcategories: [
      { id: 50, name: "era solar lamps" },
      { id: 33, name: "inground lights" },
      { id: 49, name: "resin lamps" },
      { id: 55, name: "submersible lights" }
    ]
  },
  {
    cname: "professional Lighting",
    image: categoryImages["professional"],
    subcategories: [
      { id: 36, name: "led downlight" },
      { id: 40, name: "led spotlights" },
      { id: 43, name: "led tracklights" }
    ]
  }
];

export default categories;