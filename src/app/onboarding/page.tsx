import { requireUser } from "@/lib/authz";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="flex-1 bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 pt-10">
        <h1 className="text-2xl font-bold text-zinc-900">Sitenizi oluşturun</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Birkaç adımda logo, tanıtım ve iletişim bilgilerinizi girin, sitenizi hemen yayınlayalım.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
