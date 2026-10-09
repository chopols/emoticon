# 프로젝트 개요
- Next.js 16.2+ (App Router)
- React 18+ / TypeScript (strict mode)
- 상태 관리: Redux Toolkit
- 스타일링: Tailwind CSS + shadcn/ui

# 빌드 및 테스트 명령
- 개발 서버: `pnpm dev`
- 빌드: `pnpm build`
- 린트: `pnpm lint`
- 테스트: `pnpm test`

# 코드 스타일 가이드
- 함수형 컴포넌트 + Hooks 사용
- 서버 컴포넌트 기본, 클라이언트 컴포넌트는 "use client" 지시문
- 경로는 `src/app/` 기반 (App Router)
- 재사용 컴포넌트는 `src/components/`에 배치

# Next.js 문서 참조
이 프로젝트는 Next.js 16.2+를 사용합니다. 코드를 작성하기 전에
`node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽으세요.
이 문서는 설치된 버전과 일치하므로, 훈련 데이터의 난은 정보를 사용하지 마세요[1][9].

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
이 버전에는 브레이킹 체인지가 있습니다 — API, 컨벤션, 파일 구조가 훈련 데이터와 다를 수 있습니다. 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽으세요.
<!-- END:nextjs-agent-rules -->

# 상태 관리
- Redux Toolkit 사용, `src/lib/store/`에 스토어 설정
- 비동기 작업은 `createAsyncThunk` 사용
- 셀렉터는 `src/lib/store/selectors.ts`에 정의
