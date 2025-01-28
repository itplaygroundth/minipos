import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function convP2DC(percentageStr:string) {
  // ลบเครื่องหมาย % ออก
  if(percentageStr.includes('%'))
    percentageStr = percentageStr.replace('%', '');
 


  // แปลงสตริงเป็นตัวเลข
  const percentage = parseFloat(percentageStr);

  // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่
  if (isNaN(percentage)) {
      throw new Error('Invalid percentage format');
  }

  // คำนวณค่าทศนิยม
  const decimal = 1 + (percentage / 100);

  return decimal;
}