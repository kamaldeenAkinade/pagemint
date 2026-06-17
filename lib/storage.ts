export type SavedPage = {
  id: string;
  editToken: string;
  createdAt: number;
};

const STORAGE_KEY = "pagemint:pages";

export function getSavedPages(): SavedPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPage(entry: SavedPage): void {
  try {
    const pages = getSavedPages();
    pages.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages.slice(0, 50)));
  } catch {
    // localStorage unavailable (private mode) - silently ignore.
  }
}

export function getLocalEditToken(id: string): string | null {
  try {
    const pages = getSavedPages();
    const found = pages.find((p) => p.id === id);
    return found ? found.editToken : null;
  } catch {
    return null;
  }
}
