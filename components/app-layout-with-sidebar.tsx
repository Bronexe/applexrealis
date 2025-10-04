"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar-new";
import { MobileLayout } from "@/components/mobile-layout";
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
  IconChecklist,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/actions/super-admin";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutWithSidebarProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayoutWithSidebar({ children, currentPath }: AppLayoutWithSidebarProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Verificar si es super administrador
      if (user) {
        const superAdminStatus = await isSuperAdmin();
        setIsSuper(superAdminStatus);
      }
      
      setIsLoadingUser(false);
    };

    getUser();
  }, []);
  
  const baseLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Condominios",
      href: "/condos",
      icon: (
        <IconBuilding className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Gestiones",
      href: "/gestiones",
      icon: (
        <IconChecklist className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Administrador",
      href: "/administrador",
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Configuración",
      href: "/configuracion",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Reportes",
      href: "/reportes",
      icon: (
        <IconReportAnalytics className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  // Agregar enlace de super administrador si el usuario tiene permisos
  const superAdminLink = {
    label: "Super Admin",
    href: "/super-admin",
    icon: (
      <IconShield className="h-5 w-5 shrink-0 text-destructive" />
    ),
  };

  const links = isSuper ? [superAdminLink, ...baseLinks] : baseLinks;

  // En móviles, usar el layout móvil
  if (isMobile) {
    return <MobileLayout currentPath={currentPath}>{children}</MobileLayout>;
  }

  // En desktop, usar el sidebar tradicional
  return (
    <div className="h-screen flex bg-background">
      <Sidebar open={open} setOpen={setOpen} className="h-full sidebar-full-height">
        <SidebarBody className="justify-between gap-10 h-full flex flex-col">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link}
                  className={cn(
                    currentPath === link.href && "bg-primary/10 text-primary"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 space-y-3">
            <SidebarUserInfo open={open} user={user} isLoading={isLoadingUser} />
            <SidebarLogoutButton open={open} />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 flex-col h-full">
        <div className="flex-1 p-2 md:p-6 overflow-y-auto">
          {children}
        </div>
        <footer className="border-t bg-card p-4 flex-shrink-0">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© 2025 Lex Realis. Todos los Derechos Reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

const SidebarUserInfo = ({ open, user, isLoading }: { open: boolean; user: User | null; isLoading: boolean }) => {
  const { animate } = useSidebar();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-start gap-2 py-2">
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        <motion.div
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre inline-block !p-0 !m-0"
        >
          <span className="text-xs text-muted-foreground">Cargando...</span>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-start gap-2 group/sidebar py-2">
      <IconMail className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      <motion.div
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        <div className="flex flex-col">
          <span className="text-xs font-medium">{user.email}</span>
          <span className="text-xs text-muted-foreground">Sesión activa</span>
        </div>
      </motion.div>
    </div>
  );
};

const SidebarLogoutButton = ({ open }: { open: boolean }) => {
  const { animate } = useSidebar();
  
  return (
    <div className="flex items-center justify-start gap-2 group/sidebar py-2">
      <IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      <motion.div
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        <LogoutButton variant="ghost" className="h-auto p-0 text-sm">
          Cerrar Sesión
        </LogoutButton>
      </motion.div>
    </div>
  );
};

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <Image
        src="/Favicon.png"
        alt="Lex Realis Logo"
        width={32}
        height={32}
        className="rounded-lg"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-foreground"
      >
        Lex Realis
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <Image
        src="/Favicon.png"
        alt="Lex Realis Logo"
        width={32}
        height={32}
        className="rounded-lg"
      />
    </Link>
  );
};
