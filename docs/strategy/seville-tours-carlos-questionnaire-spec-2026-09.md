# Carlos Questionnaire Specification — Spanish-first, conditional

**Status:** Specification for a web questionnaire. **Not built.** Research instrument, not a sales form.
**Version:** 1.0 — 2026-09-21
**Target completion:** 6–8 minutes maximum. **Nobody answers all 73 questions.**
**Companion:** [recording pack](./seville-tours-carlos-demo-recording-pack-2026-09.md) · [field card](./operator-handoff-field-card-2026-09.md)

---

## 0. Rules the implementation must obey

**Spanish first.** Spanish is the default language and the only one Carlos sees unless he switches. English strings exist for our own analysis, not for him.

**Conditional by design.** Section B always runs. C–G run only when the matching demo was watched or the matching branch triggers. A respondent who watched only Demo 1 answers roughly 20 questions, not 73.

**Past facts only.** Every question is about something that already happened. No "would you use", except where explicitly marked as a preference probe and read as weak evidence.

**Free text is optional everywhere.** Every scale question carries an "prefiero no decirlo" escape.

### Privacy — enforced, not requested

The form must **not request and must not accept**:

- traveller names · phone numbers · email addresses · passport details
- payment details · voucher codes · booking references
- raw screenshots · identifiable message content

Implementation: no file upload control at all, and free-text fields carry a visible note — *"No incluyas datos de viajeros, códigos ni capturas."* If a field is later suspected of collecting identifiers, delete the response rather than redact it.

---

## 1. Section A — Comprehension *(always, 4 questions)*

| # | ES | Type |
|---|---|---|
| 1 | ¿Qué crees que está haciendo Para Usted en estos vídeos? | Free text |
| 2 | ¿Qué demo te parece más relevante para tu negocio? | Single choice: 1 / 2 / 3 / ninguna |
| 3 | ¿Qué parte te ha parecido engañosa o exagerada? | Free text |
| 4 | ¿Qué parte te crearía trabajo extra? | Free text |

**Q3 is the most valuable question in the whole form.** If it comes back empty, ask it again verbally.

---

## 2. Section B — Direct and bespoke enquiries *(always, 12 questions)*

| # | ES | Type |
|---|---|---|
| 5 | Piensa en la última consulta privada importante. ¿Qué era? | Free text, no identifiers |
| 6 | ¿Dónde empezó? | WhatsApp / email / teléfono / web / OTA / otro |
| 7 | ¿Por qué canales pasó antes de cerrarse? | Multi-select |
| 8 | ¿Qué tuviste que preguntar tú que no te habían dicho? | Free text |
| 9 | ¿Cuánto tiempo tuyo llevó, aproximadamente? | <15 min / 15–45 / 45–120 / >2 h |
| 10 | ¿Se convirtió? | Sí / no / sigue abierta |
| 11 | Rango aproximado de valor de la reserva | <€100 / €100–300 / €300–800 / €800–2.000 / >€2.000 / prefiero no decirlo |
| 12 | ¿Cuántas consultas parecidas en tu última temporada comparable? | Number band |
| 13 | ¿Lo que haces hoy para esto es suficiente? | 1–5 |
| 14 | ¿Qué pregunta al viajero añadirías? | Free text |
| 15 | ¿Qué pregunta sobra o es intrusiva? | Free text |
| 16 | ¿Un resumen ya revisado por el viajero te quitaría trabajo? | 1–5 + free text |

**Q13 is a kill gate.** A 4 or 5 means do not build, regardless of how interesting Q16 sounds.

---

## 3. Section C — WordPress catalogue *(if Demo 1 watched, 7 questions)*

17. ¿El catálogo actual de la web representa bien lo que vendes de verdad?
18. ¿Qué productos o condiciones te cuesta mantener al día?
19. ¿Qué datos de una recomendación tienen que venir sólo de ti?
20. ¿Qué información se puede leer con seguridad de la web?
21. ¿Qué requiere siempre confirmación directa?
22. ¿Te ayuda que se busque sólo dentro de tu propio catálogo? *(1–5)*
23. ¿Qué no se debería deducir nunca del catálogo?

**Q19 and Q23 define the guardrails.** They convert directly into code constraints.

---

## 4. Section D — Off-catalogue requests *(if Demo 1 watched, 6 questions)*

**24.** Frequency grid — *nunca / alguna vez / a menudo / constantemente* for each of: comida · restaurantes · hoteles · transporte · recogida en aeropuerto · conductores · eventos · entradas · experiencias fuera de tu catálogo.

25. ¿Qué haces hoy con esas peticiones?
26. ¿Cuáles tienen valor para ti?
27. ¿Cuáles son una distracción?
28. ¿Cuáles deberían quedarse como pregunta y no convertirse en producto?
29. ¿Qué tipos de profesional ya tienes de confianza?

---

## 5. Section E — Operator collaboration *(if Demo 2 watched, 12 questions)*

