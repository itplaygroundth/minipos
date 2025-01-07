"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
 
import { languages } from '@/app/i18n/setting'
import { useTranslation } from "@/app/i18n/client"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  // items: {
  //   href: string
  //   title: string
  // }[]
}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()
 
  const lang = pathname?.split('/')[1] || languages[0]
  
  const {t} = useTranslation(lang,"common",undefined)
     //console.log('lngCookie:', lngCookie); // ตรวจสอบค่าที่ได้จากคุกกี้
   const initialLocale = lang ? lang : 'en'; // ใช้ค่า lngCookie ถ้ามี ไม่งั้นใช้ 'en'

  const sidebarNavItems = [
    {
      title:  `${t('menu.profile')}`,
      href: `/${initialLocale}/settings`,
    },
    {
      title: `${t('menu.account')}`,
      href: `/${initialLocale}/settings/account`,
    },
    {
      title: `${t('menu.appearance')}`,
      href: `/${initialLocale}/settings/appearance`,
    },
    {
      title: `${t('menu.notifications')}`,
      href: `/${initialLocale}/settings/notifications`,
    },
    {
      title: `${t('menu.display')}`,
      href: `/${initialLocale}/settings/display`,
    },
  ]
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
