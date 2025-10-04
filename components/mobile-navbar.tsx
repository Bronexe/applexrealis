"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  IconDashboard,
  IconBuilding,
  IconFileText,
  IconShield,
  IconLogout,
  IconUser,
  IconSettings,
  IconReportAnalytics,
  IconMail,
  IconMenu2,
  IconX,
} from "@tabler/icons-react"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { isSuperAdmin } from "@/lib/actions/super-admin"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface MobileNavbarProps {
  currentPath?: string
}

export function MobileNavbar({ currentPath }: MobileNavbarProps) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
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
      
      setIsLoadingUser(false)
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
    icon: <IconShield className="h-5 w-5 text-destructive" />,
  }

  const links = isSuper ? [superAdminLink, ...baseLinks] : baseLinks

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/Favicon.png"
              alt="Lex Realis Logo"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg">Lex Realis</span>
          </Link>

          {/* Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <IconMenu2 className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de Navegación</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/Favicon.png"
                      alt="Lex Realis Logo"
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    <span className="font-semibold text-lg">Lex Realis</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="h-8 w-8"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-6 py-4">
                  <nav className="space-y-2">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                          currentPath === link.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {link.icon}
                        <span className="font-medium">{link.label}</span>
                        {link.label === "Super Admin" && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            Admin
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* User Info & Logout */}
                <div className="border-t p-6 space-y-4">
                  {/* User Info */}
                  {!isLoadingUser && user && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <IconMail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Sesión activa</p>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <LogoutButton 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => setOpen(false)}
                  >
                    <IconLogout className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </LogoutButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
