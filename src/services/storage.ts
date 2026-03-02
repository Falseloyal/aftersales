import { Customer, Staff, ServiceRecord, Feedback } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'aftersales_customers',
  STAFF: 'aftersales_staff',
  SERVICE_RECORDS: 'aftersales_service_records',
  FEEDBACK: 'aftersales_feedback',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getList<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveList<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

// Customer CRUD
export const customerService = {
  getAll(): Customer[] {
    return getList<Customer>(STORAGE_KEYS.CUSTOMERS);
  },
  getById(id: string): Customer | undefined {
    return this.getAll().find((c) => c.id === id);
  },
  create(data: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const list = this.getAll();
    const customer: Customer = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(customer);
    saveList(STORAGE_KEYS.CUSTOMERS, list);
    return customer;
  },
  update(id: string, data: Partial<Customer>): Customer | undefined {
    const list = this.getAll();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    list[index] = { ...list[index], ...data };
    saveList(STORAGE_KEYS.CUSTOMERS, list);
    return list[index];
  },
  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    saveList(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  },
};

// Staff CRUD
export const staffService = {
  getAll(): Staff[] {
    return getList<Staff>(STORAGE_KEYS.STAFF);
  },
  getById(id: string): Staff | undefined {
    return this.getAll().find((s) => s.id === id);
  },
  create(data: Omit<Staff, 'id' | 'createdAt'>): Staff {
    const list = this.getAll();
    const staff: Staff = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(staff);
    saveList(STORAGE_KEYS.STAFF, list);
    return staff;
  },
  update(id: string, data: Partial<Staff>): Staff | undefined {
    const list = this.getAll();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    list[index] = { ...list[index], ...data };
    saveList(STORAGE_KEYS.STAFF, list);
    return list[index];
  },
  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length === list.length) return false;
    saveList(STORAGE_KEYS.STAFF, filtered);
    return true;
  },
};

// Service Record CRUD
export const serviceRecordService = {
  getAll(): ServiceRecord[] {
    return getList<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
  },
  getById(id: string): ServiceRecord | undefined {
    return this.getAll().find((r) => r.id === id);
  },
  create(data: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>): ServiceRecord {
    const list = this.getAll();
    const now = new Date().toISOString();
    const record: ServiceRecord = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(record);
    saveList(STORAGE_KEYS.SERVICE_RECORDS, list);
    return record;
  },
  update(id: string, data: Partial<ServiceRecord>): ServiceRecord | undefined {
    const list = this.getAll();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
    saveList(STORAGE_KEYS.SERVICE_RECORDS, list);
    return list[index];
  },
  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((r) => r.id !== id);
    if (filtered.length === list.length) return false;
    saveList(STORAGE_KEYS.SERVICE_RECORDS, filtered);
    return true;
  },
};

// Feedback CRUD
export const feedbackService = {
  getAll(): Feedback[] {
    return getList<Feedback>(STORAGE_KEYS.FEEDBACK);
  },
  getById(id: string): Feedback | undefined {
    return this.getAll().find((f) => f.id === id);
  },
  create(data: Omit<Feedback, 'id' | 'createdAt'>): Feedback {
    const list = this.getAll();
    const feedback: Feedback = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(feedback);
    saveList(STORAGE_KEYS.FEEDBACK, list);
    return feedback;
  },
  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((f) => f.id !== id);
    if (filtered.length === list.length) return false;
    saveList(STORAGE_KEYS.FEEDBACK, filtered);
    return true;
  },
};
