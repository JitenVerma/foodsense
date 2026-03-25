export function UploadPreview({
  previewUrl,
  fileName,
}: {
  previewUrl: string;
  fileName: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Meal preview"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="border-t border-slate-200 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Selected Image
        </p>
        <p className="mt-1 truncate text-sm font-medium text-slate-900">{fileName}</p>
      </div>
    </div>
  );
}

