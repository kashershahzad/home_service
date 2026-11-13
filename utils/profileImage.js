import * as ImageManipulator from "expo-image-manipulator";

/** True for remote http(s) or already-persisted data URIs. */
export function isRemoteOrDataUri(uri) {
  if (!uri || typeof uri !== "string") return false;
  return /^(https?:\/\/|data:image\/)/i.test(uri.trim());
}

/**
 * Convert a local picker URI into a persistable profileImageUrl.
 * Remote/data URIs are returned as-is. Local files become a compressed data URI
 * so the image still loads after app restart (file:// paths expire).
 */
export async function toPersistableProfileImage(uri) {
  if (!uri || typeof uri !== "string") return null;
  const trimmed = uri.trim();
  if (!trimmed) return null;
  if (isRemoteOrDataUri(trimmed)) return trimmed;

  const result = await ImageManipulator.manipulateAsync(
    trimmed,
    [{ resize: { width: 720 } }],
    {
      compress: 0.72,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!result?.base64) {
    throw new Error("Could not process profile photo.");
  }
  return `data:image/jpeg;base64,${result.base64}`;
}

/** Normalize API / local values for <Image source={{ uri }}>. */
export function resolveAvatarUri(uri) {
  if (!uri || typeof uri !== "string") return null;
  const trimmed = uri.trim();
  if (!trimmed) return null;
  if (isRemoteOrDataUri(trimmed) || trimmed.startsWith("file:")) return trimmed;
  if (trimmed.startsWith("/")) {
    return `https://api.itshomely.com${trimmed}`;
  }
  return trimmed;
}
