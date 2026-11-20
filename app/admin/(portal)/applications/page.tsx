import { getAdminApplicationsAction } from "@/features/admin/application-actions";
import { AdminApplicationsClient } from "./applications-client";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const initialRes = await getAdminApplicationsAction({ status: "ALL" });
  const initialList = initialRes.data?.applications || [];

  return <AdminApplicationsClient initialApplications={initialList} />;
}
