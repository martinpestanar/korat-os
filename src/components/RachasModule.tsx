'use client';

import { Flame, Trophy, Crown, Zap, ShieldCheck, Sparkles, CheckCircle2, Target } from 'lucide-react';
import type { KoratStreak } from '@/lib/supabase';

interface RachasModuleProps {
  streaks: KoratStreak[];
  todayStr: string;
  onCheckIn: (streak: KoratStreak) => void;
}

interface StreakTier {
  label: string;
  badgeClass: string;
  barClass: string;
  glowClass: string;
  icon: React.ElementType;
}

function getStreakTier(days: number): StreakTier {
  if (days >= 30) {
    return {
      label: 'Leyenda',
      badgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
      barClass: 'from-amber-400 via-yellow-400 to-orange-500',
      glowClass: 'border-amber-300/80 shadow-amber-500/10',
      icon: Crown,
    };
  }
  if (days >= 21) {
    return {
      label: 'Titán',
      badgeClass: 'bg-violet-500/15 text-violet-700 border-violet-300',
      barClass: 'from-violet-500 to-fuchsia-500',
      glowClass: 'border-violet-200 shadow-violet-500/10',
      icon: Crown,
    };
  }
  if (days >= 14) {
    return {
      label: 'Imparable',
      badgeClass: 'bg-rose-500/15 text-rose-700 border-rose-300',
      barClass: 'from-rose-500 to-orange-500',
      glowClass: 'border-rose-200 shadow-rose-500/10',
      icon: Flame,
    };
  }
  if (days >= 7) {
    return {
      label: 'En Llamas',
      badgeClass: 'bg-orange-500/15 text-orange-700 border-orange-300',
      barClass: 'from-orange-500 to-amber-500',
      glowClass: 'border-orange-200 shadow-orange-500/10',
      icon: Flame,
    };
  }
  if (days >= 3) {
    return {
      label: 'Constante',
      badgeClass: 'bg-sky-500/15 text-sky-700 border-sky-300',
      barClass: 'from-sky-500 to-teal-400',
      glowClass: 'border-sky-200 shadow-sky-500/10',
      icon: Zap,
    };
  }
  return {
    label: 'Chispa',
    badgeClass: 'bg-stone-200/70 text-stone-700 border-stone-300',
    barClass: 'from-slate-400 to-slate-500',
    glowClass: 'border-stone-200/90',
    icon: Sparkles,
  };
}

function getGlobalRank(totalDays: number): { title: string; subtitle: string } {
  if (totalDays >= 100) return { title: 'Leyenda Korat', subtitle: 'Disciplina de élite inquebrantable' };
  if (totalDays >= 50) return { title: 'Maestro del Hábito', subtitle: 'Tu consistencia ya es tu ventaja injusta' };
  if (totalDays >= 20) return { title: 'Forjador Imparable', subtitle: 'El impulso está de tu lado' };
  if (totalDays >= 7) return { title: 'Guerrero Constante', subtitle: 'Construyendo acero diario' };
  return { title: 'Iniciado', subtitle: 'Cada día sellado suma poder' };
}

const MILESTONES = [7, 14, 21, 30];

