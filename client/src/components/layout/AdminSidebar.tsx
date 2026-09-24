import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  Printer,
  Users,
  Settings,
  LogOut,
  Package,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import SBOLogo from "../../assets/sbo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  description?: string;
}

const NAV_MAIN: NavItem[] = [
  {
    label: "Operations Dashboard",
    href: "/admin/dashboard",
    icon: Layers,
    description: "Live station overview",
  },
  {
    label: "Print Queue",
    href: "/admin/requests",
    icon: Printer,
    badge: "7",
    description: "Active & pending jobs",
  },
  {
    label: "Inventory & Supplies",
    href: "/admin/inventory",
    icon: Package,
    description: "Paper, ink & stock",
  },
];

const NAV_MANAGEMENT: NavItem[] = [
  {
    label: "Student Accounts",
    href: "/admin/students",
    icon: Users,
    description: "Manage student access",
  },
  {
    label: "Print Logs & Reports",
    href: "/admin/reports",
    icon: FileSpreadsheet,
    description: "Analytics & audit trail",
  },
  {
    label: "Station Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Configure the system",
  },
];

export const NAV_ITEMS: NavItem[] = [...NAV_MAIN, ...NAV_MANAGEMENT];

function NavGroup({
  items,
  label,
  pathname,
}: {
  items: NavItem[];
  label?: string;
  pathname: string;
}) {
  return (
    <SidebarGroup className="px-0 py-0">
      {label && (
        <SidebarGroupLabel className="px-3 mb-1 text-[9.5px] font-black tracking-[0.16em] uppercase text-slate-400">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/dashboard" && pathname === "/admin");

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.label}
                  render={
                    <Link
                      to={item.href}
                      className="flex items-center justify-between w-full"
                    />
                  }
                  className={[
                    "relative h-auto py-2.5 px-3 rounded-xl transition-all duration-150 group/nav",
                    isActive
                      ? "!bg-[#073474] !text-white shadow-sm shadow-[#073474]/20"
                      : "text-slate-500 hover:text-[#FF7701] hover:bg-orange-50",
                  ].join(" ")}
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white/50 rounded-r-full"
                    />
                  )}

                  <span className="flex items-center gap-2.5 min-w-0">
                    {/* Icon wrapper */}
                    <span
                      className={[
                        "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-150",
                        isActive
                          ? "bg-white/15"
                          : "bg-slate-100 group-hover/nav:bg-orange-100",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "w-3.5 h-3.5 shrink-0",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover/nav:text-[#FF7701]",
                        ].join(" ")}
                      />
                    </span>

                    {/* Label + description */}
                    <span className="flex flex-col min-w-0 leading-none">
                      <span
                        className={[
                          "text-xs font-bold truncate tracking-tight",
                          isActive
                            ? "text-white"
                            : "text-slate-700 group-hover/nav:text-[#FF7701]",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                      {item.description && (
                        <span
                          className={[
                            "text-[10px] mt-0.5 truncate font-medium",
                            isActive
                              ? "text-white/60"
                              : "text-slate-400 group-hover/nav:text-orange-400",
                          ].join(" ")}
                        >
                          {item.description}
                        </span>
                      )}
                    </span>
                  </span>

                  {/* Badge / chevron */}
                  <span className="flex items-center gap-1 shrink-0 ml-1">
                    {item.badge ? (
                      <span
                        className={[
                          "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black tabular-nums",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#FF7701] text-white",
                        ].join(" ")}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      !isActive && (
                        <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover/nav:opacity-100 group-hover/nav:text-orange-300 transition-all" />
                      )
                    )}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const location = useLocation();
  const { adminUser, logoutAdmin } = useAdminAuth();

  return (
    <Sidebar
      className="border-r border-slate-200 [--sidebar-width:16rem]"
      collapsible="offcanvas"
    >
      {/* Header */}
      <SidebarHeader className="px-5 pt-5 pb-4 pr-6 border-b border-slate-100">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 group min-w-0 pr-2"
        >
          {/* SBO Logo */}
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <img
              src={SBOLogo}
              alt="BukSU SBO"
              className="w-full h-full object-contain"
            />
          </div>

          {/* System Name */}
          <div className="min-w-0 leading-none">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-[15px] font-black tracking-tight text-[#073474]">
                SBO
              </span>

              <span className="text-[15px] font-black tracking-tight text-[#FF7701]">
                Printing System
              </span>
            </div>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              College of Technologies
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2.5 py-4 flex flex-col gap-1.5">
        <NavGroup items={NAV_MAIN} pathname={location.pathname} />
        <NavGroup items={NAV_MANAGEMENT} pathname={location.pathname} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 pb-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-colors group">
          <Avatar className="w-10 h-10 border-transparent shrink-0">
            <AvatarImage
              src={
                adminUser?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${adminUser?.name || "admin"}`
              }
              alt={adminUser?.name || "Admin"}
            />
            <AvatarFallback className="text-[10px] bg-[#073474]/10 text-[#073474] font-black">
              {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-700 truncate leading-tight">
              {adminUser?.name || "BukSU Officer"}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {adminUser?.studentId || "SBO-ADMIN"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logoutAdmin}
            className="w-7 h-7 shrink-0 text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
