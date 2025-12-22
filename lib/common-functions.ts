/**
 * Gets the asset URL with proper prefix for subdirectory deployments
 */
export const getAssetUrl = (assetPath: string) => {
  if (!assetPath) {
    return ""; // Return empty string for missing asset paths
  }
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath; // Return absolute URLs as is
  }
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";
  const cleanPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${assetPrefix}${cleanPath}`;
};
