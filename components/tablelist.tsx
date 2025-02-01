'use client'
import { ColumnFiltersState, createColumnHelper, FilterFn, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Button, Input, Label, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { useEffect, useMemo, useState } from "react";
import Cookies from 'js-cookie'; 
import { useTranslation } from "@/app/i18n/client";
import { Items } from "@/types";
import { formatInTimeZone,toDate, format } from 'date-fns-tz'
import { Select,SelectGroup } from "@/components/ui/select";
import { rankItem } from "@tanstack/match-sorter-utils";
 
import { cn, formatNumber } from "@/lib/utils";
import DebouncedInput from "@/components/debouncedinput";
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value)
  
    // Store the itemRank info
    addMeta({
      itemRank,
    })
  
    // Return if the item should be filtered in/out
    return itemRank.passed
  }
export default function TableList({
    classname,
    lang,
    title,
    items,
    setShowPanelItem,
    modalItemColumns,
    handleSelect,
    setfilteredDataItem,
    globalFilter,
    setGlobalFilter,
    isShowInput
}: {
    classname:string
    lang: string,
    title:string,
    items:any,
    setShowPanelItem: any,
    modalItemColumns: any,
    handleSelect: any,
    setfilteredDataItem:any,
    globalFilter:any,
    setGlobalFilter:any,
    isShowInput:boolean
}){
    
    const [sorting, setSorting] = useState<SortingState>([])
   
    const [showPanelAr, setShowPanelAr] = useState(false);
    const [pageSize, setPageSize] = useState(10); // กำหนดค่าเริ่มต้นเป็น 10 แถวต่อหน้า
    const [currentPage, setCurrentPage] = useState(0); // ตัวแปรสำหรับเก็บหน้าปัจจุบัน
    const [isDialogOpen, setIsDialogOpen] = useState(false); // สถานะสำหรับเปิด/ปิด Dialog
    const [totalamount, setTotalAmount] = useState(0); // สถานะสำหรับยอดเงินที่แสดง
    const [receivedAmount, setReceivedAmount] = useState(0); // สถานะสำหรับยอดเงินที่รับ
    const [price,setPrice] = useState("")
    const [rowSelection, setRowSelection] = useState({})
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false); // สำหรับ Dialog รับเงิน
    const [isBillDialogOpen, setIsBillDialogOpen] = useState(false); // สำหรับ Dialog แสดงบิล
    const [changeAmount, setChangeAmount] = useState(0); // สถานะสำหรับยอดเงินทอน
    const [billDetails, setBillDetails] = useState<any>(null); // สถานะสำหรับรายละเอียดบิล
    const [posid,setPosid] = useState(Cookies?.get('posid') || "")
    const [filteredData,setfilteredData] = useState([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [itemFilter, setItemFilter] = useState('')
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
      })
    
    const [isFocused, setIsFocused] = useState(false);
    const [columnVisibility, setColumnVisibility] =
      useState<VisibilityState>({})
    const {t} = useTranslation(lang,"common",undefined)

   
  
   
    // const columns = useMemo(()=>[
    //     columnHelper.accessor('name', {
    //         header: t('columns.name'),
    //         cell: info => info.getValue(),
    //         filterFn: fuzzyFilter
    //       }),
    // ],[])
    const columnHelper = createColumnHelper<typeof items>()
    const columns = useMemo(() => 
        modalItemColumns.map((col:any) => 
          col.visible ?  // ตรวจสอบว่า col.visible เป็นจริง
          columnHelper.accessor(col.id, {
              header: col.header,
              cell: (info) => {
              if(col.format=="0.00") {
                return   <Label style={{ textAlign: "right", display: "block" }}>   
                {formatNumber(parseFloat(info.getValue()?.toString()), 2)}</Label>
              } else  if(col.format == "DD-MM-YYYY") {
                return   <Label className={cn("text-sm-600","text-right")}>{new Date().toLocaleDateString(lang)}</Label>
              } else {
                return  info.getValue()
              }
            },
              filterFn: col.filterFn || fuzzyFilter,
              // สามารถเพิ่ม options อื่นๆ ได้ตามต้องการ เช่น enableSorting: true
          }): null 
            // columnHelper.accessor(col.id, {
            //     header: col.header,
            //     cell: (info) => info.getValue(),
            //     filterFn: col.filterFn || fuzzyFilter,
            //     visible:col.visible
            //     // ใช้ filterFn ที่กำหนดใน col หรือใช้ fuzzyFilter เป็นค่าเริ่มต้น
            //     // คุณสามารถเพิ่ม options อื่นๆ ได้ตามต้องการ เช่น enableSorting: true
                
            ).filter((col:any) => col !== null)
        , [modalItemColumns]
    );

