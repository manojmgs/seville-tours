import type { TourTranslation } from "./types";

/**
 * Spanish translations for WordPress tour pages.
 * Keys are English WordPress slugs.
 *
 * Only translate title, excerptHtml, contentHtml, and seo.
 * Do NOT add price, gallery, booking URL, or reviews — those come from WooCommerce.
 */
export const esTourTranslations: Record<string, TourTranslation> = {
  "seville-alcazar-guided-tour": {
    title: "Visita Guiada al Alcázar de Sevilla",

    excerptHtml: `<p>Recorre el Real Alcázar de Sevilla con un guía oficial titulado. Evita las colas y descubre uno de los palacios reales más antiguos de Europa, famoso por su arquitectura mudéjar, sus salones reales y sus impresionantes jardines.</p>`,

    contentHtml: `
<h2>Visita Guiada al Alcázar de Sevilla – Acceso sin colas</h2>

<p>Descubre el Real Alcázar de Sevilla, uno de los Patrimonios de la Humanidad más extraordinarios de España, de la mano de un guía oficial titulado. Con acceso sin esperas, podrás saltarte las largas colas y explorar este histórico palacio real en toda su profundidad.</p>

<p>Construido originalmente durante el período islámico y ampliado posteriormente por los reyes cristianos, el Alcázar es una obra maestra arquitectónica única que fusiona los estilos islámico, gótico, renacentista y mudéjar. Hoy en día sigue siendo residencia oficial de la Casa Real española.</p>

<h3>Lo que incluye la visita</h3>

<ul>
<li>Entrada sin colas al Real Alcázar de Sevilla</li>
<li>Guía local oficial titulado</li>
<li>Recorrido por el Palacio Mudéjar del Rey Pedro I</li>
<li>Visita al Palacio Gótico y las cámaras reales</li>
<li>Paseo por los jardines y patios del Alcázar</li>
<li>Curiosidades sobre el papel del palacio en <em>Juego de Tronos</em></li>
</ul>

<h3>¿Qué vas a vivir?</h3>

<p>Encontrarás a tu guía cerca de la entrada principal del Alcázar, donde comenzaréis con una introducción histórica al recinto. En el interior, exploraréis el espectacular Palacio Mudéjar, célebre por su intrincada decoración de azulejos, arcos y patios. Después pasaréis por el Palacio Gótico y los salones reales, que aún se utilizan durante las visitas oficiales de la familia real.</p>

<p>La visita concluye con un recorrido por los jardines del Alcázar, donde fuentes, pabellones y una exuberante vegetación crean un ambiente de paz y serenidad. Al terminar, podrás quedarte y explorar los jardines libremente a tu ritmo.</p>

<h3>Información práctica</h3>

<ul>
<li><strong>Duración:</strong> Aproximadamente 1,5 horas</li>
<li><strong>Punto de encuentro:</strong> Junto a la entrada principal del Real Alcázar (detalles tras la reserva)</li>
<li><strong>Idioma:</strong> Inglés (otros idiomas disponibles bajo petición)</li>
<li><strong>Accesibilidad:</strong> Parcialmente accesible para personas con movilidad reducida</li>
</ul>
    `.trim(),

    seo: {
      title: "Visita Guiada al Alcázar de Sevilla – Acceso sin Colas | Seville Tours Co.",
      description:
        "Recorre el Real Alcázar de Sevilla con un guía oficial titulado. Evita las colas y descubre uno de los palacios reales más antiguos de Europa, famoso por su arquitectura mudéjar, sus salones reales y sus impresionantes jardines.",
    },
  },
};
