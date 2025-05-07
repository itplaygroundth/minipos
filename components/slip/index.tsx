'use client'
import React, { useState } from 'react';
import {
    DndContext,
    useDraggable,
    useDroppable,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Label } from '../ui';
import { randomInt, randomUUID } from 'crypto';
 

// Define dimensions for each paper size
const paperSizes = {
    A4: { width: '210mm', height: '297mm' },
    A5: { width: '148mm', height: '210mm' },
    slip: { width: '80mm', height: '200mm' },
};
 
const Component = ({ content }: { content: string }) => (
    <div className="p-2">
      <Label className="text-sm font-medium">{content}</Label>
    </div>
  );
interface ComponentData {
    id: number;
    component:typeof Component;
    position: {x: number, y: number};
    area: 'header' | 'body' | 'footer';
    content: string;
}

// const DraggableColumn = ({ column, className }: { column: string; className?: string }) => {
//     const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
//         id: column,
//     });
    
//     return (
//         <div
//             ref={setNodeRef}
//             {...listeners}
//             {...attributes}
//             className={`cursor-move p-2 text-center ${className} ${isDragging ? 'opacity-75 border-dotted border-2 border-blue-500' : ''}`}
//         >
//             {column}
//         </div>
//     );
// };
const DraggableColumn = ({ className, content,id }: { className: string, content: string ,id:string}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { content },
    });
    const CustomStyle = {
    // display: "flex",
    // width: "140px",
    // height: "140px",
    // backgroundColor: "#e8e8a2"
    };
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
    
        <div
            ref={setNodeRef}
             style={style}
            {...listeners}
            {...attributes}
            className={cn("cursor-move p-2 text-pretty text-center", className, `${isDragging ? 'opacity-100 border-dotted border-2 border-blue-500' : ''}`)}
        >
            {content}
        </div>
    );
};

const DraggableArea = ({ area, children, className }: { 
    area: 'header' | 'body' | 'footer', 
    children: React.ReactNode,
    className?: string 
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: area,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                `layout-${area}`,
                isDragging ? 'opacity-75 border-dotted border-2 border-blue-500' : '',
                'p-[10px] border border-gray-300 mb-[10px]',
                className
            )}
        >
            {children}
        </div>
    );
};
const CustomStyle = {
    display: "flex",
    width: "40px",
    height: "40px",
    backgroundColor: "#e8e8a2"
  };
const Draggable = ({ id, content,styles }:{id:number,content:string,styles:React.CSSProperties}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id
    });
  
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
        }
      : {};
  
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, ...CustomStyle,...styles}}
        {...listeners}
        {...attributes}
      >
        {content}
      </div>
    );
  }
  
