import { requireSiteOwner } from "@/lib/authz";
import { SlideForm } from "../SlideForm";
import { createSlide } from "../actions";

export default async function NewSlidePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  await requireSiteOwner(siteId);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-zinc-900">Yeni Slide</h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <SlideForm siteId={siteId} action={createSlide.bind(null, siteId)} />
      </div>
    </div>
  );
}
