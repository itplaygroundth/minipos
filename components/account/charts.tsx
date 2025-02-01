"use client"
import React, { useState, useEffect } from 'react'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
 
 
 
import { languages } from '@/app/i18n/setting'
import { usePathname } from 'next/navigation';
 
import { Separator } from '@radix-ui/react-separator';
 
 
import {BCCharts} from "@/types"
import TimeLabel from '../timelabel'
import Autocomplete from '../ui/autocomplete'
 
import { TreeView } from '../ui/extension/tree-view'
 

interface SubItem {
    id: string;
    isSelectable: boolean;
    name: string;
    children?: SubItem[];
}

 

interface ChartProps {
    data: {
        Items: BCCharts[];
        // Customers: BCAr[];
        // Setting:string;
        // Docno:string;
        // Invoice:any[];
        Role:string;
    }
    message: string;
    status: boolean;
}
 


 
    
 

const ChartsComponent:React.FC<ChartProps> = ({ data, message, status }) => {
   
    const [searchArTerm, setSearchArTerm] = useState('');
  
    const [parent, setParent] = useState<string | null>(null);
    const [chartcode, setChartCode] = useState<string>("");

  
    const pathname = usePathname()
    const lang = pathname?.split('/')[1] || languages[0]
 
    const [isLoading,setIsLoading] = useState(false)
     
 
 
 
    const filteredDataItem:BCCharts[] = data?.Items.filter(item => 
        (item?.name1?.toLowerCase().includes(searchArTerm?.toLowerCase()) || 
        (item?.name2?.toLowerCase().includes(searchArTerm?.toLowerCase()) ||
        item?.code?.toLowerCase().includes(searchArTerm?.toLowerCase())) &&
        (/\d/.test(searchArTerm) || /^[a-zA-Z\u0E00-\u0E7F]*$/.test(searchArTerm))
    ))
   

   // const elements = data.Items.map((item)=>item.isheader==1 && {id:item.code,isSelectable:true,name:item.name1,children:[{id:item.code,isSelectable:true,name:item.name1}]})

   const organizeData = (data:BCCharts[])=> {
    const result:SubItem[] = [];

    // สร้าง root nodes
    const headers = data.filter(item => item.isheader === 1);
    headers.forEach(header => {
        const children = data.filter(item => item.code.startsWith(header.code) && item.isheader === 0);
        result.push({
            id: header.code,
            isSelectable: true,
            name: `${header.code}::${header.name1}`,
            children: children.map(child => ({
                id: child.code,
                isSelectable: true,
                name: `${child.code}::${child.name1}`,
            })),
        });
    });

    return result;
}

const elements = organizeData(data.Items);
//console.log(JSON.stringify(elements, null, 2));


   // console.log(elements)
    // const elementsx = [
    //     {
    //       id: "1",
    //       isSelectable: true,
    //       name: "src",
    //       children: [
    //         {
    //           id: "2",
    //           isSelectable: true,
    //           name: "app.tsx",
    //         },
    //         {
    //           id: "3",
    //           isSelectable: true,
    //           name: "components",
    //           children: [
    //             {
    //               id: "20",
    //               isSelectable: true,
    //               name: "pages",
    //               children: [
    //                 {
    //                   id: "21",
    //                   isSelectable: true,
    //                   name: "interface.ts",
    //                 },
    //               ],
    //             },
    //           ],
    //         },
    //         {
    //           id: "6",
    //           isSelectable: true,
    //           name: "ui",
    //           children: [
    //             {
    //               id: "7",
    //               isSelectable: true,
    //               name: "carousel.tsx",
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ];
    const handleKeyDown = (event: KeyboardEvent) => {
 
        if (event.key === "Escape") {
        } else if (event.key === "Enter") {
            
        } else if(event.key == "F7") {
 
        } else if(event.key == "F5") {
           
        } else if(event.key == "F4") {
            
        }
    };
    useEffect(() => {
        // เพิ่ม event listener สำหรับการกดปุ่ม
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            // ลบ event listener เมื่อ component ถูก unmount
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
 
 
    return isLoading?( 
        <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[90vh] max-w-desktop rounded-lg border  overflow-auto"
      >
        <ResizablePanel className="md:min-w-[300px]" defaultSize={25}>
          <div className="flex h-full  justify-center p-6 ">
          <div className="flex flex-1 flex-col gap-4 p-4">
          <TimeLabel classname="" lang={lang} />
          <Autocomplete
                value={chartcode}
                onChange={setChartCode}
                allSuggestions={filteredDataItem.map((item) => ({ name: item?.name1, code: item?.code }))}
                classname="w-[270px]"
          />
          
          </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
        </ResizablePanelGroup>   
    ):(
    
        <div className="flex flex-1 flex-col  gap-4 p-4 ">
            <div className="flex justify-start h-[90vh] gap-4 max-w-desktop overflow-auto ">
                <div className="bg-muted/50 w-full sm:w-[400px] shadow  backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <TimeLabel lang={lang}  classname="w-[320px]" />
                        <Separator orientation='horizontal' />
                        <Autocomplete
                                value={chartcode}
                                onChange={setChartCode}
                                allSuggestions={filteredDataItem.map((item) => ({ name: item?.name1, code: item?.code }))}
                               classname="w-[400px]"
                            />
                       
                        <Separator orientation='horizontal' />
                        
                       {/* <TreeView
                         className="rounded-md h-[70vh] bg-background overflow-hidden"
                        elements={elements}
                        initialSelectedId={elements.length.toString()}
                        initialExpendedItems={["1","2"]}
                        indicator={true}
                        />*/}
                     
                    </div>
                </div>
               
                        
                        <span>Drop here</span>
                  
            </div>
      </div>
      
    );
};

export default ChartsComponent;