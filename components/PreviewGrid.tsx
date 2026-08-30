"use client";

interface PreviewGridProps {
  urls: string[];
  cols: number;
  rows: number;
}

export default function PreviewGrid({ urls, cols, rows }: PreviewGridProps) {
  const gridTemplate = `repeat(${cols}, minmax(0, 1fr))`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A89A85]">
          작업 결과 미리보기
        </p>
        <span className="rounded-full bg-[#EAF3E3] px-3 py-1 text-xs font-medium text-[#5F7A4E]">
          {urls.length}개 · {cols}×{rows} · 360×360 PNG
        </span>
      </div>

      <div
        className="grid gap-3 rounded-[24px] bg-[#FFFDF9] p-4 shadow-sm"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {urls.map((url, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[16px] bg-[#F3E8D6] shadow-sm"
          >
            <img
              src={url}
              alt={`character_${i + 1}`}
              className="aspect-square h-full w-full object-cover"
              draggable={false}
            />
            <span className="absolute left-1.5 top-1.5 rounded-md bg-[#5A4632]/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
