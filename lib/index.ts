import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  posid?:string;
  username?: string;
  prefix?: string;
  role:string;
  isLoggedIn: boolean;
  token?:string;
  customerCurrency?:string;
  lng?:string;
  config?:string;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
    role:"user"
  };
  

  export const sessionOptions:SessionOptions = {
    password: process.env.SESSION_SECRET as string,
    cookieName: "posmini_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };
  