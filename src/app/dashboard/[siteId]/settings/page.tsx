import { requireSiteOwner } from "@/lib/authz";
import { parseSocials } from "@/lib/sites";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { updateSiteSettings } from "./actions";

export default async function SiteSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { siteId } = await params;
  const { error, success } = await searchParams;
  const { site } = await requireSiteOwner(siteId);
  const socials = parseSocials(site.socials);

  const action = updateSiteSettings.bind(null, site.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">Site Ayarları</h2>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "slug-taken" ? "Bu site adresi zaten kullanılıyor." : "Lütfen bilgileri kontrol edin."}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Ayarlar kaydedildi.</p>
      )}

      <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
        <Field label="Site adı">
          <input className="input" name="name" defaultValue={site.name} required />
        </Field>

        <Field label="Site adresi (slug)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">/s/</span>
            <input className="input" name="slug" defaultValue={site.slug} required />
          </div>
        </Field>

        <ImageUploadField name="logoUrl" siteId={site.id} initialUrl={site.logoUrl} label="Logo" />

        <Field label="Slogan">
          <input className="input" name="tagline" defaultValue={site.tagline ?? ""} />
        </Field>

        <Field label="Tanıtım metni">
          <textarea className="input min-h-32" name="intro" defaultValue={site.intro ?? ""} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="E-posta">
            <input className="input" type="email" name="contactEmail" defaultValue={site.contactEmail ?? ""} />
          </Field>
          <Field label="Telefon">
            <input className="input" name="contactPhone" defaultValue={site.contactPhone ?? ""} />
          </Field>
        </div>

        <Field label="Adres">
          <textarea className="input min-h-20" name="address" defaultValue={site.address ?? ""} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Instagram">
            <input className="input" name="instagram" defaultValue={socials.instagram ?? ""} />
          </Field>
          <Field label="Facebook">
            <input className="input" name="facebook" defaultValue={socials.facebook ?? ""} />
          </Field>
          <Field label="X / Twitter">
            <input className="input" name="twitter" defaultValue={socials.twitter ?? ""} />
          </Field>
          <Field label="Web sitesi">
            <input className="input" name="website" defaultValue={socials.website ?? ""} />
          </Field>
        </div>

        <hr className="border-zinc-200" />
        <p className="text-sm font-semibold text-zinc-700">SEO</p>

        <Field label="Meta açıklama (seoDescription)">
          <textarea
            className="input min-h-20"
            name="seoDescription"
            defaultValue={site.seoDescription ?? ""}
            placeholder="Arama motorlarında görünen kısa açıklama (~160 karakter)"
          />
        </Field>

        <ImageUploadField
          name="ogImageUrl"
          siteId={site.id}
          initialUrl={site.ogImageUrl}
          label="Sosyal medya görseli (OG Image)"
        />

        <hr className="border-zinc-200" />
        <p className="text-sm font-semibold text-zinc-700">Analitik</p>

        <Field label="Google Analytics Ölçüm ID (G-XXXXXXXX)">
          <input
            className="input"
            name="gaId"
            defaultValue={site.gaId ?? ""}
            placeholder="G-XXXXXXXXXX"
          />
        </Field>

        <Field label="Meta Pixel ID">
          <input
            className="input"
            name="metaPixelId"
            defaultValue={site.metaPixelId ?? ""}
            placeholder="123456789012345"
          />
        </Field>

        <hr className="border-zinc-200" />

        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input type="checkbox" name="published" defaultChecked={site.published} />
          Site yayında
        </label>

        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Kaydet
        </button>
      </form>
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
