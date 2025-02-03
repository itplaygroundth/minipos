"use client"

import React, { useState, useEffect, useMemo, EventHandler, Component } from 'react'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import axios  from "axios"

import { languages } from '@/app/i18n/setting'
import { usePathname } from 'next/navigation';

import { Separator } from '@radix-ui/react-separator';


import {BCCharts, Items} from "@/types"
import TimeLabel from '../timelabel'
import Autocomplete from '../ui/autocomplete'

import { TreeView } from '../ui/extension/tree-view'
import Link from 'next/link'
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label } from '../ui'
import TableList from '@/components/tablelist'
import { set } from 'date-fns'
import { Copy, Files } from 'lucide-react'
import { DialogClose } from '../ui/dialog'
import { Switch } from '../ui/switch'
import { AddInvoice, ImportInv, ImportInvoice, ImportXls } from '@/actions'
import { toast } from '@/hooks/use-toast'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { resolve } from 'path'
import * as XLSX from 'xlsx';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { getSession, getSessionStr } from '@/lib/session'


interface SubItem {
    id: string;
    isSelectable: boolean;
    name: string;
    children?: SubItem[];
}



interface ChartProps {
    data: {
        Items: BCCharts[];
        // Customers: BCAr[];
        // Setting:string;
        // Docno:string;
        // Invoice:any[];
        Role:string;
    }
    message: string;
    status: boolean;
}



 const fileSchema = z.object({
    xls: z.instanceof(File).refine((file) => file.size < 7000000, {
        message: 'กรุณาเลือกไฟล์ก่อนอัปโหลด ขนาดไม่เกิน 7MB.',
      })
 })

interface IFileInput {
    xls: File;
}

