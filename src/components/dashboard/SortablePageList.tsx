"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { updatePageOrder } from "@/app/dashboard/[siteId]/pages/actions";

type Page = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};

function SortableRow({
  page,
  siteId,
  onDelete,
}: {
  page: Page;
  siteId: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-zinc-400 hover:text-zinc-600 active:cursor-grabbing px-1"
        title="Sürükle"
      >
        ⠿
      </button>

      <div className="flex-1">
        <p className="font-medium text-zinc-900">{page.title}</p>
        <p className="text-sm text-zinc-500">/sayfa/{page.slug}</p>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          page.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {page.published ? "Yayında" : "Taslak"}
      </span>

      <Link
        href={`/dashboard/${siteId}/pages/${page.id}`}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
      >
        Düzenle
      </Link>

      <button
        type="button"
        onClick={() => onDelete(page.id)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Sil
      </button>
    </div>
  );
}

export function SortablePageList({
  siteId,
  initialPages,
  deleteAction,
}: {
  siteId: string;
  initialPages: Page[];
  deleteAction: (id: string) => Promise<void>;
}) {
  const [pages, setPages] = useState(initialPages);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);
    setPages(reordered);
    await updatePageOrder(siteId, reordered.map((p) => p.id));
  }

  async function handleDelete(id: string) {
    if (!confirm("Sayfayı silmek istediğinizden emin misiniz?")) return;
    await deleteAction(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
        Henüz sayfa eklenmemiş.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {pages.map((page) => (
            <SortableRow
              key={page.id}
              page={page}
              siteId={siteId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
