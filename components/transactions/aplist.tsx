'use client'
import React, { useMemo, useState, useEffect } from 'react';
import { Button, Input, Table,TableFooter,TableBody, TableCell, TableHead, TableHeader, TableRow ,  Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Label,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogFooter,
    Form,
    FormField,
    FormItem} from '@/components/ui';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
 
  } from "@tanstack/react-table"
import { useTranslation } from '@/app/i18n/client';
import { languages } from '@/app/i18n/setting'
import { usePathname } from 'next/navigation';
import { formatNumber } from '@/lib/utils'
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { FormControl, FormDescription, FormLabel } from '../ui/form';
interface Items {
    rowNumber:number;
    code:string;
    name: string;
    quantity: number;
    price:number;
    total:number;
    unit:string;
}
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Item } from '@radix-ui/react-dropdown-menu';
//  interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[]
//   data: TData[]
// }
const recieveSchema = z.object({
    recievemoney: z.number().min(0, "ต้องเป็นตัวเลขที่ไม่ติดลบ").optional(),
    totalamount: z.number().optional()
})
const saleSchema = z.object({
    docno: z.string().optional(),
    customer: z.string().min(1, "must be at least 1 characters long").optional(),
    items: z.array(z.object({
        rowNumber: z.number(),
        code: z.string(),
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        total: z.number(),
        unit: z.string(),
    })).optional(),
    recievemoney: z.number().min(0, "ต้องเป็นตัวเลขที่ไม่ติดลบ").optional(),
    totalamount: z.number().optional()
});
interface ModalDataItem {
    code: string;
    name1: string;
    address: string | null;
    debtamount: number | null;
}

interface APListProps {
    data: ModalDataItem[];
    message: string;
    status: boolean;
}

