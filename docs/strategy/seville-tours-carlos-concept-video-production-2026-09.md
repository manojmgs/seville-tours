# Carlos Concept Video Production — Seville Tours Co.

**Status:** Production record for three Spanish concept videos. **The interactive research route is a validated storyboard only** — it is not production functionality and is not committed.
**Version:** 1.0 — 2026-09-21
**Compositions:** `CarlosDemo1JourneyBrief` · `CarlosDemo2Collaboration` · `CarlosDemo3ReturnLoop`
**Companion:** [questionnaire spec](./seville-tours-carlos-questionnaire-spec-2026-09.md) · [recording pack](./seville-tours-carlos-demo-recording-pack-2026-09.md)

---

## 1. Objective

Three short videos, sent to Carlos as **one package**, covering the complete operator lifecycle:

| Video | Lifecycle position | Question it answers |
|---|---|---|
| 1 — Mejores solicitudes privadas | **BEFORE** the booking | Does a reviewed request remove enquiry work? |
| 2 — Colaborar sin perder el contexto | **BETWEEN** professionals | Does preserved context help, or add a link? |
| 3 — Continuar la relación después del tour | **AFTER** the experience | Which post-trip task is worth automating? |

Carlos's answers decide which flow becomes the primary TIS demonstration. This is research, not a sale.

---

## 2. Source storyboard and factual grounding

The videos follow the corrected interactive demos at `/en/tis-showcase/seville-tours-research` (development-only). Video 1 keeps that route's two-pane grammar, language-first ordering, five core questions, offered-not-demanded detail, operator choice and end-of-flow contact capture. Videos 2 and 3 use video-native storytelling over the same validated stage flows.

**Catalogue facts** were read from the running research demo — which resolves them from the local generated WordPress manifest — and copied into [facts.ts](remotion/carlos/facts.ts) with a capture date. No render touches the network.

| Fact | Value |
|---|---|
| Seville Alcázar Guided Tour | €50 per person · 1.5 h |
| Private Seville Tapas Tour | €65 per person · 3 h |
| Highlights of Seville Tour | €130 per person · 2.5 h |
| Granada y la Alhambra (día privado) | Desde €295 por persona |
| Fixed Alcázar gift card | €50 · 365 días · ParaUsted |
| Source line shown on screen | `Fuente: sevilletoursco.com · leído el 18-09-2026` |

**Re-verify against the demo before re-rendering** if the manifest is regenerated.

---

## 3. Status labels

Persistent, one per scene, top-left:

| Label | Used for |
|---|---|
| `Concepto de investigación` | Default, every concept scene |
| `Base ya construida` | The gift-card foundation only |
| `Flujo propuesto · No disponible hoy` | The lifecycle vision scene |
| `Ningún operador real ha sido contactado · No se ha transmitido información` | Every collaboration scene |

Spanish captions run in a high-contrast band across every frame, sized to survive WhatsApp compression.

---

## 4. Prohibited claims

Never rendered, in any scene: *Booking confirmed · Available now · Order completed · Voucher redeemed · Price confirmed · Request sent · Operator accepted · Introduction sent · immutable.*

Required bounded statements, which reuse the same words and must survive: *No booking created · Availability not confirmed · No price quoted · Nothing ordered yet · No real operator contacted.*

Also excluded by design: marketing superlatives, revenue guarantees, "eliminates all work" claims, criticism of WhatsApp / FareHarbor / Bókun / Civitatis / Viator / GetYourGuide, reciprocity promises, partnership claims, and legal classification.

**Granada framing (deliberate):** Carlos already publishes a Granada day trip. The video says he may **fulfil or coordinate** it, and explores another professional only if it falls outside his dates, capacity, language or trusted network. It never implies the request must be passed on.

---

## 5. Scene timings and narration

Narration lengths are measured from the generated MP3s and written to [audio-timings.ts](remotion/carlos/audio-timings.ts); each scene is its narration plus 0.7 s. Spanish and English scripts live together in [script.ts](remotion/carlos/script.ts) so they cannot drift.

### Video 1 — 73.1 s (8 scenes)

