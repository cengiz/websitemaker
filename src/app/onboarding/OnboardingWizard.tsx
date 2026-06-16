"use client";

import { useMemo, useState, useTransition } from "react";
import { THEMES } from "@/lib/themes";
import { slugify } from "@/lib/slug";
import { checkSlugAvailable, createSite, type WizardData } from "./actions";

const STEPS = [
  "Temel Bilgiler",
  "Logo & Marka",
  "Hakkında",
  "İletişim",
  "Tema",
  "Önizleme",
] as const;

const EMPTY: WizardData = {
  name: "",
  slug: "",
  logoUrl: "",
  tagline: "",
  intro: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  socials: { instagram: "", facebook: "", twitter: "", website: "" },
  themeKey: THEMES[0].key,
};

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">(
    "idle"
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const updateSocial = (key: keyof WizardData["socials"], value: string) =>
    setData((prev) => ({ ...prev, socials: { ...prev.socials, [key]: value } }));

  const handleNameChange = (value: string) => {
    update("name", value);
    if (!slugTouched) {
      update("slug", slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    update("slug", slugify(value));
    setSlugStatus("idle");
  };

  const verifySlug = async () => {
    const slug = slugify(data.slug || data.name);
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    update("slug", slug);
    setSlugStatus("checking");
    const available = await checkSlugAvailable(slug);
    setSlugStatus(available ? "available" : "taken");
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Yükleme başarısız oldu.");
        return;
      }
      update("logoUrl", json.url);
    } finally {
      setUploading(false);
    }
  };

  const canGoNext = useMemo(() => {
    if (step === 0) {
      return data.name.trim().length >= 2 && data.slug.trim().length >= 2;
    }
    return true;
  }, [step, data]);

  const goNext = () => {
    if (step === 0) {
      void verifySlug();
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createSite(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <ol className="mb-8 flex flex-wrap gap-2 text-xs font-medium text-zinc-500">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 ${
              i === step
                ? "bg-zinc-900 text-white"
                : i < step
                ? "bg-zinc-200 text-zinc-700"
                : "bg-zinc-100"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Site adı ve adresi</h2>
            <Field label="Site adı">
              <input
                className="input"
                value={data.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Örn. Acme Kahve"
              />
            </Field>
            <Field label="Site adresi (slug)">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">/s/</span>
                <input
                  className="input"
                  value={data.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={verifySlug}
                  placeholder="acme-kahve"
                />
              </div>
              {slugStatus === "checking" && (
                <p className="text-xs text-zinc-500">Kontrol ediliyor...</p>
              )}
              {slugStatus === "available" && (
                <p className="text-xs text-green-600">Bu adres uygun.</p>
              )}
              {slugStatus === "taken" && (
                <p className="text-xs text-red-600">Bu adres kullanılıyor, başka bir ad deneyin.</p>
              )}
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Logo ve marka</h2>
            <Field label="Logo">
              <div className="flex items-center gap-4">
                {data.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.logoUrl} alt="Logo" className="h-16 w-16 rounded object-contain border border-zinc-200" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-zinc-300 text-xs text-zinc-400">
                    Logo
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                  }}
                />
              </div>
              {uploading && <p className="text-xs text-zinc-500">Yükleniyor...</p>}
            </Field>
            <Field label="Slogan (kısa tanıtım)">
              <input
                className="input"
                value={data.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Örn. Şehrin en taze kahvesi"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Hakkında / Tanıtım</h2>
            <Field label="Tanıtım metni">
              <textarea
                className="input min-h-32"
                value={data.intro}
                onChange={(e) => update("intro", e.target.value)}
                placeholder="İşletmeniz hakkında ziyaretçilere göstermek istediğiniz metin."
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">İletişim bilgileri</h2>
            <Field label="E-posta">
              <input
                className="input"
                type="email"
                value={data.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                placeholder="info@firma.com"
              />
            </Field>
            <Field label="Telefon">
              <input
                className="input"
                value={data.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                placeholder="+90 5xx xxx xx xx"
              />
            </Field>
            <Field label="Adres">
              <textarea
                className="input min-h-20"
                value={data.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Instagram">
                <input
                  className="input"
                  value={data.socials.instagram}
                  onChange={(e) => updateSocial("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </Field>
              <Field label="Facebook">
                <input
                  className="input"
                  value={data.socials.facebook}
                  onChange={(e) => updateSocial("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </Field>
              <Field label="X / Twitter">
                <input
                  className="input"
                  value={data.socials.twitter}
                  onChange={(e) => updateSocial("twitter", e.target.value)}
                  placeholder="https://x.com/..."
                />
              </Field>
              <Field label="Web sitesi">
                <input
                  className="input"
                  value={data.socials.website}
                  onChange={(e) => updateSocial("website", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Tema seçin</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => update("themeKey", theme.key)}
                  className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition ${
                    data.themeKey === theme.key
                      ? "border-zinc-900 ring-2 ring-zinc-900"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <div className="flex gap-2">
                    <span
                      className="h-6 w-6 rounded-full border"
                      style={{ background: theme.vars["--site-primary"] }}
                    />
                    <span
                      className="h-6 w-6 rounded-full border"
                      style={{ background: theme.vars["--site-bg"] }}
                    />
                    <span
                      className="h-6 w-6 rounded-full border"
                      style={{ background: theme.vars["--site-card"] }}
                    />
                  </div>
                  <p className="font-medium">{theme.name}</p>
                  <p className="text-xs text-zinc-500">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Önizleme &amp; Yayınla</h2>
            <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <Summary label="Site adı" value={data.name} />
              <Summary label="Adres" value={`/s/${data.slug}`} />
              <Summary label="Slogan" value={data.tagline} />
              <Summary label="Tema" value={THEMES.find((t) => t.key === data.themeKey)?.name ?? ""} />
              <Summary label="E-posta" value={data.contactEmail} />
              <Summary label="Telefon" value={data.contactPhone} />
            </div>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmit}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {pending ? "Oluşturuluyor..." : "Siteyi yayınla"}
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Geri
          </button>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              İleri
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="font-medium text-zinc-700">{label}:</span>{" "}
      <span className="text-zinc-600">{value}</span>
    </p>
  );
}