export function RachasModule({ streaks, todayStr, onCheckIn }: RachasModuleProps) {
  const totalStreaks = streaks.length;
  const completedToday = streaks.filter((s) => Boolean(todayStr && s.last_checked_date === todayStr)).length;
  const dailyPct = totalStreaks > 0 ? Math.round((completedToday / totalStreaks) * 100) : 0;
  const allDoneToday = totalStreaks > 0 && completedToday === totalStreaks;

  const totalCurrentDays = streaks.reduce((acc, s) => acc + s.current_streak, 0);
  const maxCurrent = streaks.reduce((max, s) => Math.max(max, s.current_streak), 0);
  const maxBest = streaks.reduce((max, s) => Math.max(max, s.best_streak), 0);
  const globalRank = getGlobalRank(totalCurrentDays);

  return (
    <section className="space-y-5">
      {/* Hero Banner: Arena de Disciplina */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/90 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <Crown className="h-3.5 w-3.5" />
              {globalRank.title}
            </div>
            <h2 className="mt-2.5 text-2xl font-black tracking-tight text-white">
              Arena de Rachas
            </h2>
            <p className="mt-1 text-xs text-slate-300">{globalRank.subtitle}</p>
          </div>

          {/* Daily Energy Ring / Pill */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xs">
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Energía de Hoy
              </p>
              <p className="text-xl font-black text-white">
                {completedToday}/{totalStreaks}{' '}
                <span className="text-xs font-bold text-amber-400">({dailyPct}%)</span>
              </p>
              <p className="text-[11px] font-medium text-emerald-400">
                {allDoneToday ? 'Día Invicto · 100% Sellado' : `${totalStreaks - completedToday} pendiente(s) hoy`}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                allDoneToday
                  ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                  : 'border-amber-400/40 bg-amber-500/20 text-amber-300'
              }`}
            >
              {allDoneToday ? <ShieldCheck className="h-6 w-6" /> : <Flame className="h-6 w-6" />}
            </div>
          </div>
        </div>

        {/* Daily Progress Bar */}
        <div className="relative mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allDoneToday
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                  : 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300'
              }`}
              style={{ width: `${dailyPct}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Racha Activa Top
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-lg font-black text-orange-400">
              <Flame className="h-4 w-4" />
              {maxCurrent}d
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Récord Histórico
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-lg font-black text-amber-300">
              <Trophy className="h-4 w-4" />
              {maxBest}d
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Días Acumulados
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-lg font-black text-sky-300">
              <Zap className="h-4 w-4" />
              {totalCurrentDays}d
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {streaks.length === 0 && (
        <div className="rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-sm">
          <Flame className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-2 text-sm font-bold text-slate-700">No hay rachas configuradas aún</p>
        </div>
      )}

      {/* Streak Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {streaks.map((streak) => {
          const checkedToday = Boolean(todayStr && streak.last_checked_date === todayStr);
          const target = streak.target_days || 30;
          const progressPct = Math.min(100, Math.round((streak.current_streak / target) * 100));
          const tier = getStreakTier(streak.current_streak);
          const TierIcon = tier.icon;
          const isNewRecord = streak.current_streak > 0 && streak.current_streak >= streak.best_streak;

          return (
            <div
              key={streak.id}
              className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                checkedToday ? 'border-emerald-300/90 bg-gradient-to-b from-emerald-50/40 to-white' : tier.glowClass
              }`}
            >
              <div>
                {/* Top Row: Tier Badge & Record */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tier.badgeClass}`}
                  >
                    <TierIcon className="h-3 w-3" />
                    {tier.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isNewRecord ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                        <Trophy className="h-3 w-3 text-amber-600" />
                        RÉCORD
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Récord: {streak.best_streak}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Counter */}
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{streak.name}</h3>
                    {streak.description && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {streak.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 rounded-2xl bg-[#FAF8F5] px-3 py-2 text-center border border-stone-200/70">
                    <div className="flex items-center justify-center gap-1 text-orange-600">
                      <Flame className="h-4 w-4 fill-orange-500/20" />
                      <span className="text-lg font-black leading-none">{streak.current_streak}</span>
                    </div>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      días
                    </p>
                  </div>
                </div>

                {/* Progress Bar toward Target */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Target className="h-3.5 w-3.5 text-slate-400" />
                      Meta {target} días
                    </span>
                    <span className="text-slate-700">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                        checkedToday ? 'from-emerald-500 to-teal-400' : tier.barClass
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="mt-3 flex items-center justify-between gap-1.5">
                  {MILESTONES.map((m) => {
                    const reached = streak.current_streak >= m;
                    return (
                      <div
                        key={m}
                        className={`flex-1 rounded-xl py-1 text-center text-[10px] font-bold transition ${
                          reached
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-stone-50 text-stone-400 border border-stone-100'
                        }`}
                      >
                        {m}d {reached ? '★' : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onCheckIn(streak)}
                disabled={checkedToday}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-extrabold transition-all ${
                  checkedToday
                    ? 'cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]'
                }`}
              >
                {checkedToday ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Sellado hoy · Racha protegida
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    Sellar día (+1)
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
