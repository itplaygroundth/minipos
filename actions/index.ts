 'use server'
 import { getSession } from "@/lib/session";
import { Authen } from "@/types";
import { redirect } from 'next/navigation'
  const port = ":4002"
  const localendpoint = "http://192.168.1.186:3000/"


    
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
          session.prefix = Prefix
          session.customerCurrency= Currency
          session.lng = "en"
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}:4006/api/v2/db/exchange/rate`,{method:'POST',
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
  // export const GetUnitcode = async () =>{
  
  //   //console.log(body)
  //   const session = await getSession();
  //   const response = await fetch(`${localendpoint}api/v1/settings/unitcode`, { method: 'POST',
  //     headers: {   
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' +  session.token
  //       },
  //       body: JSON.stringify({"table":"BCItemUnit"})
  //     })
  //     return response.json()
  // }
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