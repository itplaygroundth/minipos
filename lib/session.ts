'use server'
import { IronSession,getIronSession } from "iron-session";

import { SessionData,sessionOptions,defaultSession } from ".";
import { cookies } from "next/headers";

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
  // return {
  //   isLoggedIn: session.isLoggedIn,
  //   token: session.token || null,
  //   username: session.username || null,
  //   userId: session.userId || null,
  //   prefix: session.prefix || null,
  //   customerCurrency: session.customerCurrency || null,
  //   lng: session.lng || "en", // กำหนดค่าเริ่มต้น
  // };
}

 
 