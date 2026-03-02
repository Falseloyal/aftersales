export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  type: 'repair' | 'return' | 'exchange' | 'consultation' | 'complaint' | 'other';
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  serviceRecordId: string;
  rating: number;
  content: string;
  category: 'product' | 'service' | 'logistics' | 'other';
  createdAt: string;
}