const SlipEditor = () => {
    const [receiptSize, setReceiptSize] = useState<'A4' | 'A5' | 'slip'>('A4');
    const [layoutComponents, setLayoutComponents] = useState<ComponentData[]>([]);

    const handleReceiptSizeChange = (size: string) => {
        setReceiptSize(size as 'A4' | 'A5' | 'slip');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/public/${size}.css`;
        document.head.appendChild(link);
    };

    const saveLayoutToCSS = () => {
        const cssContent = layoutComponents.map(component => {
            return `.component-${component.id} { /* styles */ }`;
        }).join('\n');

        console.log('CSS Content:', cssContent);
    };
    
    const addComponent = (type: string, active: any, delta: any, area: 'header' | 'body' | 'footer') => {
        
      //  setLayoutComponents({id:active.id,area:area,position:{x:delta.x,y:delta.y}})
        // const note = layoutComponents.find((x) => x.id === Number(active.id));
        // console.log("note:", note);
        
        // if(note) {
        //     const updatedNotes = layoutComponents.map((x) => {
        //         if (x.id === note.id) {
        //             return {
        //                 ...x,
        //                 position: {
        //                     x: x.position.x + delta.x,
        //                     y: x.position.y + delta.y
        //                 }
        //             };
        //         }
        //         return x;
        //     });
            
        //     setLayoutComponents([
        //         ...updatedNotes, 
        //         {
        //             id: Date.now(),
        //             component: type as React.ReactNode,
        //             area,
        //             position: { x: delta.x, y: delta.y }
        //         }
        //     ]);
        // } else {
            // setLayoutComponents([{
            //     id: Date.now(),
            //     component: type as React.ReactNode,
            //     area,
            //     position: { x: delta.x, y: delta.y }
            // }]);
        // }
    };

    const moveComponent = (id: number, active: any, delta: any, newArea: 'header' | 'body' | 'footer') => {
        setLayoutComponents(prevComponents => 
            prevComponents.map(component => {
                if (component.id === active.id) {
                    return {
                        ...component,
                        area: newArea,
                        position: {
                            x: component.position.x + delta.x,
                            y: component.position.y + delta.y
                        }
                    };
                }
                return component;
            })
        );
    };

    const editComponentContent = (id: number, newContent: string) => {
        setLayoutComponents(layoutComponents.map(component =>
            component.id === id ? { ...component, content: newContent } : component
        ));
    };

    const DroppableArea = ({ area }: { area: 'header' | 'body' | 'footer' }) => {
        const { setNodeRef, isOver } = useDroppable({
            id: area,
        });
        const CustomStyle = {
        display: "flex",
        width: "600px",
        height: "600px",
        background: "green"
        };
    
        return (
            <div
                ref={setNodeRef}
                style={CustomStyle}
                className={cn(
                    `layout-${area}`,
                    isOver ? 'bg-blue-50' : '',
                    'w-full h-full overflow-y-auto p-[10px] border border-gray-300'
                )}
            >
                {JSON.stringify(layoutComponents)}
                {layoutComponents.filter(c => c.area === area).map(component => (
                   
                        <Draggable  
                            styles={{
                            position: "absolute",
                            left: `${component.position.x}px`,
                            top: `${component.position.y}px`
                            }}
                            key={component.id}
                            id={component.id}
                            content={component.content}> 
                        {/* <component.component 
                            content={component.content}
                           // onChange={(newContent: string) => editComponentContent(component.id, newContent)}
                        /> */}
                        </Draggable>
                    
                ))}
            </div>
        );
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    return (
        <DndContext sensors={sensors} onDragEnd={(event) => {
            const { active, over, delta } = event;
            if (over) {
               const newArea = over.id as 'header' | 'body' | 'footer';
              
                const component = layoutComponents.find(c => c.id.toString() === active.id);
                
                if (component) {
                    moveComponent(component.id, active, delta, newArea);
                } else {
                    // Add new component based on active.id
                    setLayoutComponents(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            component: Component,
                            position: { x: delta.x, y: delta.y },
                            area: newArea,
                            content: active.id === 'label' ? 'New Label' : 'Input Value'
                        }
                    ]);
                }
            }
        }}>
            <div className="receipt-size-selector">
                <label>Select Receipt Size:</label>
                <select onChange={(e) => handleReceiptSizeChange(e.target.value)} value={receiptSize}>
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="slip">Slip</option>
                </select>
            </div>
            <div className="flex gap-4">
                <div className="bg-muted/50 w-full sm:w-[250px] shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <h3>เลือกรายการ</h3>
                        <div className='w-[120px] bg-blue-300'>
                            <DraggableColumn className='w-[120px]' id="input" content="Input" />
                        </div>
                        <div className='w-[120px] bg-blue-300'>
                            <DraggableColumn className='w-[120px]' id="label" content="Label" />
                        </div>
                        <div className='w-[120px] bg-blue-300'>
                            <DraggableColumn className='w-[120px]' id="table" content="Table" />
                        </div>
                    </div>
                </div>
          
            
            <div 
                style={{ 
                    width: paperSizes[receiptSize].width, 
                    height: paperSizes[receiptSize].height,
                    border: '1px solid black',
                    margin: 'auto'
                }}
                className="flex flex-col gap-4 p-4"
            >
              <DroppableArea  area='body'/>
            </div>
            </div>
            <button onClick={saveLayoutToCSS}>Save Layout</button>
        </DndContext>
    );
};

export default SlipEditor;