| Scene | s | Spanish narration (abridged) |
|---|---|---|
| d1-problem | 7.8 | Una solicitud privada rara vez llega como un producto, una fecha y un número de personas… |
| d1-questions | 13.0 | Cinco preguntas sencillas, empezando por el idioma… Privado es una preferencia, no un producto confirmado. |
| d1-optional | 8.4 | A partir de ahí, todo lo demás se ofrece, no se exige. |
| d1-brief | 12.5 | Separa lo que se sabe, lo que prefiere, lo que sigue abierto y lo que hay que preguntarte a ti. |
| d1-catalogue | 14.4 | Las opciones salen solo de tu propio catálogo publicado… La disponibilidad no se consulta aquí. |
| d1-operator | 7.1 | Si aparece más de un operador, el viajero elige. |
| d1-enquiry | 8.8 | Los datos de contacto se piden solo al final… Nada sale del navegador. |
| d1-question | 6.5 | ¿Esto reduciría trabajo en tu última solicitud privada…? |

### Video 2 — 97.2 s (10 scenes)

`d2-request` · `d2-days` · `d2-unknowns` · `d2-decision` · `d2-anonymous` · `d2-interest` · `d2-sharing` · `d2-receipt` · `d2-business` · `d2-question`

Five narration lines were shortened after the first pass to bring the video from 113.6 s into the 85–100 s budget.

### Video 3 — 77.0 s (7 scenes)

`d3-completed` · `d3-built` · `d3-truth` · `d3-gift` · `d3-souvenir` · `d3-future` · `d3-question`

**Combined package: 4 min 7 s**, inside the five-minute ceiling.

### English equivalents

Every scene carries an `en` string in [script.ts](remotion/carlos/script.ts), written for later TIS use. They are not rendered today; an English build would reuse the same compositions with English narration and captions.

---

## 6. Render commands

```
pnpm video:carlos:voiceover     # Spanish narration + measured timings
pnpm video:carlos:1
pnpm video:carlos:2
pnpm video:carlos:3
```

**Narration:** ElevenLabs, premade voice `George` (`JBFqnCBsd6RMkjVDRZzb`), model `eleven_multilingual_v2`, 25 clips, one per scene. Override with `ELEVENLABS_VOICE_ID`. The key is read from `.env.local` with an anchored per-line parser and is never logged.

**Local TLS note:** this machine sits behind a TLS-intercepting proxy, so Node's `fetch` fails with a self-signed chain error. Fix by exporting the CA certificates Windows already trusts into a PEM bundle and setting `NODE_EXTRA_CA_CERTS`. **Never** set `NODE_TLS_REJECT_UNAUTHORIZED=0`.

---

## 7. Output metadata

All three: **1920 × 1080 · 30 fps · H.264 + AAC stereo**.

| File | Duration | Size | SHA-256 |
|---|---|---|---|
| `carlos-demo-1-journey-brief-es.mp4` | 73.09 s | 6.41 MB | `547DC3E6D013089F2C6AB3F838E8AA169976FB15D2569E1512D25E24B2926417` |
| `carlos-demo-2-collaboration-es.mp4` | 97.26 s | 7.87 MB | `AEA9942D10EE2459BEE30CBAA52A40FFF459F3C69BB6EAB31CCC6E12284B1B13` |
| `carlos-demo-3-return-loop-es.mp4` | 76.97 s | 5.62 MB | `98032037218AF7189ABBEA850F9FA6EC7BBC9FFA225D9F99D91D881DCFA4611A` |

