import JSZip from "jszip";
import { saveAs } from "file-saver";

export type GridOrder = "row-major" | "column-major";

export interface GridConfig {
  cols: number;
  rows: number;
  order: GridOrder;
}

export interface SplitResult {
  blobs: Blob[];
  urls: string[];
  width: number;
  height: number;
  srcWidth: number;
  srcHeight: number;
}

export const OUTPUT_SIZE = 360;

export function createImageBitmapFromFile(file: File): Promise<ImageBitmap | HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof createImageBitmap === "function") {
      createImageBitmap(file)
        .then(resolve)
        .catch(() => {
          resolveFromUrl(file, resolve, reject);
        });
    } else {
      resolveFromUrl(file, resolve, reject);
    }
  });
}

function resolveFromUrl(
  file: File,
  resolve: (v: ImageBitmap | HTMLImageElement) => void,
  reject: (e: Error) => void
) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error("이미지를 불러올 수 없습니다."));
  };
  img.src = url;
}

/**
 * 스프라이트 시트를 cols x rows 그리드로 15개 셀로 분할한 뒤
 * 각 셀을 360x360 PNG로 변환한다.
 *
 * 셀 순서:
 *  - row-major: 좌->우, 위->아래
 *  - column-major: 위->아래, 좌->우
 */
export async function splitImage(
  bitmap: ImageBitmap | HTMLImageElement,
  config: GridConfig
): Promise<SplitResult> {
  const srcWidth = bitmap.width;
  const srcHeight = bitmap.height;
  const cellWidth = srcWidth / config.cols;
  const cellHeight = srcHeight / config.rows;

  const results: { blob: Blob; url: string }[] = [];

  for (let i = 0; i < config.cols * config.rows; i++) {
    let sx: number;
    let sy: number;

    if (config.order === "row-major") {
      sx = (i % config.cols) * cellWidth;
      sy = Math.floor(i / config.cols) * cellHeight;
    } else {
      sx = Math.floor(i / config.rows) * cellWidth;
      sy = (i % config.rows) * cellHeight;
    }

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas를 초기화할 수 없습니다.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const out = OUTPUT_SIZE;
    const aspect = cellWidth / cellHeight;
    let dw = out;
    let dh = out / aspect;
    let dx = (out - dw) / 2;
    let dy = (out - dh) / 2;
    if (dw > out) {
      dw = out;
      dh = out / aspect;
      dx = (out - dw) / 2;
      dy = (out - dh) / 2;
    }
    if (dh > out) {
      dh = out;
      dw = out * aspect;
      dy = (out - dh) / 2;
      dx = (out - dw) / 2;
    }

    ctx.drawImage(bitmap, sx, sy, cellWidth, cellHeight, dx, dy, dw, dh);

    const blob = await canvasToPng(canvas);
    results.push({ blob, url: URL.createObjectURL(blob) });
  }

  return {
    blobs: results.map((r) => r.blob),
    urls: results.map((r) => r.url),
    width: OUTPUT_SIZE,
    height: OUTPUT_SIZE,
    srcWidth,
    srcHeight,
  };
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG 변환에 실패했습니다."));
      },
      "image/png"
    );
  });
}

export async function downloadZip(
  blobs: Blob[],
  filename = "characters.zip"
): Promise<void> {
  const zip = new JSZip();
  blobs.forEach((blob, i) => {
    const num = String(i + 1).padStart(2, "0");
    zip.file(`character_${num}.png`, blob);
  });
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, filename);
}
