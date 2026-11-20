import { notFound } from "next/navigation";
import { AdminSetupService } from "@/services/admin/admin-setup-service";
import { AdminSetupWizard } from "./setup-wizard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Setup | GoWithStudy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSetupPage() {
  const allowed = await AdminSetupService.isSetupAllowed();
  if (!allowed) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <AdminSetupWizard />
    </div>
  );
}
