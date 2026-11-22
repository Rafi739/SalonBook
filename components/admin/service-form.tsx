/* eslint-disable react-hooks/set-state-in-effect -- Synchronizes form fields when editing a service. */
"use client";

import {
  ImagePlus,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { getJWTToken } from "@/lib/auth-client";
import {
  createAdminService,
  updateAdminService,
  type AdminService,
  type AdminServiceInput,
  type AdminServiceStatus,
} from "@/lib/admin-services";
import type { ServiceCategory } from "@/lib/services";

interface ServiceFormProps {
  service?: AdminService | null;
  onSaved: () => void;
  onCancel: () => void;
}

const categoryMap: Record<ServiceCategory, AdminServiceInput["category"]> = {
  mens: "Men's",
womens: "Women's",
  unisex: "Unisex",
};

export function ServiceForm({
  service,
  onSaved,
  onCancel,
}: ServiceFormProps) {
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("unisex");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<AdminServiceStatus>("active");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setServiceName(service?.name ?? "");
    setCategory(service?.category ?? "unisex");
    setDescription(service?.description ?? "");
    setPrice(service ? String(service.price) : "");
    setDuration(service ? String(service.durationMinutes) : "");
    setImage(service?.imageUrl ?? "");
    setStatus(service?.status ?? "active");
    setError(null);
    setSuccess(null);
  }, [service]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setSuccess(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const token = await getJWTToken();
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/services/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        cache: "no-store",
      });

      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("imageUrl" in result) ||
        typeof result.imageUrl !== "string"
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Image upload failed.";

        throw new Error(message);
      }

      setImage(result.imageUrl);
      setSuccess("Image uploaded successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!image.trim()) {
      setError("Please upload a service image.");
      return;
    }

    const numericPrice = Number(price);
    const numericDuration = Number(duration);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isSafeInteger(numericDuration) || numericDuration <= 0) {
      setError("Duration must be a positive whole number of minutes.");
      return;
    }

    const input: AdminServiceInput = {
      serviceName: serviceName.trim(),
      category: categoryMap[category],
      description: description.trim(),
      price: numericPrice,
      duration: numericDuration,
      image: image.trim(),
      status,
    };

    setIsSaving(true);

    try {
      if (service) {
        await updateAdminService(service.id, input);
        setSuccess("Service updated successfully.");
      } else {
        await createAdminService(input);
        setSuccess("Service created successfully.");
      }

      onSaved();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save service.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">
            {service ? "Update Service" : "Add New Service"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the service details below.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving || isUploading}
          aria-label="Close service form"
          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100"
        >
          <X size={19} />
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Service Name
            </span>
            <input
              required
              maxLength={100}
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="e.g. Hair Styling"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Category
            </span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ServiceCategory)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400"
            >
              <option value="mens">Men&apos;s</option>
              <option value="womens">Women&apos;s</option>
              <option value="unisex">Unisex</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Price
            </span>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter service price"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Duration (minutes)
            </span>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="e.g. 45"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-700">
            Description
          </span>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the salon service..."
            className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400"
          />
        </label>

        <div className="space-y-3">
          <span className="block text-sm font-medium text-gray-700">
            Service Image
          </span>

          {image && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Service preview"
                className="h-40 w-48 rounded-xl border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setImage("")}
                disabled={isUploading || isSaving}
                className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow transition hover:bg-red-50"
                aria-label="Remove selected image"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-5 py-8 text-center transition hover:border-rose-300 hover:bg-rose-50/30">
            {isUploading ? (
              <LoaderCircle size={25} className="animate-spin text-rose-600" />
            ) : (
              <ImagePlus size={25} className="text-gray-400" />
            )}

            <span className="text-sm font-medium text-gray-700">
              {isUploading ? "Uploading image..." : "Choose service image"}
            </span>
            <span className="text-xs text-gray-400">
              JPG, PNG or WEBP · Maximum 5 MB
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={isUploading || isSaving}
              className="sr-only"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-700">
            Service Status
          </span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as AdminServiceStatus)
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving || isUploading}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {isSaving
              ? "Saving..."
              : service
                ? "Update Service"
                : "Create Service"}
          </button>
        </div>
      </form>
    </section>
  );
}




/* eslint-enable react-hooks/set-state-in-effect */
