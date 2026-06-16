import Link from "next/link";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Giriş yap</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Hesabınla devam edin.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error === "credentials"
              ? "E-posta veya şifre yanlış."
              : "Lütfen geçerli bilgiler girin."}
          </p>
        )}

        <form action={loginAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Giriş yap
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Hesabın yok mu?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