//const table = createTable(items,columns)
const table = useReactTable({
    data:items,
    columns,
    debugTable: true,
    filterFns: {
        fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
      },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setItemFilter,
    globalFilterFn: fuzzyFilter, 
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    initialState: {
        columnVisibility: {},
        pagination: {
          pageIndex: 0, //custom initial page index
          pageSize: 20, //custom default page size
        },
      },
    state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        globalFilter,
        pagination
    },
    // filterFns: {
    //     customArrayFilter: (row, columnId, filterValue) => {
    //         const names = row.getValue(columnId) as string[];
    //         return names.some(name => 
    //             name.toLowerCase().includes(filterValue.toLowerCase())
    //         );
    //     },
    // },
});
useEffect(() => {
    const filteredData = table.getFilteredRowModel().rows.map(row => row.original);
    setfilteredDataItem(filteredData);
}, [table.getFilteredRowModel().rows, setfilteredDataItem]);

const handleFocus = () => {
  setIsFocused(true);
};

const handleBlur = () => {
  // Delay hiding suggestions to allow for click events on suggestions
  setTimeout(() => {
    setIsFocused(false);
    // setSuggestions([]);
    // setSelectedIndex(-1);
  }, 200);
};

return (
    <div className={cn("fixed bg-white shadow-lg p-4",classname)} style={{ width: 'calc(100% - 300px)', left: '300px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="flex justify-between">
        {/* <h2 className=" text-lg font-bold  bg-opacity-50 rounded p-3">{title}</h2><Button variant="outline" onClick={() => setShowPanelItem(false)}>ปิด</Button> */}
        </div>
  
        <div className={cn("flex justify-start items-center my-2",!isShowInput?"":"hidden")}>
        <Label className="bg-gray-200 bg-opacity-80 shadow border-left border-block  w-[120px] text-center" style={{ lineHeight: '35px' }}>{"ค้นหา"}</Label>
        <DebouncedInput
                          id="searchTerm-input"
                          placeholder="ค้นหารายการ" 
                          value={globalFilter ?? ''}
                          onChange={value => {
                          
                           // setGlobalFilter(String(value))
                            setItemFilter(String(value))
                           
                            
                        }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                          className="p-2 font-lg shadow border-right border-block max-w-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && filteredData.length === 1) {
                                handleSelect(filteredData[0]); // เลือกรายการเดียวที่แสดง
                                //document.getElementById('quantity-input')?.focus(); // โฟกัสที่ช่อง quantity
                                setShowPanelItem(false)
                            }
                        }}
                         />         
        </div>
        <div className="rounded-md border bg-background/95">
            <Table className="table-striped">
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
                <TableBody>
                {table.getRowModel() && table.getRowModel().rows && table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                  
                            <TableRow key={row.id} onClick={() =>{ 
                        
                                handleSelect(row.original)
                               
                            }} > 
                                {row.getVisibleCells().map((cell) => (
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
                            <TableCell colSpan={modalItemColumns.length} className="h-24 text-center">
                                {t('common.noResults')}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} {t('of')}{" "}
              {table.getFilteredRowModel().rows.length} {t('rowSelected')}.
            </div>
            <div>
            <Select
         
              onValueChange={(value) => table.setPageSize(parseInt(value))}
   
            >
               <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
              </SelectTrigger>
              <SelectContent>
              <SelectGroup>
               
              {[10, 20, 30, 40, 50].map(pageSize => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
                </SelectItem>
              ))}
              </SelectGroup>
              </SelectContent>
            </Select>
            </div>
            <div className="space-x-2">
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t('next')}
              </Button>
              <Button 
              variant="outline"
              size="sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </Button>
            </div>
          </div>
    </div>
)
}