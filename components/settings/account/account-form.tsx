"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronDownIcon, ChevronsUpDown, Currency } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { languages } from '@/app/i18n/setting'
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
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
import { useEffect, useState } from "react"
import { GetExchangeRate, GetSettings, UpdateSettings } from "@/actions"
import { useTranslation } from "@/app/i18n/client"
import { usePathname } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui"
import Cookies from "js-cookie"
import { iSetting } from "@/types"
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


export function AccountForm() {
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] || languages[0]
  const {t} = useTranslation(lang,"common",undefined)
  const [settings,setSettings] = useState<iSetting>()
  //const { setCustomerCurrency } = useAuthStore();
  const [customerCurrency,setCustomerCurrency] = useState("")
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number } | null>(null)
  const posid = Cookies.get("posid")

  const defaultValues: Partial<AccountFormValues> = {
    // name: "Your name",
    // dob: new Date("2023-01-23"),
    machinenumber:posid,
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
      
       if(posid){
       const response = await  GetSettings(posid)
         
       if(response.Status){
        //console.log(response.Data)
        const {posId,location,data} = response.Data
       //form.Set()
        setSettings(response.Data)
      //   console.log(data.Data[1].key,data.Data[1].value)
      // machinenumber:"01",
      // taxnumber:"0",
      // address:"",
      // baseCurrency:"USD",
      // targetCurrency:"THB"
      //form.setValue("machinenumber",posId)
      const obj = JSON.parse(data)
      console.log(obj)
      form.setValue("taxno",obj.taxno)
      form.setValue("address",location)
      form.setValue("baseCurrency",obj.baseCurrency)
      form.setValue("targetCurrency",obj.targetCurrency)
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
          }
        }
       } catch (error) {
        console.error("Error fetching agent settigs:", error)
         
      }
    }
    
    fetchSettings()
  
  },[])



  function onSubmit(data: AccountFormValues) {

   const update = async () => {

      

       let udata = {
        "posId":data.machinenumber,
        "status":"active",
        "location": data.address,
        "data":""}

        let subdata = {
          "taxno":data.taxno,
          "taxrate":"7%",
          "baseCurrency":data.baseCurrency,
          "targetCurrency":data.targetCurrency,
          "saleprice":"",
          "whcode":"",
          "shelfcode":""
        }

        if(settings){
          const obj = JSON.parse(settings?.data)
          subdata.saleprice = obj.saleprice
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
        console.log(response)
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




  // function onSubmit(data: AccountFormValues) {
  //   console.log(data)
  //   toast({
  //     title: "You submitted the following values:",
  //     description: (
  //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //         <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //       </pre>
  //     ),
  //   })
  // }

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
                <Input placeholder={t('account.posid_placeholder')} {...field} className={cn("w-50")} />
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
          name="taxno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.taxno')}</FormLabel>
              <FormControl>
                <Input placeholder={t('account.taxno_placeholder')} {...field} className={cn("w-50")} />
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.address')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('account.address_placeholder')} {...field} 
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
        {/* <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="Your currency." {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile and in
                emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
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
        {/* <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        {/* <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue("language", language.value)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2",
                                language.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <Button type="submit">{t('settings.button.save')}</Button>
      
      </form>
    </Form>
    </div>
  )
}
