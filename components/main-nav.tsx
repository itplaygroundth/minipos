'use client'
import Link from "next/link"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/app/i18n/client"

import { usePathname } from "next/navigation"
import { languages } from '@/app/i18n/setting'
import { Menu } from "./menu"


export function MainNav({
  role,
  className,
  ...props
}: {
  role: string;
  className?: string;
  [key: string]: any;
}) {
    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]
    
  const {t} = useTranslation(lang,"common",undefined)
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6")}
      {...props}
    >
    
      {
        Menu.filter(item => item.Roles.includes(role)) 
        .map((item,index)=>{
          const Icon = item.Icon
          return (
          <Link  key={index}
        href={`/${lang}/${item.Link}`}
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary data-[active]:text-primary-foreground"
          prefetch={false}>
            { /*item.ShowIcon &&  <item.Icon size={16} color="currentColor" />*/ }
          {t(`menu.${item.Label}`)}
          </Link>
          )
        })
      }
    </nav>
    
  )
}