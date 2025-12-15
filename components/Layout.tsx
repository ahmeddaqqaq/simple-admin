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
import { LogOut } from "lucide-react";
import { showSuccess } from "@/lib/utils/error-handler";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/home" },
    { label: "Orders", href: "/orders" },
    { label: "Categories", href: "/categories" },
    { label: "Ingredients", href: "/ingredients" },
    { label: "Ready Items", href: "/ready-items" },
    { label: "Settings", href: "/settings" },
  ];

  const handleLogout = async () => {
    await authService.logout();
    showSuccess("Logged out successfully");
    router.push("/");
  };

  return (
    <>
      <ApiConfigInitializer />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex flex-col">
          <div className="p-6 border-b flex items-center justify-center">
            <Image
              src="/simple.png"
              alt="Simple Admin"
              width={150}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <nav className="flex-1 overflow-y-auto mt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-6 py-3 text-gray-700 hover:bg-gray-200 ${
                    isActive ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  {item.label}
                  {item.label === "Orders" && <Badge className="ml-2">New</Badge>}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-auto">
          <OrderNotifier />
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
