---
name: korat-ui-design
description: Sistema de Diseño Moderno UI/UX para Korat OS (Vibe Surf Minimalista, Light Mode, jerarquía visual estricta y colores semánticos). Leer siempre antes de crear o modificar cualquier pantalla.
---

# Korat OS — Sistema de Diseño UI/UX Moderno

## 1. Paleta Base (Solo Modo Claro)
- **Fondo general (Canvas):** `#FAF8F5` (arena suave que no cansa la vista).
- **Superficie de tarjetas (Nivel 2):** `#FFFFFF` con borde `border-stone-200/80` y `rounded-3xl`.
- **Superficie interna (Nivel 3 / Inputs):** `#FAF8F5` para crear contraste claro entre el contenedor y sus items.

## 2. Colores Semánticos (Cada color comunica algo)
Nunca usar colores decorativos al azar:
- **Sky / Océano (`sky-500`):** Navegación activa, foco del día y acciones principales.
- **Emerald (`emerald-500`):** Dinero entrando, clientes activos/pagando, rachas cumplidas.
- **Orange / Coral (`orange-500`):** Ventas, módulos de pago de Nilah IA, prioridades comerciales.
- **Amber (`amber-500`):** Recordatorios de cobro/boleta, advertencias suaves, rachas sin marcar.
- **Rose (`rose-500`):** Gastos, límite de voz alcanzado (3/3 videos), acciones destructivas (eliminar).
- **Teal (`teal-500`):** Creatividad, guiones, hooks y pizarra visual.

## 3. Jerarquía Visual en 3 Niveles
1. **Nivel 1 (Métricas Brújula):** Números `text-2xl` / `text-3xl font-extrabold`, máximo 3 tarjetas por fila, con barra de progreso si hay meta.
2. **Nivel 2 (Bloques de Trabajo):** Títulos `text-base font-bold text-slate-900`, subtítulos cortos `text-xs text-slate-500`.
3. **Nivel 3 (Badges y Metadatos):** Pills `rounded-full text-[11px] font-bold` con contraste alto sobre fondo suave.
