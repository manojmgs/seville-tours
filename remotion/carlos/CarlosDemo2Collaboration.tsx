import React from "react";
import { AbsoluteFill } from "remotion";
import { CarlosVideoShell, type CarlosVideoProps } from "./VideoShell";
import { DEMO2_SCENES } from "./script";
import { GRANADA_FACT } from "./facts";
import { COLORS, FONT_DISPLAY, LABELS } from "./theme";
import { BigQuestion, Boundary, Card, Heading, KeyValue, ListBlock, Stage, useReveal } from "./ui";

/** Video 2 — a four-day journey where collaboration is an option, never an assumption. */
export function CarlosDemo2Collaboration({ hasAudio }: CarlosVideoProps) {
  return <CarlosVideoShell scenes={DEMO2_SCENES} hasAudio={hasAudio} renderScene={renderScene} />;
}

function renderScene(sceneId: string): React.ReactNode {
  switch (sceneId) {
    case "d2-request":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Cuatro días, dos ciudades</Heading>
          <Card delay={10}>
            <ListBlock
              delay={16}
              items={[
                "Dos adultos · puede unirse un familiar",
                "Del 14 al 18 de octubre",
                "Sevilla y Granada",
                "Historia y comida",
                "Privado si es posible · ritmo tranquilo",
              ]}
            />
          </Card>
        </Stage>
      );

    case "d2-days":
      return (
        <Stage label={LABELS.concept}>
          <Heading>El viaje, tal y como está de verdad</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22, flex: 1, minHeight: 0 }}>
            <DayCard
              day="Día 1"
              city="Sevilla"
              note="Posible experiencia de tu catálogo."
              tone="known"
              delay={8}
            />
            <DayCard
              day="Día 2"
              city="Granada"
              note={`${GRANADA_FACT.title}. ${GRANADA_FACT.price}. Requiere tu decisión profesional.`}
              tone="ask"
              delay={20}
            />
            <DayCard day="Día 3" city="Sin decidir" note="Nada propuesto." tone="open" delay={32} />
            <DayCard day="Día 4" city="Sin decidir" note="Nada propuesto." tone="open" delay={40} />
          </div>
          <Boundary delay={50} lines={["No inventamos itinerario."]} />
        </Stage>
      );

    case "d2-unknowns":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Lo que bloquea una propuesta</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, flex: 1, minHeight: 0 }}>
            <Card tone="open" delay={8}>
              <ListBlock
                delay={14}
                items={[
                  "Ciudad exacta por noche",
                  "Número final de personas",
                  "Entradas a monumentos",
                  "Transporte entre ciudades",
                ]}
              />
            </Card>
            <Card tone="open" delay={20}>
              <ListBlock
                delay={26}
                items={[
                  "Contexto de alojamiento",
                  "Disponibilidad",
                  "Precio",
                  "Quién contrata y quién cobra",
                ]}
              />
            </Card>
          </div>
        </Stage>
      );

    case "d2-decision":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Tres caminos. Ninguno automático.</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26, flex: 1, minHeight: 0 }}>
            <PathCard
              title="Lo haces tú"
              body="Realizas el servicio directamente, como ya haces hoy."
              delay={8}
            />
            <PathCard
              title="Lo coordinas tú"
              body="Lo gestionas dentro de tu modelo actual y tu red de confianza."
              delay={20}
            />
            <PathCard
              title="Exploras a otro profesional"
              body="Solo si queda fuera de tus fechas, capacidad, idioma o red."
              delay={32}
            />
          </div>
          <Boundary delay={44} lines={["La decisión sigue siendo tuya."]} />
        </Stage>
      );

    case "d2-anonymous":
      return (
        <Stage label={LABELS.noContact} labelTone="warn">
          <Heading>Lo que vería el otro profesional</Heading>
          <Card delay={10}>
            <KeyValue
              delay={16}
              rows={[
                ["Destino", "Granada"],
                ["Ventana de fechas", "14–18 de octubre"],
                ["Grupo", "Dos adultos, puede unirse un familiar"],
                ["Intereses", "Historia, comida local"],
                ["Ritmo", "Tranquilo"],
                ["Abierto", "Tarde exacta, formato privado, entradas"],
              ]}
            />
            <Boundary delay={44} lines={["No se ha compartido la identidad del viajero."]} />
          </Card>
        </Stage>
      );

    case "d2-interest":
      return (
        <Stage label={LABELS.noContact} labelTone="warn">
          <Heading>Una respuesta prudente</Heading>
          <Card tone="ask" delay={10}>
            <p style={{ margin: 0, fontSize: 42, lineHeight: 1.4, color: COLORS.green900 }}>
              «Potencialmente relevante. Falta confirmar la tarde preferida.»
            </p>
            <Boundary
              delay={26}
              lines={["No dice aceptado. No dice disponible. No dice confirmado."]}
            />
          </Card>
        </Stage>
      );

    case "d2-sharing":
      return (
        <Stage label={LABELS.concept}>
          <Heading>El viajero decide qué se comparte</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, flex: 1, minHeight: 0 }}>
            <Card title="Se comparte" tone="ask" delay={8}>
              <ListBlock
                delay={14}
                items={[
                  "Ventana de fechas",
                  "Tamaño del grupo",
                  "Intereses relevantes",
                  "Preferencias",
                  "Preguntas abiertas relevantes",
                ]}
              />
            </Card>
            <Card title="No se comparte" tone="open" delay={20}>
              <ListBlock
                delay={26}
                muted
                items={[
                  "Datos de pago",
                  "Documentos de identidad",
                  "Elementos no relacionados del plan",
                  "Notas privadas",
                  "Conversaciones con otros profesionales",
                ]}
              />
            </Card>
          </div>
          <Boundary delay={40} lines={["Acción: «Preparar para revisión». No «enviar»."]} />
        </Stage>
      );

    case "d2-receipt":
      return (
        <Stage label={LABELS.noContact} labelTone="warn">
          <Heading>Contexto de introducción preparado</Heading>
          <Card tone="open" delay={8}>
            <KeyValue
              delay={14}
              rows={[
                ["Iniciado por", "Contexto de operador de Carlos"],
                ["Preparado para", "Profesional en Granada · solo concepto"],
                ["Propósito", "Revisar un día en Granada"],
                ["Journey Brief", "Versión 3"],
                ["Reserva", "Ninguna"],
                ["Disponibilidad", "Sin confirmar"],
                ["Precio", "Sin presupuestar"],
                ["Acuerdo comercial", "Ninguno"],
                ["Transmisión", "No se ha realizado"],
              ]}
            />
            <Boundary delay={44} lines={["Recibo versionado. Se puede corregir o retirar."]} />
          </Card>
        </Stage>
      );

    case "d2-business":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Lo comercial se queda con los profesionales</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, flex: 1, minHeight: 0 }}>
            <Card tone="open" delay={8}>
              <ListBlock
                delay={14}
                items={[
                  "¿Quién sigue siendo el contacto principal?",
                  "¿Quién presupuesta?",
                  "¿Quién contrata?",
                  "¿Quién cobra?",
                ]}
              />
            </Card>
            <Card tone="open" delay={20}>
              <ListBlock
                delay={26}
                items={[
                  "¿Hay comisión por la introducción?",
                  "¿Se espera reciprocidad?",
                  "¿Qué sistema registra cada servicio?",
                  "¿Quién gestiona los cambios?",
                ]}
              />
            </Card>
          </div>
          <Boundary delay={40} lines={["Este concepto no responde a ninguna de ellas."]} />
        </Stage>
      );

    case "d2-question":
      return (
        <BigQuestion question="¿Esto habría ayudado en tu última solicitud multidía o derivada, o crearía otro enlace que gestionar?" />
      );

    default:
      return <AbsoluteFill style={{ background: COLORS.cream }} />;
  }
}

function DayCard({
  day,
  city,
  note,
  tone,
  delay,
}: {
  day: string;
  city: string;
  note: string;
  tone: "known" | "ask" | "open";
  delay: number;
}) {
  return (
    <Card tone={tone} delay={delay}>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: 1, color: COLORS.muted }}>
        {day}
      </p>
      <p
        style={{
          margin: "8px 0 14px",
          fontFamily: FONT_DISPLAY,
          fontSize: 34,
          color: COLORS.green900,
        }}
      >
        {city}
      </p>
      <p style={{ margin: 0, fontSize: 23, lineHeight: 1.45, color: COLORS.ink }}>{note}</p>
    </Card>
  );
}

function PathCard({ title, body, delay }: { title: string; body: string; delay: number }) {
  const style = useReveal(delay);

  return (
    <div
      style={{
        ...style,
        border: `3px solid rgba(24,32,25,0.16)`,
        background: COLORS.card,
        borderRadius: 28,
        padding: 32,
      }}
    >
      <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 36, color: COLORS.green900 }}>{title}</p>
      <p style={{ margin: "16px 0 0", fontSize: 27, lineHeight: 1.5, color: COLORS.ink }}>{body}</p>
    </div>
  );
}
