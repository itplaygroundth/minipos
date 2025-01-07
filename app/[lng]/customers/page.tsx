import { GetAPList } from '@/actions';
import APListComponent from '@/components/transactions/aplist';
 


const Page = async () => {
    const modelList = await GetAPList()
   // console.log(modelList)
    return (
        <APListComponent  
        data={modelList.Data} 
        message={modelList.Message} 
        status={modelList.Status}  />
    );
};

export default Page;