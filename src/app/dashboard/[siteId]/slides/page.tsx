import Link from "next/link";
import { requireSiteOwner } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { SortableSlideList } from "@/components/dashboard/SortableSlideList";
import { deleteSlide, updateSliderType } from "./actions";
import { SliderTypeForm } from "./SliderTypeForm";

export default async function SlidesPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { siteId } = await params;
  const sp = await searchParams;
  const { site } = await requireSiteOwner(siteId);

  const slides = await prisma.slide.findMany({
    where: { siteId: site.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  async function handleDelete(id: string) {
    "use server";
    await deleteSlide(siteId, id);
  }

  async function handleTypeChange(formData: FormData) {
    "use server";
    const type = formData.get("sliderType") as string;
    await updateSliderType(siteId, type);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Slider</h2>
        <Link
          href={`/dashboard/${siteId}/slides/new`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          + Slide Ekle
        </Link>
      </div>

      {sp.success && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          {sp.success === "created"
            ? "Slide oluşturuldu."
            : sp.success === "updated"
            ? "Slide güncellendi."
            : "Slide silindi."}
        </p>
      )}

      <SliderTypeForm
        currentType={site.sliderType ?? "disabled"}
        action={handleTypeChange}
      />

      <SortableSlideList
        siteId={siteId}
        initialSlides={slides}
        deleteAction={handleDelete}
      />
    </div>
  );
}
