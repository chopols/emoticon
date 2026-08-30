"use client";

import { useCallback, useRef, useState } from "react";
import UploadZone from "@/components/UploadZone";
import GridSelector from "@/components/GridSelector";
import PreviewGrid from "@/components/PreviewGrid";
import {
  createImageBitmapFromFile,
  downloadZip,
  splitImage,
  type GridConfig,
  type SplitResult,
} from "@/lib/splitImage";

export default function ImageSplitter() {
  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(3);
  const [order, setOrder] = useState<GridConfig["order"]>("row-major");
  const [fileName, setFileName] = useState<string | null>(null);
  const [srcPreview, setSrcPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);

  const bitmapRef = useRef<ImageBitmap | HTMLImageElement | null>(null);
  const fileRef = useRef<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    fileRef.current = file;
    setFileName(file.name);
    setResult(null);
    if (srcPreview) URL.revokeObjectURL(srcPreview);
    setSrcPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const bitmap = await createImageBitmapFromFile(file);
      if (bitmapRef.current && "close" in bitmapRef.current) {
        bitmapRef.current.close();
      }
      bitmapRef.current = bitmap;
    } catch (e) {
      console.error(e);
      alert("이미지를 불러오는 데 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }, [srcPreview]);

  const handleSplit = useCallback(async () => {
    if (!bitmapRef.current) return;
    setProcessing(true);
    try {
      const r = await splitImage(bitmapRef.current, { cols, rows, order });
      setResult((prev) => {
        if (prev) prev.urls.forEach((u) => URL.revokeObjectURL(u));
        return r;
      });
    } catch (e) {
      console.error(e);
      alert("이미지 분할에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  }, [cols, rows, order]);

  const handleDownload = useCallback(async () => {
    if (!result) return;
    const base = fileName
      ? fileName.replace(/\.[^.]+$/, "")
      : "characters";
    await downloadZip(result.blobs, `${base}.zip`);
  }, [result, fileName]);

  const handleReset = useCallback(() => {
    fileRef.current = null;
    setFileName(null);
    if (bitmapRef.current && "close" in bitmapRef.current) bitmapRef.current.close();
    bitmapRef.current = null;
    if (srcPreview) URL.revokeObjectURL(srcPreview);
    setSrcPreview(null);
    setResult((prev) => {
      if (prev) prev.urls.forEach((u) => URL.revokeObjectURL(u));
      return null;
    });
    setProcessing(false);
  }, [srcPreview]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#F3E8D6] shadow-sm">
          <svg
            className="h-7 w-7 text-[#A98358]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="7" rx="2" />
            <rect x="3" y="14" width="18" height="7" rx="2" />
            <path d="M6 7h.01M6 18h.01" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#5A4632] sm:text-4xl">
          이모티콘 스프라이트 자르기
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[#8A7A63]">
          15개 캐릭터가 모인 PNG / JPG 시트 하나를 업로드하면,
          자동으로 15칸 그리드로 잘라 각각{" "}
          <span className="font-semibold text-[#7A664E]">360×360 PNG</span>로
          변환하고 하나의 ZIP으로 다운로드합니다.
        </p>
      </div>

      <UploadZone onFile={handleFile} />

      {fileName && (
        <div className="mt-6">
          <div className="mb-6 rounded-[24px] bg-[#FFFDF9] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-full bg-[#EAF3E3] px-3 py-1 text-xs font-medium text-[#5F7A4E]">
                  업로드됨
                </span>
                <span className="truncate font-medium text-[#5A4632]">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="shrink-0 text-sm text-[#A89A85] underline-offset-2 hover:text-[#5A4632] hover:underline"
                >
                  다시 선택
                </button>
              </div>
              {busy && (
                <span className="text-sm text-[#A89A85]">읽는 중…</span>
              )}
            </div>

            {srcPreview && (
              <div className="mb-6 flex justify-center">
                <img
                  src={srcPreview}
                  alt="업로드 원본"
                  className="max-h-64 rounded-[16px] shadow-sm"
                />
              </div>
            )}

            <GridSelector
              cols={cols}
              rows={rows}
              order={order}
              onColsRows={(c, r) => {
                setCols(c);
                setRows(r);
                setResult((prev) => {
                  if (prev) prev.urls.forEach((u) => URL.revokeObjectURL(u));
                  return null;
                });
              }}
              onOrder={(o) => {
                setOrder(o);
                setResult((prev) => {
                  if (prev) prev.urls.forEach((u) => URL.revokeObjectURL(u));
                  return null;
                });
              }}
            />

            <div className="mt-8">
              <button
                type="button"
                onClick={handleSplit}
                disabled={processing}
                className="w-full rounded-[24px] bg-[#B98B5F] px-8 py-4 text-lg font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-[#A97D53] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {processing ? "작업 중…" : "15칸으로 분할하기"}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-6">
              <div className="mb-6 rounded-[24px] bg-[#FFFDF9] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <PreviewGrid urls={result.urls} cols={cols} rows={rows} />
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full rounded-[24px] bg-[#7A9B5A] px-8 py-4 text-lg font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-[#6C8B4F] hover:shadow-lg sm:w-auto"
                  >
                    ZIP 다운로드
                  </button>
                  <p className="mt-3 text-sm text-[#A89A85]">
                    15개의 PNG가{" "}
                    <span className="font-medium text-[#7A664E]">
                      character_01.png ~ character_15.png
                    </span>{" "}
                    이름으로 압축됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