Rendered to `out/`; review copies at `C:\mnt\data\` (the Windows equivalent of the requested `/mnt/data/`).

---

## 8. WhatsApp delivery

**Send all three together as one research package.** Do not make Carlos respond to each video separately before he has seen the whole direction. After watching, offer exactly two options — a 20–30 minute weekend conversation, or a short asynchronous questionnaire. Never both.

The three drafts are in §9 below. **Option 1 is recommended.**

### Four questions for the weekend meeting

1. ¿Qué vídeo representa el problema más frecuente de verdad en tu negocio?
2. Cuéntame la última vez que ocurrió exactamente eso.
3. ¿Cuántas veces pasó en tu última temporada comparable, y qué valor había en juego aproximadamente?
4. ¿Nuestro flujo quitaría trabajo, o solo lo movería a otra herramienta?

Closing question: **Si en los próximos dos años construyéramos bien solo una de estas tres, ¿cuál debería ser y por qué?**

---

## 9. WhatsApp drafts

### Option 1 — Friendly and clear *(recommended)*

> Hola Carlos, sé que estás muy ocupado, así que he preparado tres vídeos cortos en lugar de pedirte una reunión directamente. En total duran menos de cinco minutos.
>
> Los vídeos muestran tres ideas diferentes:
>
> 1. Reducir el trabajo de reconstruir solicitudes privadas desde WhatsApp.
> 2. Coordinar un viaje de varios días con otros profesionales sin perder el contexto ni la relación con el viajero.
> 3. Continuar la relación después del tour mediante tarjetas regalo, recomendaciones, recuerdos y futuras reservas.
>
> No necesito que me animes. Lo que más me ayuda es que me digas qué parte refleja un problema real, qué parte no funcionaría y qué te haría perder más tiempo.
>
> 🎥 Vídeo 1: [enlace]
> 🎥 Vídeo 2: [enlace]
> 🎥 Vídeo 3: [enlace]
>
> Después, como te resulte más cómodo:
> **A)** hablamos 20–30 minutos este fin de semana, o
> **B)** te envío unas preguntas cortas para responder cuando puedas.
>
> No necesito ningún dato de clientes. Tu opinión nos ayudará a decidir qué merece la pena mostrar y validar en TIS.

### Option 2 — Shorter

> Hola Carlos, he preparado tres demos cortas, menos de cinco minutos en total:
>
> 1. Mejorar solicitudes privadas y reducir trabajo de WhatsApp.
> 2. Coordinar viajes de varios días con otros profesionales.
> 3. Tarjetas regalo, referencias, recuerdos y futuras reservas.
>
> 🎥 1: [enlace] 🎥 2: [enlace] 🎥 3: [enlace]
>
> Necesito crítica real, no que me animes 😊
>
> Después podemos hablar 20–30 minutos este fin de semana o, si estás a tope, te envío unas preguntas cortas para responder cuando puedas. ¿Qué te viene mejor?

### Option 3 — Voice-note friendly

Text first:

> Hola Carlos, he intentado reflejar todo lo que gestionas tú solo: tours, solicitudes privadas, WhatsApp, FareHarbor, la web, otros profesionales y lo que ocurre después del tour. Tres vídeos cortos, menos de cinco minutos.
>
> 🎥 Solicitudes y recomendaciones: [enlace]
> 🎥 Viaje multidía y colaboración: [enlace]
> 🎥 Regalos, recomendaciones y retorno: [enlace]

Then a ~20 second voice note:

> "Hola Carlos, perdona la interrupción. No quiero venderte la idea: quiero saber si esto te ahorraría trabajo o si sería otra herramienta más que gestionar. No necesito ningún dato de tus clientes. Cuando puedas verlos, hablamos un rato este fin de semana; y si no tienes tiempo, te mando unas preguntas cortas. Las dos opciones me sirven. Gracias."

---

## 10. Risks and unresolved questions

- **Narration accent.** ElevenLabs free-tier access is limited to premade, English-native voices. `eleven_multilingual_v2` speaks Spanish clearly but with a mild non-native accent. A native Spanish voice needs a paid plan. **Listen to Video 1 before sending** and decide whether the accent is acceptable for a Spanish operator.
- **Catalogue drift.** Prices are a 2026-09-21 snapshot. If the manifest regenerates, re-verify [facts.ts](remotion/carlos/facts.ts) before re-rendering.
- **Boundary lines can clip.** In a few dense scenes the second boundary line falls below the card. The caption band carries the same statement, so no claim is lost, but the redundancy is reduced.
- **Caption band on the closing question** sits on a dark background and reads as plain text rather than a band. Legible, slightly less polished.
- **Link hosting is unsolved.** The drafts contain placeholders. Sending three 6–8 MB files directly through WhatsApp will compress them; hosted links preserve quality and let us see whether he opened them.
