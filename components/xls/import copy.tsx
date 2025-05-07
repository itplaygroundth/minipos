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
import axios from "axios"

import { languages } from '@/app/i18n/setting'
import { usePathname } from 'next/navigation';

import { Separator } from '@radix-ui/react-separator';


import { BCCharts, Items } from "@/types"
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

const DraggableColumn = ({ column }: { column: string }) => {
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
            className="p-2 border border-gray-300 mb-1 cursor-move"
        >
            {column}
        </div>
    );
};

const DropArea = ({ onDrop }: { onDrop: (column: string) => void }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'drop-area',
        data: { accepts: 'column' },
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[100px] border-2 p-4 mt-4 ${isOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'
                }`}
        >
            Drop columns here
        </div>
    );
};

export function XlsComponent() {

    const [searchArTerm, setSearchArTerm] = useState('');

    const [parent, setParent] = useState<string | null>(null);
    const [chartcode, setChartCode] = useState<string>("");
    const form = useForm<IFileInput>({
        resolver: zodResolver(fileSchema),
    });

    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]

    const [isLoading, setIsLoading] = useState(false)
    const [isSale, setIsSale] = useState(false)
    const [isBuy, setIsBuy] = useState(false)
    const [isExpense, setIsExpense] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const [filteredDataItem, setfilteredDataItem] = useState([])
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [itemState, setItemsState] = useState<boolean>(false)
    const [items, setItems] = useState<Items[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { t } = useTranslation(lang, "common", undefined)
    const [mode, setMode] = useState('')
    const formRef = React.useRef<HTMLFormElement>(null);
    const [jsonData, setJsonData] = useState("");
    const [columns, setColumns] = useState<{ name: string; example: string }[]>([]);
    const [droppedColumns, setDroppedColumns] = useState<{ name: string; example: string }[]>([]);
    const columnHelper = createColumnHelper<Items>()
    const columnstable = [
        columnHelper.accessor('rowNumber', {
            header: t('transaction.columns.rowNumber'),
            cell: (info) => {
                const rowIndex = info.row.index + 1; // เพิ่ม 1 เพื่อเริ่มจาก 1 แทน 0
                return <div className="text-center">{rowIndex}</div>;
            },
        }),
        columnHelper.accessor('name', {
            header: t('transaction.columns.name'),
            cell: (info) => {
                return (
                    <span className={cn("text-left", "inline-block")} style={{ textAlign: 'left' }}>
                        {info.getValue()}
                    </span>
                )
            },
        }),
        columnHelper.accessor('quantity', {
            header: t('transaction.columns.quantity'),
            cell: info => {
                const value = info.getValue();
                return formatNumber(parseFloat(value?.toString()), 2);
            }
        }),
        columnHelper.accessor('unit', {
            header: t('transaction.columns.unit'),
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
            footer: ({ table }: any) => {
                const totalsum = table
                    .getRowModel()
                    .rows.reduce((sum: any, row: any) => row.original.total + sum, 0);
                return (
                    <span className={cn(totalsum <= 0 ? "text-grey-500" : "text-green-500", "font-bold", "text-lg")} style={{ textAlign: 'right' }}>
                        ยอดสินค้ารวม
                    </span>)
            },
        }),
        columnHelper.accessor('total', {
            header: () => <div className="text-right">{t('transaction.columns.total')}</div>,
            cell: info => {
                const value = info.getValue();
                return (
                    <div className="text-right">
                        {formatNumber(parseFloat(value?.toString()), 2)}
                    </div>
                );
            },
            footer: ({ table }: any) => {
                const totalsum = table
                    .getRowModel()
                    .rows.reduce((sum: any, row: any) => row.original.total + sum, 0);
                return (
                    <span className={cn(totalsum <= 0 ? "text-grey-500" : "text-green-500", "text-lg", "font-bold")} style={{ textAlign: 'right' }}>
                        {formatNumber(totalsum, 2)}
                    </span>)
            },
        }),
        // {
        //   id: "actions",
        //   enableHiding: false,
        //   cell: ({ row }) => {
        //     const member = row.original as iPartners;
        //   //  console.log(member)
        //     return (
        //       <div>
        //         <Button 
        //           variant="ghost" 
        //           onClick={() => openEditPanel(member)}
        //         >
        //           {t('partner.edit.title')}
        //         </Button>
        //       </div>
        //     );
        //   },
        // },
    ]
    useEffect(() => {
        // Parse the JSON data
        const jsonData = `{"Columns":[{"name":"inv_date","type":"date","index":0,"example":""},{"name":"inv_no","type":"string","index":1,"example":"BS66111405"},{"name":"inv_no_full","type":"string","index":2,"example":"BS66111405"},{"name":"itemtypecode","type":"string","index":3,"example":"8525.80.59"},{"name":"itemtypename","type":"string","index":4,"example":"กล้องวงจรปิด และอุปกรณ์ CCTV"},{"name":"code","type":"string","index":5,"example":"A0141128"},{"name":"shortname","type":"string","index":6,"example":"CONFERENCE CAM LOGITECH PTZ PRO 2"},{"name":"qty","type":"number","index":7,"example":"1"},{"name":"unitprice","type":"number","index":8,"example":"16650"},{"name":"nettotal","type":"string","index":9,"example":""},{"name":"","type":"string","index":10,"example":""}],"Filename":"โอนข้อมูล TH6701-0002.xls","Message":"ตรวจสอบโครงสร้างไฟล์เรียบร้อย","Note":"กรุณาตรวจสอบประเภทข้อมูลของแต่ละคอลัมน์ก่อนนำเข้า","Status":true,"TotalColumns":11,"TotalRows":1031}`;
        const parsedData = JSON.parse(jsonData);
        setColumns(parsedData.Columns.map((col: any) => ({ name: col.name, example: col.example })));
    }, []);

    // const elements = data.Items.map((item)=>item.isheader==1 && {id:item.code,isSelectable:true,name:item.name1,children:[{id:item.code,isSelectable:true,name:item.name1}]})

    const organizeData = (data: BCCharts[]) => {
        const result: SubItem[] = [];

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
        { id: 'rowNumber', header: 'ลำดับ', visible: true, format: '' },
        { id: 'code', header: 'รหัสสินค้า', visible: true, format: '' },
        { id: 'name', header: 'ชื่อ', visible: true, format: '' },
        { id: 'quantity', header: 'จำนวน', visible: true, format: '' },
        { id: 'unit', header: 'หน่วยนับ', visible: true, format: '' },
        { id: 'unitcode', header: 'หน่วยนับ', visible: false, format: '' },
        { id: 'price1', header: 'ราคา1', visible: true, format: '0.00' },
        { id: 'price2', header: 'ราคา2', visible: true, format: '0.00' },
        { id: 'price3', header: 'ราคา3', visible: true, format: '0.00' },
    ], []);

    const handleSelectItem = (item: Items) => { }
    const handleLoadFile = (mode: string) => {

        switch (mode) {
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
    const handleCloseDialog = () => { }
    const handleFileChange = (event: Event) => {
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
            const session = await getSession();

            const formData = new FormData();
            formData.append('xls', values.xls);

            const response = await axios.post('http://192.168.1.186:8030/api/v1/invoice/upload', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${session?.token}`
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
    const handleUpload = (values: z.infer<typeof fileSchema>) => {

        //console.log(values)
        try {
            if (!values) {
                alert("กรุณาเลือกไฟล์ก่อนอัปโหลด");
                return;
            }
            if (values) {
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
        catch (err: any) {
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

    const handleDrop = (column: { name: string; example: string }) => {
        setDroppedColumns((prev) => [...prev, column]);
    };

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

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const column = columns.find(col => col.name === active.id);
            if (column) {
                handleDrop(column);
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
            enableRowSelection: true,

            initialState: {
                pagination: {
                    pageIndex: 0, //custom initial page index
                    pageSize: 25, //custom default page size
                },
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
                    <div className="flex w-full flex-col gap-4">
                        {/* แถวที่ 1 - Form */}
                        <div className="w-full">
                        <Form {...form}>
                            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => clearState()} disabled={mode === ""} variant="outline">{`เลือกไฟล์ ${mode}`}</Button>
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
                    <div className="bg-muted/50 w-full sm:w-[240px] shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                        <div className="flex flex-1 flex-col gap-4 p-4">
                            <h3>Columns</h3>
                            {columns.map((column) => (
                                <DraggableColumn key={column.name} column={column.name} />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Table */}
                    <div className="flex-1 p-4">
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
                                                <DropArea onDrop={handleDrop} columnId={header.id} />
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
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className={cn("h-24 text-center")}
                                        >
                                            {t('common.noResults')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                {table.getFooterGroups().map((footerGroup: any) => (
                                    <TableRow key={footerGroup.id} className="border-solid md:border-dotted">
                                        {footerGroup.headers.map((header: any) => (
                                            <TableCell className="text-right" key={header.column.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.footer,
                                                        header.getContext()
                                                    )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={columns.length - 1} className="text-right">
                                        ภาษีมูลค่าเพิ่ม:
                                    </TableCell>
                                    <TableCell colSpan={columns.length} className="text-right">
                                        {formatNumber(0, 2)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={columns.length - 1} className="text-right">
                                        ยอดรวมภาษี:
                                    </TableCell>
                                    <TableCell colSpan={columns.length} className="text-right">
                                        {formatNumber(0, 2)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
                    </div>
            </div>
        </div>
    </DndContext>

    )
}


