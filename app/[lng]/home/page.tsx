import { GetARList,GetItemList, GetSettings } from '@/actions';
import SaleComponent from '@/components/transactions/sale';


const Page = async () => {
    try {
    const Customers = await GetARList()
    const Items = await GetItemList(0,100)

    if(Customers.Status){
    const response = {
        Status: Customers.Status && Items.Status,
        Message: Customers.Message,
        Data: {
            Items: Items.Data,
            Customers:Customers.Data
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
        return <>Error loading data</>;
    }
    } catch (error) {
        console.error("Error fetching data:", error);
        return <>Error loading data</>;
    }
   
};

export default Page;