"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CondoTabsSimpleProps {
  condoId: string;
}

export function CondoTabsSimple({ condoId }: CondoTabsSimpleProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const tabs = [
    { value: "dashboard", label: "Dashboard", href: `/condos/${condoId}/dashboard` },
    { value: "asambleas", label: "Asambleas", href: `/condos/${condoId}/asambleas` },
    { value: "planes", label: "Planes", href: `/condos/${condoId}/planes` },
    { value: "certificaciones", label: "Certificaciones", href: `/condos/${condoId}/certificaciones` },
    { value: "seguros", label: "Seguros", href: `/condos/${condoId}/seguros` },
    { value: "contratos", label: "Contratos", href: `/condos/${condoId}/contratos` },
    { value: "copropietarios", label: "Copropietarios", href: `/condos/${condoId}/copropietarios` },
  ];

  const isActive = (href: string) => {
    if (href.includes("/dashboard") && pathname.includes("/dashboard")) return true;
    if (href.includes("/asambleas") && pathname.includes("/asambleas")) return true;
    if (href.includes("/planes") && pathname.includes("/planes")) return true;
    if (href.includes("/certificaciones") && pathname.includes("/certificaciones")) return true;
    if (href.includes("/seguros") && pathname.includes("/seguros")) return true;
    if (href.includes("/contratos") && pathname.includes("/contratos")) return true;
    if (href.includes("/copropietarios") && pathname.includes("/copropietarios")) return true;
    return false;
  };


  // Versión móvil con scroll horizontal
  if (isMobile) {
    return (
      <div className="w-full">
        {/* Scroll horizontal para móvil */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={cn(
                "flex-shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap",
                isActive(tab.href)
                  ? "bg-background text-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Versión desktop con grid
  return (
    <div className="grid w-full grid-cols-7 rounded-2xl bg-muted p-1">
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










