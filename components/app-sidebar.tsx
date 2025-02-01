import * as React from "react"

 
import { VersionSwitcher } from "./version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "./ui"
import {  SignOutTh } from "@/actions"
 

// This is sample data.
const data = {
  versions: ["1.1.0-alpha"],//["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "หน้าจอหลัก",
      url: "#",
      items: [
        {
          title: "POS",
          url: "home",
        },
        {
          title: "นำเข้า",
          url: "import",
        },
       
      ],
    },
    {
      title: "ระบบการซื้อขาย",
      url: "#",
      items: [
        {
          title: "จัดการซื้อ",
          url: "#",
        },
        {
          title: "จัดการขาย",
          url: "#",
        },
        {
          title: "คืนสินค้า/ส่วนลด",
          url: "#",
        },
      ],
    },
    {
      title: "ระบบบัญชี",
      url: "#",
      items: [
        {
          title: "กำหนดงวด",
          url: "#",
        },
        {
          title: "ผังบัญขี",
          url: "account",
        },
    //     {
    //       title: "Data Fetching",
    //       url: "#",
    //       isActive: true,
    //     },
    //     {
    //       title: "Rendering",
    //       url: "#",
    //     },
    //     {
    //       title: "Caching",
    //       url: "#",
    //     },
    //     {
    //       title: "Styling",
    //       url: "#",
    //     },
    //     {
    //       title: "Optimizing",
    //       url: "#",
    //     },
    //     {
    //       title: "Configuring",
    //       url: "#",
    //     },
    //     {
    //       title: "Testing",
    //       url: "#",
    //     },
    //     {
    //       title: "Authentication",
    //       url: "#",
    //     },
    //     {
    //       title: "Deploying",
    //       url: "#",
    //     },
    //     {
    //       title: "Upgrading",
    //       url: "#",
    //     },
    //     {
    //       title: "Examples",
    //       url: "#",
    //     },
    ],
    },
    {
      title: "รายงาน",
      url: "#",
      items: [
        {
          title: "รายงานทั่วไป",
          url: "#",
        },
    //     {
    //       title: "File Conventions",
    //       url: "#",
    //     },
    //     {
    //       title: "Functions",
    //       url: "#",
    //     },
    //     {
    //       title: "next.config.js Options",
    //       url: "#",
    //     },
    //     {
    //       title: "CLI",
    //       url: "#",
    //     },
    //     {
    //       title: "Edge Runtime",
    //       url: "#",
    //     },
      ],
    },
    // {
    //   title: "Architecture",
    //   url: "#",
    //   items: [
    //     {
    //       title: "Accessibility",
    //       url: "#",
    //     },
    //     {
    //       title: "Fast Refresh",
    //       url: "#",
    //     },
    //     {
    //       title: "Next.js Compiler",
    //       url: "#",
    //     },
    //     {
    //       title: "Supported Browsers",
    //       url: "#",
    //     },
    //     {
    //       title: "Turbopack",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
  
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item:{title:string,url:string,items:any[]}) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item: { title: string; url: string; isActive: boolean; }) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))
        
        }
      
      </SidebarContent>
      <SidebarRail />
      <div className="relative left-0 bottom-0 m-2 flex justify-center ">
        <div className="flex grow items-end gap-4">
            <Button 
            variant="ghost"
            className="w-[240px] justify-center h-10 mt-5 bg-orange-400 hover:text-white hover:bg-orange-700"
            onClick={SignOutTh}
            > ออกจากระบบ</Button>  
         </div>
         </div>
    </Sidebar>
  )
}
