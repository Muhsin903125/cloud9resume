/**
 * Gets the asset URL with proper prefix for subdirectory deployments
 */
export const getAssetUrl = (assetPath: string) => {
  if (!assetPath) {
    return "";
  }
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  // Use NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL as prefix
  const rawPrefix =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  const assetPrefix = rawPrefix.replace(/\/$/, ""); // Remove trailing slash if any

  const cleanPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${assetPrefix}${cleanPath}`;
};
