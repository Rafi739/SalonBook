"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Camera, LoaderCircle, Save, UserRound } from "lucide-react";
import {
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfile,
} from "@/lib/customer-profile";
import { getJWTToken } from "@/lib/auth-client";
import { isRecord } from "@/lib/backend-api";
import Image from "next/image";

export default function CustomerProfilePageContent() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getCustomerProfile();
      setProfile(result);
      setName(result.name);
      setImage(result.image);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadProfile();
  }, [loadProfile]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setError("Only JPG, PNG and WEBP images are supported.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const token = await getJWTToken();
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/customer/profile/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const body: unknown = await response.json();

      if (!response.ok || !isRecord(body) || typeof body.imageUrl !== "string") {
        throw new Error(
          isRecord(body) && typeof body.message === "string"
            ? body.message
            : "Image upload failed.",
        );
      }

      setImage(body.imageUrl);
      setSelectedFile(null);
      setMessage("Image uploaded. Save your profile to apply it.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateCustomerProfile({
        name: name.trim(),
        image,
      });

      setProfile(updated);
      setName(updated.name);
      setImage(updated.image);
      setMessage("Your profile has been updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Loading your profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error || "Profile information is unavailable."}
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="ml-2 font-semibold underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
          Account settings
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and profile picture.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-7 sm:flex-row">
   {image ? (
  <Image
    src={image}
    alt="Customer profile"
    width={96}
    height={96}
    unoptimized
    className="size-24 rounded-full border-4 border-rose-50 object-cover"
  />
) : (
  <div className="flex size-24 items-center justify-center rounded-full bg-rose-50 text-rose-600">
    <UserRound className="size-10" />
  </div>
)}
          <div className="text-center sm:text-left">
            <h2 className="font-semibold text-slate-900">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Customer account</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Camera className="size-4" />
                Choose image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
              </label>

              <button
                type="button"
                onClick={() => void handleUpload()}
                disabled={!selectedFile || isUploading}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage("");
                    setSelectedFile(null);
                    setMessage("Profile picture will be removed when you save changes.");
                    setError("");
                  }}
                  disabled={isSaving || isUploading}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove picture
                </button>
              )}
            </div>

            {selectedFile && (
              <p className="mt-2 text-xs text-slate-500">{selectedFile.name}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="customer-name" className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="customer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <label htmlFor="customer-email" className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="customer-email"
              value={profile.email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              Email address cannot be changed here.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Account role
            </label>
            <input
              value="Customer"
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => {
              setName(profile.name);
              setImage(profile.image);
              setSelectedFile(null);
              setError("");
              setMessage("");
            }}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
