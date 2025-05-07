import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { toast } from '@/hooks/use-toast';
import { Button, Input } from '../ui';

const registrationSchema = z.object({
    dbname: z.string().min(1, "Database name is required"),
    remarkname: z.string().min(1, "Remark name is required"),
    user: z.string().min(1, "User is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RegistrationForm: React.FC = () => {
    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
    });

    const onSubmit = (data: RegistrationFormData) => {
        // Handle form submission
        console.log(data);
        toast({
            title: "Registration Successful",
            description: "Your account has been created.",
            variant: "default",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="dbname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Database Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter database name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="remarkname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Remark Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter remark name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter user name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} placeholder="Enter password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Register</Button>
            </form>
        </Form>
    );
};

export default RegistrationForm; 