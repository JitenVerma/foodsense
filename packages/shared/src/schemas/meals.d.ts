import { z } from "zod";
export declare const ConfidenceSchema: z.ZodNumber;
export declare const DishCandidateSchema: z.ZodObject<{
    name: z.ZodString;
    confidence: z.ZodNumber;
}, z.core.$strip>;
export declare const MacroTotalsSchema: z.ZodObject<{
    protein_g: z.ZodNumber;
    carbs_g: z.ZodNumber;
    fat_g: z.ZodNumber;
    calories_kcal: z.ZodNumber;
}, z.core.$strip>;
export declare const IngredientCategorySchema: z.ZodEnum<{
    visible: "visible";
    inferred: "inferred";
}>;
export declare const IngredientSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    grams: z.ZodNumber;
    category: z.ZodEnum<{
        visible: "visible";
        inferred: "inferred";
    }>;
    confidence: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    macros: z.ZodOptional<z.ZodObject<{
        protein_g: z.ZodNumber;
        carbs_g: z.ZodNumber;
        fat_g: z.ZodNumber;
        calories_kcal: z.ZodNumber;
    }, z.core.$strip>>;
    nutritionMatch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const MealAnalysisResponseSchema: z.ZodObject<{
    dishCandidates: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        confidence: z.ZodNumber;
    }, z.core.$strip>>;
    visibleIngredients: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        grams: z.ZodNumber;
        category: z.ZodEnum<{
            visible: "visible";
            inferred: "inferred";
        }>;
        confidence: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        macros: z.ZodOptional<z.ZodObject<{
            protein_g: z.ZodNumber;
            carbs_g: z.ZodNumber;
            fat_g: z.ZodNumber;
            calories_kcal: z.ZodNumber;
        }, z.core.$strip>>;
        nutritionMatch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    inferredIngredients: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        grams: z.ZodNumber;
        category: z.ZodEnum<{
            visible: "visible";
            inferred: "inferred";
        }>;
        confidence: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        macros: z.ZodOptional<z.ZodObject<{
            protein_g: z.ZodNumber;
            carbs_g: z.ZodNumber;
            fat_g: z.ZodNumber;
            calories_kcal: z.ZodNumber;
        }, z.core.$strip>>;
        nutritionMatch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    macroTotals: z.ZodObject<{
        protein_g: z.ZodNumber;
        carbs_g: z.ZodNumber;
        fat_g: z.ZodNumber;
        calories_kcal: z.ZodNumber;
    }, z.core.$strip>;
    assumptions: z.ZodArray<z.ZodString>;
    warnings: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const RecalculateMealRequestSchema: z.ZodObject<{
    ingredients: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        grams: z.ZodNumber;
        category: z.ZodEnum<{
            visible: "visible";
            inferred: "inferred";
        }>;
        confidence: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        macros: z.ZodOptional<z.ZodObject<{
            protein_g: z.ZodNumber;
            carbs_g: z.ZodNumber;
            fat_g: z.ZodNumber;
            calories_kcal: z.ZodNumber;
        }, z.core.$strip>>;
        nutritionMatch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const RecalculateMealResponseSchema: z.ZodObject<{
    ingredients: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        grams: z.ZodNumber;
        category: z.ZodEnum<{
            visible: "visible";
            inferred: "inferred";
        }>;
        confidence: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        macros: z.ZodOptional<z.ZodObject<{
            protein_g: z.ZodNumber;
            carbs_g: z.ZodNumber;
            fat_g: z.ZodNumber;
            calories_kcal: z.ZodNumber;
        }, z.core.$strip>>;
        nutritionMatch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    macroTotals: z.ZodObject<{
        protein_g: z.ZodNumber;
        carbs_g: z.ZodNumber;
        fat_g: z.ZodNumber;
        calories_kcal: z.ZodNumber;
    }, z.core.$strip>;
    warnings: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const AnalyzeMealBase64RequestSchema: z.ZodObject<{
    imageBase64: z.ZodString;
    mimeType: z.ZodEnum<{
        "image/jpeg": "image/jpeg";
        "image/png": "image/png";
        "image/webp": "image/webp";
    }>;
}, z.core.$strip>;
export declare const ImageUploadMetadataSchema: z.ZodObject<{
    mimeType: z.ZodEnum<{
        "image/jpeg": "image/jpeg";
        "image/png": "image/png";
        "image/webp": "image/webp";
    }>;
    sizeBytes: z.ZodNumber;
}, z.core.$strip>;
export type DishCandidateDto = z.infer<typeof DishCandidateSchema>;
export type MacroTotalsDto = z.infer<typeof MacroTotalsSchema>;
export type IngredientDto = z.infer<typeof IngredientSchema>;
export type MealAnalysisResponseDto = z.infer<typeof MealAnalysisResponseSchema>;
export type RecalculateMealRequestDto = z.infer<typeof RecalculateMealRequestSchema>;
export type RecalculateMealResponseDto = z.infer<typeof RecalculateMealResponseSchema>;
//# sourceMappingURL=meals.d.ts.map