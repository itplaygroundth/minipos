"use client"
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
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

import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils'
import { useCustomDialog } from '@/components/customdlg';
import { formatInTimeZone,toDate, format } from 'date-fns-tz'


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
    FormItem,Skeleton,
    DialogDescription} from '@/components/ui';
 
import { useTranslation } from '@/app/i18n/client';
import { languages } from '@/app/i18n/setting'
import { usePathname } from 'next/navigation';
import { convP2DC, formatNumber } from '@/lib/utils'
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { FormControl, FormDescription, FormLabel } from '../ui/form';

import { string, z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {DeleteIcon,Trash2} from "lucide-react"
import Cookies from 'js-cookie'; 
import { AddInvoice, DeleteInv, GetDocNo, GetInvoiceNo, GetItemList, GetSettings } from '@/actions';
import { pages } from 'next/dist/build/templates/app-page';
import {Items,BCAr} from "@/types"
import TableList from './tablelist'
import DebouncedInput from '../debouncedinput'
import TimeLabel from '../timelabel'
import { DialogClose } from '../ui/dialog'
import Autocomplete from '../ui/autocomplete'
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

 

interface SaleProps {
    data: {
        Items: Items[];
        Customers: BCAr[];
        Setting:string;
        Docno:string;
        Invoice:any[];
        Role:string;
    }
    message: string;
    status: boolean;
}
const company = process.env.NEXT_PUBLIC_COMPANY
const SaleComponent:React.FC<SaleProps> = ({ data, message, status }) => {
  //  const [searchTerm, setSearchTerm] = useState('');
    const [searchArTerm, setSearchArTerm] = useState('');
    const [quantity, setQuantity] = useState(1);
  //  const [invoice,setInvoice] = useState(data.Invoice)
 // เปลี่ยนประเภทของ items เป็น Item[]
    const [items, setItems] = useState<Items[]>([]);
    const [customer, setCustomer] = useState<BCAr>();
    const [customerId, setCustomerId] = useState(JSON.parse(JSON.parse(data.Setting).data).customer || "");
    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]
    const {toast} = useToast()
    const {t} = useTranslation(lang,"common",undefined)
    const [isLoading,setIsLoading] = useState(false)
    const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [showPanelItem, setShowPanelItem] = useState(false);
    const [showPanelDoc, setShowPanelDoc] = useState(false);
 
    const [showPanelAr, setShowPanelAr] = useState(false);
    const [pageSize, setPageSize] = useState(10); // กำหนดค่าเริ่มต้นเป็น 10 แถวต่อหน้า
    const [currentPage, setCurrentPage] = useState(0); // ตัวแปรสำหรับเก็บหน้าปัจจุบัน
    const [isDialogOpen, setIsDialogOpen] = useState(false); // สถานะสำหรับเปิด/ปิด Dialog
    const [totalamount, setTotalAmount] = useState(0); // สถานะสำหรับยอดเงินที่แสดง
    const [taxamount, setTaxAmount] = useState(0); // สถานะสำหรับยอดเงินที่แสดง
    const [sumitemamount, setItemAmount] = useState(0); // สถานะสำหรับยอดเงินที่แสดง
    
    // const [receivedAmount, setReceivedAmount] = useState(0); // สถานะสำหรับยอดเงินที่รับ
    //const [rowSelection, setRowSelection] = React.useState({})
    const [rowSelection, setRowSelection] = useState({});
    const [price,setPrice] = useState(JSON.parse(JSON.parse(data.Setting).data).price)
    const [user,setUser] = useState<BCAr>()
   // const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false); // สำหรับ Dialog รับเงิน
    const [isBillDialogOpen, setIsBillDialogOpen] = useState(false); // สำหรับ Dialog แสดงบิล
    const [isDelDialogOpen,setIsDellDialogOpen] = useState(false)
    const [changeAmount, setChangeAmount] = useState(0); // สถานะสำหรับยอดเงินทอน
    const [billDetails, setBillDetails] = useState<any>(null); // สถานะสำหรับรายละเอียดบิล
    const [posid,setPosid] = useState("")
    const [globalFilter, setGlobalFilter] = useState('')
    const [docFilter, setDocFilter] = useState('')
    const [docno,setDocno] = useState(data.Docno)
    const [setting,setSetting] = useState(data.Setting)
    const [filteredDataItem,setfilteredDataItem] = useState([])
    const [filteredDataInv,setfilteredDataInv] = useState([])
    const [isEdit, setIsEdit] = useState(false)
    const date = new Date()
    const form = useForm<z.infer<typeof recieveSchema>>({
        resolver: zodResolver(recieveSchema),
        defaultValues:{
            totalamount:0,
            recievemoney:0
        }
    })
    useEffect(() => {
        // โหลดข้อมูลจาก sessionStorage ถ้ามี
        
        try {
        //console.log(JSON.parse(JSON.parse(setting).data).docformat)
        if(posid=="")
        setPosid(JSON.parse(setting).posId) 

        setUser(data.Customers.filter((item)=>item.code==customerId)[0])

        const storedItems = sessionStorage.getItem('items');
       // console.log(storedItems)
        const isedit = sessionStorage.getItem("isedit");
        if (isedit) {
            setIsEdit(isedit === "true"); // แปลงค่าจาก sessionStorage เป็น boolean
        }
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
       
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                setItems(parsedItems); // ตั้งค่า items หากมีข้อมูล
                const total = parsedItems.reduce((total, item) => total + item.total, 0);
                setItemAmount(total)
                setTaxAmount(total-(total/convP2DC(JSON.parse(JSON.parse(data.Setting).data).taxrate)))
            }
        }
        }
        catch{
            
        }
    }, []); // ทำงานเพียงครั้งเดียวเมื่อคอมโพเนนต์ถูกสร้างขึ้น

    useEffect(() => {
        try {
        // อัปเดต sessionStorage ทุกครั้งที่ items เปลี่ยนแปลง
        sessionStorage.setItem('items', JSON.stringify(items));
        }
        catch {

        }
    }, [items]);
    const [confirm, ConfirmDialogComponent] = useCustomDialog({
        title: "ลบรายการ?",
        description: "ต้องการลบรายการนี้ ใช่หรือไม่?",
        btnok:"ตกลง",
        btncancel:"ยกเลิก"

    });
    const handleOpenButton = async () => {
        const ok = await confirm();
        if (ok) {
            handleDel()
            clearSession()
            return;
        }
    }
    const clearSession = () => {
        sessionStorage.removeItem('items');
       
        setItems([]); // เคลียร์ items ใน state
        form.setValue("totalamount",0)
        form.setValue("recievemoney",0)
        //console.log(setting)
        //console.log(posid,JSON.parse(JSON.parse(setting).data).docformat)
        GetInvoiceNo(posid,JSON.parse(JSON.parse(setting).data).docformat).then((response)=>{
         //   console.log(response)
            if(response.Status){
                setDocno(response.Data)
            }
            // console.log("###############")
            // console.log(customer)
            // console.log(customerId)
            // console.log("###############")
        })
        sessionStorage.setItem("isedit","false")
        setTaxAmount(0)
        setItemAmount(0)
        setTotalAmount(0)
        setIsEdit(false)
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
    const modalArColumns = useMemo(() => [
        { id: 'rowNumber', header: 'ลำดับ',visible:true,format:'' },
        { id: 'code', header: 'รหัสลูกค้า',visible:true,format:'' },
        { id: 'name', header: 'ชื่อ',visible:true,format:'' },
        { id: 'address', header: 'ที่อยู่',visible:true,format:'' },
        // { id: 'unit', header: 'หน่วยนับ' },
        // { id: 'price1', header: 'ราคา1' },
        // { id: 'price2', header: 'ราคา2' },
        // { id: 'price3', header: 'ราคา3' },
    ], []);
    const modalInvColumns = useMemo(() => [
       // { id: 'rowNumber', header: 'ลำดับ',visible:true  },
        { id: 'docdate', header: 'วันที่' ,visible:true,format:'DD-MM-YYYY' },
        { id: 'docno', header: 'เลขที่เอกสาร' ,visible:true,format:'' },
        { id: 'arname', header: 'ชื่อลูกค้า' ,visible:true,format:'' },
        { id: 'totalamount', header: 'มูลค่า' ,visible:true,format:'0.00' },
        // { id: 'unit', header: 'หน่วยนับ' },
        // { id: 'price1', header: 'ราคา1' },
        // { id: 'price2', header: 'ราคา2' },
        // { id: 'price3', header: 'ราคา3' },
    ], []);
    const filteredDataAr = data?.Customers.filter(item => 
        (item?.name?.toLowerCase().includes(searchArTerm?.toLowerCase()) || 
        item?.code?.toLowerCase().includes(searchArTerm?.toLowerCase())) &&
        (/\d/.test(searchArTerm) || /^[a-zA-Z\u0E00-\u0E7F]*$/.test(searchArTerm))
    );
    const columnHelper = createColumnHelper<Items>()
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
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 25, //default page size
      });
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
            onPaginationChange: setPagination,
            enableRowSelection: true,
            initialState: {
                pagination: {
                  pageIndex: 0, //custom initial page index
                  pageSize: 25, //custom default page size
                },
              },
            state: {
                sorting,
                columnFilters,
                columnVisibility,
                rowSelection,
                pagination
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
    const table = createTable(items, columns);
    
    const handleRowClick = (row:any) => {
        setRowSelection(row)
    //    // const newSelectedRows = new Set(rowSelection);
    //     if (rowSelection.has(row.id)) {
    //         rowSelection.delete(row.id); // ยกเลิกการเลือกหากแถวถูกเลือกอยู่แล้ว
    //     } else {
    //         rowSelection.add(row.id); // เพิ่มแถวที่ถูกเลือก
    //     }
    //     setSelectedRows(newSelectedRows);
     };
    
     const handleDeleteRow = (rowId:number) => {
        // ลบแถวออกจากข้อมูล
        console.log(rowId);

        // Make a copy of the items array
        const newData = [...items];
    
        // Remove the item at the specified index using splice
        newData.splice(rowId, 1);
    
        // Update the state with the new array
        setItems(newData);
        // Calculate the new total amount
        const totalAmount = newData.reduce((sum, item) => sum + item.total, 0);
        
        // Update the total amount state
        setTotalAmount(totalAmount);
        setTaxAmount(totalAmount-(totalAmount/convP2DC(JSON.parse(JSON.parse(data.Setting).data).taxrate)))
    // ตั้งค่า totalAmount ใหม่
        setItemAmount(totalAmount)
        // Clear the row selection
        setRowSelection({});
      
    };
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
                    <li> <h1 >${company}</h1></li>
                    <li>${customer?.name}</li>
                    <li>${JSON.parse(data.Setting).location}</li>
                    <li>เลขที่: ${billDetails?.docno}</li>
                    <li>วันที่ ${new Date().toLocaleDateString(lang)}</li>
                    </ul>
                    <br>
                    ${printContent?.innerHTML} 
                    <ul>  
                        <li>ยอดรวม: ${billDetails?.total} บาท</li>
                        <li>ยอดเงินที่รับ: ${billDetails?.received} บาท</li>
                        <li>ยอดเงินทอน: ${billDetails?.change} บาท</li>
                    </ul>
                    <br>
                    <div className="text-center mt-4">พิมพ์วันที่: ${new Date().toLocaleDateString(lang)}</div>
                </body>
            </html>
        `);
        
        win?.document.close(); // ปิด document ของหน้าต่าง
        win?.focus(); // มุ่งเน้นหน้าต่าง
        win?.print(); // เรียกฟังก์ชันพิมพ์
        win?.close(); // ปิดหน้าต่างหลังจากพิมพ์
        setTimeout(() => {
        setIsBillDialogOpen(!isBillDialogOpen)
      //  setCustomerId("")
        setGlobalFilter("")
        clearSession()
        
        },1000)
    };
    const handleSelectInv = (item: {docno:string,docdate:string}) => {
        // console.log(item)
         setShowPanelDoc(false)
         sessionStorage.setItem("isedit","true")
         setIsEdit(true)

         //setCustomer({code:item.arcode,name:item.arname})
         setDocno(item.docno)
        
         GetDocNo(item.docno).then((response)=>{
           // form.setValue("Docno",item.docno)
           //response.Data.map((item:any)=>{
        //setItems(response.Data)
       // console.log(response) 
       
       if(response.Status){
        setCustomer({code:response.Data.Invoice.arcode,name:response.Data.Invoice.arname,address:"",pricelevel:""})  
        let items:any = []
        let total = 0
        response.Data.Invoicesub.forEach((item:any) => {
        
        item.name = item.itemname
        item.code = item.itemcode
        item.quantity = item.qty
        item.total = item.amount
        ///item.unit = item.unitcode
        //addItem(item)
        items = [...items,item]
        total += item.total
        })
        setTotalAmount(total)
        setItems(items)
        setTaxAmount(total-(total/convP2DC(JSON.parse(JSON.parse(data.Setting).data).taxrate)))
        // setTotalAmount(totalAmount); // ตั้งค่า totalAmount ใหม่
         setItemAmount(total)
        } else {
            toast({
                variant: "destructive",
                title: t('common.error.title'),
                description: response.Message,
            });
        }
         })
        // const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
         //setTotalAmount(totalAmount); // ตั้งค่า totalAmount ใหม่
       
    }
    const handleSelectItem = (item: Items) => {

   //   addItem(item)
        //console.log(item)
        // ตรวจสอบว่ามีสินค้านี้อยู่ในรายการหรือไม่
        
        
        
        const existingItemIndex = items.findIndex(existingItem => existingItem.code === item.code);
       // console.log(`${item}.${item[price as keyof Items]}`)
        const whcode = JSON.parse(JSON.parse(setting).data).whcode
        const shelfcode = JSON.parse(JSON.parse(setting).data).shelfcode
        const saleprice = parseFloat(item[price as keyof Items].toString())
      
        item.whcode = whcode
        item.shelfcode = shelfcode
        //console.log(items)
        //console.log(existingItemIndex)
        if (existingItemIndex == -1) {
            item.quantity = quantity
            item.total = saleprice * quantity 
            item.price = saleprice
           // item.unitcode = item.unit
            items.push(item)
            setItems([...items])
        }else {
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity; // เพิ่มจำนวนจากช่องกรอก
            updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity; // คำนวณผลรวมใหม่
            setItems(updatedItems);
        }
       
        const total = items.reduce((total, item) => total + item.total, 0);
        setItemAmount(total)
        setTaxAmount(total-(total/convP2DC(JSON.parse(JSON.parse(data.Setting).data).taxrate)))
        //console.log(items)
        setShowPanelItem(false);
        setQuantity(1);
        
    };
    // const addItem = (item: Items) => {
    //     const existingItemIndex = items.findIndex(existingItem => existingItem.code === item.code);
       
    //     let saleprice = 0.0
    //     if(item[price as keyof Items])
    //         saleprice = parseFloat(item[price as keyof Items].toString())
    //     else
    //         saleprice = item.price
          
    //      //console.log(`${item}.${item[price]}`)
    //      const whcode = JSON.parse(JSON.parse(setting).data).whcode
    //      const shelfcode = JSON.parse(JSON.parse(setting).data).shelfcode
    //      //console.log(item[price as keyof Items])
       
    //      item.whcode = whcode
    //      item.shelfcode = shelfcode
    //      if (existingItemIndex !== -1) {
    //          // ถ้ามีอยู่แล้ว ให้ปรับปรุงจำนวนและผลรวม
    //          const updatedItems = [...items];
    //          updatedItems[existingItemIndex].quantity += quantity; // เพิ่มจำนวนจากช่องกรอก
    //          updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity; // คำนวณผลรวมใหม่
    //          setItems(updatedItems);
    //      } else {
    //          // item.price = saleprice
    //          // ถ้าไม่มี ให้เพิ่มรายการใหม่
    //         // console.log(items)
    //          setItems([...items, { ...item, quantity, total: saleprice * quantity }]);
    //      }
    //      const newTotalAmount = items.reduce((total, item) => total + item.total, 0);
    //      setTotalAmount(newTotalAmount); // ตั้งค่า totalAmount ใหม่
    //       // ซ่อน Panel
    //      setQuantity(1); // รีเซ็ตจำนวน
    // }
    const handleSelectAr = (item: BCAr) => {
        // ตรวจสอบว่ามีสินค้านี้อยู่ในรายการหรือไม่
        //const existingArIndex = bCAr.findIndex(existingItem => existingItem.code === item.code);
        
        //if (existingArIndex !== -1) {
            // ถ้ามีอยู่แล้ว ให้ปรับปรุงจำนวนและผลรวม
          //  const updatedItems = [...items];
           // updatedItems[existingArIndex].quantity += quantity; // เพิ่มจำนวนจากช่องกรอก
          //  updatedItems[existingArIndex].total = updatedItems[existingArIndex].price * updatedItems[existingArIndex].quantity; // คำนวณผลรวมใหม่
          //  setBCAr(updatedItems);
       // } else {
            // ถ้าไม่มี ให้เพิ่มรายการใหม่
        setCustomer(item);
       // }
       // const newTotalAmount = items.reduce((total, item) => total + item.total, 0);
       // setTotalAmount(newTotalAmount); // ตั้งค่า totalAmount ใหม่
        setShowPanelAr(false); // ซ่อน Panel
        //setQuantity(1); // รีเซ็ตจำนวน
        setSearchArTerm('');
    };
    // const handleEsc = (event: KeyboardEvent) => { 
    //     if (event.key === "Escape") {
    //         setShowPanelItem(false);
    //         setShowPanelAr(false); // ซ่อน Panel เมื่อกด ESC
    //     } 
    // }
    const handleKeyDown = (event: KeyboardEvent) => {
        //console.log(event.key)
        if (event.key === "Escape") {
           // if(showPanelItem)
            setShowPanelItem(false);
          //  if(showPanelAr)
            setShowPanelAr(false); 
          //  if(showPanelDoc)
            setShowPanelDoc(false); // ซ่อน Panel เมื่อกด ESC
        } else if (event.key === "Enter") {
            if (filteredDataItem.length === 1) {
                handleSelectItem(filteredDataItem[0]); 
                setGlobalFilter('');// เลือกรายการเดียวที่แสดง
            } else if (filteredDataAr.length === 1) {
                handleSelectAr(filteredDataAr[0]); 
                setSearchArTerm('');
            }
        } else if(event.key == "F7") {
            handleOpenDialog()
        } else if(event.key == "F5") {
            if(showPanelAr)
            setShowPanelAr(false)
            setShowPanelItem(true)
            document.getElementById('searchTerm-input')?.focus();
        } else if(event.key == "F4") {
            if(showPanelItem)
            setShowPanelItem(false)
            setShowPanelAr(true)
            document.getElementById('customerid-input')?.focus();
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
    const paginatedDataAr = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredDataAr?.slice(startIndex, endIndex);
    }, [filteredDataAr, currentPage, pageSize]); 
    const handlerPrint = () =>{
//        console.log(JSON.parse(data.Setting))
        const totalamount = items.reduce((total, item) => total + item.total, 0)    
        const today = formatInTimeZone(date, 'Asia/Bangkok', 'yyyy-MM-dd')
        const recievemoney = totalamount
        const change = recievemoney - totalamount;
        setBillDetails({
            docno:docno, // เปลี่ยนเป็นเลขที่เอกสารจริง
            docdate: today,
            arcode: customerId, // ใช้รหัสลูกค้า
            items: items, // ใช้รายการสินค้าที่ถูกเลือก
            total: formatNumber(totalamount,2), // ยอดรวม
           // netdebtamount: formatNumber(totalamount,2), 
            received: formatNumber(recievemoney,2), // ยอดเงินที่รับ
            change: formatNumber(change,2) // ยอดเงินทอน
        });
        setIsBillDialogOpen(true);
    }
    const handleSave:SubmitHandler<z.infer<typeof recieveSchema>> =  async (bdata:z.infer<typeof recieveSchema>) => {
        bdata.totalamount = items.reduce((total, item) => total + item.total, 0)    
        const today = formatInTimeZone(date, 'Asia/Bangkok', 'yyyy-MM-dd')

        try {
            if(bdata.recievemoney && bdata.recievemoney>0){
                if(bdata.recievemoney < bdata.totalamount) {
                    
                        toast({
                            variant: "destructive",
                            title: t('common.error.title'),
                            description:"ยอดเงินรับน้อยกว่า ยอดสินค้ารวม",
                        });
                  
                    return
                }
           
            const change = bdata.recievemoney - bdata.totalamount; // คำนวณยอดเงินทอน
           // ตั้งค่ายอดเงินทอน
            const  percent = parseFloat(JSON.parse(JSON.parse(setting).data).taxrate.replace("%",""))
            const percentage = ((100+percent)/100)
            const BeforeTaxamount = (bdata.totalamount / percentage).toFixed(2);
            const TaxAmount = (bdata.totalamount - (bdata.totalamount / percentage)).toFixed(2);
            
            setChangeAmount(change); 
            //const user = data.Customers.filter((item)=>item.code==customerId)[0]
            
            const bill_detail  = {
                invoice:{
                    docno: docno,
                    taxno:docno, // เปลี่ยนเป็นเลขที่เอกสารจริง
                    docdate: toDate(today),
                    arcode: user?.code,
                    arname: user?.name, // ใช้รหัสลูกค้า
                //   items: items, // ใช้รายการสินค้าที่ถูกเลือก
                    SumofItemAmount: bdata.totalamount, 
                    AfterDiscount: bdata.totalamount, 
                    BeforeTaxamount: parseFloat(BeforeTaxamount), 
                    TaxAmount:parseFloat(TaxAmount),
                    totalamount: bdata.totalamount, // ยอดรวม
                    HomeAmount: bdata.totalamount,
                    billbalance: bdata.totalamount,
                    netdebtamount: bdata.totalamount, 
                    SumcashAmount: bdata.recievemoney, // ยอดเงินที่รับ
                    sumchangeamount: change,
                    PayBillStatus:0,
                    ExchangeRate:1,
                    IsCancel:0,
                    IsCompleteSave:1,
                    posstatus:0,
                    BillType:0,
                    TaxType:1,
                    TaxRate:parseFloat(JSON.parse(JSON.parse(setting).data).taxrate.replace("%","")),
                    GLFormat:"B2"
                    },
                invoicesub:items
            }
           // console.log(bill_detail)
            //const sumchangechange = bdata.recievemoney-bdata.totalamount
            setBillDetails({
                docno:docno, // เปลี่ยนเป็นเลขที่เอกสารจริง
                docdate: today,
                arcode: customerId, // ใช้รหัสลูกค้า
                items: items, // ใช้รายการสินค้าที่ถูกเลือก
                total:formatNumber(bdata.totalamount,2), // ยอดรวม
                // netdebtamount: formatNumber(totalamount,2), 
                received: formatNumber(bdata.recievemoney,2), // ยอดเงินที่รับ
                change: formatNumber(change,2), // ยอดเงินทอน
                totalamount: formatNumber(bdata.totalamount,2), // ยอดรวม
                netdebtamount: formatNumber(bdata.totalamount,2), 
                sumcashamount: formatNumber(bdata.recievemoney,2), // ยอดเงินที่รับ
                sumchangeamount: formatNumber(change,2) // ยอดเงินทอน
            });
          //  console.log(JSON.parse(JSON.parse(setting).data).taxrate)
            const invoice = await AddInvoice(bill_detail)
          //  console.log(invoice)
           if(invoice.Status){

          
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
        } else {
            toast({
                variant: "destructive",
                title: t('common.error.title'),
                description: invoice.Message,
            });
        }

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
            //console.log(error)
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
    const handleDel = () =>{
      //  console.log("915",docno)
         DeleteInv(docno).then((response)=>{
    //        console.log(response)
            if(response.Status){
                toast({
                    variant: "default",
                    title: t('common.success.title'),
                    description: response.Message,
                    });
                setIsDellDialogOpen(false)
            } else {
                toast({
                variant: "destructive" ,
                title: t('common.error.title'),
                description: response.Message,
                });
            }


         }).catch((err)=>{
            toast({
                variant: "destructive" ,
                title: t('common.error.title'),
                description: err,
                });
         })
    }
    return isLoading?( 
        <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>):(
        <div className="flex flex-1 flex-col gap-4 p-4 ">
            <div className="flex justify-start gap-4 max-w-desktop overflow-auto ">
                <div className="bg-muted/50 w-full sm:w-[300px] shadow  backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <div className="flex items-center space-x-4 text-sm">
                            <div> <Label className={cn("text-sm font-bold")}>{`Role:  `}</Label><Label className={cn("text-sm font-bold",!isEdit?"text-green-600":"text-green-600")}>{`${data.Role.toString().toUpperCase()}`}</Label></div>
                            <Separator orientation="vertical" />
                            <div> <Label className={cn("text-sm font-bold")}>{`Mode:  `}</Label><Label className={cn("text-sm font-bold",!isEdit?"text-green-600":"text-green-600")}>{`${isEdit?"Edit":"Insert"}`}</Label></div>
                        </div>
                        <TimeLabel lang={lang} />
                        <Label className='bg-gray-300  h-[20px] text-center' style={{ lineHeight: '20px' }}>{`${t('transaction.posid')} : ${JSON.parse(setting).posId}`}</Label>
                        <Label className='bg-gray-300 h-[20px] text-center' style={{ lineHeight: '20px' }}>{`${t('transaction.docno')} : ${docno}`}</Label>
                        <Separator orientation='horizontal' />
                        <Label className='pl-2'>{"X จำนวนที่ต้องการขาย"}</Label>
                        <Input 
                            id="quantity-input"
                            type="text" 
                            placeholder="จำนวน" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Number(e.target.value))} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    //handleSelectItem(filteredDataItem[0]); // เลือกรายการเดียวที่แสดง
                                    setGlobalFilter(''); // เคลียร์ searchTerm
                                    //setQuantity(1); // ตั้งค่า quantity เป็น 1
                                    document.getElementById('searchTerm-input')?.focus();
                                }
                            }}
                        />
                         <Label className='pl-2'>{"[F5] เลือกรายการสินค้า"}</Label>
                         <DebouncedInput
                          id="searchTerm-input"
                          placeholder="ค้นหารายการสินค้า" 
                          value={globalFilter ?? ''}
                          onChange={value => {
                            if(String(value)==='')
                                return
                            setGlobalFilter(String(value))
                            //setSearchTerm(String(value)); // อัปเดตสถานะการค้นหา
                           
                            setShowPanelItem(true); // แสดง Panel เมื่อมีการพิมพ์
                            
                            if(showPanelAr)
                                setShowPanelAr(false);   
                            
                        }}
                          className="pl-2 font-lg shadow border border-block max-w-sm"
                        //   onKeyDown={(e) => {
                        //     if (e.key === "Enter" && filteredDataItem.length === 1) {
                        //         handleSelectItem(filteredDataItem[0]); // เลือกรายการเดียวที่แสดง
                        //         //document.getElementById('quantity-input')?.focus(); // โฟกัสที่ช่อง quantity
                        //         setShowPanelItem(false)
                        //     }
                        // }}
                         />
                        {/* <Input 
                            id="searchTerm-input"
                            placeholder="ค้นหารายการสินค้า" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value); // อัปเดตสถานะการค้นหา
                                setShowPanelItem(true); // แสดง Panel เมื่อมีการพิมพ์
                                if(showPanelAr)
                                    setShowPanelAr(false);
                            }} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && filteredDataItem.length === 1) {
                                    handleSelectItem(filteredDataItem[0]); // เลือกรายการเดียวที่แสดง
                                    //document.getElementById('quantity-input')?.focus(); // โฟกัสที่ช่อง quantity
                                }
                            }}
                        /> */}
                        {/* <Button onClick={addItem}>เพิ่มรายการ</Button> */}
                      
                        <Label className='pl-2'>{"[F4] รหัสลูกค้า "}
                            {/* <span className='text-green-600'>{`${user?`${user?.name}`:"ยังไม่กำหนดรหัสลูกค้า"}`}</span> */}
                         </Label>
                        <Autocomplete
                                value={customerId}
                                onChange={setCustomerId}
                                allSuggestions={filteredDataAr.map((item) => ({ name: item.name, code: item.code }))}
                               classname="w-[270px]"
                            />
                        {/* <Input 
                            id="customerid-input"
                            placeholder="รหัสลูกค้าหรือสมาชิก" 
                            value={searchArTerm} 
                            onChange={(e) => {
                                setCustomerId(e.target.value);
                                setSearchArTerm(e.target.value)
                                setShowPanelAr(true);
                                if(showPanelItem)
                                setShowPanelItem(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && filteredDataAr.length === 1) {
                                    handleSelectAr(filteredDataAr[0]); // เลือกรายการเดียวที่แสดง
                                    setSearchArTerm(''); // เคลียร์ searchTerm
                                    //setQuantity(1); // ตั้งค่า quantity เป็น 1
                                    document.getElementById('searchTerm-input')?.focus();
                                }
                            }}
                        /> */}
                        <Separator orientation='horizontal' />
                        <div className='flex flex-col gap-3 border border-1 mt-2'>
                          
                        <Button className="text-white hover:bg-gray-400" disabled={isEdit} onClick={handleOpenDialog}>[F7] กดรับเงิน</Button>
                        <Button  className="bg-blue-300 text-black-400 hover:bg-blue-400"   onClick={()=>handlerPrint()}>[F11] พิมพ์บิล</Button>
                        <Button className='bg-red-400 text-green-800 hover:bg-red-500'  onClick={clearSession}>ยกเลิก</Button>
                    
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 bg-muted/50 w-full shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="min-h-[100vh] flex-1 w-full rounded-xl bg-muted/50 md:min-h-min p-5 overflow-auto">
                        {/* <div className={cn("mb-2",data.Role.toString()!="USER"?'':'hidden')}>
                            <Button className='p-2 mx-2 w-[80px] text-white bg-blue-400 hover:bg-blue-500'
                                onClick={() => setShowPanelDoc(true)}
                            >{"บัญชี"}</Button>
                              <Button className='p-2 w-[80px] text-white bg-orange-400 hover:bg-orange-500'
                                onClick={() => setShowPanelDoc(true)}
                            >{"ภาษี"}</Button>
                        </div> */}
                        <div className="rounded-md border bg-background/95 ">
                        <div className='flex'>
                            
                              <Button className='p-2 m-2 w-[100px]'
                                onClick={() => setShowPanelDoc(true)}
                            >{"ค้นหาบิลขาย"}</Button>
                            <div  className={cn('flex ml-auto', docno && isEdit?'':'hidden')}>
                                <Button className='p-2 m-2 w-[100px] text-white bg-green-400 hover:bg-green-600'
                                    onClick={() => setShowPanelDoc(true)}
                                    disabled={data.Role.toString().toUpperCase()=="USER"}
                                >{"บันทึก"}</Button>
                                <Button className='p-2 m-2 w-[100px] text-white bg-red-400 hover:bg-red-600'
                                    onClick={handleOpenButton}
                                    disabled={data.Role.toString().toUpperCase()=="USER"}
                                >{"ลบ"}</Button>
                            </div>
                        </div>
                            <Table>
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
                                        data-state={row.getIsSelected() ? "selected" : ""}
                                        onClick={()=>handleRowClick(row)}
                                        className={cn("table-row",table.getState().rowSelection.id==row.id?"text-blue-500 font-bold":"transparent")}
                                       
                                        >
                                            
                                        {row.getVisibleCells().map((cell:any) => (
                                            <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                            </TableCell>
                                        ))}
                                        <TableCell className='w-[2px]'>
                                            {table.getState().rowSelection?.id ===row.id && (
                                                <Button
                                                    className="bg-red-400 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // หยุดการ bubbling ของ event
                                                        handleDeleteRow(row.id);
                                                    }}
                                                   variant="outline" size="icon"
                                                   disabled={isEdit && data.Role.toString().toUpperCase()=="USER"}
                                                >
                                                <Trash2 />
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
                                     <TableRow>
                                    <TableCell colSpan={columns.length-1} className="text-right">
                                            ภาษีมูลค่าเพิ่ม:   {JSON.parse(JSON.parse(data.Setting).data).taxrate}
                                    </TableCell>
                                    <TableCell colSpan={columns.length} className="text-right">
                                    {formatNumber(taxamount || 0, 2)}
                                    </TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell colSpan={columns.length-1} className="text-right">
                                            ยอดรวมภาษี:   
                                    </TableCell>
                                    <TableCell colSpan={columns.length} className="text-right">
                                    {formatNumber(sumitemamount || 0, 2)}
                                    </TableCell>
                                    </TableRow>
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
                        {/* <div>
                            <label>Row Selection State:</label>
                            <pre>{JSON.stringify(table.getState().rowSelection, null, 2)}</pre>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Panel สำหรับแสดงตาราง */}
           
            {showPanelItem?( <TableList 
             classname={"top-50 left-0 right-0 z-50 "}
             lang={lang}
             title="ค้นหา และ เลือกสินค้า"
             items={data.Items}
             setShowPanelItem={setShowPanelItem}
             modalItemColumns={modalItemColumns} 
             handleSelect={handleSelectItem}
             globalFilter={globalFilter}
             setGlobalFilter={setGlobalFilter}
             setfilteredDataItem={setfilteredDataItem}
             isShowInput={true}
             />):<></>}

            {showPanelDoc?( <TableList 
             classname={"top-50 left-0 right-0 z-50 "}
             lang={lang}
             title="ค้นหา และ เลือกบิลขาย"
             items={data.Invoice}
             setShowPanelItem={setShowPanelDoc}
             modalItemColumns={modalInvColumns} 
             handleSelect={handleSelectInv}
             globalFilter={docFilter}
             setGlobalFilter={setDocFilter}
             setfilteredDataItem={setfilteredDataInv}
             isShowInput={false}
             />):<></>}

            {showPanelAr && (
                <div className="fixed top-30 left-0 right-0 z-50 bg-white shadow-lg p-4" style={{ width: 'calc(100% - 300px)', left: '300px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold bg-gray-200 bg-opacity-50 rounded p-3">ค้นหา และ เลือกลูกค้า</h2>
                        <Button variant="outline" onClick={() => setShowPanelAr(false)}>ปิด</Button>
                    </div>
                    <div className="rounded-md border bg-background/95">
                        <Table className="table-striped">
                            <TableHeader>
                                <TableRow>
                                    {modalArColumns.map(column => (
                                        <TableHead key={column.id}>{column.header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedDataAr.length > 0 ? (
                                    paginatedDataAr.map((item, index) => (
                                        <TableRow key={index} onClick={() => handleSelectAr(item)} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                            {modalArColumns.map(column => (
                                                <TableCell key={column.id}>{item[column.id as keyof BCAr]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={modalArColumns.length} className="h-24 text-center">
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
                                const newTotalPages = Math.ceil(filteredDataAr.length / newSize);
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
                <DialogDescription>
                {`ยอดสินค้ารวม: ${formatNumber(items.reduce((total, item) => total + item.total, 0), 2)}`} 
                </DialogDescription> 
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
                    {/* <div>เงินทอน: {formatNumber(items.reduce((total, item) => total + item.total, 0) - receivedAmount, 2)}</div> */}
            
            </DialogContent>
      
            </form>
            </Form>
        </Dialog>
        <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
            <DialogContent >
                <DialogTitle className="print-dialog"></DialogTitle>
                <DialogDescription></DialogDescription>
                <div className=' flex flex-col p-4 border border-gray-300 rounded-lg shadow-md'>
                    <h1 className="text-xl font-bold text-center">{company}</h1>
                    <div className="text-center">{customer?.name}</div>
                    <div className="text-center">{JSON.parse(data.Setting).location}</div>
                    <div className="text-center">เลขที่: {billDetails?.docno}</div>
                    <div className="text-center">วันที่ {new Date().toLocaleDateString(lang)}</div>
                    
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
                                    <TableCell>{ item.name.substr(0, 10)}</TableCell>
                                    <TableCell>{item.quantity} x {formatNumber(item.price, 2)}</TableCell>
                                    <TableCell>{item.total} บาท</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     </div>
                    <div className="flex flex-col justify-between mt-4">  
                        <div><div>ยอดรวม: {billDetails?.total} บาท</div></div>
                        <div><div>ยอดเงินที่รับ: {billDetails?.received} บาท</div></div>
                        <div><div>ยอดเงินทอน: {billDetails?.change} บาท</div></div>
                    </div>
                    
                    {/* <div className="mt-4 text-center">Terms & Conditions</div>
                    <ol className="list-decimal ml-4">
                        <li>Items purchased cannot be exchanged or returned.</li>
                        <li>Double-check the change you received.</li>
                        <li>Don't forget to come back.</li>
                    </ol> */}
                    
                    <div className="text-center mt-4">พิมพ์วันที่: {new Date().toLocaleDateString(lang)}</div>
                    <Button className="print-button" onClick={handlePrint}>พิมพ์บิล</Button>
               
                </div>
            </DialogContent>
          
             
        </Dialog>
           
        
        <ConfirmDialogComponent />
        </div>
    );
};

export default SaleComponent;