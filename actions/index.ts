 'use server'
 import { getSession } from "@/lib/session";
import { Authen } from "@/types";
import { redirect } from 'next/navigation'
  const port = ":4002"
  const localendpoint = "http://192.168.1.133:3000/"
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
 
    //const session = await getSession();
    //const plainSession = JSON.parse(JSON.stringify(session));

     // const state = useAuthStore()
  
      const response = await fetch(`${localendpoint}api/v1/ap/list`, { method: 'GET',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          //'Authorization': 'Bearer ' +  token
          },
         // body: JSON.stringify({"username":body.username,password:body.password,prefix:body.prefix})
        })
        return response.json();
         
         
       
 }

  export async function Logout(lang:string) {
    const session = await getSession();
    session.destroy();
    if (!session.isLoggedIn) {
        redirect(`/${lang}/login`);
      }
  }