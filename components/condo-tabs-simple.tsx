"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CondoTabsSimpleProps {
  condoId: string;
}

export function CondoTabsSimple({ condoId }: CondoTabsSimpleProps) {
  const pathname = usePathname();

  const tabs = [
    { value: "dashboard", label: "Dashboard", href: `/condos/${condoId}/dashboard` },
    { value: "asambleas", label: "Asambleas", href: `/condos/${condoId}/asambleas` },
    { value: "planes", label: "Planes", href: `/condos/${condoId}/planes` },
    { value: "certificaciones", label: "Certificaciones", href: `/condos/${condoId}/certificaciones` },
    { value: "seguros", label: "Seguros", href: `/condos/${condoId}/seguros` },
  ];

  const isActive = (href: string) => {
    if (href.includes("/dashboard") && pathname.includes("/dashboard")) return true;
    if (href.includes("/asambleas") && pathname.includes("/asambleas")) return true;
    if (href.includes("/planes") && pathname.includes("/planes")) return true;
    if (href.includes("/certificaciones") && pathname.includes("/certificaciones")) return true;
    if (href.includes("/seguros") && pathname.includes("/seguros")) return true;
    return false;
  };

  return (
    <div className="grid w-full grid-cols-5 rounded-2xl bg-muted p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={cn(
            "flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
            isActive(tab.href)
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}