| # | ES |
|---|---|
| 30 | ¿Cuándo fue la última vez que pasaste una petición a otro profesional? |
| 31 | ¿Qué le mandaste? |
| 32 | ¿Qué te tuvo que volver a preguntar? |
| 33 | ¿Quién siguió dando la cara ante el viajero? |
| 34 | ¿Cuántos casos así en tu última temporada comparable? |
| 35 | Rango de valor aproximado |
| 36 | ¿Cómo elegiste a esa persona? |
| 37 | ¿Qué esperarías razonablemente a cambio? *(multi: atribución · negocio recíproco · comisión · ver el resultado · mantener la relación con el viajero · nada)* |
| 38 | ¿Ayudaría que el otro profesional viera primero una petición anónima? *(1–5)* |
| 39 | ¿Ayudaría que el viajero revisara qué se comparte? *(1–5)* |
| 40 | ¿Ayudaría el recibo de introducción? *(1–5)* |
| 41 | ¿Qué lo convertiría en otro eslabón inútil? |

**Q34 is the headline number for the whole research effort.** Q37 decides whether attribution alone is a product.

---

## 6. Section F — Four-day private request *(if Demo 2 watched, 10 questions)*

42. ¿Prestas todos los servicios directamente?
43. ¿Subcontratas?
44. ¿El viajero reserva cada servicio por separado?
45. ¿Quién fija el precio?
46. ¿Quién cobra?
47. ¿Quién responde si falla otro proveedor?
48. ¿Dónde está guardada la versión más completa de la petición?
49. ¿Qué incógnita te impide dar precio?
50. ¿Una vista de "incógnitas que bloquean" te quitaría trabajo? *(1–5)*
51. ¿Qué preocupación legal o comercial frenaría este modelo?

**Q47 and Q51 are where the Package Travel exposure surfaces.** Record the wording exactly; do not paraphrase into our own vocabulary.

---

## 7. Section G — Gift card and post-trip *(if Demo 3 watched, 11 questions)*

52. ¿Cuántas tarjetas regalo vendes, aproximadamente?
53. ¿De qué tipos?
54. ¿Cuándo fue la última compra?
55. ¿Cuándo fue el último canje?
56. ¿Cuál es el paso manual más pesado?
57. ¿Cómo pides las reseñas hoy?
58. ¿Cómo sabes que alguien vino recomendado?
59. ¿Cuántos viajeros repiten?
60. ¿Te han pedido fotos, notas, la ruta o algún recuerdo?
61. ¿Qué tarea de después del tour merece la pena resolver?
62. ¿Qué concepto futuro **no** deberíamos construir?

**Q62 is deliberately negative.** It is the cheapest way to kill a rail before it costs anything.

---

## 8. Section H — TIS value *(always, 5 questions)*

63. ¿Qué demo enseñarías primero en TIS?
64. ¿Qué afirmación desconfiaría un operador de verdad?
65. ¿Qué pregunta deberíamos hacer a **todos** los operadores en TIS?
66. ¿A quién más deberíamos entrevistar?
67. ¿Nos presentarías a alguien? *(multi: otro operador · guía · conductor · hotel · DMC · contacto de plataforma · no)*

---

## 9. Section I — Next step *(always, pick any)*

68. Revisar Journey Briefs sintéticos
69. Reconstruir una consulta histórica anonimizada
70. Presentarnos a otro profesional
71. Una llamada de 20 minutos
72. Ayudar a definir un piloto acotado
73. Ningún paso siguiente

**"Ningún paso siguiente" must be as easy to click as the others.** A form that makes refusal awkward produces polite noise.

---

## 10. Final question *(always)*

> **"¿Cuál es la razón más fuerte por la que Para Usted fracasaría en tu negocio?"**

Free text, no character limit, no follow-up. Leave it alone.

---

## 11. How Carlos's evidence changes the TIS plan

This section exists so the decision is made before the data arrives, not after.

### If Demo 1 scores highest

**Primary TIS story:** the Journey Brief and catalogue-grounded recommendations. The handoff concept drops to a verbal aside. This is the cheapest outcome — the working playback already demonstrates it.

### If Demo 2 scores highest **and** Q34 frequency plus Q35 value are meaningful

**Primary TIS story:** Journey Brief **plus** operator-to-operator context handoff. This authorises the concept-screen slice described in the [scope assessment](../architecture/tis-handoff-concept-scope-2026-09.md) — and only then.

### If Demo 3 scores highest

Keep gift cards as the **proven secondary commercial story**. Do **not** replace the immediate operator-work demo. Post-trip work must be shown to be more frequent or more valuable before it takes the lead — one enthusiastic operator is not that evidence.

### If all three score weak

**Do not add features.** Use TIS for open problem discovery, run the [field card](./operator-handoff-field-card-2026-09.md) on every conversation, and treat the existing playback as a conversation starter rather than a pitch.

### The override that beats all four

If Q13 comes back as 4 or 5 — *the current workaround is good enough* — then no demo score matters. That answer alone means the wedge is not there yet, and the honest response is to keep looking.
