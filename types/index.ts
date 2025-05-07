import { ColumnDef } from "@tanstack/react-table"

export interface Authen {
    username:string
    password:string
    prefix:string
    dbname:string
    server:string
    posid:string;
}

export interface iSetting {
    machinenumber:string;
    taxno:string
    address:string
    location:string
    data:string
    baseCurrency:string
    targetCurrency:string
    price:string
    whcode:string
    shelfcode:string
    taxrate:string
}

export interface Invoice {
    docdate:string;
    docno:string;
    taxno:string;
    itemcode:string;
    itemname: string;
    whcode:string;
    shelfcode:string;
    qty: number;
    price:number;
    total:number;
    unitcode:string;
    nettotal:number;
}

export interface Items {
    rowNumber:number;
    code:string;
    name: string;
    whcode:string;
    shelfcode:string;
    quantity: number;
    price:number;
    total:number;
    unit:string;
    unitcode:string;
}
export interface BCAr {
   // rowNumber:number;
    code:string;
    name: string;
    address:string;
    pricelevel:string;
   
}
export interface BCCharts {
    // rowNumber:number;
     code:  string;
     name1: string;
     name2: string;
     isheader:number;
    
 }
export interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[]
    data: TData[]
  }

export interface XLSProps {
    xdata: {
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
export interface SaleProps {
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