import { NextResponse, NextRequest } from "next/server";

import { getSession } from "./lib/session";
import { fallbackLng, languages,cookieName } from "./app/i18n/setting";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const cookies = req.cookies; 
  console.log("line 9 ",url.pathname)
  
  // ดึงค่า cookies
  let lng = cookies.get('i18next')?.value || url.pathname.split('/')[1] || fallbackLng; // ใช้ค่า locale จาก cookie หรือจาก URL
  //console.log("middleware string:",lng.toString())
  //const posid = cookies.get('posid')
  //console.log("hello:",posid)
  // const posid = cookies.get('posid')
  
  //   if (!posid && req.nextUrl.pathname !== `/${lng}/login`) {
  //     return NextResponse.redirect(new URL(`/${lng}/login`, req.url));
  //   }
  
  const supportedLanguages = ['en', 'th'];
 
  if (!supportedLanguages.includes(lng.toString())) {
    lng = fallbackLng;
  }

  const session = await getSession();
  lng = req.cookies.get('NEXT_LOCALE')?.value || fallbackLng;
  const isLoggedIn = session.isLoggedIn !== null && session.isLoggedIn;
 


  if (!isLoggedIn && ![`/${lng}/login`, `/${lng}/register`].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(`/${lng}/login`, req.url));
  }
  
  if (url.pathname === '/') {
    if(isLoggedIn){
      return NextResponse.redirect(new URL(`/${lng}/home`, req.url));
    }else{
      return NextResponse.redirect(new URL(`/${lng}/login`, req.url));
    }
  }
 

  // ตรวจสอบเส้นทางเมื่อเข้าหน้าแรกของภาษานั้นๆ
  if (url.pathname === `/${lng}` || url.pathname === `/${lng}/` ) {
   
    //const isLoggedIn = session.isLoggedIn !== null && session.isLoggedIn;
    const redirectPath = isLoggedIn ? `/${lng}/home` : `/${lng}/login`;
    // console.log(isLoggedIn)
    // console.log(lng)
  

    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

 
  // จัดการกับ referer
  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer')!);
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (lngInReferer) {
      response.cookies.set(cookieName, lngInReferer);
    }
    return response;
  }

  return NextResponse.next();
}

 
export const config = {
  matcher: [
    '/:lng((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
};
