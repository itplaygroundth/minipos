"use client"

import React, { useState, useEffect, useMemo, EventHandler, Component, Key, useRef } from 'react'

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
import axios from "axios"

import { languages } from '@/app/i18n/setting'
import { usePathname } from 'next/navigation';

import { Separator } from '@radix-ui/react-separator';


import { BCCharts, Invoice, Items, SaleProps, XLSProps } from "@/types"
import TimeLabel from '../timelabel'
import Autocomplete from '../ui/autocomplete'

import { TreeView } from '../ui/extension/tree-view'
import Link from 'next/link'
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../ui'
import TableList from '@/components/tablelist'
import { set } from 'date-fns'
import { Copy, Files } from 'lucide-react'
import { DialogClose } from '../ui/dialog'
import { Switch } from '../ui/switch'
import { AddInvoice, GetInvoiceNo, ImportInv, ImportInvoice, ImportXls } from '@/actions'
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
import { getSessionStr } from '@/lib/session'
import {
    DndContext,
    useDraggable,
    useDroppable,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    createColumnHelper,
    flexRender,
    FilterFn,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    selectRowsFn,
} from "@tanstack/react-table"
import { cn, formatNumber } from '@/lib/utils'
import { useTranslation } from '@/app/i18n/client'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'

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
        Role: string;
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

// Define a type for the draggable item
const ItemType = {
    COLUMN: 'column',
};

const DraggableColumn = ({ className, column }: { className: string, column: string }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: column,
        data: { column },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn("p-2   mb-1 cursor-move text-pretty", className)}
        >
            {column}
        </div>
    );
};
//  const DropArea = ({ onDrop, columnId }: { 
//   onDrop: (column: { name: string; example: string }, columnId: string) => void,
//   columnId: string
// }) => {
//   // In drop handler:
//   onDrop(droppedColumn, columnId);
// };
const DropArea = ({ onDrop, columnId, className, mapping }: {
    onDrop: (column: { name: string; example: string }, columnId: string) => void,
    columnId: string,
    className: string,
    mapping: Record<string, { name: string; example: string }>
}) => {

    const { setNodeRef, isOver } = useDroppable({
        id: `${columnId}`,
        data: { accepts: 'column' },
    });

    const droppedColumn = mapping[columnId];

    return (
        <div
            ref={setNodeRef}
            className={cn(`min-h-[50px] border-2 p-2 mt-2 ${isOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'}`, className)}
        >
            {droppedColumn ? (
                <span>{droppedColumn.name}</span>
            ) : (
                "วางรายการที่เลือก"
            )}
        </div>
    );
};

