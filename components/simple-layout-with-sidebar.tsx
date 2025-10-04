"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"

interface SimpleLayoutWithSidebarProps {
  children: React.ReactNode
  currentPath?: string
}

export default function SimpleLayoutWithSidebar({ children, currentPath }: SimpleLayoutWithSidebarProps) {
  const [open, setOpen] = useState(false)
  
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "🏠"
    },
    {
      label: "Administrador",
      href: "/administrador",
      icon: "👤"
    },
    {
      label: "Configuración",
      href: "/configuracion",
      icon: "⚙️"
    },
    {
      label: "Reportes",
      href: "/reportes",
      icon: "📊"
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${open ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              {open && <span className="font-bold text-lg">Lex Realis</span>}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    currentPath === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {open && <span className="text-sm font-medium">{link.label}</span>}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t">
            <LogoutButton variant="ghost" className="w-full justify-start">
              <span className="text-xl mr-3">🚪</span>
              {open && <span>Cerrar Sesión</span>}
            </LogoutButton>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}





















