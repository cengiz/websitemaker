import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="text-6xl font-black text-zinc-900">404</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-800">Sayfa bulunamadı</h1>
      <p className="mt-2 text-zinc-500">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
