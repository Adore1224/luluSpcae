const musicFiles = import.meta.glob(
  "../assets/music/*.{mp3,m4a,ogg,wav}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const getTrackTitle = (path) => {
  const fileName = path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "Untitled";
  return decodeURIComponent(fileName)
    .replace(/^\d+\s*[-_.]\s*/, "")
    .replace(/[_-]+/g, " ")
    .trim();
};

export const musicTracks = Object.entries(musicFiles)
  .sort(([first], [second]) => first.localeCompare(second, "zh-CN"))
  .map(([path, source], index) => ({
    id: path,
    source,
    title: getTrackTitle(path),
    number: String(index + 1).padStart(2, "0"),
  }));
