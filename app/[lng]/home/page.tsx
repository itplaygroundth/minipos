import { GetARList,GetInvoiceList,GetInvoiceNo,GetItemList } from '@/actions';
import { SettingForm } from '@/components/settings/setting-form';
import SaleComponent from '@/components/transactions/sale';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


const Page = async () => {
    const session = await getSession()
    const {role,config,dbname,posid} = session
    try {
    const Customers = await GetARList()
    const Items = await GetItemList(0,100)
  
 
    const {data} = JSON.parse(config)
    
   
    let docformat = "DOYYMM-####"
   

   
    // if(!data) {
    //     redirect(`/th/login`)
        
    // } else 
    if(data) {

        docformat = JSON.parse(data).docformat
        if(!docformat)
        docformat = "DOYYMM-####"        
    }   
    else
    {
        // form.setValue("price",obj?.price.toString())
        // form.setValue("whcode",obj?.whcode.toString())
        // form.setValue("shelfcode",obj?.shelfcode.toString())
        const conf = {customer:"AR-0001",
            data:JSON.stringify({price:"price1",whcode:"01",shelfcode:"01"}),posId:posid || dbname,location:""}
        return (
            <Dialog open={true} >
          
            <DialogContent className="[&>button:last-child]:hidden"> 
            <DialogTitle>กรุณาค่าเริ่มต้นก่อน</DialogTitle>
            <SettingForm config={conf}/>
            </DialogContent>
            </Dialog>
        )
       // redirect(`/th/settings/startup`)
       
    }
    
    
    const  docno = await GetInvoiceNo(session.posid || "",docformat)
    const Invoice = await GetInvoiceList(0,100,docformat.substring(0,docformat.indexOf("Y")))
 
    //console.log(docno,Invoice)
    //console.log(Invoice.Data)
    //console.log(JSON.stringify(session))

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