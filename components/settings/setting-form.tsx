"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePathname } from "next/navigation"
import { languages } from "@/app/i18n/setting"
import { useTranslation } from "@/app/i18n/client"
import { useEffect, useState } from "react"
import { GetCodeName,GetSettings, UpdateSettings } from "@/actions"
import Cookies from 'js-cookie'; 
import { iSetting } from "@/types"


const profileFormSchema = z.object({
  price: z.string().optional(),
  whcode:z.string().optional(),
  shelfcode:z.string().optional(),
  // username: z
  //   .string()
  //   .min(2, {
  //     message: "Username must be at least 2 characters.",
  //   })
  //   .max(30, {
  //     message: "Username must not be longer than 30 characters.",
  //   }),
  // email: z
  //   .string({
  //     required_error: "Please select an email to display.",
  //   })
  //   .email(),
  // bio: z.string().max(160).min(4),
  // urls: z
  //   .array(
  //     z.object({
  //       value: z.string().url({ message: "Please enter a valid URL." }),
  //     })
  //   )
  //   .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.


export function SettingForm(config:any) {
 
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] || languages[0]
  const {t} = useTranslation(lang,"common",undefined)
  const {posId,location,data} = config.config
  const [unitcode,setUnitcode]= useState([])
  const [whcode,setWhcode]= useState([])
  const [shelfcode,setShelfcode]= useState([])
  const [setting,setSetting] = useState<iSetting>()
  const posid = Cookies.get("posid")
  // const { fields, append } = useFieldArray({
  //   name: "urls",
  //   control: form.control,
  // })
  const defaultValues: Partial<ProfileFormValues> = {
    price:setting?.price,
    whcode:setting?.whcode,
    shelfcode:setting?.shelfcode
  }
      
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
     defaultValues,
    mode: "onChange",
  })
  useEffect(()=>{
    const fetchSetting = async () =>{

      try {
      const whdata = await GetCodeName("BCWarehouse")
    
      if(whdata.Status){
        setWhcode(whdata.Data)
      }

      const shelfdata = await GetCodeName("BCShelf")
      if(shelfdata.Status){
        setShelfcode(shelfdata.Data)
      }
        //console.log(config)
        setSetting(config.config)
         const {data} = config.config
        
         const obj = JSON.parse(data)
        //console.log(obj)
         form.setValue("price",obj?.price.toString())
         form.setValue("whcode",obj?.whcode.toString())
         form.setValue("shelfcode",obj?.shelfcode.toString())
      // if(posid) {
      //  const response = await  GetSettings(posid)
         
      //  if(response.Status){
        
      //   setSetting(response.Data)
      //   const {data} = response.Data
      //   const obj = JSON.parse(data)
      //   //console.log(obj)
      //    form.setValue("price",obj?.price.toString())
      //    form.setValue("whcode",obj?.whcode.toString())
      //    form.setValue("shelfcode",obj?.shelfcode.toString())
      //  }
       
    
      //   }
       } catch (error) {
        console.error("Error fetching agent settigs:", error)
         
      }
    }

    fetchSetting()

  },[])




 
  
 


  function onSubmit(accdata: ProfileFormValues) {

    const update = async () => {
 
    //  toast({
    //        title: "You submitted the following values:",
    //        description: (
    //          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //          </pre>
    //        ),
    //      })
      
     // const posid = Cookies.get('posid')
    //  if(setting){
      const newsetting = Object.assign({}, setting || {}, accdata)
      
    //  console.log(setting)
      //}
      const udata = {
          "posId":posId,
          "status":"active",
          "location": setting?.location,
           "data": JSON.stringify({
            "taxno": setting ? JSON.parse(setting.data).taxno : "",
            "taxrate":"7%",
            "customer":setting? JSON.parse(setting.data).customer: "",
            "docformat":setting ? JSON.parse(setting.data).docformat:"",
            "baseCurrency": setting ? JSON.parse(setting.data).baseCurrency : "",
            "targetCurrency": setting ? JSON.parse(setting.data).targetCurrency : "",
            "price":newsetting.price,
            "whcode":newsetting.whcode,
            "shelfcode":newsetting.shelfcode
           })
        }
        
         toast({
          title: "You submitted the following values:",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(udata, null, 2)}</code>
            </pre>
          ),
        })

        const response = await UpdateSettings(udata)
      // //    {
      // //    "posId":posid,
      // //   //  "status":"active",
      // //   //  "location": data.address,
      // //    "data":JSON.stringify({
      // //      "taxno":data.taxno,
      // //      "taxrate":"7%",
      // //      "baseCurrency":data.baseCurrency,
      // //      "targetCurrency":data.targetCurrency
      // //    })})
        
   
        if(response.Status){
        //setCustomerCurrency(data.targetCurrency)
         toast({
           title: t("settings.update_preferences"),
         description: (
           <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
             <code className="text-white">{JSON.stringify(data, null, 2)}</code>
           </pre>
           ),
         })
       
       }else{
         toast({
           title: t("settings.update_preferences"),
           description: response.Message,
         })
       }
      }
   update() 
   }
 

  // function onSubmit(data: ProfileFormValues) {
  //   toast({
  //     title: "You submitted the following values:",
  //     description: (
  //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //         <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //       </pre>
  //     ),
  //   })
  // }

  return (
    <div className="space-y-6">
    <div>
        <h3 className="text-lg font-medium">{t('settings.title')}</h3>
        <p className="text-sm text-muted-foreground">
        {t('settings.description')}
        </p>
      </div>
      <Separator />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 md:w-[400px]">
        
         <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.saleprice.title')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.saleprice.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                  [1,2,3,4,5,6].map((item)=>(
                     <SelectItem key={item} value={`price${item}`}>
                      {`${t('common.saleprice.title')}${item}`}</SelectItem>
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
          name="whcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.warehouse.title')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.warehouse.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                  whcode.map((item:{code:string,name:string},index:number)=>(
                     <SelectItem key={index} value={`${item.code}`}>{`${item.name}`}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
              {/* <FormDescription>
              {t('common.warehouse.placeholder')}
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="shelfcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.shelf.title')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.shelf.title')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                  shelfcode.map((item:{code:string,name:string},index:number)=>(
                     <SelectItem key={index} value={`${item.code}`}>{`${item.name}`}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
              {/* <FormDescription>
                You can manage verified email addresses in your{" "}
                <Link href="/examples/forms">email settings</Link>.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    Add links to your website, blog, or social media profiles.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            Add URL
          </Button>
        </div> */}
        <Button type="submit">{t('settings.button.save')}</Button>
      </form>
    </Form>
    </div>
  )
}
