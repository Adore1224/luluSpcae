export function matchSearch(value, ...fields) {
  return fields.join(' ').toLowerCase().includes(value.trim().toLowerCase());
}
export const notePaper = { width: 800, height: 450, maxTextX: 600, maxTextY: 360, maxBlocks: 24, maxText: 15000 };

export function noteTextBlocks(item) {
  return item?.textBlocks ?? (item?.body ? [{ x: 24, y: 24, text: item.body }] : []);
}
