"use client";

import { useState } from "react";
import {
  DndContext, PointerSensor, useSensor, useSensors,
  closestCenter, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { updateSlideOrder } from "@/app/dashboard/[siteId]/slides/actions";

type Slide = {
  id: string;
  title: string | null;
  imageUrl: string | null;
  published: boolean;
};

function SortableRow({ slide, siteId, onDelete }: { slide: Slide; siteId: string; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab px-1 text-zinc-400 hover:text-zinc-600 active:cursor-grabbing">⠿</button>
      {slide.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={slide.imageUrl} alt="" className="h-14 w-20 rounded object-cover" />
      ) : (
        <div className="h-14 w-20 rounded bg-zinc-100" />
      )}
      <div className="flex-1">
        <p className="font-medium text-zinc-900">{slide.title || <span className="text-zinc-400 italic">Başlıksız</span>}</p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${slide.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
        {slide.published ? "Yayında" : "Taslak"}
      </span>
      <Link href={`/dashboard/${siteId}/slides/${slide.id}`} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50">Düzenle</Link>
      <button type="button" onClick={() => onDelete(slide.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Sil</button>
    </div>
  );
}

export function SortableSlideList({ siteId, initialSlides, deleteAction }: {
  siteId: string;
  initialSlides: Slide[];
  deleteAction: (id: string) => Promise<void>;
}) {
  const [slides, setSlides] = useState(initialSlides);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = slides.findIndex((s) => s.id === active.id);
    const newIdx = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(slides, oldIdx, newIdx);
    setSlides(reordered);
    await updateSlideOrder(siteId, reordered.map((s) => s.id));
  }

  async function handleDelete(id: string) {
    if (!confirm("Slide silinsin mi?")) return;
    await deleteAction(id);
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  if (slides.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
        Henüz slide eklenmemiş.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {slides.map((slide) => (
            <SortableRow key={slide.id} slide={slide} siteId={siteId} onDelete={handleDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
