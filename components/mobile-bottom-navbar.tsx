"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  IconDashboard,
  IconBuilding,
  IconUser,
  IconSettings,
  IconReportAnalytics,
  IconShield,
  IconChecklist,
} from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import { cn } from "@/lib/utils"

interface MobileBottomNavbarProps {
  currentPath?: string
}

export function MobileBottomNavbar({ currentPath }: MobileBottomNavbarProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isSuper, setIsSuper] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const superAdminStatus = await isSuperAdmin()
        setIsSuper(superAdminStatus)
      }
    }

    getUser()
  }, [])

  const baseLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconDashboard className="h-5 w-5" />,
    },
    {
      label: "Condominios",
      href: "/condos",
      icon: <IconBuilding className="h-5 w-5" />,
    },
    {
      label: "Gestiones",
      href: "/gestiones",
      icon: <IconChecklist className="h-5 w-5" />,
    },
    {
      label: "Administrador",
      href: "/administrador",
      icon: <IconUser className="h-5 w-5" />,
    },
    {
      label: "Configuración",
      href: "/configuracion",
      icon: <IconSettings className="h-5 w-5" />,
    },
    {
      label: "Reportes",
      href: "/reportes",
      icon: <IconReportAnalytics className="h-5 w-5" />,
    },
  ]

  const superAdminLink = {
    label: "Super Admin",
    href: "/super-admin",
    icon: <IconShield className="h-5 w-5" />,
  }

  const links = isSuper ? [superAdminLink, ...baseLinks] : baseLinks

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around py-2">
        {links.slice(0, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-0 flex-1",
              currentPath === link.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              {link.icon}
              {link.label === "Super Admin" && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs"
                >
                  <span className="sr-only">Admin</span>
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-full">
              {link.label === "Super Admin" ? "Admin" : link.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}









