import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  username?: string;
  prefix?: string;
  isLoggedIn: boolean;
  token?:string;
  customerCurrency?:string;
  lng?:string;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
  };
  

  export const sessionOptions:SessionOptions = {
    password: process.env.SESSION_SECRET as string,
    cookieName: "posmini_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };
  