"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFile: (file: File) => void;
}

export default function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const validateAndPass = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!/^image\/(png|jpe?g)$/.test(file.type)) {
        alert("PNG 또는 JPG 이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      validateAndPass(file);
    },
    [validateAndPass]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        id="sprite-file-input"
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          validateAndPass(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <label
        htmlFor="sprite-file-input"
        className={[
          "group block w-full cursor-pointer rounded-[24px] border-2 border-dashed bg-[#FFFDF9] p-10 text-center shadow-sm transition duration-300",
          dragging
            ? "border-[#C9A77C] bg-[#FBF3E6]"
            : "border-[#E7D8BC] hover:-translate-y-1 hover:shadow-lg hover:border-[#C9A77C]",
        ].join(" ")}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E8D6] transition group-hover:scale-105">
          <svg
            className="h-8 w-8 text-[#A98358]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M5 20h14" />
          </svg>
        </div>

        <p className="text-lg font-semibold text-[#5A4632]">
          클릭하여 이미지 업로드
        </p>
        <p className="mt-2 text-sm text-[#A89A85]">
          또는 이 영역으로 PNG / JPG 파일을 끌어다 놓으세요
        </p>
        <p className="mt-4 inline-block rounded-full bg-[#F3E8D6] px-4 py-1 text-xs font-medium text-[#7A664E]">
          하나의 스프라이트 시트 파일 (15개 캐릭터 포함)
        </p>
      </label>
    </div>
  );
}
