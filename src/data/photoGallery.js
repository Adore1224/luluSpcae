const pictureModules = import.meta.glob(
  "../assets/picture/photo/*.{avif,jpeg,jpg,png,webp}",
  { eager: true, import: "default", query: "?url" },
);

export const pictureGallery = Object.entries(pictureModules)
  .sort(([first], [second]) => first.localeCompare(second, "zh-CN"))
  .map(([path, thumbnail], index) => ({
    id: `picture-${index + 1}`,
    name: path.split("/").pop() ?? `picture-${index + 1}`,
    displayName: `照片 ${String(index + 1).padStart(2, "0")}`,
    type: "album",
    size: "image",
    modified: "",
    tags: [],
    thumbnail,
  }));
