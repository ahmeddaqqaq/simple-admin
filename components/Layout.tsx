"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import OrderNotifier from "./OrderNotifier";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiConfigInitializer } from "./ApiConfigInitializer";
import { authService } from "@/lib/services/auth.service";
import {
  LayoutDashboard,
  ShoppingCart,
  FolderTree,
  Carrot,
  UtensilsCrossed,
  Tag,
  CreditCard,
  Users,
  Coins,
  Settings,
  LogOut,
} from "lucide-react";
import { showSuccess } from "@/lib/utils/error-handler";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/home", icon: LayoutDashboard },
    { label: "Orders", href: "/orders", icon: ShoppingCart, badge: "New" },
    { label: "Categories", href: "/categories", icon: FolderTree },
    { label: "Ingredients", href: "/ingredients", icon: Carrot },
    { label: "Ready Items", href: "/ready-items", icon: UtensilsCrossed },
    { label: "Promo Codes", href: "/promo-codes", icon: Tag },
    { label: "Subscription Plans", href: "/subscription-plans", icon: CreditCard },
    { label: "Subscriptions", href: "/customer-subscriptions", icon: Users },
    { label: "Gold Coins", href: "/gold-coins", icon: Coins },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await authService.logout();
    showSuccess("Logged out successfully");
    router.push("/");
  };

  return (
    <>
      <ApiConfigInitializer />
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-72 bg-card border-r border-border flex flex-col shadow-strong">
          {/* Logo Section */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4">
              <Image
                src="/simple.png"
                alt="Simple Admin"
                width={160}
                height={64}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? ""
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span
                    className={`flex-1 font-medium ${
                      isActive ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={`text-xs ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/90"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer/Logout Section */}
          <div className="p-4 border-t border-border/50 bg-muted/30">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <OrderNotifier />
          <div className="p-8 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </>
  );
};

export default Layout;
