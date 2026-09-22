import React from "react";
import { AbsoluteFill } from "remotion";
import { CarlosVideoShell, type CarlosVideoProps } from "./VideoShell";
import { DEMO3_SCENES } from "./script";
import { ALCAZAR_GIFT_CARD } from "./facts";
import { COLORS, FONT_DISPLAY, LABELS } from "./theme";
import { BigQuestion, Boundary, Card, Heading, KeyValue, ListBlock, Stage, useReveal } from "./ui";

/** Video 3 — the post-trip loop, with built and proposed rails visibly separated. */
export function CarlosDemo3ReturnLoop({ hasAudio }: CarlosVideoProps) {
  return <CarlosVideoShell scenes={DEMO3_SCENES} hasAudio={hasAudio} renderScene={renderScene} />;
}

function renderScene(sceneId: string): React.ReactNode {
  switch (sceneId) {
    case "d3-completed":
      return (
        <Stage label={LABELS.concept}>
          <Heading>El tour ha terminado</Heading>
          <Card delay={10}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[
                "Parar aquí",
                "Dejar una reseña",
                "Regalar la experiencia",
                "Guardar un recuerdo",
                "Volver en el futuro",
              ].map((choice, index) => (
                <Option key={choice} label={choice} delay={16 + index * 7} />
              ))}
            </div>
          </Card>
          <Boundary delay={56} lines={["Sin marketing automático · El viajero decide"]} />
        </Stage>
      );

    case "d3-built":
      return (
        <Stage label={LABELS.built} labelTone="built">
          <Heading>Esto ya está construido</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 26, flex: 1, minHeight: 0 }}>
            <Card tone="ask" delay={8}>
              <p style={{ margin: 0, fontSize: 64 }}>🎁</p>
              <p
                style={{
                  margin: "14px 0 6px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 38,
                  color: COLORS.green900,
                }}
              >
                {ALCAZAR_GIFT_CARD.title}
              </p>
              <p style={{ margin: 0, fontSize: 34, fontWeight: 800, color: COLORS.green500 }}>
                {ALCAZAR_GIFT_CARD.price} · {ALCAZAR_GIFT_CARD.validity}
              </p>
            </Card>
            <Card delay={18}>
              <ListBlock
                delay={24}
                items={[
                  "ParaUsted es la autoridad del bono: emisión, pago, saldo y canje",
                  "La verificación es de solo lectura y no puede canjear",
                  "El canje en V1 sigue siendo manual",
                  "FareHarbor sigue siendo la autoridad de reserva y plazas",
                ]}
              />
            </Card>
          </div>
        </Stage>
      );

    case "d3-truth":
      return (
        <Stage label={LABELS.built} labelTone="built">
          <Heading>Y conviene decirlo claro</Heading>
          <Card tone="open" delay={10}>
            <ListBlock
              delay={16}
              items={[
                "Comprar una tarjeta regalo no es reservar una fecha",
                "No confirma disponibilidad",
                "El canje y la reserva son pasos distintos",
                "Seville Tours no crea un segundo registro de bonos",
              ]}
            />
          </Card>
        </Stage>
      );

    case "d3-gift":
      return (
        <Stage label={LABELS.built} labelTone="built">
          <Heading>Regalarla a otra persona</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, flex: 1, minHeight: 0 }}>
            <Card title="Quien compra" delay={8}>
              <p style={{ margin: 0, fontSize: 30, lineHeight: 1.5 }}>
                Paga en ParaUsted. No elige fecha y no reserva nada.
              </p>
            </Card>
            <Card title="Quien la recibe" tone="ask" delay={18}>
              <p style={{ margin: 0, fontSize: 30, lineHeight: 1.5 }}>
                Decide si mira, y cuándo. La disponibilidad la confirmas tú, por el proceso normal.
              </p>
            </Card>
          </div>
          <Boundary delay={34} lines={["La fecha sigue sin elegir."]} />
        </Stage>
      );

    case "d3-souvenir":
      return (
        <Stage label={LABELS.concept}>
          <Heading>Algo que llevarse</Heading>
          <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 26, flex: 1, minHeight: 0 }}>
            <Card title="Aprobado" tone="ask" delay={8}>
              <p style={{ margin: 0, fontSize: 30, lineHeight: 1.5 }}>
                Tarjeta regalo del operador · {ALCAZAR_GIFT_CARD.price}
              </p>
            </Card>
            <Card title="Muestras · no aprobadas todavía" delay={18}>
              <ListBlock
                delay={24}
                muted
                items={[
                  "Lámina de la ruta",
                  "Foto del guía",
                  "Recuerdo del recorrido",
                  "Objeto local",
                  "Memoria en audio",
                  "Libro del viaje impreso",
                ]}
              />
            </Card>
          </div>
          <Boundary delay={40} lines={["Nada pedido todavía · Sin carrito, sin pago"]} />
        </Stage>
      );

    case "d3-future":
      return (
        <Stage label={LABELS.future} labelTone="future">
          <Heading>Dirección futura</Heading>
          <Card tone="open" delay={8}>
            <KeyValue
              delay={14}
              rows={[
                ["Reseña", "Si el viajero quiere"],
                ["Compartir", "Voluntario"],
                ["Regalo", "A otra persona"],
                ["Recomendación", "Atribuible a quien la hizo"],
                ["Viaje futuro", "Vuelve a empezar"],
              ]}
            />
            <Boundary
              delay={40}
              lines={[
                "Nada de esto existe hoy.",
                "Sin puntos, sin saldo, sin descuentos automáticos, sin bono de red, sin liquidación entre operadores, sin reventa.",
              ]}
            />
          </Card>
        </Stage>
      );

    case "d3-question":
      return (
        <BigQuestion question="¿Qué tarea después del tour tendría suficiente valor como para dejar de hacerla manualmente?" />
      );

    default:
      return <AbsoluteFill style={{ background: COLORS.cream }} />;
  }
}

function Option({ label, delay }: { label: string; delay: number }) {
  const style = useReveal(delay, 10);

  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        border: "3px solid rgba(24,32,25,0.28)",
        background: COLORS.card,
        borderRadius: 999,
        padding: "16px 30px",
        fontSize: 30,
        fontWeight: 600,
        color: COLORS.ink,
      }}
    >
      {label}
    </span>
  );
}
