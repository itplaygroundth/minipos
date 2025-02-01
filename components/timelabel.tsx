import React, { useEffect, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz'; // ถ้าใช้ฟังก์ชันนี้ในการจัดการโซนเวลา
 // ตัวอย่างการใช้ i18next สำหรับการแปล
import { Label } from './ui';
import { useTranslation } from '@/app/i18n/client';
import { cn } from '@/lib/utils';

const TimeLabel = ({lang,classname=""}:{lang:string,classname:string}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const {t} = useTranslation(lang,"common","transaction")
    useEffect(() => {
        // ฟังก์ชันเพื่ออัปเดตเวลา
        const interval = setInterval(() => {
            setCurrentDate(new Date()); // อัปเดต state ทุกวินาที
        }, 1000); // 1 วินาที

        // เคลียร์ interval เมื่อคอมโพเนนต์ถูก unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <Label className={cn(classname,'bg-gray-300 h-[20px] text-center')} style={{ lineHeight: '20px' }}>
            {`${t('transaction.time')} : ${formatInTimeZone(currentDate, 'Asia/Bangkok', 'dd-MM-yyyy HH:mm')}`}
        </Label>
    );
};

export default TimeLabel;