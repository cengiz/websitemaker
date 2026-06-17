import { notFound } from "next/navigation";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { SlideForm } from "../SlideForm";
import { updateSlide } from "../actions";

export default async function EditSlidePage({
  params,
}: {
  params: Promise<{ siteId: string; slideId: string }>;
}) {
  const { siteId, slideId } = await params;
  const { site } = await requireSiteOwner(siteId);

  const slide = await prisma.slide.findFirst({ where: { id: slideId, siteId: site.id } });
  if (!slide) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-zinc-900">Slide Düzenle</h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <SlideForm
          siteId={siteId}
          slide={slide}
          action={updateSlide.bind(null, siteId, slide.id)}
        />
      </div>
    </div>
  );
}
