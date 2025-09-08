"use client"

import React from "react"
import Link from "next/link"

interface BasicLayoutProps {
  children: React.ReactNode
  currentPath?: string
}

export default function BasicLayout({ children, currentPath }: BasicLayoutProps) {
  const links = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Administrador", href: "/administrador", icon: "👤" },
    { label: "Configuración", href: "/configuracion", icon: "⚙️" },
    { label: "Reportes", href: "/reportes", icon: "📊" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <h1 className="text-xl font-bold">Lex Realis</h1>
            </div>
            <nav className="flex items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