const APListComponent:  React.FC<APListProps> = ({ data, message, status }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [quantity, setQuantity] = useState(1);
 // เปลี่ยนประเภทของ items เป็น Item[]
    const [items, setItems] = useState<Items[]>([]);
    const [customerId, setCustomerId] = useState('');
    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]
    const {toast} = useToast()
    const {t} = useTranslation(lang,"common",undefined)
    const [isLoading,setIsLoading] = useState(false)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [showPanel, setShowPanel] = useState(false);
    const [pageSize, setPageSize] = useState(10); // กำหนดค่าเริ่มต้นเป็น 10 แถวต่อหน้า
    const [currentPage, setCurrentPage] = useState(0); // ตัวแปรสำหรับเก็บหน้าปัจจุบัน
    const [isDialogOpen, setIsDialogOpen] = useState(false); // สถานะสำหรับเปิด/ปิด Dialog
    const [totalamount, setTotalAmount] = useState(0); // สถานะสำหรับยอดเงินที่แสดง
    const [receivedAmount, setReceivedAmount] = useState(0); // สถานะสำหรับยอดเงินที่รับ
    
     
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false); // สำหรับ Dialog รับเงิน
    const [isBillDialogOpen, setIsBillDialogOpen] = useState(false); // สำหรับ Dialog แสดงบิล
    const [changeAmount, setChangeAmount] = useState(0); // สถานะสำหรับยอดเงินทอน
    const [billDetails, setBillDetails] = useState<any>(null); // สถานะสำหรับรายละเอียดบิล

    
    // const handlePrint = () => {
    //     // ฟังก์ชันสำหรับพิมพ์บิล
    //     window.print();
    // };



    const form = useForm<z.infer<typeof recieveSchema>>({
        resolver: zodResolver(recieveSchema),
        defaultValues:{
            totalamount:0,
            recievemoney:0
        }
        })
    useEffect(() => {
        // โหลดข้อมูลจาก sessionStorage ถ้ามี
        const storedItems = sessionStorage.getItem('items');
        if (storedItems) {
            setItems(JSON.parse(storedItems));
        }
    }, []); // ทำงานเพียงครั้งเดียวเมื่อคอมโพเนนต์ถูกสร้างขึ้น

    useEffect(() => {
        // อัปเดต sessionStorage ทุกครั้งที่ items เปลี่ยนแปลง
        sessionStorage.setItem('items', JSON.stringify(items));
    }, [items]);

    // ฟังก์ชันสำหรับเคลียร์ sessionStorage
    const clearSession = () => {
        sessionStorage.removeItem('items');
        setItems([]); // เคลียร์ items ใน state
        form.setValue("totalamount",0)
        form.setValue("recievemoney",0)

    };
    
    const handleOpenDialog = () => {
        if (!customerId) {
             // แจ้งเตือนถ้าช่องรหัสลูกค้าเป็นค่าว่าง
            toast({
                variant: "destructive",
                title: t('common.error.title'),
                description: "กรุณากรอกรหัสลูกค้าก่อน",
              });
            document.getElementById('customerid-input')?.focus(); // โฟกัสที่ช่องรหัสลูกค้า
            
        } else {
            setIsDialogOpen(true); // เปิด Dialog ถ้ามีค่าในช่องรหัสลูกค้า
        }
    };
    
   // const [paginatedData,setPaginatedData] = useState([])
   
    // const modalData = useMemo(() => [
      
    // ], []);

    const modalColumns = useMemo(() => [
        { id: 'rowNumber', header: 'ลำดับ' },
        { id: 'code', header: 'รหัสสินค้า' },
        { id: 'name1', header: 'ชื่อ' },
        { id: 'quantity', header: 'จำนวน' },
        { id: 'unit', header: 'หน่วยนับ' },
        { id: 'price', header: 'ราคา' },
    ], []);
 
 

    const filteredData = data?.filter((item) => 
        (item.name1.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (/\d/.test(searchTerm) || /^[a-zA-Z\u0E00-\u0E7F]*$/.test(searchTerm))
    );

    //const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize); // แบ่งข้อมูลตามหน้า

 
    // const addItem = () => {
    //     // เพิ่มรายการลงในตาราง
    //     setItems([...items, { rowNumber:1,name: searchTerm, quantity,price:100,unit:"sku",total:quantity*100 }]);
    //     setSearchTerm('');
    //     setQuantity(1);
    // };
    const columnHelper = createColumnHelper<Items>()
    //const totalAmount = items.reduce((total, item) => total + item.total, 0); // สมมุติราคาสินค้าเป็น 100

    const columns =  [
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
          }
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
            footer: ({ table }:any) => {
                const totalsum = table
                  .getRowModel()
                  .rows.reduce((sum:any, row:any) => row.original.total + sum, 0);
                  return (
                    <span className={cn(totalsum <= 0 ? "text-grey-500" : "text-green-500","font-bold","text-lg")} style={{ textAlign: 'right'  }}>
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
          footer: ({ table }:any) => {
            const totalsum = table
              .getRowModel()
              .rows.reduce((sum:any, row:any) => row.original.total + sum, 0);
              return (
                <span className={cn(totalsum <= 0 ? "text-grey-500" : "text-green-500","text-lg","font-bold")} style={{ textAlign: 'right' }}>
                  {formatNumber( totalsum, 2)}
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
    const createTable = (data: any[], columns: any[]) => {
        return useReactTable({
            data: data,
            columns: columns,
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            onColumnVisibilityChange: setColumnVisibility,
            onRowSelectionChange: setRowSelection,
            state: {
                sorting,
                columnFilters,
                columnVisibility,
                rowSelection,
            },
            filterFns: {
                customArrayFilter: (row, columnId, filterValue) => {
                    const names = row.getValue(columnId) as string[];
                    return names.some(name => 
                        name.toLowerCase().includes(filterValue.toLowerCase())
                    );
                },
            },
        });
    };

    // สร้างตัวแปร table โดยส่ง data และ columns
    const table = createTable(items, columns);
 
    if (isLoading) {
    return <div>Loading {t('transaction.title')}...</div>;
    }
    const handlePrint = () => {
        const printContent = document.querySelector('.bill'); // เลือก div ที่ต้องการพิมพ์
        const win = window.open('', '', 'width=800,height=600'); // เปิดหน้าต่างใหม่

        win?.document.write(`
            <html>
                <head>
                    <title>พิมพ์บิล</title>
                    <style>
                        @media print {
                            @page {
                                size: 8cm auto; /* กำหนดขนาดกระดาษ */
                                margin: 0; /* กำหนดมาร์จิน */
                            }
                            body {
                                display: flex;
                                flex-direction: column;
                                /* justify-content: center;   จัดให้กึ่งกลางในแนวตั้ง */
                                align-items: center; /* จัดให้กึ่งกลางในแนวนอน */
                                height: 100vh; /* กำหนดความสูงของ body ให้เต็มพื้นที่ */
                                margin: 0; /* ไม่มีมาร์จิน */
                            }
                            ul {
                                list-style-type: none; /* ไม่ให้แสดงจุดหน้า li */
                                padding: 0; /* ไม่ให้มี padding ด้านซ้าย */
                                margin: 0; /* ไม่ให้มี margin */
                                text-align: center; /* จัดตำแหน่งข้อความใน ul ให้อยู่กลาง */
                            }

                            li {
                                margin: 5px 0; /* เพิ่มระยะห่างระหว่าง li */
                            }
                            .bill {
                                text-align: center; /* ตั้งค่าการจัดตำแหน่งเป็นกลาง */
                                width: 8cm; /* กำหนดความกว้างของบิล */
                                padding: 10px; /* กำหนดระยะห่างภายใน */
                                border: 1px solid #000; /* กำหนดเส้นขอบ */
                                font-family: Arial, sans-serif; /* กำหนดฟอนต์ */
                                font-size: 9px; /* ขนาดฟอนต์ */
                                line-height: 1; /* ระยะห่างระหว่างบรรทัด */
                                margin: 0 auto; /* จัดกลาง */
                                background-color: #fff; /* สีพื้นหลัง */
                            }

                            .bill h1 {
                                font-size: 9px; /* ขนาดฟอนต์สำหรับหัวข้อ */
                                text-align: center; /* จัดกลาง */
                                /* margin-bottom: 5px;  ระยะห่างด้านล่าง */
                            }

                            .bill p {
                                /* margin: 5px 0;   ระยะห่างด้านบนและด้านล่าง */
                            }

                            .bill .total {
                                font-weight: bold; /* ทำให้ตัวหนา */
                                text-align: right; /* จัดชิดขวา */
                            }

                            .bill .terms {
                                /* margin-top: 10px;   ระยะห่างด้านบน */
                                font-size: 9px; /* ขนาดฟอนต์สำหรับเงื่อนไข */
                            } 

                            .print-button {
                                display: none; /* ซ่อนปุ่มเมื่อพิมพ์ */
                            }
                            .print-dialog {
                                display: none;
                            }
                           
                        }
                    </style>
                </head>
                <body>
                
                    <ul>
                    <li> <h1 >${t('DealPOS')}</h1></li>
                    <li>${t('Aplikasi Kasir Online untuk bisnis Retail')}</li>
                    <li>${t('Aplikasi Kasir Online untuk bisnis Retail')}</li>
                    <li>เลขที่: ${billDetails?.docno}</li>
                    <li>วันที่ ${new Date().toLocaleDateString()}</li>
                    </ul>
                    ${printContent?.innerHTML} 
                    <ul>  
                        <li>ยอดรวม: ${billDetails?.total} บาท</li>
                        <li>ยอดเงินที่รับ: ${billDetails?.received} บาท</li>
                        <li>ยอดเงินทอน: ${billDetails?.change} บาท</li>
                    </ul>
                    <p className="text-center mt-4">พิมพ์วันที่: ${new Date().toLocaleDateString()}</p>
                </body>
            </html>
        `);
        
        win?.document.close(); // ปิด document ของหน้าต่าง
        win?.focus(); // มุ่งเน้นหน้าต่าง
        win?.print(); // เรียกฟังก์ชันพิมพ์
        win?.close(); // ปิดหน้าต่างหลังจากพิมพ์
        setTimeout(() => {
        setIsBillDialogOpen(!isBillDialogOpen)
        clearSession()

        },1000)
    };
    
    const handleSelectItem = (item: Items) => {
        // ตรวจสอบว่ามีสินค้านี้อยู่ในรายการหรือไม่
        const existingItemIndex = items.findIndex(existingItem => existingItem.code === item.code);
        
        if (existingItemIndex !== -1) {
            // ถ้ามีอยู่แล้ว ให้ปรับปรุงจำนวนและผลรวม
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity; // เพิ่มจำนวนจากช่องกรอก
            updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity; // คำนวณผลรวมใหม่
            setItems(updatedItems);
        } else {
            // ถ้าไม่มี ให้เพิ่มรายการใหม่
            setItems([...items, { ...item, quantity, total: item.price * quantity }]);
        }
        const newTotalAmount = items.reduce((total, item) => total + item.total, 0);
        setTotalAmount(newTotalAmount); // ตั้งค่า totalAmount ใหม่
        setShowPanel(false); // ซ่อน Panel
        setQuantity(1); // รีเซ็ตจำนวน
        setSearchTerm('');
    };

    // ฟังก์ชันสำหรับจัดการการกด ESC
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setShowPanel(false); // ซ่อน Panel เมื่อกด ESC
        } else if (event.key === "Enter") {
            if (filteredData.length === 1) {
                // handleSelectItem(filteredData[0]); 
                // setSearchTerm('');// เลือกรายการเดียวที่แสดง
                const selectedItem = filteredData[0];
                const item: Items = {
                    rowNumber: 0, // กำหนดค่าเริ่มต้น
                    code: selectedItem.code,
                    name: selectedItem.name1,
                    quantity: 1, // กำหนดค่าเริ่มต้น
                    price: 0, // กำหนดค่าเริ่มต้น
                    total: 0, // กำหนดค่าเริ่มต้น
                    unit: '', // กำหนดค่าเริ่มต้น
                };
                handleSelectItem(item);
                setSearchTerm(''); // เลือกรายการเดียวที่แสดง
            }
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
   
    const paginatedData = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData?.slice(startIndex, endIndex);
    }, [filteredData, currentPage, pageSize]); 
   
    // const handleReceivedAmountEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (event.key === "Enter") {
    //         //const totalAmount = items.reduce((total, item) => total + item.total, 0);
    //         const change = receivedAmount - totalamount; // คำนวณยอดเงินทอน
    //         setChangeAmount(change); // ตั้งค่ายอดเงินทอน
    //         setTimeout(() => {
    //             toast({
    //                 variant: "default",
    //                 title: t('common.error.title'),
    //                 description: `${totalamount}-${receivedAmount}=${change}`,
    //               });
    //            // clearSession(); // เคลียร์ session หลังจาก 3 วินาที
    //            setIsDialogOpen(false)
    //         }, 2000);
    //         // แสดง Dialog หรือทำการอื่น ๆ ที่ต้องการ
    //     }
    // };

    const handleSave:SubmitHandler<z.infer<typeof recieveSchema>> =  async (data:z.infer<typeof recieveSchema>) => {
        data.totalamount = items.reduce((total, item) => total + item.total, 0)    
        try {
            if(data.recievemoney && data.recievemoney>0){
                if(data.recievemoney < data.totalamount) {
                    
                        toast({
                            variant: "destructive",
                            title: t('common.error.title'),
                            description:"ยอดเงินรับน้อยกว่า ยอดสินค้ารวม",
                        });
                  
                    return
                }
           
            const change = data.recievemoney - data.totalamount; // คำนวณยอดเงินทอน
            setChangeAmount(change); // ตั้งค่ายอดเงินทอน
            setBillDetails({
                docno: "12345", // เปลี่ยนเป็นเลขที่เอกสารจริง
                customer: customerId, // ใช้รหัสลูกค้า
                items: items, // ใช้รายการสินค้าที่ถูกเลือก
                total: formatNumber(data.totalamount,2), // ยอดรวม
                received: formatNumber(data.recievemoney,2), // ยอดเงินที่รับ
                change: formatNumber(change,2) // ยอดเงินทอน
            });
      

            // ตั้งค่ารายละเอียดบิล
          
    
            // แสดง Dialog
            

            setTimeout(() => {
                // toast({
                //     variant: "destructive",
                //     title: t('common.error.title'),
                //     description: `${data.recievemoney}-${data.totalamount}=${change}`,
                // });
            // clearSession(); // เคลียร์ session หลังจาก 3 วินาที
            setIsDialogOpen(false)
            setIsBillDialogOpen(true);
            }, 1000);
        }  else {
            toast({
                        variant: "destructive",
                        title: t('common.error.title'),
                        description: "ยอดรับเงินไม่ถูกต้อง!",
                    });
            const inputElement = document.getElementById('recievemoney-input') as HTMLInputElement;
                    if (inputElement) {
                        inputElement.focus(); // โฟกัสไปที่ input
                        inputElement.select(); // เลือกเนื้อหาใน input
                    }
        }
        } catch (error) {
            if (error instanceof z.ZodError) {
                // แสดงข้อผิดพลาดที่เกิดจาก Zod
                error.errors.forEach((err) => {
                    toast({
                        variant: "destructive",
                        title: t('common.error.title'),
                        description: err.message,
                    });
                });
            }  
        }
        // toast({
        //     variant: "default",
        //     title: t('common.error.title'),
        //     description: `${JSON.stringify(data)}`,
        // });

        // if (!data.docno || !data.customer) {
        //     toast({
        //         variant: "destructive",
        //         title: t('common.error.title'),
        //         description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        //     });
        //     return; // ออกจากฟังก์ชันถ้าข้อมูลไม่ครบ
        // }
       
    };

    return    (
        <div className="flex flex-1 flex-col gap-4 p-4 ">
            <div className="flex justify-start gap-4 max-w-desktop overflow-auto ">
                <div className="bg-muted/50 w-full sm:w-[300px] shadow  backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                    
                        
                        {/* <Label className='p-2'>{"X จำนวนที่ต้องการขาย"}</Label>
                        <Input 
                            id="quantity-input"
                            type="text" 
                            placeholder="จำนวน" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Number(e.target.value))} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && filteredData?.length === 1) {
                                    handleSelectItem(filteredData[0]); // เลือกรายการเดียวที่แสดง
                                    setSearchTerm(''); // เคลียร์ searchTerm
                                    //setQuantity(1); // ตั้งค่า quantity เป็น 1
                                    document.getElementById('searchTerm-input')?.focus();
                                }
                            }}
                        /> */}
                         <Label className='p-2'>{"รหัสตัวแทน"}</Label>
                        <Input 
                            id="searchTerm-input"
                            placeholder="รหัสตัวแทนหรือเจ้าหนี้" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value); // อัปเดตสถานะการค้นหา
                                setShowPanel(true); // แสดง Panel เมื่อมีการพิมพ์
                            }} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && filteredData?.length === 1) {
                                    const selectedItem = filteredData[0];
                                    const item: Items = {
                                        rowNumber: 0, // กำหนดค่าเริ่มต้น
                                        code: selectedItem.code,
                                        name: selectedItem.name1,
                                        quantity: 1, // กำหนดค่าเริ่มต้น
                                        price: 0, // กำหนดค่าเริ่มต้น
                                        total: 0, // กำหนดค่าเริ่มต้น
                                        unit: '', // กำหนดค่าเริ่มต้น
                                    };
                                    handleSelectItem(item); // เลือกรายการเดียวที่แสดง
                                    //document.getElementById('quantity-input')?.focus(); // โฟกัสที่ช่อง quantity
                                }
                                // if (e.key === "Enter" && filteredData?.length === 1) {
                                //     handleSelectItem(filteredData[0]); // เลือกรายการเดียวที่แสดง
                                //     //document.getElementById('quantity-input')?.focus(); // โฟกัสที่ช่อง quantity
                                // }
                            }}
                        />
                        {/* <Button onClick={addItem}>เพิ่มรายการ</Button> */}
                        <Separator />
                        {/* <Label className='p-2'>{"รหัสลูกค้า"}</Label>
                        <Input 
                            id="customerid-input"
                            placeholder="รหัสลูกค้าหรือสมาชิก" 
                            value={customerId} 
                            onChange={(e) => setCustomerId(e.target.value)} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && filteredData?.length === 1) {
                                    handleSelectItem(filteredData[0]); // เลือกรายการเดียวที่แสดง
                                    //document.getElementById('quantity-input')?.focus(); // โฟกัสที่ช่อง quantity
                                }
                            }}
                        /> */}
                        <Button onClick={handleOpenDialog}>กดรับเงิน</Button>
                    
                    
                    </div>
                </div>
                <div className="flex-1 bg-muted/50 w-full shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="min-h-[100vh] flex-1 w-full rounded-xl bg-muted/50 md:min-h-min p-5 overflow-auto">
                        <div className="rounded-md border bg-background/95 ">
                            <Table className="table-striped">
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
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row:any) => (
                                        <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        >
                                        {row.getVisibleCells().map((cell:any) => (
                                            <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                    ) : (
                                    <TableRow>
                                        <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                        >
                                        {t('common.noResults')}
                                        </TableCell>
                                    </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                {table.getFooterGroups().map((footerGroup:any) => (
                                    <TableRow key={footerGroup.id} className="border-solid md:border-dotted">
                                      
                                    {footerGroup.headers.map((header:any) => (
                                        
                                    <TableCell  className="text-right" key={header.column.id}> {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.footer,
                                            header.getContext()
                                        )}</TableCell>
                        
                                    ))}
                                    </TableRow>
                                    ))}
                                     {/* <TableRow>
                                    <TableCell colSpan={columns.length-1} className="text-right">
                                            ยอดสินค้ารวม:   
                                    </TableCell>
                                    <TableCell colSpan={columns.length} className="text-right">
                                    {formatNumber(parseFloat(totalAmount?.toString()), 2)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell colSpan={columns.length-1} className="text-right">
                                            ยอดรวม:   
                                    </TableCell>
                                    <TableCell colSpan={columns.length} className="text-right">
                                    {formatNumber(parseFloat(totalAmount?.toString()), 2)}
                                        </TableCell>
                                    </TableRow> */}
                                    {/* <TableRow>
                                        <TableCell colSpan={columns.length} className="text-right">
                                            <h3>ใบเสร็จ</h3>
                                            {items.map((item, index) => (
                                                <div key={index}>
                                                    {item.name} x {item.quantity}
                                                </div>
                                            ))}
                                            <div>ยอดรวม: {totalAmount} บาท</div>
                                        </TableCell>
                                    </TableRow> */}
                                </TableFooter>
                            </Table>
                        </div>
                        {/* <div className="flex items-center justify-end space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} {t('common.of')}{" "}
                            {table.getFilteredRowModel().rows.length} {t('common.rowSelected')}.
                            </div>
                            <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {t('common.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                {t('common.next')}
                            </Button>
                            </div>
                        </div> */}
                    </div>
                 
                     
                </div>
            </div>

            {/* Panel สำหรับแสดงตาราง */}
            {showPanel && (
                <div className="fixed top-30 left-0 right-0 z-50 bg-white shadow-lg p-4" style={{ width: 'calc(100% - 300px)', left: '300px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold bg-gray-200 bg-opacity-50 rounded p-3">ค้นหา และ เลือกเจ้าหนี้</h2>
                        <Button variant="outline" onClick={() => setShowPanel(false)}>ปิด</Button>
                    </div>
                    <div className="rounded-md border bg-background/95">
                        <Table className="table-striped">
                            <TableHeader>
                                <TableRow>
                                    {modalColumns.map(column => (
                                        <TableHead key={column.id}>{column.header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData?.length > 0 ? (
                                    paginatedData.map((item, index) => {
                                        const newItem: Items = {
                                            rowNumber: 0, // กำหนดค่าเริ่มต้น
                                            code: item.code,
                                            name: item.name1,
                                            quantity: 1, // กำหนดค่าเริ่มต้น
                                            price: 0, // กำหนดค่าเริ่มต้น
                                            total: 0, // กำหนดค่าเริ่มต้น
                                            unit: '', // กำหนดค่าเริ่มต้น
                                        };
                                        return (
                                            <TableRow key={index} onClick={() => handleSelectItem(newItem)} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                                {modalColumns.map(column => (
                                                    <TableCell key={column.id}>{item[column.id as keyof ModalDataItem]}</TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={modalColumns?.length} className="h-24 text-center">
                                            {t('common.noResults')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        {/* <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} {t('common.of')}{" "}
                            {table.getFilteredRowModel().rows.length} {t('common.rowSelected')}.
                        </div> */}
                        <div className="flex items-center space-x-2">
                        <Select
                            value={`${pageSize}`} // ใช้ pageSize ที่ตั้งค่า
                            onValueChange={(value) => {
                                const newSize = Number(value);
                                setPageSize(newSize); // ตั้งค่า pageSize ใหม่
                                // คำนวณจำนวนหน้าใหม่เมื่อเปลี่ยนขนาดหน้า
                                const newTotalPages = Math.ceil(filteredData?.length / newSize);
                                console.log(`Total Pages: ${newTotalPages}`); // แสดงจำนวนหน้าใหม่
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {t('common.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                {t('common.next')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
            <DialogContent aria-describedby=''>
                <DialogTitle>ฟอร์มการรับเงิน</DialogTitle>
                <p>ยอดสินค้ารวม: {formatNumber(items.reduce((total, item) => total + item.total, 0), 2)}</p>
                    <FormField
                        control={form.control} // กำหนด control ที่เหมาะสม
                        name="recievemoney"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ยอดเงินที่รับ</FormLabel>
                                <FormControl>
                                    <Input 
                                        id="recievemoney-input"
                                        type="text"
                                        placeholder="ยอดเงินที่รับ" 
                                        {...field} 
                                        value={field.value || 0} // ใช้ value แทน defaultValue
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            if (!isNaN(value) && value >= 0) { // ตรวจสอบว่าเป็นตัวเลขและไม่ติดลบ
                                                field.onChange(value); // อัปเดตค่าที่ควบคุม
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault(); // ป้องกันการส่งฟอร์มโดยอัตโนมัติ
                                                form.handleSubmit(handleSave)(); // เรียกใช้ฟังก์ชันส่งฟอร์ม
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>กรุณากรอกยอดเงินที่รับ</FormDescription>
                            </FormItem>
                        )}
                    />
                    {/* <p>เงินทอน: {formatNumber(items.reduce((total, item) => total + item.total, 0) - receivedAmount, 2)}</p> */}
            
            </DialogContent>
           
            </form>
            </Form>
        </Dialog>
        <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
            <DialogContent >
                <DialogTitle className="print-dialog">บิลการขาย</DialogTitle>
                <div className=' flex flex-col p-4 border border-gray-300 rounded-lg shadow-md'>
                    <h1 className="text-xl font-bold text-center">{t('DealPOS')}</h1>
                    <p className="text-center">{t('Aplikasi Kasir Online untuk bisnis Retail')}</p>
                    <p className="text-center">{t('Aplikasi Kasir Online untuk bisnis Retail')}</p>
                    <p className="text-center">เลขที่: {billDetails?.docno}</p>
                    <p className="text-center">วันที่ {new Date().toLocaleDateString()}</p>
                    
                    <h3 className="mt-4">รายการสินค้า:</h3>
                    <div className="bill">
                    <Table className="table-striped">
                        <TableHeader>
                            <TableRow>
                                <TableHead>ชื่อสินค้า</TableHead>
                                <TableHead>จำนวน</TableHead>
                                <TableHead>ยอดรวม</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billDetails?.items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name} - {item.code}</TableCell>
                                    <TableCell>{item.quantity} x {formatNumber(item.price, 2)}</TableCell>
                                    <TableCell>{item.total} บาท</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     </div>
                    <div className="flex flex-col justify-between mt-4">  
                        <div><p>ยอดรวม: {billDetails?.total} บาท</p></div>
                        <div><p>ยอดเงินที่รับ: {billDetails?.received} บาท</p></div>
                        <div><p>ยอดเงินทอน: {billDetails?.change} บาท</p></div>
                    </div>
                    
                    {/* <p className="mt-4 text-center">Terms & Conditions</p>
                    <ol className="list-decimal ml-4">
                        <li>Items purchased cannot be exchanged or returned.</li>
                        <li>Double-check the change you received.</li>
                        <li>Don't forget to come back.</li>
                    </ol> */}
                    
                    <p className="text-center mt-4">พิมพ์วันที่: {new Date().toLocaleDateString()}</p>
                    <Button className="print-button" onClick={handlePrint}>พิมพ์บิล</Button>
               
                </div>
            </DialogContent>
            
              
             
        </Dialog>
        </div>
    );
};

export default APListComponent;