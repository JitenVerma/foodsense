"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Ingredient, MealAnalysisResponse } from "@foodsense/shared";

import { recalculateMeal } from "../lib/api-client";
import {
  ingredientSignature,
  sumIngredientMacros,
} from "../lib/macro-utils";

function cloneIngredient(ingredient: Ingredient): Ingredient {
  return {
    ...ingredient,
    macros: ingredient.macros ? { ...ingredient.macros } : undefined,
  };
}

function buildDensityMap(ingredients: Ingredient[]) {
  return Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      ingredient.macros && ingredient.grams > 0
        ? {
            protein_g: ingredient.macros.protein_g / ingredient.grams,
            carbs_g: ingredient.macros.carbs_g / ingredient.grams,
            fat_g: ingredient.macros.fat_g / ingredient.grams,
            calories_kcal: ingredient.macros.calories_kcal / ingredient.grams,
          }
        : {
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            calories_kcal: 0,
          },
    ]),
  );
}

function scaleMacrosFromDensity(
  density: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories_kcal: number;
  },
  grams: number,
) {
  const roundTo = (value: number) => Math.round(value * 10) / 10;

  return {
    protein_g: roundTo(density.protein_g * grams),
    carbs_g: roundTo(density.carbs_g * grams),
    fat_g: roundTo(density.fat_g * grams),
    calories_kcal: roundTo(density.calories_kcal * grams),
  };
}

export function useMealResultsEditor(initialAnalysis: MealAnalysisResponse) {
  const initialIngredients = [
    ...initialAnalysis.visibleIngredients.map(cloneIngredient),
    ...initialAnalysis.inferredIngredients.map(cloneIngredient),
  ];
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => [
    ...initialIngredients,
  ]);
  const [warnings, setWarnings] = useState<string[]>(initialAnalysis.warnings);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const initialRenderRef = useRef(true);
  const lastSyncedSignatureRef = useRef(ingredientSignature(ingredients));
  const macroDensityByIdRef = useRef(buildDensityMap(initialIngredients));

  const macroTotals = useMemo(() => sumIngredientMacros(ingredients), [ingredients]);

  useEffect(() => {
    const signature = ingredientSignature(ingredients);

    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      lastSyncedSignatureRef.current = signature;
      return;
    }

    if (signature === lastSyncedSignatureRef.current) {
      return;
    }

    setSyncState("syncing");
    setSyncError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await recalculateMeal(ingredients);
        lastSyncedSignatureRef.current = ingredientSignature(result.ingredients);
        macroDensityByIdRef.current = buildDensityMap(result.ingredients);
        setIngredients(result.ingredients.map(cloneIngredient));
        setWarnings(Array.from(new Set([...initialAnalysis.warnings, ...result.warnings])));
        setSyncState("idle");
      } catch (error) {
        setSyncState("error");
        setSyncError(
          error instanceof Error
            ? error.message
            : "Unable to refresh macros from the server.",
        );
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [ingredients, initialAnalysis.warnings]);

  function updateIngredient(
    ingredientId: string,
    updater: (ingredient: Ingredient) => Ingredient,
  ) {
    setIngredients((currentIngredients) =>
      currentIngredients.map((ingredient) =>
        ingredient.id === ingredientId ? updater(ingredient) : ingredient,
      ),
    );
  }

  return {
    ingredients,
    visibleIngredients: ingredients.filter((ingredient) => ingredient.category === "visible"),
    inferredIngredients: ingredients.filter(
      (ingredient) => ingredient.category !== "visible",
    ),
    macroTotals,
    warnings,
    syncState,
    syncError,
    updateIngredientName(ingredientId: string, name: string) {
      updateIngredient(ingredientId, (ingredient) => ({
        ...ingredient,
        name,
      }));
    },
    updateIngredientGrams(ingredientId: string, grams: number) {
      updateIngredient(ingredientId, (ingredient) => ({
        ...ingredient,
        grams,
        macros: scaleMacrosFromDensity(
          macroDensityByIdRef.current[ingredient.id] ?? {
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            calories_kcal: 0,
          },
          grams,
        ),
      }));
    },
    removeIngredient(ingredientId: string) {
      setIngredients((currentIngredients) =>
        currentIngredients.filter((ingredient) => ingredient.id !== ingredientId),
      );
    },
    addIngredient(category: Ingredient["category"]) {
      setIngredients((currentIngredients) => [
        ...currentIngredients,
        {
          id: `${category}-${crypto.randomUUID()}`,
          name: "new ingredient",
          grams: 0,
          category,
          confidence: 0.2,
          notes:
            category === "inferred"
              ? "Added manually by the user."
              : "Visible ingredient added manually by the user.",
          macros: {
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            calories_kcal: 0,
          },
          nutritionMatch: null,
        },
      ]);
    },
  };
}
