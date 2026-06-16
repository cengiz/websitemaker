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
import { updateProductOrder } from "@/app/dashboard/[siteId]/products/actions";

type Product = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  category: string | null;
  published: boolean;
};

function SortableRow({
  product,
  siteId,
  onDelete,
}: {
  product: Product;
  siteId: string;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

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

      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={product.title} className="h-12 w-12 rounded object-cover" />
      ) : (
        <div className="h-12 w-12 rounded bg-zinc-100" />
      )}

      <div className="flex-1">
        <p className="font-medium text-zinc-900">{product.title}</p>
        <p className="text-sm text-zinc-500">
          {product.price != null ? `${product.price.toLocaleString("tr-TR")} TL` : "Fiyat yok"}
          {product.category ? ` · ${product.category}` : ""}
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          product.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {product.published ? "Yayında" : "Taslak"}
      </span>

      <Link
        href={`/dashboard/${siteId}/products/${product.id}`}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
      >
        Düzenle
      </Link>

      <button
        type="button"
        onClick={() => onDelete(product.id)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Sil
      </button>
    </div>
  );
}

export function SortableProductList({
  siteId,
  initialProducts,
  deleteAction,
}: {
  siteId: string;
  initialProducts: Product[];
  deleteAction: (id: string) => Promise<void>;
}) {
  const [products, setProducts] = useState(initialProducts);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);
    await updateProductOrder(siteId, reordered.map((p) => p.id));
  }

  async function handleDelete(id: string) {
    if (!confirm("Ürünü silmek istediğinizden emin misiniz?")) return;
    await deleteAction(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
        Henüz ürün eklenmemiş.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <SortableRow
              key={product.id}
              product={product}
              siteId={siteId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
