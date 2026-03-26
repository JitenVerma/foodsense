const UNIT_PATTERN =
  /\b(tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|cup|cups|oz|ounce|ounces|lb|lbs|g|kg|ml|l|clove|cloves|slice|slices|can|cans|package|packages|pinch|dash)\b/gi;
const LEADING_AMOUNT_PATTERN =
  /^\s*[\d./-]+\s*(to\s*[\d./-]+)?\s*/i;
const PREPARATION_PATTERN =
  /\b(chopped|diced|minced|grated|pureed|peeled|sliced|fresh|large|small|medium|optional)\b/gi;

const NORMALIZATION_ALIASES: Record<string, string> = {
  "tomato puree": "tomato sauce",
  "tomatoes": "tomato",
  "garlic cloves": "garlic",
  onions: "onion",
};

export interface RecipeIngredientNormalizerService {
  normalizeIngredientString(input: string): string | null;
  normalizeIngredientList(inputs: string[]): string[];
}

function singularize(input: string) {
  if (input.endsWith("ies")) {
    return `${input.slice(0, -3)}y`;
  }

  if (input.endsWith("s") && !input.endsWith("ss") && input.length > 4) {
    return input.slice(0, -1);
  }

  return input;
}

function cleanIngredient(input: string) {
  const normalized = input
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(LEADING_AMOUNT_PATTERN, "")
    .replace(UNIT_PATTERN, " ")
    .replace(PREPARATION_PATTERN, " ")
    .replace(/[;,:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return null;
  }

  const aliasMatch = NORMALIZATION_ALIASES[normalized];
  if (aliasMatch) {
    return aliasMatch;
  }

  return singularize(normalized);
}

export function createRecipeIngredientNormalizerService(): RecipeIngredientNormalizerService {
  return {
    normalizeIngredientString(input) {
      return cleanIngredient(input);
    },
    normalizeIngredientList(inputs) {
      return inputs
        .map((input) => cleanIngredient(input))
        .filter((input): input is string => Boolean(input));
    },
  };
}

