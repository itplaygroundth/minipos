'use client'
import { useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Authen } from "@/types";
import { useTranslation } from "@/app/i18n/client";
//import { useTranslation } from 'next-i18next';
//import { Button } from '@/components/ui/button';
import { Button, Input, Label, Form, FormField, FormItem, FormMessage,Separator } from '@/components/ui';
import { useToast } from "@/hooks/use-toast";
import { Signin } from "@/actions";
import { useRouter } from 'next/navigation';
import LanguageToggle from "../language-toggle";
 
import Cookies from 'js-cookie'; 

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  prefix: z.string().optional()
});

export default function Login() {
    //const cookieStore = await cookies()
    //const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
    const lngCookie = Cookies.get('lng');
    const initialLocale = lngCookie ? lngCookie.valueOf() : 'en'; 
  const { t } = useTranslation(initialLocale,'common',undefined);
  const [error, setError] = useState("");
  const [showing,setShowing] = useState(false)
 
  const {toast} = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
        username: "", // กำหนดค่าเริ่มต้นให้กับ username
        password: "", // กำหนดค่าเริ่มต้นให้กับ password
        prefix: "ckd"
      }
    })
    const redirect = ()=>{
        location.replace(`/register`)
    }
 

  const handleSubmit: SubmitHandler<Authen> =  async (data: z.infer<typeof loginSchema>) => {

    
    const response =  await Signin({username:data.username,password:data.password,prefix:"ckd"})
  
     
      if (response.Status) {
        
        toast({
            variant: "default",
            title: t('login.success'),
            description: response.Message,
          });
          router.push(`/${"en"}/home`);
      } else {
        toast({
            variant: "destructive",
            title: t('login.error'),
            description: response.Message,
          });
      }
      

    // const res = await fetch("api/login", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // });

    
    // const result = await res.json();
    //     if(result.Status){
    //   // Redirect or perform any action after successful login
    
   
    //   } else {
      
    //   toast({
    //     variant: "destructive",
    //     title: t('login.error'),
    //     description: result.Message,
    //   });
    // }
    //}
  };

  return (
    <div>
         <div className= "bg-gray-100 min-h-screen flex items-center justify-center p-6">
         <div className=" grow bg-white shadow-lg rounded-lg max-w-md mx-auto">
         <div className="px-6 py-4">
         <div className="flex flex-row px-6 py-4 ">
          <h2 className="text-gray-700 text-3xl font-semibold">{t('login.title')}</h2>
          {/* <LanguageToggle initialLocale={initialLocale} /> */}
        </div>
        
      <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField 
         control={form.control}
         name="username"
         render={({ field }) => (
          <FormItem>
            <Label>{t('login.username')}</Label>
            <Input {...field} value={field.value || ""}  />
          </FormItem>
         )} />
        <FormField
               control={form.control}
               name="password"
               render={({ field }) => (
          <FormItem>
            <Label>{t('login.password')}</Label>
            <Input type="password" {...field} value={field.value || ""} />
          </FormItem>)}
          />
        
        <div className="mt-6">
              <Button type="submit" className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 w-full">
                {t('login.title')}
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="mt-3">
            <Button type="button" onClick={redirect} className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 w-full">
                {t('login.register')}
              </Button>
            </div>
        </form>
      </Form>
      </div>
      </div>
      </div>
    </div>
  );
} 