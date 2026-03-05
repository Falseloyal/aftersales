import { supabase } from './supabase';
import { Customer, Staff, ServiceRecord, Feedback } from '../types';

// Helper to handle Supabase responses
const handleResponse = <T>(data: T | null, error: any): T => {
    if (error) {
        console.error('Supabase Error:', error);
        throw new Error(error.message);
    }
    return data as T;
};

// Customer CRUD
export const customerService = {
    async getAll(): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        // Convert snake_case to camelCase
        return handleResponse(data, error)?.map((item: any) => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email,
            company: item.company,
            address: item.address,
            createdAt: item.created_at
        })) || [];
    },

    async getById(id: string): Promise<Customer | undefined> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code === 'PGRST116') return undefined; // Not found
        const item: any = handleResponse(data, error);
        if (!item) return undefined;

        return {
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email,
            company: item.company,
            address: item.address,
            createdAt: item.created_at
        };
    },

    async create(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        const { data, error } = await supabase
            .from('customers')
            .insert([{
                name: customerData.name,
                phone: customerData.phone,
                email: customerData.email,
                company: customerData.company,
                address: customerData.address
            }])
            .select()
            .single();

        const item: any = handleResponse(data, error);
        return {
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email,
            company: item.company,
            address: item.address,
            createdAt: item.created_at
        };
    },

    async update(id: string, updateData: Partial<Customer>): Promise<Customer | undefined> {
        const dbData: any = {};
        if (updateData.name !== undefined) dbData.name = updateData.name;
        if (updateData.phone !== undefined) dbData.phone = updateData.phone;
        if (updateData.email !== undefined) dbData.email = updateData.email;
        if (updateData.company !== undefined) dbData.company = updateData.company;
        if (updateData.address !== undefined) dbData.address = updateData.address;

        const { data, error } = await supabase
            .from('customers')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        const item: any = handleResponse(data, error);
        if (!item) return undefined;

        return {
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email,
            company: item.company,
            address: item.address,
            createdAt: item.created_at
        };
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error', error);
            return false;
        }
        return true;
    },
};

// Staff CRUD
export const staffService = {
    async getAll(): Promise<Staff[]> {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('created_at', { ascending: false });

        return handleResponse(data, error)?.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            department: item.department,
            role: item.role,
            status: item.status,
            createdAt: item.created_at
        })) || [];
    },

    async getById(id: string): Promise<Staff | undefined> {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code === 'PGRST116') return undefined;
        const item: any = handleResponse(data, error);
        if (!item) return undefined;
        return {
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            department: item.department,
            role: item.role,
            status: item.status,
            createdAt: item.created_at
        };
    },

    async create(staffData: Omit<Staff, 'id' | 'createdAt'>): Promise<Staff> {
        // Warning: This simplistic approach uses the standard signUp which might sign the current admin out
        // In a true secure app, you'd use the Supabase Admin API on a backend to create users.
        // For this demo, we use signUp, but recommend the user handles auth correctly.

        // 1. Create the Auth User with a default password
        const defaultPassword = 'yc123456!';
        const staffEmail = staffData.email;

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: staffEmail,
            password: defaultPassword,
        });

        if (authError) {
            console.error('Failed to create Auth user', authError);
            throw new Error('授权账号创建失败: ' + authError.message);
        }

        const userId = authData?.user?.id;

        // 2. Create the Staff Database Record
        const { data, error } = await supabase
            .from('staff')
            .insert([{
                user_id: userId, // Link the auth user
                name: staffData.name,
                email: staffData.email,
                phone: staffData.phone,
                department: staffData.department,
                role: staffData.role === 'admin' ? 'admin' : 'staff', // force safety
                status: staffData.status
            }])
            .select()
            .single();

        const item: any = handleResponse(data, error);
        return {
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            department: item.department,
            role: item.role,
            status: item.status,
            createdAt: item.created_at
        };
    },

    async update(id: string, updateData: Partial<Staff>): Promise<Staff | undefined> {
        const { data, error } = await supabase
            .from('staff')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        const item: any = handleResponse(data, error);
        if (!item) return undefined;
        return {
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            department: item.department,
            role: item.role,
            status: item.status,
            createdAt: item.created_at
        };
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);
        if (error) return false;
        return true;
    },
};

