import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Columns, Users, CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pipeline", href: "/pipeline", icon: Columns },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Product Finder</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-primary-foreground" : "text-gray-400"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
            Settings
          </button>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
