import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CameraSection } from "@/components/admin/camera-section";
import { NotifSection } from "@/components/admin/notif-section";
import { RagSection } from "@/components/admin/rag-section";
import { RuntimeSection } from "@/components/admin/runtime-section";
import { VlmPromptsSection } from "@/components/admin/vlm-prompts-section";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a] text-white p-4 md:p-6 lg:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <AdminPageHeader />
        <CameraSection />
        <RuntimeSection />
        <VlmPromptsSection />
        <RagSection />
        <NotifSection />
      </div>
    </div>
  );
}
