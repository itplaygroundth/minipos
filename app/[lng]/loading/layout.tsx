
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
  }
  
  export default async function Layout({
    children, 
  }: LayoutProps) {
    //const posid  = sessionStorage.getItem('posid');
   // const session = await getSession()
   

  return (
    <div>
    <div className={cn("container pt-8 pb-8 px-4 sm:px-8",
        "min-h-[calc(100vh)] flex justify-center items-center")}>{children}</div>
    </div>
  );
}