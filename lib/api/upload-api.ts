import {
  ApiError,
  uploadFormData,
  type ApiRequestHeaders,
} from "@/lib/api/client";

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** POST /upload — multipart product image */
export async function uploadProductImage(
  headers: ApiRequestHeaders,
  localUri: string,
): Promise<string> {
  const filename = localUri.split("/").pop()?.split("?")[0] ?? "photo.jpg";
  const form = new FormData();
  form.append("file", {
    uri: localUri,
    name: filename,
    type: guessMimeType(localUri),
  } as unknown as Blob);

  const res = await uploadFormData<{
    success: boolean;
    data?: { url?: string };
  }>("/upload", form, headers);

  const url = res.data?.url?.trim();
  if (!url) {
    throw new ApiError("Upload response missing url", 502);
  }
  return url;
}
