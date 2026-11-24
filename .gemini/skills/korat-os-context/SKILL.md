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
- **Posicionamiento Korat Flow / Nilah IA:** Sistema de **Fidelización Digital y Blindaje de Clientes por WhatsApp** para salones de belleza y estética (NO es un bot frío genérico ni un software contable pesado; es una experiencia interactiva sin apps externas).
  - **Módulo 1: Club Glow (Sellos Digitales VIP):**
    - Billetera móvil interactiva en WhatsApp (Webview sin login, hitos 4, 8 y 12 sellos).
    - Motor anti-fraude (ticket mínimo por sello, control por cita) y Wizard Glow (asistente de margen que asegura costo de regalos <= 10-15%).
  - **Módulo 2: Escudo de Reseñas Post-Cita (Filtro 1 a 5 Estrellas & Auditoría de Staff):**
    - Combate el "Efecto Abandono" (la clienta siente que su opinión importa de verdad; si no le gustó algo se desahoga en privado y no en Google Maps).
    - Permite a la dueña auditar a las estilistas cuando no está en el local.
    - 4-5 ⭐: Agradecimiento automático + acredita sellos con confeti y link a tarjeta online (+ opción Google Reviews).
    - 1-3 ⭐ (Control de Daños): Desvía de inmediato en privado a la dueña/administradora para resolver en caliente. Los sellos se acreditan a las 24h para separar la queja del premio.
  - **Módulo 3: Cumpleaños VIP en 2 Tiempos:**
    - Tiempo 1 (6 días antes): Inteligencia de sellos (si tiene 1 sello le regala 2 para dejarla a 1 de ganar premio e incentivar visita; o regalo directo de cortesía para salones sin sellos).
    - Tiempo 2 (Día exacto): Mensaje cálido de felicitación y conexión emocional.
  - **Módulo 4: Guardián Pre-Cita Anti No-Show:**
    - Recordatorio 24h antes (confirmar/reprogramar) + recordatorio 3h antes (ubicación exacta y tips).
  - **Módulo 5: Guía de Cuidados Post-Cita en 2 Tiempos:**
    - Tiempo 1 (24h): Cuidados críticos inmediatos por servicio (ej. no mojar pestañas o lavar tras keratina).
    - Tiempo 2 (7-10d): Tips de mantenimiento para prolongar duración y preparar el terreno del retoque. (2 tiempos en lugar de 3 para no fatigar el chat).
  - **Módulo 6: Radar de Retoque en 2 Tiempos & Rescate Cálido:**
    - Tiempo 1 (18-21d): Retoque preventivo según servicio (uñas, tinte, pestañas).
    - Tiempo 2 (35-40d): Rescate apoyado en beneficios activos de Club Glow (cero sensación de spam, cero mensajes fríos a 60/120d).
  - **Módulo 7: Micro-Campañas Festivas (Drip Engine):**
    - Fechas clave (San Valentín, Día de la Madre, Navidad) con 10-14 días de anticipación.
    - Disparo por goteo quirúrgico (5 a 12 mensajes diarios por salón con delays de 25-55s) segmentados por servicio para no saturar recepción ni alertar a Meta.
  - **Seguridad en WhatsApp (Evolution API / Meta):** Cero spam frío descontrolado. Kill-switch de 25-30 mensajes salientes diarios max por salón.
  - **Packaging:** Vender como Sistema Integral en **DÓLARES** (**Nilah Glow $69 USD/mes** y **Nilah Pro $109 USD/mes**) y NO desmembrado en módulos individuales de $20.
- **Motor de Píldoras Virales (`beauty-salon-hooks-engine`):**
  - **Lectura Obligatoria Previa:** El agente DEBE leer `nilah-saas-architecture` antes de escribir cualquier guion para reflejar con precisión matemática las funciones reales (ej. Cumpleaños en 2 tiempos: T1 exactamente 7 días / 1 semana antes con regalo/sellos + T2 el día exacto solo felicitando; Sellos hitos 4-8-12; Calificación post-cita 1-5⭐).
  - Estructura fija de 30 a 45 segundos para producción masiva (3 videos diarios).
  - Apertura obligatoria con **Visual Pattern Interrupt Tripartito** (Firma 1 a 6: *"Si tu X se ve así 📸, así 📸, o así 📸..."* con 3 imágenes superpuestas en <2.5s y SFX pop-pop-pop).
  - **Desglose Neuro-Conversacional Obligatorio:** En cada plantilla de mensaje compartida, explicar brevemente la psicología y UX conversacional de por qué funciona (reducir carga cognitiva, anclaje de valor, técnica del doble cierre) frente a los mensajes fríos habituales.
  - Cero venta comercial (cero CTA de compra o DM; remate seco de autoridad).
  - Precios y finanzas exclusivamente en **DÓLARES ($USD)**.
- **Perfil Maestro:** Leer `korat-perfil-maestro.md` en la raíz del workspace.
- **Regla de Guiones (`korat-guionista`):**
  - Claridad nivel niño de 11 años (cero tecnicismos, frases cortas; si no se entiende fácil, no funciona).
  - Formato: **Talking-Head Híbrido con Motion Graphics Editoriales** (combina la presencia humana grabada en oficina con el motor de Motion Design en Concat + HyperFrames: Cutout de silueta en PiP, living canvas blanco perla/lila, tarjetas de producto en WhatsApp, confeti y SFX orgánicos).
  - Estilo de locución: Conversación natural, español neutro con "tú" (sin voseo). **PROHIBIDO decir "amiga"** (trato directo y profesional de igual a igual).
  - **Entrega de Valor con Plantilla Gratuita (Cero Fricción Comercial):** En cada video dar la solución manual lista para copiar y pegar: *"Esto yo lo tengo en automático, pero si tú lo haces manual, copia este mensaje exacto y mándalo hoy mismo"*.
  - **Cero Call to Action de Venta (Zero Hard-Selling CTA):** No pedir que compren ni que comenten palabras clave para venderles. Terminar de golpe con una frase de remate contundente sobre el negocio del salón.
  - **Estructura de Guion con Dirección Visual & SFX:** Cada guion debe incluir:
    1. Lo que dices en voz alta a cámara.
    2. El plano de cámara (`FULL_CAM` o `PIP_CORNER` con silueta sin fondo).
    3. La escena gráfica que se va construyendo de fondo (la metáfora visual).
    4. El efecto de sonido sugerido (SFX: *pop, whoosh, chaching, ding, papel arrugándose*).
  - Entregar siempre en 2 versiones (**A guion técnico audiovisual completo** y **B anclas de locución rápida**).
