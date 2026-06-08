import { useState } from "react";
import { supabase } from "../../lib/supabase";

const BUCKET_NAME = "prestige-images";

export default function AdminProductImages() {
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [message, setMessage] = useState("");

  const selectedItemCode = selectedItem?.itemcode || "";

  async function searchItems() {
    const keyword = searchText.trim();

    if (!keyword) {
      setItems([]);
      setMessage("Please enter itemcode or item name.");
      return;
    }

    setIsSearching(true);
    setMessage("");

    const { data, error } = await supabase
      .from("items")
      .select("itemcode, itemname, price")
      .or(`itemcode.ilike.%${keyword}%,itemname.ilike.%${keyword}%`)
      .limit(20);

    if (error) {
      setMessage(error.message);
      setItems([]);
      setIsSearching(false);
      return;
    }

    setItems(data || []);
    setIsSearching(false);
  }

  async function loadProductImages(itemcode) {
    if (!itemcode) {
      setImages([]);
      return;
    }

    setIsLoadingImages(true);
    setMessage("");

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("itemcode", itemcode)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setMessage(error.message);
      setImages([]);
      setIsLoadingImages(false);
      return;
    }

    const imagesWithPublicUrls = (data || []).map((img) => {
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(img.image_url);

      return {
        ...img,
        publicUrl: publicData.publicUrl,
      };
    });

    setImages(imagesWithPublicUrls);
    setIsLoadingImages(false);
  }

  async function handleSelectItem(item) {
    setSelectedItem(item);
    setItems([]);
    setSearchText(`${item.itemcode} - ${item.itemname}`);
    setFiles([]);
    await loadProductImages(item.itemcode);
  }

  async function handleUpload() {
    if (!selectedItemCode) {
      setMessage("Please search and select an item first.");
      return;
    }

    if (files.length === 0) {
      setMessage("Please select image first.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    const uploadedPaths = [];

    try {
      const { data: existingImages, error: existingError } = await supabase
        .from("product_images")
        .select("id")
        .eq("itemcode", selectedItemCode);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const startingSortOrder = (existingImages?.length || 0) + 1;
      const rowsToInsert = [];

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const fileExt = file.name.split(".").pop().toLowerCase();
        const allowedExt = ["jpg", "jpeg", "png", "webp"];

        if (!allowedExt.includes(fileExt)) {
          throw new Error("Only JPG, PNG, and WEBP files are allowed.");
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Each image must be 5MB or below.");
        }

        const safeItemCode = selectedItemCode.replace(/[^a-zA-Z0-9-_]/g, "");
        const sortOrder = startingSortOrder + index;
        const fileName = `${sortOrder}-${Date.now()}.${fileExt}`;
        const filePath = `${safeItemCode}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        uploadedPaths.push(filePath);

        rowsToInsert.push({
          itemcode: selectedItemCode,
          image_url: filePath,
          sort_order: sortOrder,
        });
      }

      const { error: insertError } = await supabase
        .from("product_images")
        .insert(rowsToInsert);

      if (insertError) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
        }

        throw new Error(insertError.message);
      }

      setFiles([]);
      setMessage("Images uploaded successfully.");
      await loadProductImages(selectedItemCode);
    } catch (error) {
      setMessage(error.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(image) {
    const confirmDelete = window.confirm("Delete this image?");

    if (!confirmDelete) return;

    setMessage("");

    try {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([image.image_url]);

      if (storageError) {
        throw new Error(storageError.message);
      }

      const { error: dbError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", image.id);

      if (dbError) {
        throw new Error(dbError.message);
      }

      setMessage("Image deleted successfully.");
      await loadProductImages(selectedItemCode);
    } catch (error) {
      setMessage(error.message || "Delete failed.");
    }
  }

  function handleClearSelection() {
    setSearchText("");
    setItems([]);
    setSelectedItem(null);
    setFiles([]);
    setImages([]);
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Prestige Product Image Upload
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Search itemcode, upload multiple images, and manage product gallery.
          </p>

          <div className="mt-6">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Search Item Code / Item Name
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setSelectedItem(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchItems();
                }}
                placeholder="Example: 00016596"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-black"
              />

              <button
                type="button"
                onClick={searchItems}
                disabled={isSearching}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="rounded-lg border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Clear
              </button>
            </div>

            {items.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
                {items.map((item) => (
                  <button
                    key={item.itemcode}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="block w-full border-b border-neutral-100 px-4 py-3 text-left hover:bg-neutral-50"
                  >
                    <p className="text-sm font-semibold text-neutral-900">
                      {item.itemcode}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {item.itemname}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedItem && (
            <div className="mt-6 rounded-xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Selected Item</p>
              <p className="mt-1 font-semibold text-neutral-900">
                {selectedItem.itemcode}
              </p>
              <p className="text-sm text-neutral-600">
                {selectedItem.itemname}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-6">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Select Images
            </label>

            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm"
            />

            {files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-700">
                  Selected files:
                </p>

                <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedItemCode}
              className="mt-5 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Images"}
            </button>

            {message && (
              <p className="mt-4 rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            Existing Images
          </h2>

          {!selectedItemCode && (
            <p className="mt-3 text-sm text-neutral-500">
              Search and select an item to view uploaded images.
            </p>
          )}

          {isLoadingImages && (
            <p className="mt-3 text-sm text-neutral-500">Loading images...</p>
          )}

          {!isLoadingImages && selectedItemCode && images.length === 0 && (
            <p className="mt-3 text-sm text-neutral-500">
              No images uploaded for this item yet.
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                <div className="aspect-square bg-neutral-100">
                  {image.publicUrl ? (
                    <img
                      src={image.publicUrl}
                      alt={image.itemcode}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      Cannot load image
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="truncate text-xs text-neutral-500">
                    {image.image_url}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Sort: {image.sort_order}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    className="mt-3 w-full rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}