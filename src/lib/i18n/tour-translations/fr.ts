import type { TourTranslation } from "./types";

/**
 * French translations for WordPress tour pages.
 * Keys are English WordPress slugs.
 *
 * Only translate title, excerptHtml, contentHtml, and seo.
 * Do NOT add price, gallery, booking URL, or reviews — those come from WooCommerce.
 *
 * Example entry:
 * "seville-alcazar-guided-tour": {
 *   title: "Visite guidée de l'Alcázar de Séville",
 *   excerptHtml: "<p>...</p>",
 *   contentHtml: "<p>...</p>",
 *   seo: { title: "...", description: "..." },
 * },
 */
export const frTourTranslations: Record<string, TourTranslation> = {
  "seville-alcazar-guided-tour": {
    title: "Visite Guidée de l'Alcázar de Séville",

    excerptHtml: `<p>Explorez le Real Alcázar de Séville avec un guide officiel agréé. Évitez les files d'attente et découvrez l'un des plus anciens palais royaux d'Europe, célèbre pour son architecture mudéjare, ses salles royales et ses jardins époustouflants.</p>`,

    contentHtml: `
<h2>Visite Guidée de l'Alcázar de Séville – Coupe-file inclus</h2>

<p>Découvrez le Real Alcázar de Séville, l'un des sites du Patrimoine mondial de l'UNESCO les plus remarquables d'Espagne, accompagné d'un guide officiel agréé. Grâce à l'accès coupe-file, vous éviterez les longues queues et explorerez ce palais royal historique dans les moindres détails.</p>

<p>Construit à l'origine à l'époque islamique puis agrandi par les rois chrétiens, l'Alcázar est un chef-d'œuvre architectural unique mêlant les styles islamique, gothique, Renaissance et mudéjar. Aujourd'hui, il demeure une résidence officielle de la famille royale espagnole.</p>

<h3>Points forts de la visite</h3>

<ul>
<li>Entrée coupe-file au Real Alcázar de Séville</li>
<li>Guide local officiel agréé</li>
<li>Exploration du Palais Mudéjar du Roi Pedro I<sup>er</sup></li>
<li>Visite du Palais Gothique et des appartements royaux</li>
<li>Promenade dans les jardins et les cours de l'Alcázar</li>
<li>Anecdotes sur le rôle du palais dans <em>Game of Thrones</em></li>
</ul>

<h3>Déroulement de la visite</h3>

<p>Retrouvez votre guide près de l'entrée principale de l'Alcázar pour débuter par une introduction historique au site. À l'intérieur, explorez le splendide Palais Mudéjar, réputé pour ses remarquables décors de faïences, ses arches et ses patios. Poursuivez votre visite à travers le Palais Gothique et les salles royales, encore utilisées lors des visites officielles de la famille royale.</p>

<p>La visite se termine par une promenade guidée dans les jardins de l'Alcázar, où fontaines, pavillons et végétation luxuriante composent une atmosphère sereine et apaisante. À l'issue de la visite, vous êtes libre de rester et de flâner dans les jardins à votre propre rythme.</p>

<h3>Informations pratiques</h3>

<ul>
<li><strong>Durée :</strong> Environ 1h30</li>
<li><strong>Point de rendez-vous :</strong> Près de l'entrée principale du Real Alcázar (détails communiqués après réservation)</li>
<li><strong>Langue :</strong> Anglais (autres langues disponibles sur demande)</li>
<li><strong>Accessibilité :</strong> Partiellement accessible aux personnes à mobilité réduite</li>
</ul>
    `.trim(),

    seo: {
      title: "Visite Guidée de l'Alcázar de Séville – Coupe-file inclus | Seville Tours Co.",
      description:
        "Explorez le Real Alcázar de Séville avec un guide officiel agréé. Évitez les files d'attente et découvrez l'un des plus anciens palais royaux d'Europe, célèbre pour son architecture mudéjare, ses salles royales et ses jardins époustouflants.",
    },
  },
};
