"use client";

import type { GridOrder } from "@/lib/splitImage";

type GridId = "5x3" | "3x5";

interface GridSelectorProps {
  cols: number;
  rows: number;
  order: GridOrder;
  onColsRows: (cols: number, rows: number) => void;
  onOrder: (order: GridOrder) => void;
}

const GRIDS: { id: GridId; cols: number; rows: number; label: string }[] = [
  { id: "5x3", cols: 5, rows: 3, label: "5 × 3" },
  { id: "3x5", cols: 3, rows: 5, label: "3 × 5" },
];

const ORDERS: { id: GridOrder; label: string; desc: string; icon: string }[] = [
  { id: "row-major", label: "가로줄 순서", desc: "좌 → 우, 위 → 아래", icon: "→" },
  { id: "column-major", label: "세로줄 순서", desc: "위 → 아래, 좌 → 우", icon: "↓" },
];

export default function GridSelector({
  cols,
  rows,
  order,
  onColsRows,
  onOrder,
}: GridSelectorProps) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#A89A85]">
        그리드 설정
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {GRIDS.map((g) => {
            const active = g.cols === cols && g.rows === rows;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onColsRows(g.cols, g.rows)}
                className={[
                  "rounded-[16px] px-6 py-3 text-lg font-semibold shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg",
                  active
                    ? "bg-[#B98B5F] text-white shadow-md"
                    : "bg-[#FFFDF9] text-[#5A4632]",
                ].join(" ")}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {ORDERS.map((o) => {
            const active = o.id === order;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onOrder(o.id)}
                className={[
                  "flex items-center gap-2 rounded-[16px] px-4 py-3 text-sm shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg",
                  active
                    ? "bg-[#B98B5F] text-white shadow-md"
                    : "bg-[#FFFDF9] text-[#5A4632]",
                ].join(" ")}
                title={o.desc}
              >
                <span className="text-base">{o.icon}</span>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-sm text-[#A89A85]">
        셀 순서: <span className="font-medium text-[#7A664E]">{order === "row-major" ? "가로줄(좌→우, 위→아래)" : "세로줄(위→아래, 좌→우)"}</span>
        {" · "}15칸 자르기 · 각각 360×360 PNG
      </p>
    </div>
  );
}
