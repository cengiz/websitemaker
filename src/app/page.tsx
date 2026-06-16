import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-zinc-900 sm:text-5xl">Sitemaker</h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600">
        Logonuzu, tanıtım yazınızı ve iletişim bilgilerinizi girin; birkaç adımda kendi siteniz
        yayında olsun. Sonradan panelinizden temayı değiştirin, haber ve ürün ekleyin.
      </p>
      <div className="mt-8 flex gap-4">
        {session?.user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Panele git
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Ücretsiz başla
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-white"
            >
              Giriş yap
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
