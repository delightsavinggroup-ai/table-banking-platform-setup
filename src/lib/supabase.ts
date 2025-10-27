import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koytnolisjrmxqewdjhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveXRub2xpc2pybXhxZXdkamhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzMzNzAsImV4cCI6MjA3NzE0OTM3MH0.p2ToaFdm0drRogopBIYkiv_BZtPYScqBhFasWtydhDE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Member {
  id: string;
  full_name: string;
  id_number: string;
  phone_number: string;
  email?: string;
  savings_balance: number;
  total_loans: number;
  membership_fee_paid: boolean;
  registration_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  contribution_date: string;
  contribution_month: string;
  payment_method: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  member?: Member;
}

export interface Loan {
  id: string;
  member_id: string;
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  monthly_payment: number;
  outstanding_balance: number;
  loan_status: 'Active' | 'Completed' | 'Defaulted' | 'Pending';
  application_date: string;
  approval_date?: string;
  due_date?: string;
  last_payment_date?: string;
  credit_score: number;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface Meeting {
  id: string;
  meeting_date: string;
  location: string;
  agenda?: string;
  meeting_type: 'Monthly' | 'Emergency' | 'Annual';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  attendees_count: number;
  total_contributions: number;
  minutes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  member_id: string;
  title: string;
  message: string;
  notification_type: 'Info' | 'Contribution' | 'Loan' | 'Meeting' | 'Warning';
  is_read: boolean;
  created_at: string;
}