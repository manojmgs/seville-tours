import React from "react";
import { AbsoluteFill } from "remotion";
import { CarlosVideoShell, type CarlosVideoProps } from "./VideoShell";
import { DEMO1_SCENES } from "./script";
import { DEMO1_TOURS, SOURCE_LINE } from "./facts";
import { COLORS, FONT_DISPLAY, LABELS } from "./theme";
import {
  BigQuestion,
  Boundary,
  Bubble,
  Card,
  Heading,
  KeyValue,
  ListBlock,
  Stage,
  TwoPane,
  useReveal,
} from "./ui";

/** Video 1 — a better private enquiry, matched against the operator's own catalogue. */
export function CarlosDemo1JourneyBrief({ hasAudio }: CarlosVideoProps) {
  return (
    <CarlosVideoShell scenes={DEMO1_SCENES} hasAudio={hasAudio} renderScene={renderScene} />
  );
}

function renderScene(sceneId: string): React.ReactNode {
  switch (sceneId) {
    case "d1-problem":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Así llega una solicitud privada</Heading>
          <Card delay={12}>
            <p style={{ fontSize: 38, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
              «Somos dos, quizá se una un familiar. Tenemos una tarde libre. Nos interesan la historia y la
              comida local. Preferimos algo privado y tranquilo.»
            </p>
          </Card>
          <Boundary
            delay={30}
            lines={["Ni producto, ni fecha, ni número final de personas."]}
          />
        </Stage>
      );

    case "d1-questions":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Cinco preguntas, la primera el idioma</Heading>
          <TwoPane
            left={
              <>
                <Bubble speaker="marco" text="¿En qué idioma lo prefieres?" delay={4} />
                <Bubble speaker="traveller" text="Español" delay={14} />
                <Bubble speaker="marco" text="¿Quién viaja?" delay={24} />
                <Bubble speaker="traveller" text="Dos, quizá un familiar más" delay={34} />
                <Bubble speaker="marco" text="¿Cómo preferís viajar?" delay={44} />
                <Bubble speaker="traveller" text="Privado, si es posible" delay={54} />
              </>
            }
            right={
              <Card title="Confirmación corta, no promesa" delay={60}>
                <p style={{ fontSize: 34, lineHeight: 1.45, margin: 0, color: COLORS.green900 }}>
                  «Privado es una preferencia, no un producto confirmado.»
                </p>
                <Boundary
                  delay={72}
                  lines={["Anoto que el número de personas no es definitivo."]}
                />
              </Card>
            }
          />
        </Stage>
      );

    case "d1-optional":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Lo demás se ofrece, no se exige</Heading>
          <Card delay={10}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[
                "Solo una tarde libre",
                "Alojamiento en Santa Cruz",
                "Preferimos caminar poco",
                "Nos gustaría cenar después",
                "Todavía sin entradas",
                "Consejo de transporte",
                "¿Hay algún evento?",
                "Una persona vegetariana",
                "Cómodo, sin excesos",
              ].map((chip, index) => (
                <Chip key={chip} label={chip} delay={16 + index * 5} />
              ))}
            </div>
          </Card>
          <Boundary delay={80} lines={["Puedes parar aquí. Nada de esto es obligatorio."]} />
        </Stage>
      );

    case "d1-brief":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Resumen revisado por el viajero</Heading>
          <TwoPane
            left={
              <>
                <ListBlock
                  label="Se sabe"
                  delay={6}
                  items={[
                    "Dos adultos, posible familiar adicional",
                    "Ventana de viaje definida",
                    "Interés en Sevilla",
                  ]}
                />
                <ListBlock
                  label="Preferencias"
                  delay={18}
                  items={["Historia", "Comida local", "Privado si es posible", "Ritmo tranquilo"]}
                />
              </>
            }
            right={
              <>
                <ListBlock
                  label="Sigue abierto"
                  delay={30}
                  items={["La tarde exacta", "Número final de personas", "Entradas", "Disponibilidad", "Precio"]}
                />
                <ListBlock
                  label="Preguntas para Carlos"
                  delay={42}
                  items={["Cena", "Consejo sobre el hotel", "Transporte", "Eventos", "Versión privada"]}
                />
                <Boundary
                  delay={54}
                  lines={["Una pregunta no es un producto.", "Una preferencia no es una reserva."]}
                />
              </>
            }
          />
        </Stage>
      );

    case "d1-catalogue":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Solo tu catálogo publicado</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, flex: 1, minHeight: 0 }}>
            {DEMO1_TOURS.map((tour, index) => (
              <Card key={tour.title} delay={10 + index * 12}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 32,
                    lineHeight: 1.2,
                    color: COLORS.green900,
                  }}
                >
                  {tour.title}
                </p>
                <p style={{ margin: "10px 0 0", fontSize: 27, fontWeight: 700, color: COLORS.green500 }}>
                  {tour.price} · {tour.duration}
                </p>
                <p style={{ margin: "14px 0 0", fontSize: 23, lineHeight: 1.4, color: COLORS.muted }}>
                  {tour.why}
                </p>
                <p
                  style={{
                    margin: "14px 0 6px",
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "#6B531D",
                  }}
                >
                  No comprobado
                </p>
                <ul style={{ margin: 0, paddingLeft: 24 }}>
                  {tour.notChecked.map((item) => (
                    <li key={item} style={{ fontSize: 21, lineHeight: 1.4, color: COLORS.muted }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <Boundary delay={50} lines={[SOURCE_LINE, "No se consulta disponibilidad."]} />
        </Stage>
      );

    case "d1-operator":
      return (
        <Stage label={LABELS.concept}>
          <Heading>El viajero elige a quién preguntar</Heading>
          <Card delay={10}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Chip label="Seville Tours Co." delay={16} selected />
              <Chip label="Otro operador publicado" delay={24} />
            </div>
            <Boundary delay={36} lines={["Cada operador confirma su propio servicio."]} />
          </Card>
        </Stage>
      );

    case "d1-enquiry":
      return (
        <Stage label={LABELS.noContact} labelTone="warn">
          <Heading>Consulta preparada para revisión</Heading>
          <Card tone="ask" delay={10}>
            <KeyValue
              delay={16}
              rows={[
                ["Preparada para", "Seville Tours Co."],
                ["Nombre", "A. R. (ejemplo)"],
                ["Correo", "a•••@ejemplo.com"],
                ["Teléfono", "6•• ••• ••• (opcional)"],
                ["Reserva", "Ninguna"],
                ["Disponibilidad", "Sin confirmar"],
                ["Precio", "Sin presupuestar"],
              ]}
            />
            <Boundary
              delay={40}
              lines={[
                "Demostración solamente.",
                "Ningún mensaje ha salido del navegador y ningún operador ha sido contactado.",
              ]}
            />
          </Card>
        </Stage>
      );

    case "d1-question":
      return (
        <BigQuestion question="¿Esto reduciría trabajo en tu última solicitud privada, o sería otro resumen más que leer?" />
      );

    default:
      return <AbsoluteFill style={{ background: COLORS.cream }} />;
  }
}

function Chip({ label, delay = 0, selected }: { label: string; delay?: number; selected?: boolean }) {
  const style = useReveal(delay, 10);

  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        border: `3px solid ${selected ? COLORS.green900 : "rgba(24,32,25,0.30)"}`,
        background: selected ? COLORS.green900 : COLORS.card,
        color: selected ? COLORS.white : COLORS.ink,
        borderRadius: 999,
        padding: "14px 26px",
        fontSize: 27,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
