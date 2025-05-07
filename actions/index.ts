'use server'
import { getSession } from "@/lib/session";
import { Authen } from "@/types";
import axios from "axios";
import { redirect } from 'next/navigation'
const port = ":4002"
const localendpoint = "http://192.168.1.186:8030/"


    
export const Login = async (body:Authen) =>{
        
    const session = await getSession();
    //const plainSession = JSON.parse(JSON.stringify(session));
 
     // const state = useAuthStore()
  
      const response = await fetch(`${localendpoint}api/v1/authen/login`, { method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          //'Authorization': 'Bearer ' +  token
          },
          body: JSON.stringify({"username":body.username,"password":body.password,"dbname":body.dbname,"prefix":body.prefix,"server":"BLACKNITRO"})
        })
        const result = await response.json();
         
       

        if(result.Status){
          const {Username,ID,Prefix,Currency,Role} = result.Data
          session.isLoggedIn = true;
          session.token = result.Token;
          session.username = Username;
          session.userId = ID
          session.role = Role;
          session.posid = body.posid
          session.dbname = body.dbname
          session.prefix = Prefix
          session.customerCurrency= Currency
          session.lng = "en"

          const config = await GetConfig(result.Token,body.posid || body.dbname)
        
          if(config.Status){
           
          session.config =  JSON.stringify(config.Data)
          }
          await session.save();
        }
        return result
        //return response.json()
}
export const Signin = async (body:Authen) =>{
        
    const session = await getSession();
    //const plainSession = JSON.parse(JSON.stringify(session));

     // const state = useAuthStore()
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}${port}/api/v2/users/login`, { method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          //'Authorization': 'Bearer ' +  token
          },
          body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
        })
        const result = await response.json();
         
        const {Username,ID,Prefix,Currency} = result.Data

        if(result.Status){
         
         // const setting = await GetSettings(body.posid)



          session.isLoggedIn = true;
          session.token = result.Token;
          session.username = Username;
          session.userId = ID
          session.prefix = Prefix
          session.customerCurrency= Currency
          session.lng = "en"
          await session.save();
        }
        return result
        //return response.json()
}
export async function  GetAPList(){
 
    const session = await getSession();
    //const plainSession = JSON.parse(JSON.stringify(session));

     // const state = useAuthStore()
  
      const response = await fetch(`${localendpoint}api/v1/ap/list`, { method: 'GET',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' +  session.token
          },
         // body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
        })
        return response.json();
         
         
       
}
export async function  GetInvoiceList(offset:number,pagesize:number,docno:string){
 
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

  // const state = useAuthStore()

  const response = await fetch(`${localendpoint}api/v1/invoice/list?offset=${offset}&pagesize=${pagesize}`, { method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
       body: JSON.stringify({"docno":docno})
      })
      return response.json();
}
export async function  GetInvoiceNo(posid:string,docformat:string){
 
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

  // const state = useAuthStore()

  const response = await fetch(`${localendpoint}api/v1/invoice/docno`, { method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
        body: JSON.stringify({"posid":posid,"docformat":docformat})
      })
      return response.json();
       
       
     
}
export async function  GetDocNo(docno:string){
 
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

  // const state = useAuthStore()

  const response = await fetch(`${localendpoint}api/v1/invoice/bydocno`, { method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
        body: JSON.stringify({"docno":docno})
      })
      return response.json();
       
       
     
}
export async function DeleteInv(docno:string){
  
  //console.log(body)
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

  // const state = useAuthStore()

  const response = await fetch(`${localendpoint}api/v1/invoice/docno`, { method: 'DELETE',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
        body: JSON.stringify({"docno":docno})
      })
      return response.json();
       
}
export async function  AddInvoice(data:any){
 
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

  // const state = useAuthStore()

  const response = await fetch(`${localendpoint}api/v1/invoice/add`, { method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
        body: JSON.stringify(data)
      })
      return response.json();
       
       
     
}
export async function  GetItemList(offset:number,pagesize:number){
 
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

  // const state = useAuthStore()

  const response = await fetch(`${localendpoint}api/v1/item/list?offset=${offset}&pagesize=${pagesize}`, { method: 'GET',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
       // body: JSON.stringify({"saleprice":saleprice})
      })
      return response.json();
       
       
     
}
 export async function  GetARList(){
 
  const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

   // const state = useAuthStore()
 
   try {
    const response = await fetch(`${localendpoint}api/v1/ar/list`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
      },
      // body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
    });
    return response.json();
  } catch (error) {
    return {Status:false,Message:"ตรวจสอบการเชื่อมต่อฐานข้อมูล!"}
  } 
}

export async function  GetDBList(){
 
  //const session = await getSession();
  //const plainSession = JSON.parse(JSON.stringify(session));

   // const state = useAuthStore()
 
   try {
    const response = await fetch(`${localendpoint}api/v1/dblist`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
       // 'Authorization': 'Bearer ' +  session.token
      },
      // body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
    });
    return response.json();
  } catch (error) {
    return {Status:false,Message:"ตรวจสอบการเชื่อมต่อฐานข้อมูล!"}
  } 
}

export async function SignOutTh() {
  const session = await getSession();
  
   
    // const response = await fetch(`${localendpoint}api/v1/authen/logout`, { method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer ' +  session.token
    //   },
    //   // body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
    // });
    // const result = await response.json()
    // if(result.Status) {
    session.destroy();
    if (!session.isLoggedIn) {
        redirect(`/th/login`);
      }
  //  }
    //return response.json();

 
}
export async function Logout(lang:string) {
    const session = await getSession();
    
     
      // const response = await fetch(`${localendpoint}api/v1/authen/logout`, { method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer ' +  session.token
      //   },
      //   // body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
      // });
      // const result = await response.json()
      // if(result.Status) {
      session.destroy();
      if (!session.isLoggedIn) {
          redirect(`/${lang}/login`);
        }
    //  }
      //return response.json();
 
   
}
export const GetExchangeRate = async (currency:string) =>{
    try{
   //   `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/v1/invoice/upload`
    const response = await fetch(`${"http://152.42.185.164"}:4006/api/v2/db/exchange/rate`,{method:'POST',
    headers:{
      'Accept':'application/json',
      'Content-Type':'application/json'
    },
    body:JSON.stringify({"currency":currency})
  })
    return response.json()
  }catch(error){
    console.log(error)
    return error
  }
}
export const GetConfig = async (token:string,posid:string) =>{
  
    //console.log(body)
    const session = await getSession();
    const response = await fetch(`${localendpoint}api/v1/settings`, { method: 'POST',
      headers: {   
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  token
        },
        body: JSON.stringify({"posid":posid})
      })
      return response.json()
}
export const GetSettings = async (posid:string) =>{
  
    //console.log(body)
    const session = await getSession();
    const response = await fetch(`${localendpoint}api/v1/settings`, { method: 'POST',
      headers: {   
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
        body: JSON.stringify({"posid":posid})
      })
      return response.json()
}
export const GetCodeName = async (table:string) =>{
  
    //console.log(body)
    const session = await getSession();
    const response = await fetch(`${localendpoint}api/v1/settings/unitcode`, { method: 'POST',
      headers: {   
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  session.token
        },
        body: JSON.stringify({"table":table})
      })
      return response.json()
}
export const UpdateSettings = async (body:any) =>{
  
  //console.log(body)
  const session = await getSession();
  const response = await fetch(`${localendpoint}api/v1/settings/update`, { method: 'POST',
    headers: {   
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' +  session.token
      },
      body: JSON.stringify(body)
    })
    return response.json()
}
export const GetCharts = async (body:any) =>{
  const session = await getSession();
  const response = await fetch(`${localendpoint}api/v1/account/getchart`, { method: 'POST',
    headers: {   
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' +  session.token
      },
      body: JSON.stringify({"code":""})
    })
    return response.json()
}
export async function  ImportInvoice(){
 
  const session = await getSession();
  //const formData = new FormData();
  
  //formData.append("xls", file);

  const response = await fetch(`${localendpoint}api/v1/upload`, {method:'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' +  session.token
        },
       // body:formData
    }) 
     return response.json()
}

export async function  ImportInv(file: File){
 
  try {
  const session = await getSession();
  const formData = new FormData();
  
  formData.append("file", file,file.name);

  
    const response = await axios.post(`${localendpoint}api/v1/upload`, formData, {
        headers: {
            'Accept': 'application/json',
            // 'Content-Type': 'multipart/form-data' // ลบออกเพราะ axios จะตั้งค่าให้เอง
            'Authorization': 'Bearer ' + session.token
        }
    });
    return response.data;
} catch (error) {
    console.error("Error importing invoice:", error);
    throw error; // หรือจัดการข้อผิดพลาดตามที่คุณต้องการ
}
}
export async function ImportXls(isitem:boolean,file:File){
//export async function ImportXls(isitem:boolean,file:File){
   
//console.log(file)
  // if (!files || files.length === 0) {
  //   throw new Error("ไฟล์ไม่ได้รับเลือก");
  // }

  // const file = files[0];
  // if (file.type !== 'application/vnd.ms-excel' && file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
  //   throw new Error("ไฟล์ที่เลือกไม่ใช่ไฟล์ .xls หรือ .xlsx");
  // }
  
  const session = await getSession();
  const formData = new FormData();
 
  formData.append("xls", file);
  formData.append('isitem', isitem.toString());
  
 
  const response = await fetch(`${localendpoint}api/v1/upload`, { method: 'POST',
    headers: {   
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' +  session.token
      },
      body: formData
    })
    console.log(response)
   return response.json()

  // const response = await fetch(`${localendpoint}api/v1/invoice/importxls`, { method: 'POST',
  //   headers: {
  //    'Accept': 'application/json',
  //    'Content-Type': 'multipart/form-data',
  //   'Authorization': 'Bearer ' +  session.token
  //   },
  //   body: formData
  // })
  // return response.json();
  //return {Status:true,Message:"Success"}
}
