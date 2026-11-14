import type { Lang } from "./nido-data";

/**
 * Copy and placeholder content for the homepage design directions under /ideas/*.
 * `null` counts are placeholders until minga / olla records are connected.
 * Never put a monetary value on community labor, and never rank people or veredas by hours.
 */
export const COMMUNITY_COUNTS = {
  mingas: null as number | null,
  ollas: null as number | null,
  receipts: null as number | null,
};

export const fmtCount = (n: number | null) => (n === null ? "—" : String(n));

export const VEREDAS = ["Resguardo Ibanacuara", "Vereda La Maizena", "Los Juanes"] as const;

export const ideasCopy = {
  es: {
    pending: "Se conectará a los registros de mingas y ollas.",
    example: "Ejemplo",
    exampleNote: "Contenido de ejemplo hasta conectar los registros y la aprobación comunitaria.",
    donate: "Donar para reconstruir",
    seeAccounts: "Ver todas las cuentas",
    mingas: "mingas realizadas",
    ollas: "ollas compartidas",
    families: "familias atendidas",
    raised: "Recaudado",
    receipts: "recibos publicados",
    noPhone:
      "¿Sin teléfono inteligente? Avise a su líder de vereda y ella o él lo anota por usted.",
    privacy:
      "Publicado con la aprobación de líderes comunitarios. Sin nombres ni ubicaciones exactas.",
    others: "Otras direcciones de diseño",
    names: {
      a: "A · Comunidad primero",
      b: "B · Informe abierto",
      c: "C · Tablero de vereda",
      d: "D · Mapa y novedades",
    },
    a: {
      kicker: "Pijao, Quindío · Recuperación con cuentas abiertas",
      title: "Pijao se reconstruye junta.",
      lead: "Casa por casa, minga por minga, con las cuentas a la vista.",
      seeWeek: "Ver las novedades",
      photoAlt: "Un grupo de personas reunidas bajo los árboles con plantas y un perro",
      weekTitle: "Novedades de esta semana",
      weekBy: "Del diario de campo",
      together: "Lo que hemos hecho juntos",
      accountsTitle: "Cada peso, cada hogar, a la vista",
      accountsLead: "Siga cada donación desde el recibo hasta el techo.",
      steps: ["Recibo", "Verificación", "Techo"],
      step: "Paso",
      readMore: "Leer más",
      allPosts: "Ver todo el diario de campo",
      noPosts: "Pronto publicaremos la primera actualización desde el campo.",
    },
    b: {
      kicker: "Informe público",
      title: "Cada peso, cada hogar, a la vista.",
      lead: "Después del terremoto y los incendios, Pijao se reconstruye casa por casa. Aquí está lo que se recibió, lo que se gastó y lo que la comunidad ha hecho junta.",
      nav: ["Resumen", "Cuentas", "Comunidad", "Verificación"],
      s1: "1. Dónde fue el dinero",
      s1Lead: "Cada gasto aparece con su recibo verificado.",
      cols: ["Fecha", "Concepto", "Vereda", "Monto", "Recibo"],
      verified: "Verificado",
      s2: "2. Del recibo al techo",
      flow: [
        ["Donación", "El dinero o los materiales llegan."],
        ["Compra", "Se compra con recibo."],
        ["Verificación", "Se revisa el recibo y se aprueba."],
        ["Techo", "Se registra lo construido."],
      ],
      s3: "3. Lo que aporta la comunidad",
      mingaCard: "mingas realizadas",
      ollaCard: "ollas comunitarias",
      noPrice:
        "Contamos las manos y las ollas. No les ponemos precio: el trabajo de la comunidad no se mide en dinero.",
      careTitle: "Cómo cuidamos a las familias",
      care: "Antes de publicar, quitamos nombres, teléfonos y ubicaciones exactas. Un coordinador y un líder comunitario aprueban cada registro.",
    },
    c: {
      title: "Tablero de la vereda",
      lead: "Qué se está organizando, cómo avanza la recuperación y qué falta.",
      print: "Imprimir para la cartelera",
      all: "Todas",
      upcoming: "Próximas actividades",
      progress: "Avance por fase",
      illustrative: "Barras ilustrativas",
      need: "Qué necesitamos",
      help: "Cómo ayudar",
      offer: "Ofrecer manos o herramientas",
      bring: "Aportar ingredientes",
      sat: "SÁB",
      up: [
        { day: "SÁB", num: "##", title: "Minga del sábado", meta: "[hora]" },
        { day: "SÁB", num: "##", title: "Olla de la minga", meta: "[hora]" },
        { day: "—", num: "##", title: "Taller para la niñez", meta: "[hora]" },
      ],
      phaseLabels: ["[n] de [n] familias", "[n] de [n] casas", "[n] actividades"],
      phaseNotes: [
        "Censo, tejas de zinc, lonas, cobijas y lámparas solares.",
        "Mingas de los sábados para casas de bahareque y caminos.",
        "Arte y teatro para la niñez, y huertas familiares.",
      ],
      needs: [
        ["Tejas de zinc", "[n]"],
        ["Herramientas", "[n]"],
        ["Ingredientes para la olla", "[n]"],
        ["Materiales de arte", "[n]"],
      ],
    },
    d: {
      kicker: "Pijao, Quindío",
      title: "Vereda por vereda, lo que se hace juntos.",
      lead: "Techos, mingas y ollas en un solo mapa, con las novedades que la comunidad aprueba compartir.",
      chips: { all: "Todo", roofs: "Techos", mingas: "Mingas", ollas: "Ollas" },
      mapLabel: "Mapa ilustrativo con tres veredas y marcadores de techos, mingas y ollas",
      mapNote:
        "Mapa ilustrativo. Se reemplaza con el mapa real, sin ubicaciones exactas de hogares.",
      updates: "Actualizaciones",
      verified: "Verificado por coordinación local",
      aiNote:
        "Algunas actualizaciones se redactan con ayuda de IA y las aprueba una persona antes de publicarse. Las citas aparecen solo con permiso.",
      items: [
        {
          meta: "[fecha] · [Vereda]",
          title: "Una minga, una olla, un techo",
          text: "Unas [n] personas trabajaron juntas y compartieron una olla comunitaria. Falta: tejas de zinc y herramientas.",
        },
        {
          meta: "[fecha] · [Vereda]",
          title: "[Título de la actualización]",
          text: "[Dos frases sobre lo que se hizo y lo que sigue, escritas con la comunidad.]",
        },
        {
          meta: "[fecha] · [Vereda]",
          title: "[Título de la actualización]",
          text: "[Cita aprobada por la persona, si decidió compartirla.]",
        },
      ],
    },
  },
  en: {
    pending: "Will connect to minga and olla records.",
    example: "Example",
    exampleNote: "Sample content until records and community approval are connected.",
    donate: "Donate to rebuild",
    seeAccounts: "See all accounts",
    mingas: "mingas held",
    ollas: "shared ollas",
    families: "households assisted",
    raised: "Raised",
    receipts: "receipts published",
    noPhone: "No smartphone? Tell your vereda leader and they'll note it for you.",
    privacy: "Published with community leaders' approval. No names or exact locations.",
    others: "Other design directions",
    names: {
      a: "A · Community first",
      b: "B · Open report",
      c: "C · Vereda board",
      d: "D · Map & updates",
    },
    a: {
      kicker: "Pijao, Quindío · Recovery with open books",
      title: "Pijao rebuilds together.",
      lead: "House by house, minga by minga, with the books in plain view.",
      seeWeek: "See what's new",
      photoAlt: "A group gathered under the trees with plants and a dog",
      weekTitle: "What's new this week",
      weekBy: "From the field journal",
      together: "What we've done together",
      accountsTitle: "Every peso, every home, in plain view",
      accountsLead: "Follow each donation from receipt to roof.",
      steps: ["Receipt", "Verification", "Roof"],
      step: "Step",
      readMore: "Read more",
      allPosts: "See the whole field journal",
      noPosts: "The first update from the field is coming soon.",
    },
    b: {
      kicker: "Public report",
      title: "Every peso, every home, in plain view.",
      lead: "After the earthquake and fires, Pijao is rebuilding house by house. Here is what came in, what was spent, and what the community has done together.",
      nav: ["Summary", "Accounts", "Community", "Verification"],
      s1: "1. Where the money went",
      s1Lead: "Every expense appears with its verified receipt.",
      cols: ["Date", "Item", "Vereda", "Amount", "Receipt"],
      verified: "Verified",
      s2: "2. From receipt to roof",
      flow: [
        ["Donation", "Money or materials arrive."],
        ["Purchase", "Bought with a receipt."],
        ["Verification", "The receipt is checked and approved."],
        ["Roof", "What was built is recorded."],
      ],
      s3: "3. What the community contributes",
      mingaCard: "mingas held",
      ollaCard: "community ollas",
      noPrice:
        "We count hands and pots. We don't put a price on them: the community's work isn't measured in money.",
      careTitle: "How we protect families",
      care: "Before publishing, we remove names, phone numbers and exact locations. A coordinator and a community leader approve every record.",
    },
    c: {
      title: "Vereda board",
      lead: "What's being organized, how recovery is going, and what's still needed.",
      print: "Print for the notice board",
      all: "All",
      upcoming: "Upcoming activities",
      progress: "Progress by phase",
      illustrative: "Illustrative bars",
      need: "What we need",
      help: "How to help",
      offer: "Offer hands or tools",
      bring: "Contribute ingredients",
      sat: "SAT",
      up: [
        { day: "SAT", num: "##", title: "Saturday minga", meta: "[time]" },
        { day: "SAT", num: "##", title: "Minga olla", meta: "[time]" },
        { day: "—", num: "##", title: "Children's workshop", meta: "[time]" },
      ],
      phaseLabels: ["[n] of [n] households", "[n] of [n] homes", "[n] activities"],
      phaseNotes: [
        "Census, zinc roofing, tarps, blankets and solar lamps.",
        "Saturday mingas for bahareque homes and paths.",
        "Art and theater for children, and family gardens.",
      ],
      needs: [
        ["Zinc roofing sheets", "[n]"],
        ["Tools", "[n]"],
        ["Ingredients for the olla", "[n]"],
        ["Art supplies", "[n]"],
      ],
    },
    d: {
      kicker: "Pijao, Quindío",
      title: "Vereda by vereda, what we do together.",
      lead: "Roofs, mingas and ollas on one map, with the updates the community agrees to share.",
      chips: { all: "All", roofs: "Roofs", mingas: "Mingas", ollas: "Ollas" },
      mapLabel: "Illustrative map with three veredas and markers for roofs, mingas and ollas",
      mapNote:
        "Illustrative map. To be replaced with the real map, with no exact household locations.",
      updates: "Updates",
      verified: "Verified by local coordination",
      aiNote:
        "Some updates are drafted with AI assistance and approved by a person before publishing. Quotes appear only with permission.",
      items: [
        {
          meta: "[date] · [Vereda]",
          title: "One minga, one olla, one roof",
          text: "About [n] people worked together and shared a community olla. Still needed: zinc sheets and tools.",
        },
        {
          meta: "[date] · [Vereda]",
          title: "[Update title]",
          text: "[Two sentences on what was done and what's next, written with the community.]",
        },
        {
          meta: "[date] · [Vereda]",
          title: "[Update title]",
          text: "[Quote approved by the person, if they chose to share it.]",
        },
      ],
    },
  },
} satisfies Record<Lang, unknown>;

export type IdeasCopy = (typeof ideasCopy)["es"];

/** Sizes a figure to its `@container` cell so long COP amounts ("$ 156.655.000") never clip. */
export function statValueSize(value: string) {
  return value.length > 9 ? "text-[clamp(0.875rem,13cqw,3rem)]" : "text-[clamp(1.5rem,22cqw,3rem)]";
}
