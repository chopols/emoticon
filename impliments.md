# 이모티콘 스프라이트 자르기 — 개발 상세내역

## 1. 프로젝트 개요

- 15개 캐릭터가 모여 있는 **스프라이트 시트**(PNG / JPG) 하나를 업로드하면
  **15칸 그리드**로 자른 뒤 각 셀을 **360×360 JPG**로 변환하고,
  하나의 **ZIP 파일**로 묶어 다운로드하는 웹 도구.
- 모든 이미지 처리는 **브라우저(클라이언트)에서만** 수행되며 서버로 전송되지 않는다.

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 16.3.3 |
| UI | React | 19.2.8 |
| 언어 | TypeScript | ^5 |
| 스타일 | Tailwind CSS | ^4 |
| ZIP 생성 | JSZip | ^3.10.1 |
| 파일 다운로드 | file-saver | ^2.0.5 |

### 빌드 설정 (`next.config.ts`)
- `output: "export"` — 정적 사이트로 내보내기
- `basePath: "/emoticon"` — 서버 하위 경로에서 서빙
- `trailingSlash: true`

## 3. 프로젝트 구조

```
emoticon/
├── app/
│   ├── layout.tsx        # 루트 레이아웃 (메타데이터, 전역 스타일)
│   ├── page.tsx          # 메인 페이지
│   └── globals.css       # Tailwind 전역 스타일
├── components/
│   ├── ImageSplitter.tsx # 핵심 오케스트레이션 컴포넌트 (client)
│   ├── UploadZone.tsx    # 클릭 / 드래그앤드롭 업로드
│   ├── GridSelector.tsx  # 그리드(5×3 / 3×5) 및 셀 순서 선택
│   └── PreviewGrid.tsx   # 분할 결과 미리보기
├── lib/
│   └── splitImage.ts     # 이미지 분할 · JPG 변환 · ZIP 다운로드 로직
├── deploy.ps1            # 서버 재배포 스크립트
├── next.config.ts        # 정적 내보내기 설정
└── package.json
```

## 4. 핵심 데이터 타입 (`lib/splitImage.ts`)

```ts
export type GridOrder = "row-major" | "column-major";

export interface GridConfig {
  cols: number;
  rows: number;
  order: GridOrder;
}

export interface SplitResult {
  blobs: Blob[];      // 각 셀의 JPG Blob
  urls: string[];     // 미리보기용 ObjectURL 목록
  width: number;      // 출력 폭 (360)
  height: number;     // 출력 높이 (360)
  srcWidth: number;   // 원본 폭
  srcHeight: number;  // 원본 높이
}
```

- 상수: `OUTPUT_SIZE = 360`, `JPG_QUALITY = 0.92`

## 5. 기능 상세

### 5.1 이미지 업로드 (`UploadZone.tsx`)
- **클릭 업로드**: 숨긴 `<input type="file">` + `<label>` 연결
- **드래그 앤 드롭**: `onDragOver` / `onDrop` 처리, 드래그 중 스타일 변화
- **유효성 검사**: `image/png|image/jpeg` MIME 타입만 허용, 아니면 alert

### 5.2 이미지 로딩 (`createImageBitmapFromFile`)
- `createImageBitmap(file)`을 우선 시도
- 지원하지 않거나 실패 시 `HTMLImageElement` + `ObjectURL` 폴백
- 이전 비트맵은 `close()`로 해제하여 메모리 누수 방지

### 5.3 그리드 설정 (`GridSelector.tsx`)
- 그리드 선택: **5 × 3**(기본) 또는 **3 × 5**
- 셀 순서 선택:
  - **가로줄 순서(row-major)**: 좌 → 우, 위 → 아래
  - **세로줄 순서(column-major)**: 위 → 아래, 좌 → 우
- 설정이 변경되면 기존 분할 결과(ObjectURL)는 해제 후 초기화

