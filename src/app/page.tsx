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
} from 'lucide-react';
import {
  supabase,
  KoratTask,
  KoratStreak,
  KoratFinance,
  KoratScript,
  KoratSaasLead,
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
  { id: 'saas', label: 'SaaS Salones', icon: Store, color: 'text-orange-500' },
  { id: 'contenido', label: 'Guiones', icon: Clapperboard, color: 'text-teal-500' },
  { id: 'finanzas', label: 'Finanzas', icon: BadgeDollarSign, color: 'text-emerald-500' },
  { id: 'rachas', label: 'Rachas', icon: Trophy, color: 'text-amber-500' },
];

const CATEGORY_STYLES: Record<TaskCategory, { label: string; badge: string }> = {
  producto: { label: 'Producto SaaS', badge: 'bg-sky-100 text-sky-700 border-sky-200' },
  ventas_contenido: { label: 'Ventas / TikTok', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  mantenimiento: { label: 'FB / Rutina', badge: 'bg-teal-100 text-teal-700 border-teal-200' },
  personal: { label: 'Personal / Gatos', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
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
    const [cRes, tRes, sRes, fRes, scRes, lRes] = await Promise.all([
      supabase.rpc('get_daily_cockpit'),
      supabase.from('korat_tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_streaks').select('*').order('created_at', { ascending: true }),
      supabase.from('korat_finances').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_scripts').select('*').order('created_at', { ascending: false }),
      supabase.from('korat_saas_leads').select('*').order('created_at', { ascending: false }),
    ]);

    if (cRes.data) setCockpit(cRes.data as CockpitMetrics);
    if (tRes.data) setTasks(tRes.data);
    if (sRes.data) setStreaks(sRes.data);
    if (fRes.data) setFinances(fRes.data);
    if (scRes.data) setScripts(scRes.data);
    if (lRes.data) setLeads(lRes.data);
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
      .insert({ title: newScriptTitle.trim(), status: 'idea', platform: 'tiktok' })
      .select()
      .single();
    if (data) setScripts([data, ...scripts]);
    setNewScriptTitle('');
  }

  async function advanceScriptStatus(script: KoratScript) {
    const order: KoratScript['status'][] = ['idea', 'guion', 'grabado', 'publicado'];
    const next = order[(order.indexOf(script.status) + 1) % order.length];
    setScripts(scripts.map((s) => (s.id === script.id ? { ...s, status: next } : s)));
    await supabase
      .from('korat_scripts')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', script.id);
    refreshCockpit();
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

  async function saveLeadWhatsapp(leadId: string) {
    await supabase
      .from('korat_saas_leads')
      .update({ whatsapp: editWhatsapp.trim() || null })
      .eq('id', leadId);
    setEditingLeadId(null);
    setEditWhatsapp('');
    loadAllData();
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
                Huaral, Lima · Foco: SaaS Salones ({cockpit.paying_count}/10 clientas)
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
              {/* Barra Semanal de Días Temáticos */}
              <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Semana Temática
                  </span>
                  <span className="text-[11px] font-semibold text-sky-600">
                    Ritmo sostenible · Sin quemarse
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {[
                    { day: 'Lun', theme: 'Ideas/Guion', color: 'bg-teal-50 text-teal-700 border-teal-200' },
                    { day: 'Mar', theme: 'Grabar (3)', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                    { day: 'Mié', theme: 'Editar/Subir', color: 'bg-sky-50 text-sky-700 border-sky-200' },
                    { day: 'Jue', theme: 'Full SaaS', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                    { day: 'Vie', theme: 'Grabar/Leads', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                    { day: 'Sáb', theme: 'Fútbol 4pm', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { day: 'Dom', theme: 'Plan/Cierre', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  ].map((d) => (
                    <div
                      key={d.day}
                      className={`rounded-xl border px-1 py-2 ${d.color}`}
                    >
                      <p className="text-[11px] font-extrabold">{d.day}</p>
                      <p className="mt-0.5 text-[9px] font-semibold leading-tight">{d.theme}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Caja Real
                    </span>
                    <div className="rounded-xl bg-sky-50 p-2 text-sky-500">
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">S/ {cockpit.balance}</p>
                  <p className="mt-1 text-xs text-slate-500">~{runwayDays} días de colchón</p>
                </div>

                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      MRR SaaS
                    </span>
                    <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">S/ {cockpit.mrr}</p>
                  <p className="mt-1 text-xs text-slate-500">{cockpit.paying_count} clienta(s) pagando</p>
                </div>

                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Grabados Hoy
                    </span>
                    <div className="rounded-xl bg-teal-50 p-2 text-teal-500">
                      <Film className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {cockpit.recorded_today} / 3
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Límite sano de voz</p>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-slate-900">Hoy en tu oficina</h2>
                  <p className="text-xs text-slate-500">
                    Tus prioridades del día para arrancar con claridad a las 11:30 am.
                  </p>
                </div>

                <form onSubmit={addTask} className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ej: Mejorar UX móvil del módulo Inbox..."
                    className="flex-1 rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="rounded-2xl border border-stone-200 bg-[#FAF8F5] px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-sky-400"
                  >
                    <option value="producto">Producto SaaS</option>
                    <option value="ventas_contenido">Ventas / TikTok</option>
                    <option value="mantenimiento">FB / Rutina</option>
                    <option value="personal">Personal / Gatos</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </form>

                {loading ? (
                  <p className="text-sm text-slate-400">Cargando tu oficina...</p>
                ) : tasks.length === 0 ? (
                  <p className="rounded-2xl bg-[#FAF8F5] p-4 text-center text-sm text-slate-500">
                    No hay tareas todavía. Agrega tu primera prioridad de hoy.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {tasks.map((task) => {
                      const style = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.producto;
                      return (
                        <li
                          key={task.id}
                          onClick={() => toggleTask(task)}
                          className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-100 bg-[#FAF8F5]/60 px-4 py-3 transition hover:border-sky-200 hover:bg-sky-50/30"
                        >
                          <div className="flex items-center gap-3">
                            {task.status === 'done' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style.badge}`}
                          >
                            {style.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}

          {activeTab === 'saas' && (
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

          {activeTab === 'contenido' && (
            <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Banco de Guiones (TikTok / IG / FB)</h2>
                  <p className="text-xs text-slate-500">
                    Llevas {cockpit.recorded_today}/3 videos grabados hoy. Clic en el estado para avanzar.
                  </p>
                </div>
              </div>

              <form onSubmit={addScript} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newScriptTitle}
                  onChange={(e) => setNewScriptTitle(e.target.value)}
                  placeholder="Ej: Reacción a clienta que se pone gel encima del retoque..."
                  className="flex-1 rounded-2xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:bg-white"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
                >
                  <Plus className="h-4 w-4" />
                  Guardar
                </button>
              </form>

              <div className="space-y-2.5">
                {scripts.length === 0 ? (
                  <p className="rounded-2xl bg-[#FAF8F5] p-4 text-center text-sm text-slate-500">
                    Tu banco de guiones está vacío. Anota tu primera idea viral.
                  </p>
                ) : (
                  scripts.map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between rounded-2xl border border-stone-100 bg-[#FAF8F5] px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-800">{sc.title}</span>
                      <button
                        onClick={() => advanceScriptStatus(sc)}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-bold uppercase text-teal-700 transition hover:bg-teal-200"
                      >
                        {sc.status}
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'finanzas' && (
            <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Finanzas & Caja</h2>
                  <p className="text-xs text-slate-500">
                    Saldo calculado en vivo: <strong>S/ {cockpit.balance}</strong>
                  </p>
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
                <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-xs leading-relaxed text-amber-900">
                    Tienes <strong>{cockpit.unchecked_streaks} racha(s)</strong> sin marcar hoy.
                    Ciérralas antes de dormir.
                  </p>
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
