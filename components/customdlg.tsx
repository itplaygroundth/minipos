import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui";
import React, { useState } from 'react';
import { DialogClose } from "./ui/dialog";
type CustomDialogProps = {
    title: string;
    description?: string;
    btnok:string;
    btncancel:string;
}
export const useCustomDialog = ({
    title,
    description,
    btnok,
    btncancel
}: CustomDialogProps): [() => Promise<unknown>, ()=> JSX.Element] => {
    const [promise, setPromise] = useState<{resolve: (value: boolean) => void} | null>(null);

    const confirm = () => new Promise( (resolve, reject) => {
        setPromise({resolve});
    });

    const handleClose = () => {
        setPromise(null);
    }

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    }

    const ConfirmDialogComponent = () => {
        return (
            <>
            <Dialog open={promise !== null }>
            <DialogContent aria-describedby=''>
                    
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    <DialogFooter>
                    {/* <DialogTrigger asChild>
                        
                    </DialogTrigger> */}
                    <Button className='bg-green-400 hover:bg-green-500' onClick={handleConfirm}>{btnok}</Button>
                    <DialogClose asChild>
                    <Button className='bg-orange-400 hover:bg-orang-500' onClick={handleCancel}>{btncancel}</Button>
                    </DialogClose>
                    
                    </DialogFooter>
            </DialogContent>
            </Dialog>
                {/* <Dialog
                    open={promise !== null }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                { title }
                            </DialogTitle>
                            <DialogDescription>
                                { description }
                            </DialogDescription>
                        </DialogHeader>
                        <Button
                            onClick={handleConfirm}
                        >
                            confirm
                        </Button>
                        <Button
                            onClick={handleCancel}
                        >
                            cancel
                        </Button>
                    </DialogContent>
                </Dialog> */}
            </>
        )
    };

    return [confirm, ConfirmDialogComponent];
}