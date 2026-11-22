import { NextResponse } from "next/server";
import {
  getBackendApiBaseUrl,
  isRecord,
} from "@/lib/backend-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication is required." },
        { status: 401 },
      );
    }

    const backendUrl = getBackendApiBaseUrl();

    if (!backendUrl) {
      return NextResponse.json(
        { message: "Backend API is not configured." },
        { status: 500 },
      );
    }

    const authResponse = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: { Authorization: authorization },
      cache: "no-store",
    });

    const authBody: unknown = await authResponse.json().catch(() => null);

    if (!authResponse.ok || !isRecord(authBody) || !isRecord(authBody.user)) {
      return NextResponse.json(
        { message: "Your session is invalid or expired." },
        { status: 401 },
      );
    }

    if (authBody.user.role !== "admin") {
      return NextResponse.json(
        { message: "Only administrators can upload service images." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { message: "Please select an image." },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPG, PNG and WEBP images are allowed." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Image size must not exceed 5 MB." },
        { status: 400 },
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Image upload is not configured." },
        { status: 500 },
      );
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
        cache: "no-store",
      },
    );

    const result: unknown = await uploadResponse.json().catch(() => null);

    if (
      !uploadResponse.ok ||
      !isRecord(result) ||
      result.success !== true ||
      !isRecord(result.data) ||
      typeof result.data.url !== "string" ||
      !result.data.url.startsWith("https://")
    ) {
      return NextResponse.json(
        { message: "Image upload failed. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      imageUrl: result.data.url,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to upload the image right now." },
      { status: 500 },
    );
  }
}
