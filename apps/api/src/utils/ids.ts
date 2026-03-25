export function createIngredientId(seed: string, index: number) {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);

  return `ing_${normalized || "item"}_${index + 1}`;
}

