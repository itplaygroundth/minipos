'use client'
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Authen } from "@/types";
import { useTranslation } from "@/app/i18n/client";
//import { useTranslation } from 'next-i18next';
//import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button, Input, Label,Separator,Select,SelectContent, SelectTrigger, SelectItem, SelectValue } from '@/components/ui';
import { useToast } from "@/hooks/use-toast";
import { Signin,Login } from "@/actions";
import { useRouter } from 'next/navigation';
import LanguageToggle from "../language-toggle";
 
import Cookies from 'js-cookie'; 
import { Value } from "@radix-ui/react-select";
 

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),//.min(6, "Password must be at least 6 characters long"),
  prefix: z.string(),
  server: z.string(),
  dbname: z.string(),
  posid: z.string()
});
const posIdsEnv = process.env.NEXT_PUBLIC_POSID;
export default function LoginComponent() {
    //const cookieStore = await cookies()
    //const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  
  

    // ตรวจสอบว่่าไม่เป็น undefined ก่อนการแปลง
 
  const lngCookie = Cookies.get('lng');
  const posid = Cookies.get('posid')
  const initialLocale = 'th' //lngCookie ? lngCookie.valueOf() : 'th'; 
 
  const [error, setError] = useState("");
  const [showing,setShowing] = useState(false)
  const [posIds,setPosids] = useState<any>([])
  const {toast} = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
        username: "", // กำหนดค่าเริ่มต้นให้กับ username
        password: "", // กำหนดค่าเริ่มต้นให้กับ password
        prefix: "ckd",
        server:"",
        dbname:"",
        posid:posid
      }
    })
    const redirect = ()=>{
        location.replace(`/register`)
    }
 
    const { t } = useTranslation(initialLocale,'common',undefined);
  const handleSubmit: SubmitHandler<Authen> =  async (data: z.infer<typeof loginSchema>) => {

    try {
    //const response =  await Signin({username:data.username,password:data.password,prefix:"TEST01",server:"BLACKNITRO"})
    const response =  await Login({username:data.username,password:data.password,dbname:"TEST01",server:"BLACKNITRO",prefix:"TEST01",posid:data.posid})
     
      if (response.Status) {
        
        toast({
            variant: "default",
            title: t('login.success'),
            description: response.Message,
          });
         // Cookies.set('posid',data.posid)
         // sessionStorage.setItem('posid',data.posid);
       //  console.log(`/${'en'}/home`)
          router.push(`/${'th'}/home`);
      } else {
        toast({
            variant: "destructive",
            title: t('login.error'),
            description: response.Message,
          });
      }
      
    }
    catch {
      toast({
        variant: "destructive",
        title: t('login.error'),
        description: "ยูสเซอร์หรือ รหัสผ่านไม่ถูกต้อง!",
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

  useEffect(()=>{
    setShowing(false)
    let posIds: string[] = [];
    if (posIdsEnv) {
        posIds = JSON.parse(posIdsEnv);
        setPosids(posIds)  // แปลงจาก string เป็น array
    }
    setShowing(true)
  },[])

  if(!showing)
     return <></> 
  
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
          name="posid"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>{t('common.posid.title')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                      <SelectValue placeholder={field.value || ""}/>   
                
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                  JSON.parse(posIdsEnv).map((item:any)=>(
                     <SelectItem key={item} value={`${item}`}>{`${item}`}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
              {/* <FormDescription>
              {t('common.saleprice.placeholder')}
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
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
            <Button  disabled type="button" onClick={redirect} className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 w-full">
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