export const XlsComponent: React.FC<XLSProps> = ({ xdata, message, status }) => {

    const { data } = JSON.parse(xdata.Setting)
    const [searchArTerm, setSearchArTerm] = useState('');

    const [parent, setParent] = useState<string | null>(null);
    const [chartcode, setChartCode] = useState<string>("");
    const form = useForm<IFileInput>({
        resolver: zodResolver(fileSchema),
    });

    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]
    const [setting, setSetting] = useState(xdata.Setting)
    const [isLoading, setIsLoading] = useState(false)
    const [isSale, setIsSale] = useState(false)
    const [isBuy, setIsBuy] = useState(false)
    const [isExpense, setIsExpense] = useState(false)

    const [customerId, setCustomerId] = useState(data != "" ? JSON.parse(data).customer : "");
    const [file, setFile] = useState<File | null>(null);
    const [tempfile, setTempfile] = useState('');
    const [docno, setDocno] = useState(xdata.Docno)
    // const [uploading, setUploading] = useState(false);
    const [itemState, setItemsState] = useState<boolean>(false)
    const [items, setItems] = useState<Invoice[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { t } = useTranslation(lang, "common", undefined)
    const [mode, setMode] = useState('')
    const formRef = React.useRef<HTMLFormElement>(null);
    const [jsonData, setJsonData] = useState("");
    const [columns, setColumns] = useState<{ index: number, name: string; example: string }[]>([]);
    const [checkdoctype, setCheckdoctype] = useState(true)
    const [taxid, setTaxid] = useState(true)
    const [accounting, setAccounting] = useState(true)
    //const [droppedColumns, setDroppedColumns] = useState<{ name: string; example: string }[]>([]);
    const filteredDataAr = xdata?.Customers.filter(item =>
        (item?.name?.toLowerCase().includes(searchArTerm?.toLowerCase()) ||
            item?.code?.toLowerCase().includes(searchArTerm?.toLowerCase())) &&
        (/\d/.test(searchArTerm) || /^[a-zA-Z\u0E00-\u0E7F]*$/.test(searchArTerm))
    );
    const columnHelper = createColumnHelper<Invoice>()
    const columnstable = [

        columnHelper.accessor('docdate', {
            header: t('transaction.columns.docdate'),
            cell: (info) => {
                return (
                    <span className={cn("text-left", "inline-block")} style={{ textAlign: 'left' }}>
                        {info.getValue()}
                    </span>
                )
            },
        }),
        columnHelper.accessor('docno', {
            header: t('transaction.columns.docno'),
            cell: (info) => {
                return (
                    <span className={cn("text-left", "inline-block")} style={{ textAlign: 'left' }}>
                        {info.getValue()}
                    </span>
                )
            },
        }),
        columnHelper.accessor('taxno', {
            header: t('transaction.columns.taxno'),
            cell: (info) => {
                return (
                    <span className={cn("text-left", "inline-block")} style={{ textAlign: 'left' }}>
                        {info.getValue()}
                    </span>
                )
            },
        }),
        columnHelper.accessor('itemcode', {
            header: t('transaction.columns.itemcode'),
            cell: (info) => {
                return (
                    <span className={cn("text-left", "inline-block")} style={{ textAlign: 'left' }}>
                        {info.getValue()}
                    </span>
                )
            },
        }),
        columnHelper.accessor('itemname', {
            header: t('transaction.columns.itemname'),
            cell: (info) => {
                return (
                    <span className={cn("text-left", "inline-block")} style={{ textAlign: 'left' }}>
                        {info.getValue()}
                    </span>
                )
            },
        }),
        columnHelper.accessor('qty', {
            header: t('transaction.columns.quantity'),
            cell: info => {
                const value = info.getValue();
                return formatNumber(parseFloat(value?.toString()), 2);
            }
        }),
        columnHelper.accessor('unitcode', {
            header: t('transaction.columns.unitcode'),
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('price', {
            header: () => <div className="text-right">{t('transaction.columns.price')}</div>,
            cell: info => {
                const value = info.getValue();
                return (
                    <div className="text-right">
                        {formatNumber(parseFloat(value?.toString()), 2)}
                    </div>
                )
            },

        }),
        columnHelper.accessor('total', {
            header: () => <div className="text-right">{t('transaction.columns.total')}</div>,
            cell: info => {
                //const value = info.getValue();
                return (
                    <div className="text-right">
                        {
                            formatNumber(parseFloat((info.row.original.qty * info.row.original.price)?.toString()), 2)
                        }
                    </div>
                );
            },

        }),

    ]
    const handleLoadFile = (mode: string) => {
        setMode(mode)
        switch (mode) {
            case "sale":
                setIsSale(true)
                setIsBuy(false)
                setIsExpense(false)
                
                break;
            case "buy":
                setIsSale(false)
                setIsBuy(true)
                setIsExpense(false)
              
                break;
            case "expense":
                setIsSale(false)
                setIsBuy(false)
                setIsExpense(true)
           
                break;
        }

    }
    const clearState = () => {
        setItemsState(false);
        setSelectedFile(null);
    }
    const handleCloseDialog = () => { }
    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target || !target.files || !target.files.length) return;
        setSelectedFile(target.files[0]);
        setFile(target.files[0]);

    }
    const onSubmit = async (values: z.infer<typeof fileSchema>) => {
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            // Get session first
            const session = await getSessionStr();

            const formData = new FormData();
            formData.append('file', values.xls);

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/v1/invoice/upload`, formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${JSON.parse(session)?.token}`
                },
            });

            if (response.status === 200) {
                setSuccess("File uploaded successfully");
                toast({
                    title: "Success",
                    description: "File uploaded successfully",
                    variant: "default",
                });

                // Parse the JSON data from the response
                const parsedData = response.data;
                setTempfile(parsedData.Temppath)
                setJsonData(JSON.stringify(parsedData));

                setColumns(parsedData.Columns.map((col: any) => ({ name: col.name, example: col.example })));
            } else {
                toast({
                    title: "Error",
                    description: response.data.Message,
                    variant: "destructive",
                });
            }

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
    const onSubmitX = async (values: z.infer<typeof exportSchema>) => {
   // console.log(values)
        let whcode = "";  //JSON.parse(JSON.parse(setting).data).whcode
        let shelfcode = ""; // JSON.parse(JSON.parse(setting).data).shelfcode
        let docformat = "DOYYMM-####"
        const { data } = JSON.parse(setting)

        if (!data) {
            // const conf = {customer:"ar-0001",
            //        data:JSON.stringify({price:"price1",whcode:"01",shelfcode:"01"})}
            whcode = "01"
            shelfcode = "01"
            setCustomerId("ar-0001")

        } else {
            whcode = JSON.parse(data).whcode
            shelfcode = JSON.parse(data).shelfcode
        }

        // const saleprice = parseFloat(item[price as keyof Items].toString())

        const session = await getSessionStr();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/v1/invoice/import`, 
                {
                    "mode":mode,
                    "ColumnMap": columnMapping,
                    "Temppath": tempfile, 
                    "setting": { 
                        "whcode": whcode,
                        "shelfcode": shelfcode,
                        "arcode": customerId,
                        "doctype":values.doctype,
                        "docno":values.doctype?docformat:values.docno,
                        "taxid":values.taxid,account:values.accounting 
                    } 
                }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(session)?.token}`
                },
            });

            if (response.status === 200) {
                // setSuccess("File uploaded successfully");
                toast({
                    title: "Success",
                    description: "โอนข้อมูลสำเร็จ",
                    variant: "default",
                });
                setTempfile("")
                setColumnMapping({})
                setColumns([])
                setItems([])
                setMode("")
                // Parse the JSON data from the response
                // const parsedData = response.data;
                //  setTempfile(parsedData.Temppath)
                // setJsonData(JSON.stringify(parsedData));

                //  setColumns(parsedData.Columns.map((col: any) => ({ name: col.name, example: col.example })));
            } else {
                toast({
                    title: "Error",
                    description: response.data.Message,
                    variant: "destructive",
                });
            }

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

            // if(data)
            //    docformat = JSON.parse(data).docformat
            //GetInvoiceNo("",docformat).then((response)=>{
            //   console.log(response)
            //     if(response.Status){
            //         setDocno(response.Data)
            //     }
            // console.log("###############")
            // console.log(customer)
            // console.log(customerId)
            // console.log("###############")
            //  })
        }

    }
    const handleKeyDown = (event: KeyboardEvent) => {

        if (event.key === "Escape") {
        } else if (event.key === "Enter") {

        } else if (event.key == "F7") {

        } else if (event.key == "F5") {

        } else if (event.key == "F4") {

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
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );
    const [columnMapping, setColumnMapping] = useState<Record<string, { index: number, name: string; example: string }>>({});
    const handleDrop = (column: { index: number, name: string; example: string }, columnId: string) => {

        setColumnMapping((prev) => ({
            ...prev,
            [columnId]: column,
        }));

        // setItems(prev => ({
        //      ...prev, 
        //      [columnId]: column.example }));

        // อัปเดต items อย่างปลอดภัย
        if (items.length === 0)
            items.push({ docdate: "", docno: "", taxno: "", unitcode: "", qty: 0, total: 0, nettotal: 0, price: 0, itemcode: "", itemname: "", whcode: "", shelfcode: "" })

        //  const newArray =[...items]

        // newArray[0][columnId as keyof Invoice] = column.example as string

        // setItems(newArray)
        //console.log(columnId)
        //console.log(column)
        setItems(prevItems => {
            const newArray = [...prevItems];
            // Initialize first item if array is empty
            if (newArray.length === 0) {
                newArray.push({} as Invoice);
            }
            // Type-safe property assignment

            (newArray[0] as any)[columnId] = column.example;
            //  console.log(newArray)
            return newArray;
        });
        // หรือถ้าต้องการเพิ่มรายการใหม่เมื่อไม่มี

        // items[0][columnId] = column.example




    };
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over) {
            const column = columns.find(col => col.name === active.id);
            //  console.log(column)
            if (column) {
                handleDrop(column, over.id);
            }
        }
    };
    const createTable = (data: any[], columns: any[]) => {
        return useReactTable({
            data: data,
            columns: columnstable,
            // onSortingChange: setSorting,
            // onColumnFiltersChange: setColumnFilters,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            //onColumnVisibilityChange: setColumnVisibility,
            //onRowSelectionChange: setRowSelection,

            //onPaginationChange: setPagination,
            //enableRowSelection: false,

            initialState: {
                // pagination: {
                //     pageIndex: 0, //custom initial page index
                //     pageSize: 25, //custom default page size
                // },
            },
            state: {
                //sorting,
                //columnFilters,
                //columnVisibility,
                //rowSelection,
                //pagination
            },

            //filterFns: {
            //    customArrayFilter: (row, columnId, filterValue) => {
            //        const names = row.getValue(columnId) as string[];
            //        return names.some(name => 
            //            name.toLowerCase().includes(filterValue.toLowerCase())
            //        );
            //    },
            //},
        });
    };
    const table = createTable(items, columns);

    // Define exportSchema using zod
    const exportSchema = z.object({
        docdate: z.string().optional(),
        docno: z.string().optional(),
        customerId: z.string().optional(),
        taxid:z.number().default(1),
        accounting:z.number().default(1),
        doctype:z.number().default(1)
        // xls: z.instanceof(File).optional(),
    });

    // Define uform with the correct type
    const uform = useForm<z.infer<typeof exportSchema>>({
        resolver: zodResolver(exportSchema),
    });

    // Define formRefx
    const formRefx = useRef<HTMLFormElement>(null);

    return isLoading ? (
        <></>
    ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex justify-start h-[90vh] gap-4 max-w-desktop overflow-auto">


                    <div className="bg-muted/50 w-full sm:w-[240px] shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                        <div className="flex flex-1 flex-col gap-4 p-4">
                            <TimeLabel lang={lang} classname="w-[200px]" />
                            <Separator orientation='horizontal' />
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
                        </div>
                    </div>

                    <div className={cn('flex flex-col w-full')}>
                        {/* First Row: File Selection Button */}
                        <div className="flex justify-start mb-4">
                            <Form {...form}>

                                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => clearState()} disabled={mode === ""} variant="outline">{mode === "" ? "เลือกเมนูประเภทนำเข้า" : `เลือกไฟล์ ${t(`common.${mode}`)}`}</Button>
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
                                            <div className="flex items-center space-x-2">
                                                <Switch id="airplane-mode"
                                                    checked={itemState}
                                                    onCheckedChange={setItemsState}
                                                />
                                                <Label htmlFor="airplane-mode">มีรายการสินค้า</Label>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button onClick={() => handleCloseDialog()}>ยกเลิก</Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button type='submit' onClick={async () => {
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
                                </form>
                            </Form>
                        </div>

                        {/* Second Row: Draggable Columns and Table */}
                        <div className="flex gap-4">
                            {/* Left Column: Draggable Columns */}
                            <div className="bg-muted/50 w-full sm:w-[150px] shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                                <div className="flex flex-1 flex-col gap-4 p-4">
                                    <h3>เลือกรายการ</h3>
                                    {columns.map((column, index) => (
                                        <div className='w-[120px] bg-blue-300' key={index}>
                                            <DraggableColumn className='w-[120px]' column={column.name} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Table */}

                            <div className={cn("flex-1 p-4", mode == "" ? "opacity-0" : "opacity-100")}>

                                <div className="flex flex-col space-y-4 mb-4">
                                    <div className="flex flex-col mb-1">
                                        <Label className='pl-2 mb-1'>ไฟล์ :{jsonData && JSON.parse(jsonData).Temppath}</Label>
                                    </div>
                                    <div className="flex flex-col ">
                                        <Label className='pl-2 mb-2'>{"รหัสลูกค้า "}
                                        </Label>
                                        <Autocomplete
                                            value={customerId}
                                            onChange={setCustomerId}
                                            allSuggestions={filteredDataAr.map((item) => ({ name: item.name, code: item.code }))}
                                            classname="w-[250px]"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <Label className='pl-2 mb-1'>{"วันที่"}</Label>
                                        <DropArea onDrop={()=>handleDrop} className='w-full md:w-64' columnId={"docdate"} mapping={columnMapping} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className='pl-2 mb-1'>{"เอกสาร"}</Label>
                                        <DropArea onDrop={()=>handleDrop} className='w-full md:w-64' columnId={"docno"} mapping={columnMapping} />
                                    </div>
                                </div>

                                <Table className="w-full">
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup: any) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header: any) => (

                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}

                                                        <DropArea onDrop={()=>handleDrop} className="" columnId={header.id} mapping={columnMapping} />
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row: any) => (
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() ? "selected" : ""}
                                                    className={cn("table-row", table.getState().rowSelection.id === row.id ? "text-blue-500 font-bold" : "transparent")}
                                                >
                                                    {row.getVisibleCells().map((cell: any) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className='w-[2px]'>
                                                        {table.getState().rowSelection?.id === row.id && (
                                                            <Button
                                                                className="bg-red-400 text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // หยุดการ bubbling ของ event
                                                                }}
                                                                variant="outline" size="icon"
                                                            >
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <></>
                                        )}
                                    </TableBody>
                                </Table>
                                <Form {...uform}>
                                    <form ref={formRefx} onSubmit={uform.handleSubmit(onSubmitX)}>
                                        <div className='flex flex-col gap-4 mt-4'>
                                            <div className="flex items-center space-x-2">
                                                <FormField
                                                    control={uform.control}
                                                    name='taxid'
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Checkbox
                                                                    {...field}
                                                                    checked={taxid}
                                                                    id="taxid"
                                                                    onCheckedChange={(checked) => setTaxid(checked as boolean)}
                                                                />
                                                            </FormControl>
                                                            <FormLabel htmlFor="taxid">{"ภาษี"}</FormLabel>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FormField
                                                    control={uform.control}
                                                    name='accounting'
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Checkbox
                                                                    {...field}
                                                                    checked={accounting}
                                                                    id="accounting"
                                                                    onCheckedChange={(checked) => setAccounting(checked as boolean)}
                                                                />
                                                            </FormControl>
                                                            <FormLabel htmlFor="accounting">{"บัญชี"}</FormLabel>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex flex-row items-center space-x-2">
                                                <div className="gap-2">
                                                    <Checkbox
                                                        className="mb-2"
                                                        checked={checkdoctype}
                                                        id="doctype"
                                                        onCheckedChange={(checked) => setCheckdoctype(checked as boolean)}
                                                    />
                                                    <label className="mx-2 mb-3" htmlFor="docformat">{"ดึงเลขที่เอกสาร EXCEL)"}</label>
                                                    <FormField
                                                        control={uform.control}
                                                        name='docno'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        className={cn(checkdoctype ? "hidden" : "", "w-[180px] mt-2")}
                                                                        placeholder="@YYMM-####"
                                                                        value={docno || ""}
                                                                        id="formatdoc"
                                                                        onChange={(e) => setDocno(e.target.value)}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="mx-2 mb-3" htmlFor="docformat">{"@@=ตัวอักษร [A-Z] เช่น DO,YYMM=ปีเดือน เช้่น 2501,#=ตัวเลขรันนิ่ง"}</FormLabel>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className='flex items-start'>
                                                <Button
                                                    onClick={async () => {
                                                        if (formRefx.current) {
                                                            formRefx.current.dispatchEvent(new Event('submit', { bubbles: true }));
                                                        }

                                                        const result = await uform.trigger();

                                                        if (!result) {
                                                            const errors = uform.formState.errors;
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
                                                    className='bg-green-500 hover:bg-green-800' size={'lg'}>{"โอนข้อมูล"}</Button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </DndContext>
    );
};


