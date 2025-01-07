'use client'
import { Logout } from "@/actions"
import { useTranslation } from "@/app/i18n/client"
import { languages } from "@/app/i18n/setting"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,  
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
  } from "@/components/ui"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
  
  export function UserNav() {
    const pathname = usePathname()
    // const [currentLang, setCurrentLang] = useState('')
    // useEffect(() => {
    //     const fetchLng = async () =>{
    
    //     //const session = await getSession()
    //     const lang = pathname?.split('/')[1] || languages[0]
    //     //session.lng = lang
    //     setCurrentLang(lang)
    
    //     }
    //     fetchLng()
    //   }, [pathname])
    
    const lang = pathname?.split('/')[1] || languages[0]
    const {t} = useTranslation(lang,"common",undefined)
    const handleLogout = () => {
        //set({ isLoggedIn: false, accessToken: null,user:{username:"",fullname:"",prefix:"",password:""} });
       // document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      Logout(lang)
        //location.replace(`/${lang}`); // เปลี่ยนไปยังหน้าแรกหลังจาก logout
      };
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/shadcn.jpg" alt="@shadcn" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">shadcn</p>
              <p className="text-xs leading-none text-muted-foreground">
                m@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
             onClick={handleLogout}>{t('menu.logout')}  
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }