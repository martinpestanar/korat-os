---
name: korat-os-context
description: Contexto técnico y personal maestro de Martín Korat. Usar siempre al trabajar en Korat OS para recordar la base de datos exacta en Supabase y las reglas del proyecto.
---

# Korat OS — Contexto Técnico y Base de Datos

- **Proyecto Supabase Activo (MCP):** `https://wquuhycqbdeysqxzwlun.supabase.co`
- **Publishable Key:** `sb_publishable_GWVt4qW76NynMLHZKglZ_Q_fuuU7Ncf`
- **Prefijo de Tablas:** Todas las tablas de esta webapp usan `korat_` (`korat_tasks`, `korat_streaks`, `korat_finances`, `korat_scripts`, `korat_saas_leads`, `korat_messages`).
- **RPCs Activas:** `get_daily_cockpit()`, `add_finance_movement(p_type, p_amount, p_category, p_note)`, `check_in_streak(p_streak_id)`.
- **Trigger Activo:** `trg_saas_lead_to_finance` (cuando un lead pasa a `paying`, registra ingreso automático en `korat_finances`).
- **Ubicación de Martín:** Huaral, Lima, Perú.
- **Perfil Maestro:** Leer `korat-perfil-maestro.md` en la raíz del workspace.
- **Regla de Guiones (`korat-guionista`):**
  - Claridad nivel niño de 11 años (cero tecnicismos, frases cortas; si no se entiende fácil, no funciona).
  - Formato *yapping* (40-90s), español neutro con "tú" (sin voseo), dirigirse a dueñas de salones como **"amiga"**.
  - Serie fija: `"Haz que vuelva, tip número X"` (en pantalla: `"Haz que vuelva #X"`).
  - Estructura "Y, Pero, Por lo tanto" (ABT) camuflada + variar el Pack de 13 Ganchos.
  - 9 de cada 10 videos sin oferta (solo valor); entregar siempre en 2 versiones (**A completo** y **B anclas**).
