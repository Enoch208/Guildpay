import { Sidebar } from "@/components/dashboard/sidebar";

/** Shell for the authenticated product area. Each page guards with requireActiveGuild(). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-3 sm:p-5">
      <div className="flex gap-5">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
