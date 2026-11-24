'use client';

import { useEffect, useState } from 'react';
import {
  Waves,
  CheckCircle,
  CheckCircle2,
  Building2,
  Sparkles as SparklesIcon,
  Circle,
  Flame,
  Wallet,
  Plus,
  Film,
  Users,
  Sun,
  Compass,
  Store,
  Clapperboard,
  BadgeDollarSign,
  Trophy,
  ArrowUpRight,
  Radar,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  Receipt,
  CalendarCheck,
  Trash2,
  Pencil,
  Maximize2,
  Copy,
  Check,
  X,
} from 'lucide-react';
import {
  supabase,
  KoratTask,
  KoratStreak,
  KoratFinance,
  KoratScript,
  KoratSaasLead,
  KoratWeeklyDay,
  KoratInspiration,
  KoratNilahItem,
  TaskCategory,
} from '@/lib/supabase';

type NavTab = 'hoy' | 'saas' | 'contenido' | 'finanzas' | 'rachas';

interface CockpitMetrics {
  balance: number;
  mrr: number;
  paying_count: number;
  leads_count: number;
  pending_tasks: number;
  recorded_today: number;
  unchecked_streaks: number;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: Compass, color: 'text-sky-500' },
  { id: 'saas', label: 'Nilah IA · SaaS', icon: Store, color: 'text-orange-500' },
  { id: 'contenido', label: 'Guiones', icon: Clapperboard, color: 'text-teal-500' },
  { id: 'finanzas', label: 'Finanzas', icon: BadgeDollarSign, color: 'text-emerald-500' },
  { id: 'rachas', label: 'Rachas', icon: Trophy, color: 'text-amber-500' },
];

const CATEGORY_STYLES: Record<
  TaskCategory,
  {
    label: string;
    badge: string;
    cardBorder: string;
    cardBg: string;
    accentBar: string;
    tag: string;
  }
> = {
  producto: {
    label: 'Nilah IA · Producto SaaS',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    cardBorder: 'border-sky-200 hover:border-sky-400',
    cardBg: 'from-sky-500/[0.04] to-white',
    accentBar: 'bg-gradient-to-b from-sky-400 to-sky-600',
    tag: 'Foco Central',
  },
  ventas_contenido: {
    label: 'Ventas & Clientes · TikTok',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    cardBorder: 'border-amber-200 hover:border-amber-400',
    cardBg: 'from-amber-500/[0.04] to-white',
    accentBar: 'bg-gradient-to-b from-amber-400 to-amber-600',
    tag: 'Crecimiento',
  },
  mantenimiento: {
    label: 'FB / Rutina & Mantenimiento',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    cardBorder: 'border-teal-200 hover:border-teal-400',
    cardBg: 'from-teal-500/[0.04] to-white',
    accentBar: 'bg-gradient-to-b from-teal-400 to-teal-600',
    tag: 'Operativo',
  },
  personal: {
    label: 'Personal & Gatos / Energía',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cardBorder: 'border-emerald-200 hover:border-emerald-400',
    cardBg: 'from-emerald-500/[0.04] to-white',
    accentBar: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
    tag: 'Vida & Salud',
  },
};

export default function KoratCockpit() {
  const [activeTab, setActiveTab] = useState<NavTab>('hoy');
  const [cockpit, setCockpit] = useState<CockpitMetrics>({
    balance: 250,
    mrr: 150,
    paying_count: 1,
    leads_count: 0,
    pending_tasks: 0,
    recorded_today: 0,
    unchecked_streaks: 2,
  });

  const [tasks, setTasks] = useState<KoratTask[]>([]);
  const [streaks, setStreaks] = useState<KoratStreak[]>([]);
  const [finances, setFinances] = useState<KoratFinance[]>([]);
  const [scripts, setScripts] = useState<KoratScript[]>([]);
  const [leads, setLeads] = useState<KoratSaasLead[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('producto');
  const [newScriptTitle, setNewScriptTitle] = useState('');
  const [newScriptHook, setNewScriptHook] = useState('');
  const [newScriptBody, setNewScriptBody] = useState('');
  const [newScriptCopy, setNewScriptCopy] = useState('');
  const [newScriptPublishDate, setNewScriptPublishDate] = useState('');
  const [newScriptRefUrl, setNewScriptRefUrl] = useState('');
  const [newScriptPlatform, setNewScriptPlatform] = useState<KoratScript['platform']>('tiktok');
  const [newScriptStatus, setNewScriptStatus] = useState<KoratScript['status']>('sin_grabar');
  const [showNewScriptForm, setShowNewScriptForm] = useState(false);
  const [scriptFilter, setScriptFilter] = useState<'pendientes' | KoratScript['status']>('pendientes');
  const [expandedScriptId, setExpandedScriptId] = useState<string | null>(null);
  const [editingScript, setEditingScript] = useState<KoratScript | null>(null);
  const [readingScript, setReadingScript] = useState<KoratScript | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [contentSubTab, setContentSubTab] = useState<'guiones' | 'pizarra'>('guiones');
  const [inspirations, setInspirations] = useState<KoratInspiration[]>([]);
  const [pillarFilter, setPillarFilter] = useState<'all' | KoratInspiration['pillar']>('all');
  const [showNewInspForm, setShowNewInspForm] = useState(false);
  const [newInspKind, setNewInspKind] = useState<'hook' | 'moodboard'>('moodboard');
  const [newInspPillar, setNewInspPillar] = useState<KoratInspiration['pillar']>('reacciones');
  const [newInspTitle, setNewInspTitle] = useState('');
  const [newInspDesc, setNewInspDesc] = useState('');
  const [newInspImg, setNewInspImg] = useState('');
  const [newInspRef, setNewInspRef] = useState('');
  const [saasSubTab, setSaasSubTab] = useState<'clientes' | 'embudo' | 'producto'>('clientes');
  const [leadFilterType, setLeadFilterType] = useState<'all' | 'calientes' | 'frio' | 'reactivar'>('all');
  const [copiedLeadMsgId, setCopiedLeadMsgId] = useState<string | null>(null);
  const [huntSalonName, setHuntSalonName] = useState('');
  const [huntOwnerName, setHuntOwnerName] = useState('');
  const [huntWhatsapp, setHuntWhatsapp] = useState('');
  const [huntOrigin, setHuntOrigin] = useState<'google_maps' | 'tiktok_inactivo' | 'tiktok_dm'>('google_maps');
  const [huntZone, setHuntZone] = useState('');
  const [nilahItems, setNilahItems] = useState<KoratNilahItem[]>([]);
  const [showNewNilahForm, setShowNewNilahForm] = useState(false);
  const [newNilahKind, setNewNilahKind] = useState<'feature' | 'priority_idea'>('priority_idea');
  const [newNilahTitle, setNewNilahTitle] = useState('');
  const [newNilahDesc, setNewNilahDesc] = useState('');
  const [newNilahPain, setNewNilahPain] = useState('');
  const [newNilahPlan, setNewNilahPlan] = useState<'gratis' | 'pago'>('pago');
  const [newNilahPriority, setNewNilahPriority] = useState(1);
  const [nilahPlanFilter, setNilahPlanFilter] = useState<'all' | 'pago' | 'gratis'>('all');
  const [editingNilah, setEditingNilah] = useState<KoratNilahItem | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [newLeadSalon, setNewLeadSalon] = useState('');
  const [newLeadOwner, setNewLeadOwner] = useState('');
  const [newLeadWhatsapp, setNewLeadWhatsapp] = useState('');
  const [newLeadStatus, setNewLeadStatus] = useState<'lead' | 'paying'>('lead');
  const [newLeadAmount, setNewLeadAmount] = useState('150');
  const [newLeadBillingDay, setNewLeadBillingDay] = useState('1');
  const [newLeadDocType, setNewLeadDocType] = useState('boleta');
  const [newLeadModules, setNewLeadModules] = useState<string[]>([
    'Calificación Staff',
    'Sellos Digitales',
    'Cumpleaños 2 Tiempos',
  ]);
  const [finType, setFinType] = useState<'income' | 'expense'>('income');
  const [finAmount, setFinAmount] = useState('');
  const [finCategory, setFinCategory] = useState('');
  const [todayStr, setTodayStr] = useState('');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [weeklyDays, setWeeklyDays] = useState<KoratWeeklyDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [dayDraft, setDayDraft] = useState<KoratWeeklyDay | null>(null);
  const [savingDay, setSavingDay] = useState(false);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    loadAllData();
  }, []);

  async function refreshCockpit() {
    const { data } = await supabase.rpc('get_daily_cockpit');
    if (data) setCockpit(data as CockpitMetrics);
  }

  async function loadAllData() {
    setLoading(true);
    const [cRes, tRes, sRes, fRes, scRes, lRes, wRes, iRes, nRes] = await Promise.all([
      supabase.rpc('get_daily_cockpit'),
      supabase.from('korat_tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_streaks').select('*').order('created_at', { ascending: true }),
      supabase.from('korat_finances').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_scripts').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_saas_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_weekly_schedule').select('*').order('day_index', { ascending: true }),
      supabase.from('korat_inspiration').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_nilah_items').select('*').order('priority', { ascending: true }).order('created_at', { ascending: false }),
    ]);

    if (cRes.data) setCockpit(cRes.data as CockpitMetrics);
    if (tRes.data) setTasks(tRes.data);
    if (sRes.data) setStreaks(sRes.data);
    if (fRes.data) setFinances(fRes.data);
    if (scRes.data) setScripts(scRes.data);
    if (lRes.data) setLeads(lRes.data);
    if (wRes.data) setWeeklyDays(wRes.data);
    if (iRes.data) setInspirations(iRes.data);
    if (nRes.data) setNilahItems(nRes.data);
    setLoading(false);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const { data } = await supabase
      .from('korat_tasks')
      .insert({ title: newTaskTitle.trim(), category: newTaskCategory })
      .select()
      .single();
    if (data) {
      setTasks([data, ...tasks]);
      refreshCockpit();
    }
    setNewTaskTitle('');
  }

  async function toggleTask(task: KoratTask) {
    const nextStatus = task.status === 'done' ? 'pending' : 'done';
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    await supabase.from('korat_tasks').update({ status: nextStatus }).eq('id', task.id);
    refreshCockpit();
  }

  async function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
    await supabase.from('korat_tasks').delete().eq('id', id);
    refreshCockpit();
  }

  async function checkInStreak(streak: KoratStreak) {
    if (!todayStr || streak.last_checked_date === todayStr) return;
    await supabase.rpc('check_in_streak', { p_streak_id: streak.id });
    loadAllData();
  }

  async function addScript(e: React.FormEvent) {
    e.preventDefault();
    if (!newScriptTitle.trim()) return;
    const { data } = await supabase
      .from('korat_scripts')
      .insert({
        title: newScriptTitle.trim(),
        hook: newScriptHook.trim() || null,
        body: newScriptBody.trim() || null,
        copy_description: newScriptCopy.trim() || null,
        publish_date: newScriptPublishDate || null,
        reference_url: newScriptRefUrl.trim() || null,
        status: newScriptStatus,
        platform: newScriptPlatform,
      })
      .select()
      .single();
    if (data) {
      setScripts([data, ...scripts]);
      refreshCockpit();
    }
    setNewScriptTitle('');
    setNewScriptHook('');
    setNewScriptBody('');
    setNewScriptCopy('');
    setNewScriptPublishDate('');
    setNewScriptRefUrl('');
    setNewScriptStatus('sin_grabar');
    setShowNewScriptForm(false);
  }

  async function advanceScriptStatus(script: KoratScript) {
    const order: KoratScript['status'][] = ['sin_grabar', 'grabado', 'editado', 'publicado'];
    const currentIdx = order.indexOf(script.status);
    const next = order[(currentIdx === -1 ? 0 : currentIdx + 1) % order.length];
    setScripts(scripts.map((s) => (s.id === script.id ? { ...s, status: next } : s)));
    await supabase
      .from('korat_scripts')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', script.id);
    refreshCockpit();
  }

  async function saveEditingScript(e: React.FormEvent) {
    e.preventDefault();
    if (!editingScript) return;
    await supabase
      .from('korat_scripts')
      .update({
        title: editingScript.title,
        hook: editingScript.hook,
        body: editingScript.body,
        copy_description: editingScript.copy_description,
        publish_date: editingScript.publish_date || null,
        reference_url: editingScript.reference_url,
        platform: editingScript.platform,
        status: editingScript.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingScript.id);
    setScripts(scripts.map((s) => (s.id === editingScript.id ? editingScript : s)));
    setEditingScript(null);
    refreshCockpit();
  }

  async function deleteScript(id: string) {
    setScripts(scripts.filter((s) => s.id !== id));
    await supabase.from('korat_scripts').delete().eq('id', id);
    refreshCockpit();
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!newLeadSalon.trim()) return;

    const isPaying = newLeadStatus === 'paying';
    const amountNum = isPaying ? parseFloat(newLeadAmount) || 150 : 0;
    const bDay = parseInt(newLeadBillingDay) || 1;

    const { data } = await supabase
      .from('korat_saas_leads')
      .insert({
        salon_name: newLeadSalon.trim(),
        owner_name: newLeadOwner.trim() || null,
        whatsapp: newLeadWhatsapp.trim() || null,
        status: newLeadStatus,
        monthly_amount: amountNum,
        billing_day: bDay,
        document_type: newLeadDocType,
        modules: isPaying ? newLeadModules : [],
        notes: isPaying
          ? `Cliente activa: ${newLeadDocType.toUpperCase()} cada día ${bDay} por S/ ${amountNum}`
          : 'Lead captado por redes',
      })
      .select()
      .single();

    if (data) {
      setLeads([data, ...leads]);
      refreshCockpit();
    }
    setNewLeadSalon('');
    setNewLeadOwner('');
    setNewLeadWhatsapp('');
    setNewLeadStatus('lead');
  }

  async function markLeadPaying(lead: KoratSaasLead) {
    if (lead.status === 'paying') return;
    await supabase
      .from('korat_saas_leads')
      .update({ status: 'paying', monthly_amount: 150 })
      .eq('id', lead.id);
    loadAllData();
  }

  function copyLeadText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedLeadMsgId(id);
    setTimeout(() => setCopiedLeadMsgId(null), 2000);
  }

  async function deleteLead(id: string) {
    setLeads(leads.filter((l) => l.id !== id));
    await supabase.from('korat_saas_leads').delete().eq('id', id);
    refreshCockpit();
  }

  async function addHuntLead(e: React.FormEvent) {
    e.preventDefault();
    if (!huntSalonName.trim()) return;
    const originLabel = huntOrigin === 'google_maps' 
      ? '🗺️ Google Maps' 
      : huntOrigin === 'tiktok_inactivo' 
        ? '💤 TikTok (Inactivo 1-2 meses)' 
        : '🔥 TikTok DM';
    const notesStr = `[ORIGEN: ${originLabel}]${huntZone ? ' · Zona: ' + huntZone.trim() : ''}`;
    
    const { data } = await supabase
      .from('korat_saas_leads')
      .insert({
        salon_name: huntSalonName.trim(),
        owner_name: huntOwnerName.trim() || null,
        whatsapp: huntWhatsapp.trim() || null,
        status: 'lead',
        monthly_amount: 0,
        billing_day: 1,
        document_type: 'boleta',
        modules: [],
        notes: notesStr,
      })
      .select()
      .single();

    if (data) {
      setLeads([data, ...leads]);
      refreshCockpit();
    }
    setHuntSalonName('');
    setHuntOwnerName('');
    setHuntWhatsapp('');
    setHuntZone('');
  }

  async function saveLeadWhatsapp(leadId: string) {
    await supabase
      .from('korat_saas_leads')
      .update({ whatsapp: editWhatsapp.trim() || null })
      .eq('id', leadId);
    setEditingLeadId(null);
    setEditWhatsapp('');
    loadAllData();
  }

  function selectWeeklyDay(day: KoratWeeklyDay) {
    if (selectedDayIndex === day.day_index) {
      setSelectedDayIndex(null);
      setDayDraft(null);
    } else {
      setSelectedDayIndex(day.day_index);
      setDayDraft({ ...day });
    }
  }

  async function saveWeeklyDay(e: React.FormEvent) {
    e.preventDefault();
    if (!dayDraft) return;
    setSavingDay(true);
    await supabase
      .from('korat_weekly_schedule')
      .update({
        theme: dayDraft.theme,
        morning_block: dayDraft.morning_block,
        afternoon_block: dayDraft.afternoon_block,
        night_block: dayDraft.night_block,
      })
      .eq('day_index', dayDraft.day_index);
    setWeeklyDays(weeklyDays.map((d) => (d.day_index === dayDraft.day_index ? dayDraft : d)));
    setSavingDay(false);
    setSelectedDayIndex(null);
    setDayDraft(null);
  }

  async function addInspiration(e: React.FormEvent) {
    e.preventDefault();
    if (!newInspTitle.trim()) return;
    const { data } = await supabase
      .from('korat_inspiration')
      .insert({
        kind: newInspKind,
        pillar: newInspPillar,
        title: newInspTitle.trim(),
        description: newInspDesc.trim() || null,
        image_url: newInspImg.trim() || null,
        reference_url: newInspRef.trim() || null,
      })
      .select()
      .single();
    if (data) setInspirations([data, ...inspirations]);
    setNewInspTitle('');
    setNewInspDesc('');
    setNewInspImg('');
    setNewInspRef('');
    setShowNewInspForm(false);
  }

  function convertInspirationToScript(item: KoratInspiration) {
    if (item.kind === 'hook') {
      setNewScriptHook(item.title);
      setNewScriptTitle('');
    } else {
      setNewScriptTitle(item.title);
      setNewScriptHook(item.description || '');
      setNewScriptRefUrl(item.reference_url || '');
    }
    setContentSubTab('guiones');
    setShowNewScriptForm(true);
  }

  async function addNilahItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newNilahTitle.trim()) return;
    const { data } = await supabase
      .from('korat_nilah_items')
      .insert({
        kind: newNilahKind,
        title: newNilahTitle.trim(),
        description: newNilahDesc.trim() || null,
        pain_point: newNilahPain.trim() || null,
        status: newNilahKind === 'feature' ? 'live' : 'planned',
        plan_type: newNilahPlan,
        priority: newNilahPriority,
      })
      .select()
      .single();
    if (data) {
      setNilahItems([...nilahItems, data].sort((a, b) => a.priority - b.priority));
    }
    setNewNilahTitle('');
    setNewNilahDesc('');
    setNewNilahPain('');
    setShowNewNilahForm(false);
  }

  async function saveEditingNilah(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNilah) return;
    await supabase
      .from('korat_nilah_items')
      .update({
        title: editingNilah.title,
        description: editingNilah.description,
        pain_point: editingNilah.pain_point,
        plan_type: editingNilah.plan_type,
        priority: editingNilah.priority,
        status: editingNilah.status,
      })
      .eq('id', editingNilah.id);
    setNilahItems(
      nilahItems
        .map((n) => (n.id === editingNilah.id ? editingNilah : n))
        .sort((a, b) => a.priority - b.priority)
    );
    setEditingNilah(null);
  }

  async function deleteNilahItem(id: string) {
    setNilahItems(nilahItems.filter((n) => n.id !== id));
    await supabase.from('korat_nilah_items').delete().eq('id', id);
  }

  async function cycleNilahStatus(item: KoratNilahItem) {
    const order: KoratNilahItem['status'][] = ['planned', 'building', 'live'];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    setNilahItems(nilahItems.map((n) => (n.id === item.id ? { ...n, status: next } : n)));
    await supabase.from('korat_nilah_items').update({ status: next }).eq('id', item.id);
  }

  async function addFinanceMovement(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(finAmount);
    if (!amountNum || !finCategory.trim()) return;
    await supabase.rpc('add_finance_movement', {
      p_type: finType,
      p_amount: amountNum,
      p_category: finCategory.trim(),
      p_note: finType === 'income' ? 'Ingreso manual' : 'Gasto manual',
    });
    setFinAmount('');
    setFinCategory('');
    loadAllData();
  }

  // Parametric Intelligence calculations
  const runwayDays = Math.max(0, Math.round(cockpit.balance / (500 / 30)));
  const clientsNeededForBase = Math.max(0, Math.ceil((500 - cockpit.mrr) / 150));
  const mrrProgressPct = Math.min(100, Math.round((cockpit.mrr / 500) * 100));
  const recordedPct = Math.min(100, Math.round((cockpit.recorded_today / 3) * 100));

  // Today's thematic day (1=Mon .. 7=Sun)
  const jsDay = todayStr ? new Date(todayStr + 'T12:00:00').getDay() : 1;
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const todayTheme = weeklyDays.find((d) => d.day_index === isoDay);

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'done') return t.status === 'done';
    return true;
  });

  const totalIncome = finances
    .filter((f) => f.type === 'income' || f.type === 'balance_snapshot')
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const totalExpense = finances
    .filter((f) => f.type === 'expense')
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20 text-slate-800 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#FAF8F5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 text-white shadow-sm shadow-sky-500/25">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                Korat OS <span className="font-semibold text-sky-600">· Martín</span>
              </h1>
              <p className="text-xs text-slate-500">
                Huaral, Lima · {todayTheme ? `Hoy: ${todayTheme.day_name} (${todayTheme.theme})` : `SaaS Salones (${cockpit.paying_count}/10)`}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 sm:flex">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Vibe Surf · Modo Claro</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:col-span-2 lg:block">
          <nav className="sticky top-24 space-y-1.5 rounded-3xl border border-stone-200/80 bg-white p-3 shadow-sm">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-xs ring-1 ring-sky-200/80'
                      : 'text-slate-600 hover:bg-[#FAF8F5] hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? item.color : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center Workspace */}
        <main className="space-y-6 lg:col-span-6">
          {activeTab === 'hoy' && (
            <>
              {/* Barra Semanal de Días Temáticos (Interactiva y Editable) */}
              <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Semana Temática
                  </span>
                  <span className="text-[11px] font-semibold text-sky-600">
                    Haz clic en cualquier día para ver o editar sus 3 bloques
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weeklyDays.map((d) => {
                    const colorMap: Record<string, string> = {
                      teal: 'bg-teal-50 text-teal-700 border-teal-200',
                      orange: 'bg-orange-50 text-orange-700 border-orange-200',
                      sky: 'bg-sky-50 text-sky-700 border-sky-200',
                      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      amber: 'bg-amber-50 text-amber-700 border-amber-200',
                    };
                    const isSelected = selectedDayIndex === d.day_index;
                    const cls = colorMap[d.color_key] || colorMap.sky;
                    return (
                      <button
                        key={d.day_index}
                        type="button"
                        onClick={() => selectWeeklyDay(d)}
                        className={`rounded-xl border px-1 py-2 transition active:scale-95 ${cls} ${
                          isSelected ? 'ring-2 ring-sky-500 ring-offset-1 shadow-xs' : 'hover:opacity-90'
                        }`}
                      >
                        <p className="text-[11px] font-extrabold">{d.day_short}</p>
                        <p className="mt-0.5 truncate text-[9px] font-semibold leading-tight">
                          {d.theme}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {dayDraft && (
                  <form
                    onSubmit={saveWeeklyDay}
                    className="mt-4 space-y-3 rounded-2xl border border-sky-100 bg-[#FAF8F5] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {dayDraft.day_name} · Editar bloques
                      </h3>
                      <input
                        type="text"
                        value={dayDraft.theme}
                        onChange={(e) => setDayDraft({ ...dayDraft, theme: e.target.value })}
                        placeholder="Tema del día"
                        className="w-36 rounded-xl border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-sky-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                          Mañana (11:30–14:30)
                        </label>
                        <textarea
                          rows={2}
                          value={dayDraft.morning_block}
                          onChange={(e) =>
                            setDayDraft({ ...dayDraft, morning_block: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                          Tarde (17:00–21:30)
                        </label>
                        <textarea
                          rows={2}
                          value={dayDraft.afternoon_block}
                          onChange={(e) =>
                            setDayDraft({ ...dayDraft, afternoon_block: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                          Noche (21:30+)
                        </label>
                        <textarea
                          rows={2}
                          value={dayDraft.night_block}
                          onChange={(e) =>
                            setDayDraft({ ...dayDraft, night_block: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDayIndex(null);
                          setDayDraft(null);
                        }}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-stone-200/60"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingDay}
                        className="rounded-xl bg-sky-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-sky-600"
                      >
                        {savingDay ? 'Guardando...' : 'Guardar Día'}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-stone-200/80 border-t-4 border-t-sky-500 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Caja Real
                    </span>
                    <div className="rounded-xl bg-sky-50 p-2 text-sky-500">
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">S/ {cockpit.balance}</p>
                  <p className="mt-1 text-xs text-slate-500">~{runwayDays} días de colchón</p>
                </div>

                <div className="rounded-3xl border border-stone-200/80 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      MRR SaaS
                    </span>
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">S/ {cockpit.mrr}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                      style={{ width: `${mrrProgressPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {mrrProgressPct}% de tu base S/ 500 ({cockpit.paying_count} clienta)
                  </p>
                </div>

                <div className={`rounded-3xl border border-stone-200/80 border-t-4 ${cockpit.recorded_today >= 3 ? 'border-t-rose-500' : 'border-t-teal-500'} bg-white p-5 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Contenido Hoy
                    </span>
                    <div className={`rounded-xl p-2 ${cockpit.recorded_today >= 3 ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-500'}`}>
                      <Film className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    {cockpit.recorded_today} / 3
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cockpit.recorded_today >= 3 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${recordedPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Grabados hoy · Publicados: {scripts.filter((s) => s.status === 'publicado').length}
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                      </span>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        Foco de Hoy · Pendientes Clave
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Vista de alto impacto para trabajar con máxima claridad mental a partir de las 11:30 am.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-2xl border border-stone-200 bg-[#FAF8F5] p-1 text-xs font-semibold">
                      {(['all', 'pending', 'done'] as const).map((f) => {
                        const count = f === 'all' 
                          ? tasks.length 
                          : f === 'pending' 
                            ? tasks.filter((t) => t.status === 'pending').length 
                            : tasks.filter((t) => t.status === 'done').length;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setTaskFilter(f)}
                            className={`rounded-xl px-3 py-1.5 transition ${
                              taskFilter === f
                                ? 'bg-white text-sky-700 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Hechas'}
                            <span className="ml-1.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Formulario rápido para nueva tarea */}
                <form onSubmit={addTask} className="mb-6 flex flex-col gap-2 rounded-2xl border border-stone-200/70 bg-[#FAF8F5] p-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Escribe un pendiente clave... (Ej: Mejorar vitrina digital a Génesis)"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                      className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 outline-none transition focus:border-sky-500"
                    >
                      <option value="producto">🚀 Nilah IA · Producto</option>
                      <option value="ventas_contenido">🔥 Ventas & TikTok</option>
                      <option value="mantenimiento">🌿 FB & Rutina</option>
                      <option value="personal">🐾 Personal & Gatos</option>
                    </select>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                </form>

                {loading ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-400">Cargando tu oficina...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-200 bg-[#FAF8F5]/80 p-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mb-3">
                      <Compass className="h-6 w-6" />
                    </div>
                    <p className="text-base font-bold text-slate-800">
                      {taskFilter === 'pending'
                        ? '¡Excelente! No tienes pendientes activos en este momento.'
                        : taskFilter === 'done'
                          ? 'Aún no has completado pendientes hoy.'
                          : 'No hay pendientes registrados.'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Mantén la vibra ligera y enfócate en tus 3 bloques del día.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {filteredTasks.map((task) => {
                      const style = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.producto;
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-5 transition-all duration-200 ${
                            isDone
                              ? 'border-stone-200/80 bg-stone-50/60 opacity-60'
                              : `${style.cardBorder} ${style.cardBg} shadow-xs hover:shadow-md hover:-translate-y-0.5`
                          }`}
                        >
                          {/* Barra de acento lateral vistosa */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-2 transition-all ${
                              isDone ? 'bg-stone-300' : style.accentBar
                            }`}
                          />

                          <div>
                            {/* Cabecera de la tarjeta */}
                            <div className="flex items-center justify-between gap-2 pl-2 mb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                    isDone ? 'bg-stone-100 text-stone-500 border-stone-200' : style.badge
                                  }`}
                                >
                                  {style.label}
                                </span>
                                <span className="rounded-md bg-stone-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                  {style.tag}
                                </span>
                              </div>

                              {/* Botón de eliminar */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task.id);
                                }}
                                className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                                title="Eliminar pendiente"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Título grande y detallado */}
                            <div
                              onClick={() => toggleTask(task)}
                              className="cursor-pointer pl-2 select-none"
                            >
                              <h3
                                className={`text-base font-extrabold leading-snug tracking-tight transition ${
                                  isDone
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-900 group-hover:text-slate-950'
                                }`}
                              >
                                {task.title}
                              </h3>
                            </div>
                          </div>

                          {/* Footer de la tarjeta con acción rápida */}
                          <div className="mt-4 flex items-center justify-between border-t border-stone-100/80 pt-3 pl-2">
                            <span className="text-[11px] font-semibold text-slate-400">
                              {task.scheduled_date ? `Fecha: ${task.scheduled_date}` : 'Para hoy'}
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleTask(task)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                                isDone
                                  ? 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                                  : 'bg-white text-slate-800 shadow-xs border border-stone-200/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Hecho</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                                  <span>Marcar listo</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}</section>
            </>
          )}

          {activeTab === 'saas' && (
            <div className="space-y-5">
              {/* Sub-navegación Nilah IA · SaaS */}
              <div className="inline-flex rounded-2xl border border-stone-200/80 bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSaasSubTab('clientes')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    saasSubTab === 'clientes'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👥 Clientes Activos ({leads.filter((l) => l.status === 'paying').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSaasSubTab('embudo')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    saasSubTab === 'embudo'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎯 Embudo & Caza Fría ({leads.filter((l) => l.status !== 'paying').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSaasSubTab('producto')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    saasSubTab === 'producto'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚙️ Producto Nilah IA & Ideas
                </button>
              </div>

              {saasSubTab === 'embudo' ? (
                <div className="space-y-6">
                  {/* Banner Guía Táctica del Embudo */}
                  <section className="rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-amber-50/50 to-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                          </span>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                            Estrategia de Prospección & Cierre (Martín + 6K TikTok)
                          </span>
                        </div>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                          Máquina de Caza en Frío & Reactivación
                        </h2>
                        <p className="mt-1 max-w-2xl text-xs text-slate-600 leading-relaxed">
                          La clave con desconocidos: <strong>no vendas de golpe</strong>. Despierta curiosidad, valida si tienen vitrina digital y usa tu TikTok de 6,500 seguidores como <strong>prueba social</strong> para generar confianza inmediata.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-orange-200 bg-white p-3 text-center shadow-xs">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Meta Diaria</p>
                          <p className="text-lg font-black text-orange-600">15 Leads</p>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-xs">
                          <p className="text-[10px] font-bold uppercase text-slate-400">En Seguimiento</p>
                          <p className="text-lg font-black text-slate-800">{leads.filter((l) => l.status !== 'paying').length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Las 3 Plantillas Maestras para Copiar y Mandar */}
                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {/* Script 1: Maps en Frío */}
                      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 uppercase">
                            1. Frío Google Maps
                          </span>
                          <button
                            type="button"
                            onClick={() => copyLeadText("¡Hola! Vi su salón en Google Maps y me encantaron los trabajos que tienen. Quería hacerles una consulta rápida: ¿tienen catálogo interactivo para mandar por WhatsApp cuando una clienta nueva pregunta precios, o lo mandan en fotos sueltas?", "script_maps")}
                            className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-stone-200"
                          >
                            {copiedLeadMsgId === 'script_maps' ? '✓ Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 italic">
                          "¡Hola! Vi su salón en Google Maps y me encantaron los trabajos que tienen. Quería hacerles una consulta rápida: ¿tienen catálogo interactivo para mandar por WhatsApp cuando una clienta nueva pregunta precios, o lo mandan en fotos sueltas?"
                        </p>
                        <p className="mt-2 text-[10px] font-semibold text-slate-400">Pica curiosidad · Cero venta dura</p>
                      </div>

                      {/* Script 2: Reactivación 1-2 Meses (Con TikTok) */}
                      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase">
                            2. Reactivar / Vistos
                          </span>
                          <button
                            type="button"
                            onClick={() => copyLeadText("¡Hola [Nombre]! Te escribí hace unas semanas por el sistema de salones. Como andamos subiendo contenido en TikTok sobre cómo aumentar clientas (ya somos más de 6,500 en la comunidad), te comparto un tip de catálogo rápido para tu salón: tiktok.com/@martin.koratflow. Avísame si pudiste armar tu vitrina digital o si te creo una demo de regalo.", "script_reactivar")}
                            className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-stone-200"
                          >
                            {copiedLeadMsgId === 'script_reactivar' ? '✓ Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 italic">
                          "¡Hola! Te escribí hace unas semanas por el sistema. Como andamos subiendo contenido en TikTok sobre cómo captar clientas (ya somos +6.5k), te comparto un tip rápido de catálogo para tu salón: [LINK TIKTOK]. Avísame si quieres tu demo de regalo."
                        </p>
                        <p className="mt-2 text-[10px] font-semibold text-slate-400">Aporta valor + Prueba social de 6k</p>
                      </div>

                      {/* Script 3: Audio de Martín */}
                      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                            3. Nota de Voz (Martín)
                          </span>
                          <button
                            type="button"
                            onClick={() => copyLeadText("Genial, mira, justo creamos Nilah para salones como el tuyo. Les armamos una vitrina digital lista para WhatsApp con sus fotos y precios para no perder tiempo escribiendo lo mismo 20 veces. Si quieres te armo una demo gratis de 2 minutos con el nombre de tu salón para que veas cómo se vería, ¿te la paso por aquí?", "script_audio")}
                            className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-stone-200"
                          >
                            {copiedLeadMsgId === 'script_audio' ? '✓ Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 italic">
                          "Genial, mira, justo creamos Nilah para salones como el tuyo. Les armamos su vitrina lista para WhatsApp para no perder tiempo escribiendo precios. Si quieres te armo una demo gratis de 2 min con tu nombre para que la veas, ¿te la paso?"
                        </p>
                        <p className="mt-2 text-[10px] font-semibold text-slate-400">Audio 20 seg · Tono relajado y seguro</p>
                      </div>
                    </div>
                  </section>

                  {/* Formulario Rápido: Cargar Lead de Caza */}
                  <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">
                      Cargar Salón Contactado (Modo Caza)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Registra en segundos el salón que encontraste en Google Maps o que te escribió en TikTok.
                    </p>

                    <form onSubmit={addHuntLead} className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <input
                          type="text"
                          value={huntSalonName}
                          onChange={(e) => setHuntSalonName(e.target.value)}
                          placeholder="Nombre del Salón (ej: Beauty Lounge)*"
                          className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white sm:col-span-1"
                          required
                        />
                        <input
                          type="text"
                          value={huntOwnerName}
                          onChange={(e) => setHuntOwnerName(e.target.value)}
                          placeholder="Dueña / Administradora (opcional)"
                          className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white"
                        />
                        <input
                          type="text"
                          value={huntWhatsapp}
                          onChange={(e) => setHuntWhatsapp(e.target.value)}
                          placeholder="WhatsApp (9 dígitos)"
                          className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white"
                        />
                        <input
                          type="text"
                          value={huntZone}
                          onChange={(e) => setHuntZone(e.target.value)}
                          placeholder="Distrito / Zona (ej: Surco, Ate, Huaral)"
                          className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">Origen:</span>
                          <select
                            value={huntOrigin}
                            onChange={(e) => setHuntOrigin(e.target.value as any)}
                            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                          >
                            <option value="google_maps">🗺️ Google Maps (Frío)</option>
                            <option value="tiktok_inactivo">💤 TikTok (Inactivo / Visto hace 1-2 meses)</option>
                            <option value="tiktok_dm">🔥 TikTok DM (Lead Caliente)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:opacity-95 active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                          Guardar Salón en Embudo
                        </button>
                      </div>
                    </form>
                  </section>

                  {/* Tablero de Salones en el Embudo */}
                  <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          Salones en Proceso ({leads.filter((l) => l.status !== 'paying').length})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Toca el botón de WhatsApp para dispararle el mensaje con un solo clic.
                        </p>
                      </div>

                      {/* Filtros rápidos de visualización */}
                      <div className="inline-flex rounded-xl border border-stone-200 bg-[#FAF8F5] p-0.5 text-[11px] font-semibold">
                        {(
                          [
                            { id: 'all', label: 'Todos' },
                            { id: 'frio', label: 'Google Maps' },
                            { id: 'reactivar', label: 'Por Reactivar' },
                            { id: 'calientes', label: 'TikTok DMs' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setLeadFilterType(tab.id)}
                            className={`rounded-lg px-3 py-1 transition ${
                              leadFilterType === tab.id
                                ? 'bg-white text-orange-600 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {leads.filter((l) => l.status !== 'paying').length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-stone-200 bg-[#FAF8F5] p-8 text-center">
                          <p className="text-sm font-bold text-slate-700">Tu embudo está vacío.</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Aprovecha la hora de prospección: busca 15 salones en Google Maps y agrégalos aquí arriba.
                          </p>
                        </div>
                      ) : (
                        leads
                          .filter((l) => l.status !== 'paying')
                          .filter((lead) => {
                            if (leadFilterType === 'frio') return lead.notes?.includes('Google Maps');
                            if (leadFilterType === 'reactivar') return lead.notes?.includes('Inactivo');
                            if (leadFilterType === 'calientes') return lead.notes?.includes('TikTok DM');
                            return true;
                          })
                          .map((lead) => {
                            const isMaps = lead.notes?.includes('Google Maps');
                            const isReactivar = lead.notes?.includes('Inactivo');
                            const defaultMsg = isReactivar
                              ? `¡Hola ${lead.owner_name || ''}! Te escribí hace un tiempo por el sistema para ${lead.salon_name}. Como andamos compartiendo tips en TikTok sobre cómo captar más clientas (ya somos más de 6,500 salones y estilistas), te quería preguntar si lograste armar tu vitrina digital o si te armo una demo de regalo de 2 minutos para WhatsApp: https://tiktok.com/@martin.koratflow`
                              : `¡Hola! Vi el salón ${lead.salon_name} en Google Maps y me encantaron sus trabajos. Quería hacerles una consulta rápida: ¿tienen catálogo interactivo para mandar por WhatsApp cuando una clienta nueva pregunta precios, o lo mandan en fotos sueltas?`;

                            return (
                              <div
                                key={lead.id}
                                className="group flex flex-col justify-between gap-3 rounded-2xl border border-stone-100 bg-[#FAF8F5]/80 p-4 transition hover:border-orange-200 hover:bg-white sm:flex-row sm:items-center"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-extrabold text-slate-900">
                                      {lead.salon_name}
                                    </h4>
                                    {lead.notes && (
                                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                        {lead.notes}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {lead.owner_name ? `Contacto: ${lead.owner_name} · ` : ''}
                                    {lead.whatsapp ? `WA: +51 ${lead.whatsapp}` : 'Sin número asignado'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {lead.whatsapp ? (
                                    <a
                                      href={`https://wa.me/51${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(defaultMsg)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      Abrir Chat WA
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 italic">Agrega teléfono</span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => markLeadPaying(lead)}
                                    className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-orange-600 active:scale-95"
                                    title="Pasar a cliente pagando mensual"
                                  >
                                    ✓ Cerrar S/ 150
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteLead(lead.id)}
                                    className="rounded-xl p-2 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                                    title="Eliminar del embudo"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </section>
                </div>
              ) : saasSubTab === 'producto' ? (
                <div className="space-y-5">
                  <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Korat Flow · Nilah IA (Producto & Ideas)
                        </h2>
                        <p className="text-xs text-slate-500">
                          Sincronizado con <strong>korat-guionista</strong> para que tus videos
                          ataquen dolores reales.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewNilahForm(!showNewNilahForm)}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-600"
                      >
                        <Plus className="h-4 w-4" />
                        {showNewNilahForm ? 'Cerrar' : 'Agregar'}
                      </button>
                    </div>

                    {showNewNilahForm && (
                      <form
                        onSubmit={addNilahItem}
                        className="mb-5 space-y-3 rounded-2xl border border-orange-200 bg-[#FAF8F5] p-4"
                      >
                        <select
                          value={newNilahKind}
                          onChange={(e) =>
                            setNewNilahKind(e.target.value as 'feature' | 'priority_idea')
                          }
                          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          <option value="priority_idea">🚀 Idea Prioritaria / Roadmap</option>
                          <option value="feature">⚙️ Funcionalidad de Nilah IA</option>
                        </select>
                        <input
                          type="text"
                          required
                          value={newNilahTitle}
                          onChange={(e) => setNewNilahTitle(e.target.value)}
                          placeholder="Nombre de la funcionalidad o idea..."
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold outline-none focus:border-orange-400"
                        />
                        <input
                          type="text"
                          value={newNilahDesc}
                          onChange={(e) => setNewNilahDesc(e.target.value)}
                          placeholder="Descripción breve de cómo funciona..."
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-400"
                        />
                        <input
                          type="text"
                          value={newNilahPain}
                          onChange={(e) => setNewNilahPain(e.target.value)}
                          placeholder="¿Qué dolor del salón resuelve? (clave para guiones)"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-orange-400"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                          >
                            Guardar en Nilah IA
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Filtros por Plan (Todas / De Pago / Plan Gratis) */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {(
                        [
                          { id: 'all', label: 'Todas' },
                          { id: 'pago', label: '💎 De Pago' },
                          { id: 'gratis', label: '🆓 Plan Gratis' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setNilahPlanFilter(f.id)}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                            nilahPlanFilter === f.id
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-[#FAF8F5] text-slate-600 hover:bg-stone-200/70'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {editingNilah && (
                      <form
                        onSubmit={saveEditingNilah}
                        className="mb-5 space-y-3 rounded-2xl border border-sky-200 bg-sky-50/50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-sky-900">
                            Editando: {editingNilah.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingNilah(null)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800"
                          >
                            Cancelar
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <input
                            type="text"
                            required
                            value={editingNilah.title}
                            onChange={(e) =>
                              setEditingNilah({ ...editingNilah, title: e.target.value })
                            }
                            className="sm:col-span-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold"
                          />
                          <div className="flex gap-2">
                            <select
                              value={editingNilah.plan_type}
                              onChange={(e) =>
                                setEditingNilah({
                                  ...editingNilah,
                                  plan_type: e.target.value as 'gratis' | 'pago',
                                })
                              }
                              className="flex-1 rounded-xl border border-stone-200 bg-white px-2 py-2 text-xs font-bold"
                            >
                              <option value="pago">💎 Pago</option>
                              <option value="gratis">🆓 Gratis</option>
                            </select>
                            <select
                              value={editingNilah.priority}
                              onChange={(e) =>
                                setEditingNilah({
                                  ...editingNilah,
                                  priority: Number(e.target.value),
                                })
                              }
                              className="w-16 rounded-xl border border-stone-200 bg-white px-2 py-2 text-xs font-bold"
                            >
                              <option value={1}>P1</option>
                              <option value={2}>P2</option>
                              <option value={3}>P3</option>
                            </select>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={editingNilah.description || ''}
                          onChange={(e) =>
                            setEditingNilah({ ...editingNilah, description: e.target.value })
                          }
                          placeholder="Descripción..."
                          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          value={editingNilah.pain_point || ''}
                          onChange={(e) =>
                            setEditingNilah({ ...editingNilah, pain_point: e.target.value })
                          }
                          placeholder="Dolor que resuelve..."
                          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded-xl bg-sky-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Ideas Prioritarias */}
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      🚀 Ideas Prioritarias / Roadmap
                    </h3>
                    <div className="mb-5 space-y-2.5">
                      {nilahItems
                        .filter(
                          (i) =>
                            i.kind === 'priority_idea' &&
                            (nilahPlanFilter === 'all' || i.plan_type === nilahPlanFilter)
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-3.5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 border border-stone-200">
                                  P{item.priority}
                                </span>
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                    item.plan_type === 'pago'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {item.plan_type === 'pago' ? '💎 Pago' : '🆓 Gratis'}
                                </span>
                                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                              </div>
                              {item.description && (
                                <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                              )}
                              {item.pain_point && (
                                <p className="mt-1 text-[11px] font-medium text-orange-700">
                                  Dolor: {item.pain_point}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => cycleNilahStatus(item)}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                  item.status === 'live'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : item.status === 'building'
                                      ? 'bg-sky-100 text-sky-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {item.status}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNilah(item)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-sky-600"
                                title="Editar"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNilahItem(item.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"
                                title="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Funcionalidades Activas */}
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      ⚙️ Funcionalidades de Nilah IA
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {nilahItems
                        .filter(
                          (i) =>
                            i.kind === 'feature' &&
                            (nilahPlanFilter === 'all' || i.plan_type === nilahPlanFilter)
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-3.5"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 border border-stone-200">
                                    P{item.priority}
                                  </span>
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                      item.plan_type === 'pago'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {item.plan_type === 'pago' ? '💎 Pago' : '🆓 Gratis'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNilah(item)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-sky-600"
                                    title="Editar"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteNilahItem(item.id)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-rose-600"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="mt-1.5 text-sm font-bold text-slate-900">{item.title}</p>
                              {item.description && (
                                <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                              )}
                            </div>
                            {item.pain_point && (
                              <p className="mt-2 rounded-lg border border-orange-100 bg-white px-2.5 py-1.5 text-[11px] font-medium text-orange-800">
                                <strong>Dolor:</strong> {item.pain_point}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
              ) : (
            <div className="space-y-6">
              {/* Resumen Superior del SaaS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Clientes Activos
                    </span>
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {leads.filter((l) => l.status === 'paying').length} Salones
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Generando ingresos recurrentes</p>
                </div>

                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      MRR Recurrente
                    </span>
                    <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                      <BadgeDollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">S/ {cockpit.mrr}</p>
                  <p className="mt-1 text-xs text-slate-500">Objetivo 6 meses: S/ 2,000</p>
                </div>

                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Leads en Seguimiento
                    </span>
                    <div className="rounded-xl bg-sky-50 p-2 text-sky-500">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {leads.filter((l) => l.status !== 'paying').length} Contactos
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Por cerrar a prueba o suscripción</p>
                </div>
              </div>

              {/* Formulario Completo de Alta: Cliente Pagando o Lead */}
              <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Registrar Nuevo Cliente o Lead
                  </h2>
                  <p className="text-xs text-slate-500">
                    Agrega directamente un salón que ya te está pagando con sus módulos y boleta, o un lead para seguimiento.
                  </p>
                </div>

                <form onSubmit={addLead} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={newLeadSalon}
                      onChange={(e) => setNewLeadSalon(e.target.value)}
                      placeholder="Nombre del Salón (ej: Glamour y Capricho)*"
                      className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white"
                      required
                    />
                    <input
                      type="text"
                      value={newLeadOwner}
                      onChange={(e) => setNewLeadOwner(e.target.value)}
                      placeholder="Dueña / Administradora"
                      className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white"
                    />
                    <input
                      type="text"
                      value={newLeadWhatsapp}
                      onChange={(e) => setNewLeadWhatsapp(e.target.value)}
                      placeholder="WhatsApp (9 dígitos)"
                      className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl border border-stone-100 bg-[#FAF8F5]/80 p-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
                        Tipo de registro
                      </label>
                      <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => setNewLeadStatus('paying')}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                            newLeadStatus === 'paying'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ⭐ Cliente Pagando (Activo)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewLeadStatus('lead')}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                            newLeadStatus === 'lead'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          💬 Lead / Interesado
                        </button>
                      </div>
                    </div>

                    {newLeadStatus === 'paying' ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-slate-600">
                            Monto Mensual (S/)
                          </label>
                          <input
                            type="number"
                            value={newLeadAmount}
                            onChange={(e) => setNewLeadAmount(e.target.value)}
                            placeholder="150"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-slate-600">
                            Día de Cobro
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={newLeadBillingDay}
                            onChange={(e) => setNewLeadBillingDay(e.target.value)}
                            placeholder="1"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-slate-600">
                            Documento
                          </label>
                          <select
                            value={newLeadDocType}
                            onChange={(e) => setNewLeadDocType(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                          >
                            <option value="boleta">Boleta</option>
                            <option value="factura">Factura</option>
                            <option value="recibo">Recibo Simple</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">
                        Los leads se guardan para seguimiento por WhatsApp y podrás pasarlos a clientes con un clic.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-orange-600 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      {newLeadStatus === 'paying' ? 'Guardar Cliente Activo' : 'Guardar Lead'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Listado de Clientes Activos (Sección Destacada) */}
              <section className="rounded-3xl border border-emerald-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-emerald-100 p-1.5 text-emerald-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Cartera de Clientes Activos ({leads.filter((l) => l.status === 'paying').length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Suscripciones activas con facturación recurrente.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    Total: S/ {cockpit.mrr} / mes
                  </span>
                </div>

                <div className="space-y-3">
                  {leads.filter((l) => l.status === 'paying').length === 0 ? (
                    <p className="rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                      No tienes clientes activos registrados todavía.
                    </p>
                  ) : (
                    leads
                      .filter((l) => l.status === 'paying')
                      .map((lead) => (
                        <div
                          key={lead.id}
                          className="flex flex-col gap-3.5 rounded-2xl border border-stone-200/90 bg-[#FAF8F5] p-4.5 transition hover:border-emerald-300"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <h3 className="text-base font-extrabold text-slate-900">
                                  {lead.salon_name}
                                </h3>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-200">
                                  S/ {lead.monthly_amount} / mes
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs font-medium text-slate-600">
                                Dueña: <strong className="text-slate-800">{lead.owner_name || 'Sin especificar'}</strong>
                                {lead.whatsapp && ` · Teléfono: ${lead.whatsapp}`}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {editingLeadId === lead.id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editWhatsapp}
                                    onChange={(e) => setEditWhatsapp(e.target.value)}
                                    placeholder="999888777"
                                    className="w-28 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs outline-none"
                                  />
                                  <button
                                    onClick={() => saveLeadWhatsapp(lead.id)}
                                    className="rounded-lg bg-sky-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-sky-600"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingLeadId(lead.id);
                                    setEditWhatsapp(lead.whatsapp || '');
                                  }}
                                  className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-stone-50"
                                >
                                  Editar WA
                                </button>
                              )}
                              {lead.whatsapp && (
                                <a
                                  href={`https://wa.me/51${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hola ${lead.owner_name || ''}, te adjunto la boleta del mes de tu suscripción del sistema para ${lead.salon_name}.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  Enviar Boleta WA
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Ficha de Facturación y Módulos Contratados */}
                          <div className="grid grid-cols-1 gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 sm:grid-cols-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                              <Receipt className="h-4 w-4 text-amber-600" />
                              <span>
                                Emisión: Día {lead.billing_day || 1} de cada mes ({lead.document_type?.toUpperCase() || 'BOLETA'})
                              </span>
                            </div>
                            <div className="text-xs text-amber-900">
                              <strong>Módulos:</strong>{' '}
                              {lead.modules && lead.modules.length > 0
                                ? lead.modules.join(', ')
                                : 'Calificación Staff, Sellos Digitales, Cumpleaños'}
                            </div>
                          </div>

                          {lead.notes && (
                            <p className="text-xs text-slate-500 italic bg-white/70 p-2.5 rounded-xl border border-stone-100">
                              {lead.notes}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </section>

              {/* Listado de Leads / Oportunidades */}
              <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Leads & Oportunidades ({leads.filter((l) => l.status !== 'paying').length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Salones que mostraron interés en TikTok o redes. Pásalos a cliente activo cuando paguen.
                  </p>
                </div>

                <div className="space-y-3">
                  {leads.filter((l) => l.status !== 'paying').length === 0 ? (
                    <p className="rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                      No hay leads pendientes en este momento. Agrega los que te escriban por TikTok.
                    </p>
                  ) : (
                    leads
                      .filter((l) => l.status !== 'paying')
                      .map((lead) => (
                        <div
                          key={lead.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-100 bg-[#FAF8F5] p-4"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">{lead.salon_name}</p>
                            <p className="text-xs text-slate-500">
                              {lead.owner_name ? `Dueña: ${lead.owner_name} · ` : ''}
                              {lead.whatsapp ? `WA: ${lead.whatsapp}` : 'Sin teléfono'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {lead.whatsapp && (
                              <a
                                href={`https://wa.me/51${lead.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-200"
                              >
                                <MessageSquare className="h-3 w-3" />
                                WhatsApp
                              </a>
                            )}
                            <button
                              onClick={() => markLeadPaying(lead)}
                              className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-orange-600"
                            >
                              Activar Cliente S/ 150
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>
            </div>
              )}
            </div>
          )}

          {activeTab === 'contenido' && (
            <div className="space-y-4">
              {/* Sub-navegación limpia: Mis Guiones vs Pizarra Visual */}
              <div className="inline-flex rounded-2xl border border-stone-200/80 bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setContentSubTab('guiones')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    contentSubTab === 'guiones'
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📝 Mis Guiones ({scripts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContentSubTab('pizarra')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    contentSubTab === 'pizarra'
                      ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎨 Pizarra Visual & Pilares
                </button>
              </div>

              {contentSubTab === 'pizarra' ? (
                <div className="space-y-5">
                  {/* Zona 1: Brújula de Marca (3 Pilares) */}
                  <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Brújula de Marca · 3 Pilares
                        </h2>
                        <p className="text-xs text-slate-500">
                          Tono directo, cercano y siempre cerrando con CTA a WhatsApp / Demo.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewInspForm(!showNewInspForm)}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-sky-600"
                      >
                        <Plus className="h-4 w-4" />
                        {showNewInspForm ? 'Cerrar' : 'Agregar a Pizarra'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {(
                        [
                          {
                            id: 'reacciones',
                            title: 'Reacciones Virales',
                            desc: 'Comentar videos de uñas/salones y rematar con tu SaaS.',
                            cls: 'border-orange-200 bg-orange-50/70 text-orange-900',
                          },
                          {
                            id: 'dolor_salon',
                            title: 'Dolor del Salón',
                            desc: 'Citas olvidadas, clientas que no vuelven, control de staff.',
                            cls: 'border-sky-200 bg-sky-50/70 text-sky-900',
                          },
                          {
                            id: 'marca',
                            title: 'Marca Personal',
                            desc: 'Tu historia administrando 3 años + creando SaaS desde Huaral.',
                            cls: 'border-teal-200 bg-teal-50/70 text-teal-900',
                          },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setPillarFilter(pillarFilter === p.id ? 'all' : p.id)
                          }
                          className={`rounded-2xl border p-3.5 text-left transition ${p.cls} ${
                            pillarFilter === p.id ? 'ring-2 ring-sky-500 ring-offset-1' : 'hover:opacity-90'
                          }`}
                        >
                          <p className="text-xs font-extrabold">{p.title}</p>
                          <p className="mt-1 text-[11px] opacity-85 leading-snug">{p.desc}</p>
                        </button>
                      ))}
                    </div>

                    {showNewInspForm && (
                      <form
                        onSubmit={addInspiration}
                        className="mt-4 space-y-3 rounded-2xl border border-sky-200 bg-[#FAF8F5] p-4"
                      >
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          <select
                            value={newInspKind}
                            onChange={(e) =>
                              setNewInspKind(e.target.value as 'hook' | 'moodboard')
                            }
                            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                          >
                            <option value="moodboard">🖼️ Tarjeta Visual / Moodboard</option>
                            <option value="hook">⚡ Hook de 3 segundos</option>
                          </select>
                          <select
                            value={newInspPillar}
                            onChange={(e) =>
                              setNewInspPillar(e.target.value as KoratInspiration['pillar'])
                            }
                            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                          >
                            <option value="reacciones">Pilar: Reacciones Virales</option>
                            <option value="dolor_salon">Pilar: Dolor del Salón</option>
                            <option value="marca">Pilar: Marca Personal</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          value={newInspTitle}
                          onChange={(e) => setNewInspTitle(e.target.value)}
                          placeholder={
                            newInspKind === 'hook'
                              ? 'Escribe el gancho de 3 segundos...'
                              : 'Título de la idea o referencia visual...'
                          }
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold outline-none focus:border-sky-400"
                        />
                        <input
                          type="text"
                          value={newInspDesc}
                          onChange={(e) => setNewInspDesc(e.target.value)}
                          placeholder="Enfoque / cómo conectarlo con tu SaaS..."
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-sky-400"
                        />
                        {newInspKind === 'moodboard' && (
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <input
                              type="url"
                              value={newInspImg}
                              onChange={(e) => setNewInspImg(e.target.value)}
                              placeholder="URL de imagen / captura (opcional)"
                              className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-sky-400"
                            />
                            <input
                              type="url"
                              value={newInspRef}
                              onChange={(e) => setNewInspRef(e.target.value)}
                              placeholder="Enlace TikTok / IG de referencia"
                              className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-sky-400"
                            />
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-600"
                          >
                            Guardar en Pizarra
                          </button>
                        </div>
                      </form>
                    )}
                  </section>

                  {/* Zona 2: Banco de Hooks (3 segundos) */}
                  <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                      ⚡ Banco de Hooks (3 segundos)
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {inspirations
                        .filter(
                          (i) =>
                            i.kind === 'hook' &&
                            (pillarFilter === 'all' || i.pillar === pillarFilter)
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-3.5"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">&quot;{item.title}&quot;</p>
                              {item.description && (
                                <p className="mt-1 text-[11px] text-slate-500">{item.description}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => convertInspirationToScript(item)}
                              className="mt-3 self-start rounded-xl bg-teal-500 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-teal-600"
                            >
                              Usar Hook en Guion →
                            </button>
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* Zona 3: Moodboard Visual (Estilo Milanote) */}
                  <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                      🖼️ Moodboard & Referencias Visuales
                    </h3>
                    {inspirations.filter(
                      (i) =>
                        i.kind === 'moodboard' &&
                        (pillarFilter === 'all' || i.pillar === pillarFilter)
                    ).length === 0 ? (
                      <p className="rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                        Aún no hay tarjetas visuales. Usa &quot;Agregar a Pizarra&quot; para pegar
                        capturas o links de TikToks virales.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {inspirations
                          .filter(
                            (i) =>
                              i.kind === 'moodboard' &&
                              (pillarFilter === 'all' || i.pillar === pillarFilter)
                          )
                          .map((item) => (
                            <div
                              key={item.id}
                              className="overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAF8F5] flex flex-col justify-between"
                            >
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="h-36 w-full object-cover"
                                />
                              )}
                              <div className="p-3.5">
                                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                {item.description && (
                                  <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                                )}
                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => convertInspirationToScript(item)}
                                    className="rounded-xl bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-sky-600"
                                  >
                                    ⚡ Pasar a Guion
                                  </button>
                                  {item.reference_url && (
                                    <a
                                      href={item.reference_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] font-bold text-sky-600 hover:underline"
                                    >
                                      Ver ref ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </section>
                </div>
              ) : (
            <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Banco de Guiones (Reemplazo Notion)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Llevas <strong>{cockpit.recorded_today}/3</strong> videos grabados hoy · Clic en
                    un guion para ver detalles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewScriptForm(!showNewScriptForm)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-teal-600 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  {showNewScriptForm ? 'Cerrar Editor' : 'Nuevo Guion'}
                </button>
              </div>

              {/* Editor colapsable limpio */}
              {showNewScriptForm && (
                <form
                  onSubmit={addScript}
                  className="mb-5 space-y-3 rounded-2xl border border-teal-200/80 bg-[#FAF8F5] p-4"
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <input
                      type="text"
                      required
                      value={newScriptTitle}
                      onChange={(e) => setNewScriptTitle(e.target.value)}
                      placeholder="Título del guion*"
                      className="sm:col-span-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold outline-none focus:border-teal-400"
                    />
                    <select
                      value={newScriptPlatform}
                      onChange={(e) =>
                        setNewScriptPlatform(e.target.value as KoratScript['platform'])
                      }
                      className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">IG Reels</option>
                      <option value="facebook">FB Reels</option>
                      <option value="youtube">YT Shorts</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <select
                      value={newScriptStatus}
                      onChange={(e) => setNewScriptStatus(e.target.value as KoratScript['status'])}
                      className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="sin_grabar">Sin grabar</option>
                      <option value="grabado">Grabado</option>
                      <option value="editado">Editado</option>
                      <option value="publicado">Publicado</option>
                    </select>
                    <input
                      type="date"
                      value={newScriptPublishDate}
                      onChange={(e) => setNewScriptPublishDate(e.target.value)}
                      title="Fecha de publicación"
                      className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                    />
                    <input
                      type="url"
                      value={newScriptRefUrl}
                      onChange={(e) => setNewScriptRefUrl(e.target.value)}
                      placeholder="Enlace video referencia (https://...)"
                      className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-teal-400"
                    />
                  </div>

                  <input
                    type="text"
                    value={newScriptHook}
                    onChange={(e) => setNewScriptHook(e.target.value)}
                    placeholder="Ganchos / Textos dentro del video..."
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-teal-400"
                  />

                  <textarea
                    rows={3}
                    value={newScriptBody}
                    onChange={(e) => setNewScriptBody(e.target.value)}
                    placeholder="El guion completo (lo que vas a decir a cámara)..."
                    className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs outline-none focus:border-teal-400"
                  />

                  <textarea
                    rows={2}
                    value={newScriptCopy}
                    onChange={(e) => setNewScriptCopy(e.target.value)}
                    placeholder="Texto copy de la descripción + hashtags..."
                    className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs outline-none focus:border-teal-400"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-teal-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-teal-600"
                    >
                      Guardar Guion
                    </button>
                  </div>
                </form>
              )}

              {/* Filtros por Estado (Por defecto: En Cola, oculta Publicados) */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {(
                  [
                    {
                      id: 'pendientes',
                      label: `En Cola (${scripts.filter((s) => s.status !== 'publicado').length})`,
                    },
                    { id: 'sin_grabar', label: 'Sin grabar' },
                    { id: 'grabado', label: 'Grabado' },
                    { id: 'editado', label: 'Editado' },
                    {
                      id: 'publicado',
                      label: `Publicados (${scripts.filter((s) => s.status === 'publicado').length})`,
                    },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setScriptFilter(st.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                      scriptFilter === st.id
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-slate-600 hover:bg-stone-200/70'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {scripts.filter((s) =>
                  scriptFilter === 'pendientes'
                    ? s.status !== 'publicado'
                    : s.status === scriptFilter
                ).length === 0 ? (
                  <p className="rounded-2xl bg-[#FAF8F5] p-5 text-center text-xs text-slate-500">
                    No hay guiones en esta vista. Haz clic en &quot;Nuevo Guion&quot; para crear uno.
                  </p>
                ) : (
                  scripts
                    .filter((s) =>
                      scriptFilter === 'pendientes'
                        ? s.status !== 'publicado'
                        : s.status === scriptFilter
                    )
                    .map((sc) => {
                      const isExpanded = expandedScriptId === sc.id;
                      const statusColors: Record<string, string> = {
                        sin_grabar: 'bg-stone-200 text-slate-700',
                        grabado: 'bg-orange-100 text-orange-700',
                        editado: 'bg-sky-100 text-sky-700',
                        publicado: 'bg-emerald-100 text-emerald-700',
                      };
                      const statusLabels: Record<string, string> = {
                        sin_grabar: 'Sin grabar',
                        grabado: 'Grabado',
                        editado: 'Editado',
                        publicado: 'Publicado',
                      };
                      return (
                        <div
                          key={sc.id}
                          className="rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-3.5 transition hover:border-teal-300"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setExpandedScriptId(isExpanded ? null : sc.id)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <div className="flex items-center gap-2">
                                <span className="rounded-md border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                  {sc.platform}
                                </span>
                                <span className="truncate text-sm font-bold text-slate-900">
                                  {sc.title}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500">
                                Creado:{' '}
                                {sc.created_at
                                  ? new Date(sc.created_at).toLocaleDateString('es-PE')
                                  : 'Hoy'}
                                {sc.publish_date && ` · Publicar: ${sc.publish_date}`}
                              </p>
                            </button>

                            <div className="flex shrink-0 items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setReadingScript(sc)}
                                className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-sky-600"
                                title="Modo Lectura para Grabar"
                              >
                                <Maximize2 className="h-3 w-3" />
                                Leer
                              </button>
                              <button
                                type="button"
                                onClick={() => advanceScriptStatus(sc)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition hover:opacity-80 ${
                                  statusColors[sc.status] || statusColors.sin_grabar
                                }`}
                              >
                                {statusLabels[sc.status] || sc.status}
                                <ArrowUpRight className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingScript(sc)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-sky-600"
                                title="Editar guion"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteScript(sc.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"
                                title="Eliminar guion"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {editingScript?.id === sc.id && (
                            <form
                              onSubmit={saveEditingScript}
                              className="mt-3 space-y-2.5 rounded-2xl border border-sky-200 bg-sky-50/50 p-3.5"
                            >
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <input
                                  type="text"
                                  required
                                  value={editingScript.title}
                                  onChange={(e) =>
                                    setEditingScript({ ...editingScript, title: e.target.value })
                                  }
                                  className="sm:col-span-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold"
                                />
                                <select
                                  value={editingScript.platform}
                                  onChange={(e) =>
                                    setEditingScript({
                                      ...editingScript,
                                      platform: e.target.value as KoratScript['platform'],
                                    })
                                  }
                                  className="rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-xs font-bold"
                                >
                                  <option value="tiktok">TikTok</option>
                                  <option value="instagram">IG Reels</option>
                                  <option value="facebook">FB Reels</option>
                                  <option value="youtube">YT Shorts</option>
                                </select>
                              </div>
                              <input
                                type="text"
                                value={editingScript.hook || ''}
                                onChange={(e) =>
                                  setEditingScript({ ...editingScript, hook: e.target.value })
                                }
                                placeholder="Ganchos / Texto en video..."
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs"
                              />
                              <textarea
                                rows={5}
                                value={editingScript.body || ''}
                                onChange={(e) =>
                                  setEditingScript({ ...editingScript, body: e.target.value })
                                }
                                placeholder="Guion completo..."
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs leading-relaxed"
                              />
                              <textarea
                                rows={2}
                                value={editingScript.copy_description || ''}
                                onChange={(e) =>
                                  setEditingScript({
                                    ...editingScript,
                                    copy_description: e.target.value,
                                  })
                                }
                                placeholder="Copy descripción..."
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingScript(null)}
                                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="rounded-xl bg-sky-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
                                >
                                  Guardar Cambios
                                </button>
                              </div>
                            </form>
                          )}

                          {isExpanded && editingScript?.id !== sc.id && (
                            <div className="mt-3 space-y-2.5 border-t border-stone-200/80 pt-3 text-xs text-slate-700">
                              {sc.hook && (
                                <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-sm font-semibold text-teal-900">
                                  <span className="text-xs font-bold uppercase text-teal-600 block mb-0.5">
                                    Gancho / Texto en video
                                  </span>
                                  {sc.hook}
                                </div>
                              )}
                              {sc.body && (
                                <div className="rounded-xl border border-stone-200/70 bg-white p-4 text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Guion</p>
                                  {sc.body}
                                </div>
                              )}
                              {sc.copy_description && (
                                <div className="rounded-xl border border-stone-100 bg-white p-3 whitespace-pre-wrap">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-slate-800">Copy descripción:</p>
                                    <button
                                      type="button"
                                      onClick={() => copyText(sc.copy_description!, sc.id)}
                                      className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-stone-200"
                                    >
                                      {copiedId === sc.id ? (
                                        <>
                                          <Check className="h-3 w-3 text-emerald-600" /> Copiado
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3 w-3" /> Copiar
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  {sc.copy_description}
                                </div>
                              )}
                              {sc.reference_url && (
                                <a
                                  href={sc.reference_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-bold text-sky-600 hover:underline"
                                >
                                  Ver video de referencia <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </section>
              )}
            </div>
          )}

          {activeTab === 'finanzas' && (
            <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-stone-100 bg-[#FAF8F5] p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Saldo Real</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">S/ {cockpit.balance}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Ingresos</p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-700">+ S/ {totalIncome}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase text-rose-700">Gastos</p>
                  <p className="mt-1 text-lg font-extrabold text-rose-700">- S/ {totalExpense}</p>
                </div>
              </div>

              <form onSubmit={addFinanceMovement} className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-4">
                <select
                  value={finType}
                  onChange={(e) => setFinType(e.target.value as 'income' | 'expense')}
                  className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-3 py-2.5 text-sm font-medium outline-none"
                >
                  <option value="income">Ingreso (+)</option>
                  <option value="expense">Gasto (-)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={finAmount}
                  onChange={(e) => setFinAmount(e.target.value)}
                  placeholder="Monto S/"
                  className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                />
                <input
                  type="text"
                  value={finCategory}
                  onChange={(e) => setFinCategory(e.target.value)}
                  placeholder="Ej: Ads Cuñada, Comida Gatos..."
                  className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Registrar
                </button>
              </form>

              <div className="space-y-2.5">
                {finances.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-2xl border border-stone-100 bg-[#FAF8F5] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{f.category}</p>
                      <p className="text-xs text-slate-500">{f.note}</p>
                    </div>
                    <span
                      className={`text-sm font-extrabold ${
                        f.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {f.type === 'expense' ? '-' : '+'} S/ {f.amount}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'rachas' && (
            <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-base font-bold text-slate-900">Rachas Diarias (Meta 30 días)</h2>
              </div>
              <div className="space-y-3">
                {streaks.map((streak) => {
                  const checkedToday = Boolean(todayStr && streak.last_checked_date === todayStr);
                  return (
                    <div
                      key={streak.id}
                      className="rounded-2xl border border-stone-100 bg-[#FAF8F5] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{streak.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{streak.description}</p>
                        </div>
                        <span className="rounded-xl bg-orange-100 px-2.5 py-1 text-xs font-extrabold text-orange-700">
                          {streak.current_streak}d
                        </span>
                      </div>
                      <button
                        onClick={() => checkInStreak(streak)}
                        disabled={checkedToday}
                        className={`mt-3 w-full rounded-xl py-2 text-xs font-bold transition ${
                          checkedToday
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                        }`}
                      >
                        {checkedToday ? '✓ Cumplido hoy' : 'Marcar día cumplido'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* Right Column: Radar Korat (Parametric Intelligence Engine) */}
        <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 text-white">
                <Radar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Radar Korat · En Vivo</h2>
                <p className="text-[11px] font-medium text-emerald-600">
                  Inteligencia paramétrica desde Supabase
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Supervivencia */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
                <p className="text-xs font-bold text-sky-800">Colchón de Supervivencia</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  Tienes <strong>S/ {cockpit.balance}</strong> (~{runwayDays} días cubiertos a S/
                  500/mes).
                </p>
              </div>

              {/* Brecha SaaS */}
              <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3.5">
                <p className="text-xs font-bold text-orange-800">Brecha SaaS Salones</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {clientsNeededForBase === 0
                    ? '¡Base de S/ 500 cubierta al 100% con recurrentes!'
                    : `Te faltan ${clientsNeededForBase} clienta(s) de S/ 150 para cubrir tu base mensual de S/ 500.`}
                </p>
                {cockpit.paying_count > 0 && (
                  <p className="mt-1.5 text-[11px] font-semibold text-orange-900/80">
                    Próximo cobro: 1ro de mes · Glamour y Capricho (Boleta S/ 150)
                  </p>
                )}
              </div>

              {/* Alerta Rachas */}
              {cockpit.unchecked_streaks > 0 ? (
                <div className="flex items-start justify-between gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs leading-relaxed text-amber-900">
                      Tienes <strong>{cockpit.unchecked_streaks} racha(s)</strong> sin marcar hoy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rachas')}
                    className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-amber-700"
                  >
                    Marcar
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-xs leading-relaxed text-emerald-900">
                    Todas tus rachas de hoy están cumplidas. Energía protegida.
                  </p>
                </div>
              )}

              {/* Freno de Voz */}
              {cockpit.recorded_today >= 3 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5">
                  <p className="text-xs font-bold text-rose-800">Freno de Voz Activado</p>
                  <p className="mt-1 text-xs text-rose-700">
                    Ya grabaste {cockpit.recorded_today} videos hoy. Descansa la voz y pasa a editar
                    o producto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Modo Lectura / Teleprompter para Grabar */}
      {readingScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-[#FAF8F5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-6 py-4 rounded-t-3xl">
              <div>
                <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-800">
                  Modo Grabación · {readingScript.platform}
                </span>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                  {readingScript.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingScript(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-stone-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {readingScript.hook && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    Gancho / Texto en pantalla
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-teal-950">
                    {readingScript.hook}
                  </p>
                </div>
              )}

              {readingScript.copy_description && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Detalles de Grabación & Psicología
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs font-medium leading-relaxed text-amber-950">
                    {readingScript.copy_description}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Guion Completo
                </p>
                <p className="whitespace-pre-wrap text-lg font-medium leading-loose text-slate-900 sm:text-xl">
                  {readingScript.body || 'Sin texto de guion todavía.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200/80 bg-white px-6 py-4 rounded-b-3xl">
              <button
                type="button"
                onClick={() => {
                  advanceScriptStatus(readingScript);
                  setReadingScript(null);
                }}
                className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-600"
              >
                ✓ Marcar siguiente estado
              </button>
              <button
                type="button"
                onClick={() => setReadingScript(null)}
                className="rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-stone-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-stone-200 bg-white/95 py-2 backdrop-blur-md lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold ${
                isActive ? 'text-sky-600' : 'text-slate-400'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? item.color : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
