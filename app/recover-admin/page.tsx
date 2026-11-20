import { notFound } from "next/navigation";
import { AdminRecoveryService } from "@/services/admin/admin-recovery-service";
import { AdminRecoveryWizard } from "./recovery-wizard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Recovery | GoWithStudy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminRecoveryPage() {
  const allowed = await AdminRecoveryService.isRecoveryAllowed();
  if (!allowed) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <AdminRecoveryWizard />
    </div>
  );
}
