import ImageSplitter from "@/components/ImageSplitter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF5EC] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-3xl flex-1">
        <ImageSplitter />
      </div>
      <footer className="mt-16 text-center text-sm text-[#B8A98F]">
        로컬에서만 처리되며 업로드한 이미지는 서버로 전송되지 않습니다.
      </footer>
    </main>
  );
}
