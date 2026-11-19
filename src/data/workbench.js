export function matchSearch(value, ...fields) {
  return fields.join(' ').toLowerCase().includes(value.trim().toLowerCase());
}
export const notePaper = { width: 800, height: 450, maxTextX: 600, maxTextY: 360, maxBlocks: 24, maxText: 15000 };
export const shareLimits = { pdf: 25 * 1024 * 1024, md: 1024 * 1024 };
export const agentReferenceLimits = { count: 3, bytes: 10 * 1024 * 1024, chars: 8000, totalChars: 18000, pdfPages: 20 };

export const projectTypes = ['企业', '个人'];

export function resolveProjectType({ id, projectType }) {
  return projectTypes.includes(projectType) ? projectType : id === 'zigbee' ? '个人' : '企业';
}

export function noteTextBlocks(item) {
  return item?.textBlocks ?? (item?.body ? [{ x: 24, y: 24, text: item.body }] : []);
}
