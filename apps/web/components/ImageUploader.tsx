import { useRef } from "react";

import { cn } from "../lib/cn";

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  error?: string | null;
}

export function ImageUploader({ onFileSelected, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex min-h-56 w-full flex-col items-center justify-center rounded-[32px] border border-dashed px-6 py-10 text-center transition",
          error
            ? "border-rose-300 bg-rose-50"
            : "border-emerald-300 bg-white/80 hover:border-emerald-500 hover:bg-emerald-50/70",
        )}
      >
        <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
          Upload Meal Photo
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-slate-950">
          Drag a meal image here or tap to browse
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Supports JPG, PNG, and WEBP. We’ll estimate the dish, ingredients, and
          macros, then let you edit everything before saving.
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
        }}
      />
    </div>
  );
}

