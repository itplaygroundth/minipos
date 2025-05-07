import { GetARList, GetCharts} from '@/actions';
import ChartsComponent from '@/components/account/charts';
import { XlsComponent } from '@/components/xls/import';
 
 
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


const Page = async () => {
    const session = await getSession()
    const {role} = session
    try {
    const Customers = await GetARList()
    // const Items = await GetItemList(0,100)
  
    // const docformat = JSON.parse(JSON.parse(session.config).data).docformat
    
     //const  docno = await GetInvoiceNo(session.posid,docformat)
    // const Invoice = await GetInvoiceList(0,100,docformat.substring(0,docformat.indexOf("Y")))
   // const chart = await GetCharts("")
    // console.log(chart)
    // console.log(Invoice.Data)


    if(Customers.Status){
        const response = {
            Status: Customers.Status,
            Message: Customers.Message,
            Data: {
                Role: role,
                Items: [],
                Customers: Customers.Data,
                Setting: session.config || "",
                Docno: "",  // Add default value
                Invoice: [] // Add empty array
            }
        }
        return (
            <XlsComponent  
                xdata={response.Data} 
                message={response.Message} 
                status={response.Status}
            />
        )
    }
    } catch (error) {
        console.error("Error fetching data:", error);
        //return <>Error loading data</>;
        redirect(`/th/login`)
    }
   
};

export default Page;