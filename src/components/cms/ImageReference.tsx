"use client";

import Image from "next/image";
import { useContext, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, mediaService } from "@/services/mediaService";
import { UploadActivity } from "./UploadActivity";
import type { CustomFieldRender } from "@puckeditor/core";
import { cmsMediaKeyFromUrl, resolveCmsImage } from "./approvedContent";

export default function ImageReference({ id, name, value, onChange, readOnly }: Parameters<CustomFieldRender<string>>[0]) {
  const activity = useContext(UploadActivity);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const preview = resolveCmsImage(value || "");
  async function upload(file: File) {
    activity(1);
    setUploading(true);
    setError("");
    try {
      const result = await mediaService.uploadImage(file, "CMS_PAGE");
      const key = result.data?.key;
      if (result.success && key && /^media:[0-9a-fA-F]{24}$/.test(key)) onChange(key);
      else setError(result.message || "Image upload failed.");
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      activity(-1);
    }
  }
  const invalid = Boolean(value && !resolveCmsImage(value));
  return (
    <div className="grid gap-1">
      {preview && <Image src={preview} alt="Selected image preview" width={240} height={140} unoptimized className="h-24 w-auto object-contain" />}
      <label htmlFor={id}>Image reference</label>
      <input
        id={id}
        name={name}
        value={value ?? ""}
        disabled={readOnly || uploading}
        onChange={(event) => {
          const reference = event.currentTarget.value;
          onChange(cmsMediaKeyFromUrl(reference.trim()) ?? reference);
        }}
        aria-describedby={id + "-hint"}
        aria-invalid={invalid}
        className="w-full rounded border border-gray-300 px-2 py-1"
      />
      <small id={id + "-hint"}>
        {invalid ? "Enter a valid image reference." : "Use a path under /images/, a media:<id> reference, or a CMS image URL from the media subdomain."}
      </small>
      <label>Replace image
        <input type="file" accept={ACCEPTED_IMAGE_TYPES} disabled={readOnly || uploading} onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void upload(file);
        }} />
      </label>
      {uploading && <small role="status">Uploading image…</small>}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
