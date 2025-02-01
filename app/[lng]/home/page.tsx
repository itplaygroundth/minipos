import { GetARList,GetInvoiceList,GetInvoiceNo,GetItemList } from '@/actions';
import SaleComponent from '@/components/transactions/sale';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


const Page = async () => {
    const session = await getSession()
    const {role} = session
    try {
    const Customers = await GetARList()
    const Items = await GetItemList(0,100)
  
    const docformat = JSON.parse(JSON.parse(session.config).data).docformat
    
    const  docno = await GetInvoiceNo(session.posid,docformat)
    const Invoice = await GetInvoiceList(0,100,docformat.substring(0,docformat.indexOf("Y")))
 
    
    // console.log(Invoice.Data)


    if(Customers.Status && Items.Status && Invoice.Status){
        const response = {
            Status: Customers.Status && Items.Status,
            Message: Customers.Message,
            Data: {
                Role:role,
                Items: Items.Data,
                Customers:Customers.Data,
                Setting: session.config || "",
                Docno: docno.Data,
                Invoice: Invoice.Data
            }
        }
        return (
            <SaleComponent 
      
            data={response.Data} 
            message={response.Message} 
            status={response.Status}
            />
        );
        } else {
            redirect(`/th/login`)
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        //return <>Error loading data</>;
        redirect(`/th/login`)
    }
   
};

export default Page;