export function XlsComponent()  {

    const [searchArTerm, setSearchArTerm] = useState('');

    const [parent, setParent] = useState<string | null>(null);
    const [chartcode, setChartCode] = useState<string>("");
    const form = useForm<IFileInput>({
        resolver: zodResolver(fileSchema),
    });

    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]

    const [isLoading,setIsLoading] = useState(false)
    const [isSale,setIsSale] = useState(false)
    const [isBuy,setIsBuy] = useState(false)
    const [isExpense,setIsExpense] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const [filteredDataItem,setfilteredDataItem] = useState([])
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [itemState,setItemsState] = useState<boolean>(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mode,setMode] = useState('')
    const formRef = React.useRef<HTMLFormElement>(null);
    const [jsonData, setJsonData] = useState("");
    // const filteredDataItem:BCCharts[] = data?.Items.filter(item =>
    //     (item?.name1?.toLowerCase().includes(searchArTerm?.toLowerCase()) ||
    //     (item?.name2?.toLowerCase().includes(searchArTerm?.toLowerCase()) ||
    //     item?.code?.toLowerCase().includes(searchArTerm?.toLowerCase())) &&
    //     (/\d/.test(searchArTerm) || /^[a-zA-Z\u0E00-\u0E7F]*$/.test(searchArTerm))
    // ))


   // const elements = data.Items.map((item)=>item.isheader==1 && {id:item.code,isSelectable:true,name:item.name1,children:[{id:item.code,isSelectable:true,name:item.name1}]})

   const organizeData = (data:BCCharts[])=> {
    const result:SubItem[] = [];

    // สร้าง root nodes
    const headers = data.filter(item => item.isheader === 1);
    headers.forEach(header => {
        const children = data.filter(item => item.code.startsWith(header.code) && item.isheader === 0);
        result.push({
            id: header.code,
            isSelectable: true,
            name: `${header.code}::${header.name1}`,
            children: children.map(child => ({
                id: child.code,
                isSelectable: true,
                name: `${child.code}::${child.name1}`,
            })),
        });
    });

    return result;
}
 const modalItemColumns = useMemo(() => [
        { id: 'rowNumber', header: 'ลำดับ',visible:true,format:'' },
        { id: 'code', header: 'รหัสสินค้า',visible:true,format:'' },
        { id: 'name', header: 'ชื่อ',visible:true,format:'' },
        { id: 'quantity', header: 'จำนวน',visible:true,format:'' },
        { id: 'unit', header: 'หน่วยนับ',visible:true,format:'' },
        { id: 'unitcode', header: 'หน่วยนับ',visible:false,format:'' },
        { id: 'price1', header: 'ราคา1',visible:true,format:'0.00'  },
        { id: 'price2', header: 'ราคา2',visible:true,format:'0.00'  },
        { id: 'price3', header: 'ราคา3',visible:true,format:'0.00'  },
    ], []);

  const handleSelectItem = (item: Items) => {}
  const handleLoadFile = (mode:string) => {
   
    switch(mode){
        case "sale":
            setIsSale(true)
            setIsBuy(false)
            setIsExpense(false)
            setMode("ขาย")
            break;
        case "buy":
            setIsSale(false)
            setIsBuy(true)
            setIsExpense(false)
            setMode("ซื้อ")
            break;
        case "expense":
            setIsSale(false)
            setIsBuy(false)
            setIsExpense(true)
            setMode("ค่าใช้จ่าย")
            break;            
    }
   
  }

  const clearState = () => {
    setItemsState(false);
    setSelectedFile(null);
  }
  const handleCloseDialog = (event:Event) => {}
  const handleFileChange = (event:Event) => {
    const target = event.target as HTMLInputElement;
    if (!target || !target.files || !target.files.length) return;
    setSelectedFile(target.files[0]);
    setFile(target.files[0]);
 ///   ImportXls(true,target.files[0])
  }
  const onSubmit = async (values: z.infer<typeof fileSchema>) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
        // Get session first
        const session = await getSessionStr();
        
        // Ensure we're only using the token string
        const token = JSON.parse(session)?.token?.toString();
        
        if (!token) {
            throw new Error("No authorization token available");
        }

        const formData = new FormData();
        formData.append('file', values.xls);

        const response = await axios.post('http://192.168.1.186:8030/api/v1/invoice/upload', formData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        })
        // .catch((err)=>{
        //     toast({
        //         title: "Error",
        //         description: err.Message,
        //         variant: "destructive",
        //     });
        // });
        if(response.status==200) {
            setSuccess("File uploaded successfully");
            toast({
                title: "Success",
                description: "File uploaded successfully",
                variant: "default",
            });
            setJsonData(JSON.stringify(response.data))
        } else {
            toast({
                title: "Error",
                description: response.data.Message,
                variant: "destructive",
            });
        }
        // Optional: Parse Excel data if still needed
        // const reader = new FileReader();
        // reader.onload = (e) => {
        //     const data = e.target?.result;
        //     if (data) {
        //         const workbook = XLSX.read(data, { type: "buffer" });
        //         const sheetName = workbook.SheetNames[0];
        //         const workSheet = workbook.Sheets[sheetName];
        //         const json = XLSX.utils.sheet_to_json(workSheet);
        //         setJsonData(JSON.stringify(json, null, 2));
        //     }
        // };
        // reader.readAsArrayBuffer(values.xls);

    } catch (error: any) {
       
        const errorMessage = error.response?.data?.message || error.message || "Failed to upload file";
        setError(errorMessage);
        toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  const handleUpload = (values:z.infer<typeof fileSchema>) => {

   //console.log(values)
    try {
        if (!values) {
            alert("กรุณาเลือกไฟล์ก่อนอัปโหลด");
            return;
          }
   if(values){
    // console.log(values)
    // ImportXls(itemState,values.xls)
    // AddInvoice(selectedFile)
    // .then((response) => {
    //         toast({
    //             variant: "default",
    //             title: "success",
    //             description: response.Message,
    //         });
    //         console.log(response)
    //     }).catch((error) => {
    //         console.log(error)
    //         toast({
    //             variant: "destructive",
    //             title: "error",
    //             description: error.message,
    //         });
    //     })
    //    console.log("ไฟล์ที่เลือก:", file?.[0]);
    }
    //ที่นี่คุณสามารถเขียนโค้ดสำหรับการอัปโหลดไฟล์ไปยังเซิร์ฟเวอร์ได้

   console.log("มีสินค้า:", itemState);
    }
    catch(err:any){
        console.log(err)
        toast({
                variant: "destructive",
                title: "error",
                description: err.toString(),
              });

    }


  };
//const elements = organizeData(data.Items);
//console.log(JSON.stringify(elements, null, 2));


   // console.log(elements)
    // const elementsx = [
    //     {
    //       id: "1",
    //       isSelectable: true,
    //       name: "src",
    //       children: [
    //         {
    //           id: "2",
    //           isSelectable: true,
    //           name: "app.tsx",
    //         },
    //         {
    //           id: "3",
    //           isSelectable: true,
    //           name: "components",
    //           children: [
    //             {
    //               id: "20",
    //               isSelectable: true,
    //               name: "pages",
    //               children: [
    //                 {
    //                   id: "21",
    //                   isSelectable: true,
    //                   name: "interface.ts",
    //                 },
    //               ],
    //             },
    //           ],
    //         },
    //         {
    //           id: "6",
    //           isSelectable: true,
    //           name: "ui",
    //           children: [
    //             {
    //               id: "7",
    //               isSelectable: true,
    //               name: "carousel.tsx",
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ];


    const handleKeyDown = (event: KeyboardEvent) => {

        if (event.key === "Escape") {
        } else if (event.key === "Enter") {

        } else if(event.key == "F7") {

        } else if(event.key == "F5") {

        } else if(event.key == "F4") {

        }
    };
    useEffect(() => {
        // เพิ่ม event listener สำหรับการกดปุ่ม
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            // ลบ event listener เมื่อ component ถูก unmount
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

 
    return isLoading?(
       <></>
    ):(

        <div className="flex flex-1 flex-col  gap-4 p-4 ">
            <div className="flex justify-start h-[90vh] gap-4 max-w-desktop overflow-auto ">
                <div className="bg-muted/50 w-full sm:w-[240px] shadow  backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <TimeLabel lang={lang}  classname="w-[200px]" />
                        <Separator orientation='horizontal' />
                        {/* <Autocomplete
                                value={chartcode}
                                onChange={setChartCode}
                                allSuggestions={filteredDataItem.map((item) => ({ name: item?.name1, code: item?.code }))}
                               classname="w-[250px]"
                            /> */}
                        <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger onClick={() => handleLoadFile("buy")}>นำเข้าข้อมูลซื้อ</AccordionTrigger>
                            <AccordionContent>
                            นำเข้าไฟล์ Excel ข้อมูลซื้อ
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger onClick={() => handleLoadFile("sale")}>นำเข้าข้อมูลขาย</AccordionTrigger>
                            <AccordionContent>
                            นำเข้าไฟล์ Excel ข้อมูลขาย

                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger onClick={() => handleLoadFile("expense")}>นำเข้าข้อมูลค่าใช้จ่าย</AccordionTrigger>
                            <AccordionContent>
                            นำเข้าไฟล์ excel ข้อมูลค่าใช้จ่าย
                            </AccordionContent>
                        </AccordionItem>
                        </Accordion>
                        <Separator orientation='horizontal' />

                       {/* <TreeView
                         className="rounded-md h-[70vh] bg-background overflow-hidden"
                        elements={elements}
                        initialSelectedId={elements.length.toString()}
                        initialExpendedItems={["1","2"]}
                        indicator={true}
                        />*/}

                    </div>
                </div>
                <Form {...form}>
               <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} >
               <Dialog>
                        <DialogTrigger asChild>
                            <Button onClick={()=>clearState} disabled={mode==""} variant="outline">{`เลือกไฟล์ ${mode}`}</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>เลือกไฟล์</DialogTitle>
                            <DialogDescription>โปรดเลือกไฟล์ที่ต้องการอัปโหลด</DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name='xls'
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input
                                        type='file'
                                        {...fieldProps}

                                        accept="application/xls, application/xlsx"
                                        onChange={(event) =>
                                          onChange(event.target.files && event.target.files[0])
                                          
                                        }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            {/* <div className="grid gap-4 py-4">
                            <Label htmlFor="file-upload" className="text-right"> เลือกไฟล์:</Label>
                            <Input
                                type="file"
                                id="file-upload"

                                onChange={
                                    (e) => {
                                        setSelectedFile(e.target?.files[0]);
                                       form.setValue("file", e.target?.files[0].name);
                                    }
                                }
                                className="col-span-3"
                            />
                            </div> */}
                            <div className="flex items-center space-x-2">
                            <Switch id="airplane-mode"
                            checked={itemState}
                            onCheckedChange={setItemsState}
                             />
                            <Label htmlFor="airplane-mode">มีรายการสินค้า</Label>
                            </div>
                            <DialogFooter>
                            <DialogClose asChild>
                            <Button onClick={()=>handleCloseDialog}>ยกเลิก</Button>
                            </DialogClose>
                            <DialogClose asChild>
                            <Button type='submit' onClick={async ()=>{

                                if (formRef.current) {
                                    formRef.current.dispatchEvent(new Event('submit', { bubbles: true }));
                                }

                                 const result = await form.trigger();

                                 if (!result) {
                                   const errors = form.formState.errors;
                                   let errorMessage = 'form.validationError';
                                   Object.keys(errors).forEach((key) => {
                                     // @ts-ignore
                                     errorMessage += `\n ${errors[key]?.message}`;
                                   });

                                   toast({
                                     title: ('form.error'),
                                     description: errorMessage,
                                     variant: "destructive",
                                   })
                                 }
                            }}
                                disabled={!form.getValues('xls')}>
                                อัปโหลดไฟล์
                            </Button>

                            </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                        </Dialog>
                        {/* {isSale &&
                        <TableList
                        lang={lang}
                        title="ค้นหา และ เลือกสินค้า"
                        items={data.Items}
                        setShowPanelItem={setIsSale}
                        modalItemColumns={modalItemColumns}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        handleSelect={handleSelectItem}
                        setfilteredDataItem={setfilteredDataItem}
                        isShowInput={true} classname={"top-50 left-0 right-0  "}
                        />

                        } */}
                        </form>
                        </Form>
                        {jsonData}
            </div>
      </div>

    );
};

 
