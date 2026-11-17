import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TaskCategory = 'producto' | 'ventas_contenido' | 'mantenimiento' | 'personal';

export interface KoratTask {
  id: string;
  title: string;
  category: TaskCategory;
  status: 'pending' | 'done';
  scheduled_date: string;
  created_at: string;
}

export interface KoratStreak {
  id: string;
  name: string;
  description: string | null;
  current_streak: number;
  best_streak: number;
  target_days: number;
  last_checked_date: string | null;
}

export interface KoratFinance {
  id: string;
  type: 'income' | 'expense' | 'balance_snapshot';
  amount: number;
  currency: string;
  category: string;
  note: string | null;
  date: string;
}

export interface KoratScript {
  id: string;
  title: string;
  hook: string | null;
  body: string | null;
  copy_description: string | null;
  publish_date: string | null;
  reference_url: string | null;
  status: 'sin_grabar' | 'grabado' | 'editado' | 'publicado';
  platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube';
  created_at?: string;
}

export interface KoratSaasLead {
  id: string;
  salon_name: string;
  owner_name: string | null;
  whatsapp: string | null;
  status: 'lead' | 'trial' | 'paying' | 'churned';
  monthly_amount: number;
  modules: string[];
  notes: string | null;
  billing_day?: number;
  document_type?: string;
  last_billed_date?: string | null;
}

export interface KoratMessage {
  id: string;
  role: 'user' | 'korat';
  content: string;
  created_at: string;
}

export interface KoratWeeklyDay {
  day_index: number;
  day_short: string;
  day_name: string;
  theme: string;
  color_key: string;
  morning_block: string;
  afternoon_block: string;
  night_block: string;
}

export interface KoratInspiration {
  id: string;
  kind: 'hook' | 'moodboard';
  pillar: 'reacciones' | 'dolor_salon' | 'marca';
  title: string;
  description: string | null;
  image_url: string | null;
  reference_url: string | null;
  created_at?: string;
}

export interface KoratNilahItem {
  id: string;
  kind: 'feature' | 'priority_idea';
  title: string;
  description: string | null;
  pain_point: string | null;
  status: 'live' | 'building' | 'planned';
  plan_type: 'gratis' | 'pago';
  priority: number;
  created_at?: string;
}
