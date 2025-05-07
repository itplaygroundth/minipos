import { ReactNode } from 'react'
import { cookies } from "next/headers"
import Cookies from 'js-cookie'; 
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui"
import { MainNav } from "@/components/main-nav"

import LanguageToggle from "@/components/language-toggle"
import { UserNav } from "@/components/user-nav"
import { getSession } from '@/lib/session';

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({
  children, 
}: LayoutProps) {
    const session = await getSession()
    const {role} = session
    
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
    const lngCookie = Cookies.get('lng'); // ดึงค่าจากคุกกี้
    //console.log('lngCookie:', lngCookie); // ตรวจสอบค่าที่ได้จากคุกกี้
    const initialLocale = lngCookie ? lngCookie : 'th'; // ใช้ค่า lngCookie ถ้ามี ไม่งั้นใช้ 'en'

    
  return (
    
    <SidebarProvider defaultOpen={defaultOpen}>
    <AppSidebar />
    <SidebarInset>
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
    <SidebarTrigger className="-ml-1" />
    <Separator orientation="vertical" className="mr-2 h-4" />
    <MainNav role={role} />
    <div className="ml-auto flex items-center space-x-4">
        {/* <Search /> */}
        <LanguageToggle initialLocale={initialLocale} /> {/* ส่งค่า locale ไปยัง Client Component */}
        <UserNav />
    </div>
    </header>
    <main>
        {children}
    </main>
    </SidebarInset>
    </SidebarProvider>
  )
}