// Service Record CRUD
export const serviceRecordService = {
    async getAll(): Promise<ServiceRecord[]> {
        const { data, error } = await supabase
            .from('service_records')
            .select('*')
            .order('created_at', { ascending: false });

        return handleResponse(data, error)?.map((item: any) => ({
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            staffId: item.staff_id,
            staffName: item.staff_name,
            type: item.type,
            status: item.status,
            priority: item.priority,
            title: item.title,
            description: item.description,
            solution: item.solution,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        })) || [];
    },

    async getById(id: string): Promise<ServiceRecord | undefined> {
        const { data, error } = await supabase
            .from('service_records')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code === 'PGRST116') return undefined;
        const item: any = handleResponse(data, error);
        if (!item) return undefined;
        return {
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            staffId: item.staff_id,
            staffName: item.staff_name,
            type: item.type,
            status: item.status,
            priority: item.priority,
            title: item.title,
            description: item.description,
            solution: item.solution,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        };
    },

    async create(recordData: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceRecord> {
        const { data, error } = await supabase
            .from('service_records')
            .insert([{
                customer_id: recordData.customerId,
                customer_name: recordData.customerName,
                staff_id: recordData.staffId,
                staff_name: recordData.staffName,
                type: recordData.type,
                status: recordData.status,
                priority: recordData.priority,
                title: recordData.title,
                description: recordData.description,
                solution: recordData.solution
            }])
            .select()
            .single();

        const item: any = handleResponse(data, error);
        return {
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            staffId: item.staff_id,
            staffName: item.staff_name,
            type: item.type,
            status: item.status,
            priority: item.priority,
            title: item.title,
            description: item.description,
            solution: item.solution,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        };
    },

    async update(id: string, updateData: Partial<ServiceRecord>): Promise<ServiceRecord | undefined> {
        const dbData: any = {
            updated_at: new Date().toISOString()
        };

        // Map camelCase to snake_case for Supabase
        if (updateData.customerId !== undefined) dbData.customer_id = updateData.customerId;
        if (updateData.customerName !== undefined) dbData.customer_name = updateData.customerName;
        if (updateData.staffId !== undefined) dbData.staff_id = updateData.staffId;
        if (updateData.staffName !== undefined) dbData.staff_name = updateData.staffName;
        if (updateData.type !== undefined) dbData.type = updateData.type;
        if (updateData.status !== undefined) dbData.status = updateData.status;
        if (updateData.priority !== undefined) dbData.priority = updateData.priority;
        if (updateData.title !== undefined) dbData.title = updateData.title;
        if (updateData.description !== undefined) dbData.description = updateData.description;
        if (updateData.solution !== undefined) dbData.solution = updateData.solution;

        const { data, error } = await supabase
            .from('service_records')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        const item: any = handleResponse(data, error);
        if (!item) return undefined;
        return {
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            staffId: item.staff_id,
            staffName: item.staff_name,
            type: item.type,
            status: item.status,
            priority: item.priority,
            title: item.title,
            description: item.description,
            solution: item.solution,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        };
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('service_records')
            .delete()
            .eq('id', id);
        if (error) return false;
        return true;
    },
};

// Feedback CRUD
export const feedbackService = {
    async getAll(): Promise<Feedback[]> {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        return handleResponse(data, error)?.map((item: any) => ({
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            serviceRecordId: item.service_record_id,
            rating: item.rating,
            content: item.content,
            category: item.category,
            createdAt: item.created_at
        })) || [];
    },

    async getById(id: string): Promise<Feedback | undefined> {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code === 'PGRST116') return undefined;
        const item: any = handleResponse(data, error);
        if (!item) return undefined;
        return {
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            serviceRecordId: item.service_record_id,
            rating: item.rating,
            content: item.content,
            category: item.category,
            createdAt: item.created_at
        };
    },

    async create(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
        const { data, error } = await supabase
            .from('feedback')
            .insert([{
                customer_id: feedbackData.customerId,
                customer_name: feedbackData.customerName,
                service_record_id: feedbackData.serviceRecordId,
                rating: feedbackData.rating,
                content: feedbackData.content,
                category: feedbackData.category
            }])
            .select()
            .single();

        const item: any = handleResponse(data, error);
        return {
            id: item.id,
            customerId: item.customer_id,
            customerName: item.customer_name,
            serviceRecordId: item.service_record_id,
            rating: item.rating,
            content: item.content,
            category: item.category,
            createdAt: item.created_at
        };
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('feedback')
            .delete()
            .eq('id', id);
        if (error) return false;
        return true;
    },
};
