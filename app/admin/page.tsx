import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NotifSection } from "@/components/admin/notif-section";
import { RagSection } from "@/components/admin/rag-section";
import { RuntimeSection } from "@/components/admin/runtime-section";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <AdminPageHeader />
        <RuntimeSection />
        <RagSection />
        <NotifSection />
      </div>
    </div>
  );
}
