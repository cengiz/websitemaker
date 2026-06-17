"use client";

import { useTransition } from "react";

const OPTIONS = [
  { value: "disabled", label: "Kapalı", desc: "Anasayfada slider gösterilmez" },
  { value: "hero", label: "Hero", desc: "Tam genişlik, 60vh yükseklik" },
  { value: "carousel", label: "Carousel", desc: "3 kart yan yana" },
] as const;

export function SliderTypeForm({
  currentType,
  action,
}: {
  currentType: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700">Slider Tipi</h3>
      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border-2 px-4 py-3 transition ${
              currentType === opt.value
                ? "border-zinc-900 bg-zinc-50"
                : "border-zinc-200 hover:border-zinc-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="sliderType"
                value={opt.value}
                defaultChecked={currentType === opt.value}
                className="accent-zinc-900"
                onChange={() => {
                  const fd = new FormData();
                  fd.set("sliderType", opt.value);
                  startTransition(() => action(fd));
                }}
              />
              <span className="font-medium text-sm text-zinc-900">{opt.label}</span>
            </div>
            <span className="text-xs text-zinc-500 pl-5">{opt.desc}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
