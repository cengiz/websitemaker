import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import type { NewsPost } from "@/generated/prisma/client";

export function NewsForm({
  siteId,
  post,
  action,
}: {
  siteId: string;
  post?: NewsPost;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Başlık</span>
        <input className="input" name="title" defaultValue={post?.title ?? ""} required />
      </label>

      <ImageUploadField name="coverImageUrl" siteId={siteId} initialUrl={post?.coverImageUrl} label="Kapak görseli" />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">Özet</span>
        <textarea className="input min-h-20" name="excerpt" defaultValue={post?.excerpt ?? ""} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">İçerik</span>
        <textarea className="input min-h-40" name="body" defaultValue={post?.body ?? ""} />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? true} />
        Yayında
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Kaydet
      </button>
    </form>
  );
}