### 5.4 이미지 분할 (`splitImage`)
1. 원본 크기를 cols × rows로 나눠 셀 크기(`cellWidth`, `cellHeight`) 계산
2. 선택된 순서대로 각 셀의 원본 좌표(`sx`, `sy`) 계산
3. 360×360 캔버스를 만들어 해당 영역을 `drawImage`로 복사
4. **가로세로 비율 유지**: 셀 비율(`aspect`)을 계산해 letterbox(여백 포함) 방식으로 중앙 정렬
   - `ctx.imageSmoothingEnabled = true`, `imageSmoothingQuality = "high"`로 고품질 리샘플링
5. `canvas.toBlob()`로 **JPG(품질 0.92)** 변환
6. 각 셀의 Blob과 미리보기용 `ObjectURL`을 컬렉션에 저장

### 5.5 결과 미리보기 (`PreviewGrid.tsx`)
- `gridTemplateColumns: repeat(cols, 1fr)`로 원본 그리드 형태 그대로 표시
- 각 셀에 1~15 번호 배지 표시

### 5.6 ZIP 다운로드 (`downloadZip`)
- JSZip에 `character_01.jpg` ~ `character_15.jpg`(2자리 숫자 패딩)로 추가
- `generateAsync({ type: "blob" })` 후 file-saver의 `saveAs()`로 저장
- 파일명은 원본명에서 확장자를 뺀 이름 사용 (예: `sprite.png` → `sprite.zip`)

### 5.7 리소스 정리 (`ImageSplitter.tsx`)
- 새 파일 선택 시: 이전 미리보기 ObjectURL `revokeObjectURL`
- 그리드/순서 변경 시: 이전 결과 ObjectURL 해제
- "다시 선택" 시: 파일·비트맵·미리보기·결과 전부 초기화

## 6. UI / UX 상세

- **색상 팔레트**: 크림색 배경(`#FAF5EC`), 카드(`#FFFDF9`), 갈색 포인트(`#B98B5F`), 초록 다운로드 버튼(`#7A9B5A`)
- **카드 호버**: `hover:-translate-y-1` + `hover:shadow-lg`로 부드러운 상승 효과
- **상태 표시**:
  - 업로드 직후 "읽는 중…"
  - 분할 중 버튼 텍스트 → "작업 중…" / 비활성화
- **라벨**: 8개 JPG 개수 · `character_01~15.jpg` 이름 규칙 안내 문구
- **푸터**: "로컬에서만 처리되며 업로드한 이미지는 서버로 전송되지 않습니다."

## 7. 배포 (`deploy.ps1`)

- 정적 빌드 → SSH로 서버 배포하는 PowerShell 스크립트
- 흐름:
  1. `npm run build`로 `out/` 생성 (`-NoBuild`로 생략 가능)
  2. 원격 디렉터리(`/home/chopols/html/emoticon/*`) 정리
  3. `scp`로 `out/*` 업로드
- 접속 정보: `chopols@ubuntu.ibzsoft.com`, SSH 키 `~/.ssh/emoticon_server`
- 접속 주소: `http://ubuntu.ibzsoft.com/emoticon/`
- 옵션: `-NoBuild`, `-Server`, `-Key`, `-RemoteDir`

## 8. 작업 이력 (git log)

| 커밋 | 내용 |
|---|---|
| `be2c609` | Create Next App 초기 세팅 |
| `f6c41fb` | `/emoticon` basePath 정적 내보내기로 스프라이트 분할기 추가 |
| `a351e6c` | 이후 기능 보완 (스프라이트 분할기 최종) |
| `56bded9` | `deploy.ps1` 배포 스크립트 추가 |

## 9. 실행 방법

```bash
npm install
npm run dev        # 개발 서버 http://localhost:3000
npm run build      # 정적 빌드 -> out/
npm run lint       # ESLint 검사
./deploy.ps1       # 빌드 + 서버 배포
```