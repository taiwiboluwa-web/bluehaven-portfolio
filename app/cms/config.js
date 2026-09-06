export const DEFAULT_LAYOUT = { width: 'wide', alignment: 'center', spacing: 'comfortable', columns: 3, mediaPosition: 'balanced', motion: 'reveal' };

export function normalizeCmsConfig(payload = {}) {
  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  return {
    settings: payload.settings && typeof payload.settings === 'object' ? payload.settings : {},
    sections: sections.map((section) => ({
      id: section.id,
      sectionKey: section.section_key ?? section.sectionKey,
      label: section.label ?? section.section_key ?? section.sectionKey ?? 'Section',
      visible: section.visible !== false,
      sortOrder: Number(section.sort_order ?? section.sortOrder ?? 0),
      layout: { ...DEFAULT_LAYOUT, ...(section.layout || {}) },
      content: section.content && typeof section.content === 'object' ? section.content : {},
    })).filter((section) => section.sectionKey).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}
