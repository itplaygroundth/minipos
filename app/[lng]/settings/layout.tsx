import { Metadata } from "next"
import Image from "next/image"
import { cookies } from "next/headers"
import Cookies from 'js-cookie';
import { SidebarNav } from "@/components/settings/components/sidebar-nav"
//import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui"
import { MainNav } from "@/components/main-nav"
import { Search } from "lucide-react"
import LanguageToggle from "@/components/language-toggle"
import { UserNav } from "@/components/user-nav"
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
}


interface SettingsLayoutProps {
  children: React.ReactNode
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
 // const cookieStore = cookies();
 // const pathname = usePathname()
  //const lang = pathname?.split('/')[1] || languages[0]
 // const lngCookie = Cookies.get('lng'); // ดึงค่าจากคุกกี้
 const session = await getSession()
 const cookieStore = await cookies()
 const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
 const lngCookie = Cookies.get('lng'); // ดึงค่าจากคุกกี้
 //console.log('lngCookie:', lngCookie); // ตรวจสอบค่าที่ได้จากคุกกี้
 const initialLocale = lngCookie ? lngCookie : 'th'; // ใช้ค่า lngCookie ถ้ามี ไม่งั้นใช้ 'en'
 const {role}= session

  return (
    <>
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
      <div className="md:hidden">
        <Image
          src="/examples/forms-light.png"
          width={1280}
          height={791}
          alt="Forms"
          className="block dark:hidden"
        />
        <Image
          src="/examples/forms-dark.png"
          width={1280}
          height={791}
          alt="Forms"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        {/* <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>  
        <Separator className="my-6" /> */}
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav role={role} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
      </main>
    </SidebarInset>
    </SidebarProvider>
    </>
  )
}
