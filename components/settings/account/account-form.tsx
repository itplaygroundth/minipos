"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useIsMobile  } from "@/hooks/use-mobile"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronDownIcon, ChevronsUpDown, Currency } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { languages } from '@/app/i18n/setting'
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import TableList from "@/components/transactions/tablelist"
import { Button,buttonVariants } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
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
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
import { useEffect, useMemo, useState } from "react"
import { GetARList, GetExchangeRate, GetSettings, UpdateSettings } from "@/actions"
import { useTranslation } from "@/app/i18n/client"
import { usePathname } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui"
import Cookies from "js-cookie"
import { BCAr, iSetting } from "@/types"
import DebouncedInput from "@/components/debouncedinput"
import { useMediaQuery } from "@/hooks/use-media-query"
import Autocomplete from '@/components/ui/autocomplete'
// const languages = [
//   { label: "English", value: "en" },
//   { label: "French", value: "fr" },
//   { label: "German", value: "de" },
//   { label: "Spanish", value: "es" },
//   { label: "Portuguese", value: "pt" },
//   { label: "Russian", value: "ru" },
//   { label: "Japanese", value: "ja" },
//   { label: "Korean", value: "ko" },
//   { label: "Chinese", value: "zh" },
// ] as const

const accountFormSchema = z.object({
  machinenumber: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  taxno: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  address: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
    docformat: z
    .string().optional(),
    
  // currency: z
  //   .string()
  //   .min(2, {
  //     message: "Name must be at least 2 characters.",
  //   })
  //   .max(3, {
  //     message: "Name must not be longer than 3 characters.",
  //   }),
  // dob: z.date({
  //   required_error: "A date of birth is required.",
  // }),
  // language: z.string({
  //   required_error: "Please select a language.",
  // }),
  customer: z
  .string().optional(),
  baseCurrency: z.enum(["USD", "EUR", "THB"], {
    invalid_type_error: "Select a base currency",
    required_error: "Please select a base currency.",
  }).optional(),
  targetCurrency: z.enum(["USD", "EUR", "THB"], {
    invalid_type_error: "Select a target currency",
    required_error: "Please select a target currency.",
  }).optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.


export function AccountForm(config:any) {
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] || languages[0]
  const {t} = useTranslation(lang,"common",undefined)
  const {posId,location,data} = config.config
  const [settings,setSettings] = useState<iSetting>()
  const [showPanelAr,setShowPanelAr] = useState(false)
  const [customer,setCustomer] = useState<BCAr>()
  const [items,setItems] = useState<BCAr[]>([])
  //const { setCustomerCurrency } = useAuthStore();
  const [customerCurrency,setCustomerCurrency] = useState("")
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number } | null>(null)
  //const posid = Cookies.get("posid")
  const [posid,setPosid]= useState('')
  //const [setting,setSetting] = useState(config)
  const isMobile = useIsMobile()
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredDataItem,setfilteredDataItem] = useState([])
  const [filteredDataAr,setfilteredDataAr] = useState([])
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  const defaultValues: Partial<AccountFormValues> = {
    // name: "Your name",
    // dob: new Date("2023-01-23"),
    machinenumber: config.posId,
    docformat:`POS@@YYMM-####`,
    taxno:"0",
    address:"",
    baseCurrency:"USD",
    targetCurrency:"THB"
  
  }
 
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
     
         if(posId){
          form.setValue("machinenumber",posId)
          const obj = JSON.parse(data)
      
        console.log(obj)
        form.setValue("taxno",obj.taxno)
        form.setValue("address",location)
        form.setValue("docformat",obj.docformat)
        form.setValue("customer",obj.customer)
        form.setValue("baseCurrency",obj.baseCurrency)
        form.setValue("targetCurrency",obj.targetCurrency)
         }
       // setPosid(posId)
       //const response = await  GetSettings(setting.posid)
         
      // if(response.Status){
        //console.log(response.Data)
        
       //form.Set()
       setSettings(config.config)
      //   console.log(data.Data[1].key,data.Data[1].value)
      // machinenumber:"01",
      // taxnumber:"0",
      // address:"",
      // baseCurrency:"USD",
      // targetCurrency:"THB"
   
   
     
 
      const Customers = await GetARList()
      if(Customers.Status){
        setItems(Customers.Data)
      }
  
      //obj.forEach((item:any) => {
       
        //form.setValue(item.SettingKey,item.SettingValue)
     // });
        
      //   console.log(data.Data[2].key,data.Data[2].value)
      //  z.Set("user_commission",data.Data[2].value)

      //   console.log(data.Data.filter((obj:any)=>obj.key.indexOf("partner_commission"))[1])
      //   console.log(data.Data.filter((obj:any)=>obj.key.indexOf("user_commission"))[1])
        
      //  console.log(data.Data)
        
      //   form.setValue("partner_commission",data.Data[1].value)
      //   form.setValue("user_commission",data.Data[2].value)
        




        // Remove ID from formattedData before setting form values
        // const { ID, ...formData } = formattedData;
        // form.reset(formData as z.infer<typeof updatedFormSchema>);
       // } 

        // const usdData = await GetExchangeRate("USD")
        // const baseToUsd = base === "USD" ? 1 : 1 / usdData.rates[base]
        // const targetToUsd = target === "USD" ? 1 : 1 / usdData.rates[target]
        
        // const baseToTarget = baseToUsd / targetToUsd
        // const targetToBase = targetToUsd / baseToUsd

        // setExchangeRates({
        //   [base]: 1,
        //   [target]: baseToTarget,
        //   [`${target}To${base}`]: targetToBase
        // })
         // }
       // }
       } catch (error) {
        console.error("Error fetching agent settigs:", error)
         
      }
    }
   
    fetchSettings()
 
  },[])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        //setShowPanelItem(false);
        setShowPanelAr(false);  // ซ่อน Panel เมื่อกด ESC
    } 
    // else if (event.key === "Enter") {
    //     if (filteredDataItem.length === 1) {
    //         //handleSelectItem(filteredDataItem[0]); 
    //         setGlobalFilter('');// เลือกรายการเดียวที่แสดง
    //     } else if (filteredDataAr.length === 1) {
    //         handleSelectAr(filteredDataAr[0]); 
    //         //setSearchArTerm('');
    //     }
    // }
};
   useEffect(() => {
        // เพิ่ม event listener สำหรับการกดปุ่ม
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            // ลบ event listener เมื่อ component ถูก unmount
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
  function onSubmit(accdata: AccountFormValues) {

   const update = async () => {

      //console.log(accdata)

       let udata = {
        "posId":accdata.machinenumber,
        "status":"active",
        "location": accdata.address,
        "data":""}
 
        let subdata = {
          "taxno":accdata.taxno,
          "taxrate":"7%",
          "baseCurrency":accdata.baseCurrency,
          "targetCurrency":accdata.targetCurrency,
          "customer":accdata?.customer,
          "docformat":accdata?.docformat,
          "pricelevel":items.find((item)=>item.code==accdata?.customer)?.pricelevel,
          "price":"",
          "whcode":"",
          "shelfcode":""
        }

        if(settings){
          const obj = JSON.parse(settings?.data)
        //  console.log(obj)
          subdata.price = obj.price
          subdata.whcode = obj.whcode
          subdata.shelfcode = obj.shelfcode
        }
        udata.data =  JSON.stringify(subdata)

          toast({
                title: "You submitted the following values:",
                description: (
                  <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(udata, null, 2)}</code>
                  </pre>
                ),
              })
      //const obj = JSON.parse(settings?.data)
        const response = await UpdateSettings(udata)
       
  
      if(response.Status){
      //  console.log(response)
       // setCustomerCurrency(data.targetCurrency)
        // toast({
        //   title: t("settings.update"),
        // description: (
        //   <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //     <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        //   </pre>
        //   ),
        // })
      
      }else{
        toast({
          title: t("settings.update_preferences"),
          description: response.Message,
        })
      }
   }
  update() 
  }


 
  const modalArColumns = useMemo(() => [
        { id: 'rowNumber', header: 'ลำดับ' },
        { id: 'code', header: 'รหัสลูกค้า' },
        { id: 'name', header: 'ชื่อ' },
        { id: 'address', header: 'ที่อยู่' },
  ], [])
  useEffect(() => {
    const fetchExchangeRates = async (base: string, target: string) => {
      try {
        const usdData = await GetExchangeRate("USD")
        const baseToUsd = base === "USD" ? 1 : 1 / usdData.rates[base]
        const targetToUsd = target === "USD" ? 1 : 1 / usdData.rates[target]
        
        const baseToTarget = baseToUsd / targetToUsd
        const targetToBase = targetToUsd / baseToUsd

        setExchangeRates({
          [base]: 1,
          [target]: baseToTarget,
          [`${target}To${base}`]: targetToBase
        })
      } catch (error) {
        console.error("Error fetching exchange rates:", error)
        setExchangeRates(null)
      }
    }

    const baseCurrency = form.watch("baseCurrency")
    const targetCurrency = form.watch("targetCurrency")

    if (baseCurrency && targetCurrency && baseCurrency !== targetCurrency) {
      fetchExchangeRates(baseCurrency, targetCurrency)
    } else {
      setExchangeRates(null)
    }
  }, [form.watch("baseCurrency"), form.watch("targetCurrency")])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('account.title')}</h3>
        <p className="text-sm text-muted-foreground">
        {t('account.description')}
        </p>
      </div>
      <Separator />
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      
        <FormField
          control={form.control}
          name="machinenumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.posid')}</FormLabel>
              <FormControl>
                <Input placeholder={t('account.posid_placeholder')} {...field}  value={field.value || ''}  className={cn("w-50")} />
              </FormControl>
              <FormDescription>
              {t('account.posid_placeholder')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="docformat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.docformat')}</FormLabel>
              <FormControl>
                <Input placeholder={t('account.docformat_placeholder')} {...field}  value={field.value || ''}  className={cn("w-50")} />
              </FormControl>
              <FormDescription>
              {t('account.docformat_placeholder')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.taxno')}</FormLabel>
              <FormControl>
                <Input placeholder={t('account.taxno_placeholder')} {...field}  value={field.value || ''}  className={cn("w-50")} />
              </FormControl>
              <FormDescription>
              {t('account.taxno_placeholder')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div>
                <FormLabel>เลือกลูกค้า</FormLabel>
              </div>
            
              <Autocomplete
                value={field.value}
                onChange={field.onChange}
                allSuggestions={items.map((item) => ({ name: item.name, code: item.code }))}
                classname="w-full"
              />
              <FormDescription>
               กำหนดรหัสลูกค้าเริ่มต้น
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.address')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('account.address_placeholder')} {...field} 
                 value={field.value || ''} 
                className={cn("w-[400px]")}  
                  ref={(textarea) => {
                    if (textarea) {
                         textarea.style.height = "0px";
                        textarea.style.height = textarea.scrollHeight + "px";
                              }
                        }}
                />
              </FormControl>
              <FormDescription>
              {t('account.address_placeholder')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
         <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="baseCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.base_currency")}</FormLabel>
                <div className="relative w-max">
                  <FormControl>
                    <select
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-[200px] appearance-none font-normal"
                      )}
                      {...field}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="THB">THB</option>
                    </select>
                  </FormControl>
                  <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                </div>
                <FormMessage />
                <p>1 {form.watch("baseCurrency")}</p>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.target_currency")}</FormLabel>
                <div className="relative w-max">
                  <FormControl>
                    <select
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-[200px] appearance-none font-normal"
                      )}
                      {...field}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="THB">THB</option>
                    </select>
                  </FormControl>
                  <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                </div>
                <FormMessage />
                <p>{exchangeRates && exchangeRates[form.watch("targetCurrency") || "USD"] 
                    ? exchangeRates[form.watch("targetCurrency") || "USD"].toFixed(4) 
                    : '1'} {form.watch("targetCurrency")}</p>
              </FormItem>
            )}
          />
        </div>
       
        <Button type="submit">{t('settings.button.save')}</Button>
      
      </form>
     
      </Form>
    

  </div>
  )
}
