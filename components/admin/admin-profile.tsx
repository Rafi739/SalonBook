"use client";

import { Camera, LoaderCircle, Pencil, Save, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { getJWTToken } from "@/lib/auth-client";
import {
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from "@/lib/admin-profile";

export default function AdminProfilePageContent() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getAdminProfile();
      setProfile(result);
      setName(result.name);
      setImage(result.image);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads initial data after mounting.
    void loadProfile();
  }, [loadProfile]);

  function cancelEditing() {
    if (profile) {
      setName(profile.name);
      setImage(profile.image);
    }
    setMessage("");
    setError("");
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > 100) {
      setError("Name must contain between 1 and 100 characters.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateAdminProfile({
        name: trimmedName,
        ...(image.trim() !== profile.image ? { image: image.trim() } : {}),
      });

      setProfile(updated);
      setName(updated.name);
      setImage(updated.image);
      setIsEditing(false);
      setMessage("Your profile has been updated successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profile update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const token = await getJWTToken();
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/services/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const body: unknown = await response.json();

      if (!response.ok || typeof body !== "object" || body === null || !("imageUrl" in body) || typeof body.imageUrl !== "string") {
        throw new Error(
          typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
            ? body.message
            : "Image upload failed.",
        );
      }

      setImage(body.imageUrl);
      setIsEditing(true);
      setMessage("Image uploaded. Save changes to apply it to your profile.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        Loading admin profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 text-center">
        <p role="alert" className="text-sm text-destructive">{error || "Profile unavailable."}</p>
        <button onClick={() => void loadProfile()} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Try again
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Account settings</p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your administrator account information.
        </p>
      </header>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 border-b border-border/80 pb-6 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name || "Admin profile"} className="size-20 rounded-full border border-border object-cover" />
            ) : (
              <UserAvatar name={name} email={profile.email} className="size-20 text-xl" />
            )}

            {isEditing && (
              <label className="absolute -bottom-1 -right-1 flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm" title="Upload profile image">
                {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-heading text-xl font-semibold">
              {profile.name || "Administrator"}
            </h2>
            <p className="mt-1 break-all text-sm text-muted-foreground">{profile.email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="size-3.5" />
              Administrator
            </span>
            {isEditing && image && (
              <button
                type="button"
                onClick={() => {
                  setImage("");
                  setMessage("Profile picture will be removed when you save changes.");
                  setError("");
                }}
                disabled={isSaving || isUploading}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Remove picture
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-profile-name" className="mb-2 block text-sm font-medium">Full name</label>
              <input
                id="admin-profile-name"
                className="auth-field"
                value={name}
                maxLength={100}
                readOnly={!isEditing}
                required
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  setError("");
                  setMessage("");
                }}
              />
            </div>

            <div>
              <label htmlFor="admin-profile-email" className="mb-2 block text-sm font-medium">Email address</label>
              <input
                id="admin-profile-email"
                className="auth-field opacity-70"
                type="email"
                value={profile.email}
                readOnly
                disabled
              />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Profile image URL</label>
            <input
              className="auth-field"
              type="url"
              value={image}
              readOnly={!isEditing}
              placeholder="https://example.com/profile.jpg"
              onChange={(event) => {
                setImage(event.currentTarget.value);
                setError("");
                setMessage("");
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP. Maximum upload size 5 MB.</p>
          </div>

          <div className="grid gap-4 rounded-xl bg-secondary/40 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Account role</p>
              <p className="mt-1 font-semibold">Administrator</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="mt-1 font-semibold">
                {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          {message && <p role="status" className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">{message}</p>}

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            {isEditing ? (
              <>
                <button type="submit" disabled={isSaving || isUploading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={cancelEditing} disabled={isSaving || isUploading} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted disabled:opacity-50">
                  <X className="size-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setError(""); setMessage(""); setIsEditing(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted">
                <Pencil className="size-4" />
                Edit profile
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
