import { getBackendApiBaseUrl } from "@/lib/backend-api";
import { isRecord } from "@/lib/backend-api";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    const backendUrl = getBackendApiBaseUrl();

    if (!backendUrl) {
      return Response.json(
        { message: "Backend API is not configured." },
        { status: 503 },
      );
    }

    const authResponse = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });

    const authBody: unknown = await authResponse.json();

    if (!authResponse.ok || !isRecord(authBody) || !isRecord(authBody.user)) {
      return Response.json(
        { message: "Invalid authentication." },
        { status: 401 },
      );
    }

    if (authBody.user.role !== "customer") {
      return Response.json(
        { message: "Customer access required." },
        { status: 403 },
      );
    }

    if (authBody.user.isBlocked === true) {
      return Response.json(
        { message: "Your account is blocked." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return Response.json(
        { message: "Please select an image." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { message: "Only JPG, PNG and WEBP images are allowed." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return Response.json(
        { message: "Image must be smaller than 5 MB." },
        { status: 400 },
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return Response.json(
        { message: "Image upload is not configured." },
        { status: 503 },
      );
    }

    const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const uploadData = new URLSearchParams();
    uploadData.set("image", imageBase64);

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
        cache: "no-store",
      },
    );

    const uploadBody: unknown = await uploadResponse.json();

    if (
      !uploadResponse.ok ||
      !isRecord(uploadBody) ||
      !isRecord(uploadBody.data) ||
      typeof uploadBody.data.url !== "string" ||
      !uploadBody.data.url.startsWith("https://")
    ) {
      return Response.json(
        { message: "Image upload failed. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({ imageUrl: uploadBody.data.url });
  } catch {
    return Response.json(
      { message: "An unexpected error occurred during image upload." },
      { status: 500 },
    );
  }
}
