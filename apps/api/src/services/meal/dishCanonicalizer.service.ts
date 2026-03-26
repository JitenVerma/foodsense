import type { DishCandidate } from "@foodsense/shared";

export interface CanonicalDishCandidate extends DishCandidate {
  sourceName: string;
}

export interface DishCanonicalizerService {
  canonicalize(dishCandidates: DishCandidate[]): CanonicalDishCandidate[];
}

const DISH_RULES: Array<{ match: RegExp; canonicalName: string }> = [
  {
    match: /butter chicken|chicken tikka masala|creamy tomato chicken curry/i,
    canonicalName: "butter chicken with rice",
  },
  {
    match: /fried rice.*chicken|chicken.*fried rice/i,
    canonicalName: "chicken fried rice",
  },
  {
    match: /rice bowl.*chicken|chicken.*rice bowl|teriyaki chicken bowl/i,
    canonicalName: "chicken rice bowl",
  },
  {
    match: /salmon.*salad|salad.*salmon/i,
    canonicalName: "salmon salad",
  },
  {
    match: /carbonara|creamy bacon pasta|bacon pasta/i,
    canonicalName: "spaghetti carbonara",
  },
];

function titleCase(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeDishName(name: string) {
  const compact = name
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const ruleMatch = DISH_RULES.find((rule) => rule.match.test(compact));
  if (ruleMatch) {
    return ruleMatch.canonicalName;
  }

  return compact;
}

export function createDishCanonicalizerService(): DishCanonicalizerService {
  return {
    canonicalize(dishCandidates) {
      return dishCandidates.map((candidate) => {
        const canonicalName = normalizeDishName(candidate.name);

        return {
          name: titleCase(canonicalName),
          sourceName: candidate.name,
          confidence: candidate.confidence,
        };
      });
    },
  };
}

