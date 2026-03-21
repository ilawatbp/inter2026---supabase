import { useState } from "react";
import { supabase } from "../../lib/supabase";

const BUCKET = "product-images";
const FOLDER = "items";

function sanitizeItemCode(name) {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

function getBaseName(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? fileName : fileName.slice(0, lastDot);
}

function getExtension(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot + 1).toLowerCase();
}

async function createSignedPreview(path) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60, {
      transform: {
        width: 500,
        height: 500,
        quality: 80,
        resize: "contain",
      },
    });

  if (error) throw error;
  return data.signedUrl;
}

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");
    setResults([]);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in.");

      const uploaded = [];

      for (const file of files) {
        const originalName = file.name;

        try {
          const itemCodeRaw = getBaseName(originalName);
          const ext = getExtension(originalName);

          if (!itemCodeRaw || !ext) {
            uploaded.push({
              originalName,
              itemCode: "",
              status: "error",
              message: "Invalid filename. Use ITEMCODE.ext",
            });
            continue;
          }

          const itemCode = sanitizeItemCode(itemCodeRaw);
          const finalFileName = `${itemCode}.${ext}`;
          const filePath = `${FOLDER}/${finalFileName}`;

          // Check if DB already has a record for this item_code
          const { data: existingRow, error: existingRowError } = await supabase
            .from("item_images")
            .select("id, image_path, content_type")
            .eq("item_code", itemCode)
            .maybeSingle();

          if (existingRowError) throw existingRowError;

          let storagePath = filePath;

          if (existingRow?.image_path) {
            // Replace existing file in private bucket
            const { data: updateData, error: updateError } = await supabase.storage
              .from(BUCKET)
              .update(existingRow.image_path, file, {
                contentType: file.type,
                upsert: true,
              });

            if (updateError) throw updateError;
            storagePath = updateData.path;
          } else {
            // First upload
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(BUCKET)
              .upload(filePath, file, {
                contentType: file.type,
                upsert: false,
              });

            if (uploadError) throw uploadError;
            storagePath = uploadData.path;
          }

          // Save or update DB metadata
          const { error: dbError } = await supabase
            .from("item_images")
            .upsert(
              {
                item_code: itemCode,
                image_path: storagePath,
                original_file_name: originalName,
                content_type: file.type,
                uploaded_by: user.id,
              },
              {
                onConflict: "item_code",
              }
            );

          if (dbError) throw dbError;

          const signedUrl = await createSignedPreview(storagePath);

          uploaded.push({
            originalName,
            itemCode,
            path: storagePath,
            signedUrl,
            status: "success",
            message: existingRow ? "Image replaced successfully" : "Image uploaded successfully",
          });
        } catch (fileErr) {
          uploaded.push({
            originalName,
            itemCode: "",
            status: "error",
            message: fileErr.message || "Upload failed",
          });
        }
      }

      setResults(uploaded);
    } catch (err) {
      console.error(err);
      setError(err.message || "Bulk upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
      />

      {uploading && <p>Uploading images...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((item, index) => (
            <div
              key={`${item.originalName}-${index}`}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <p><strong>Original:</strong> {item.originalName}</p>
              <p><strong>Item Code:</strong> {item.itemCode || "-"}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Message:</strong> {item.message}</p>
              {item.path && (
                <p className="break-all">
                  <strong>Path:</strong> {item.path}
                </p>
              )}

              {item.signedUrl && (
                <img
                  src={item.signedUrl}
                  alt={item.itemCode || item.originalName}
                  className="w-60 h-60 object-contain rounded-lg border"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}