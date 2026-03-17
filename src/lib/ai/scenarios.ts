import type { CECRLevel } from "@/generated/prisma/enums";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: CECRLevel;
  isPremium: boolean;
  systemPrompt: string;
}

const levelInstructions: Record<string, string> = {
  A1: "L'utilisateur est débutant absolu. Utilise des phrases très courtes et simples. Vocabulaire de base uniquement (max 500 mots). Corrige doucement les erreurs. Utilise beaucoup de répétition.",
  A2: "L'utilisateur est élémentaire. Phrases simples mais peut comprendre des structures basiques. Vocabulaire courant. Corrige les erreurs en expliquant brièvement.",
  B1: "L'utilisateur est intermédiaire. Il peut s'exprimer sur des sujets familiers. Utilise un vocabulaire plus riche. Explique les nuances grammaticales quand pertinent.",
  B2: "L'utilisateur est intermédiaire avancé. Conversations fluides sur des sujets variés. Challenge-le avec des expressions idiomatiques et du vocabulaire soutenu.",
  C1: "L'utilisateur est avancé. Discussions complexes et abstraites. Utilise un langage naturel avec argot, humour, et subtilités culturelles.",
  C2: "L'utilisateur maîtrise la langue. Parle comme un natif. Discussions sur n'importe quel sujet avec toute la richesse de la langue.",
};

export function buildSystemPrompt(scenario: Scenario, targetLanguage: string, userLevel: CECRLevel): string {
  return `Tu es un partenaire de conversation pour apprendre ${targetLanguage}. Tu joues un rôle dans la situation suivante : "${scenario.title}" — ${scenario.description}.

RÈGLES :
- Parle UNIQUEMENT en ${targetLanguage} (sauf pour les explications grammaticales qui peuvent être en français entre parenthèses)
- ${levelInstructions[userLevel]}
- Reste dans le contexte de la situation
- Si l'utilisateur fait une erreur, corrige-la naturellement dans ta réponse, puis ajoute une brève explication en français entre parenthèses
- Sois naturel et conversationnel, pas robotique
- Pose des questions pour maintenir la conversation
- Ne réponds JAMAIS en tant qu'IA ou assistant — tu es le personnage de la situation`;
}

export const scenarios: Scenario[] = [
  {
    id: "restaurant",
    title: "Au restaurant",
    description: "Tu es serveur/serveuse dans un restaurant. L'utilisateur est un client qui vient commander.",
    icon: "🍽️",
    level: "A1",
    isPremium: false,
    systemPrompt: "",
  },
  {
    id: "hotel-checkin",
    title: "Check-in à l'hôtel",
    description: "Tu es réceptionniste dans un hôtel. L'utilisateur arrive pour s'enregistrer.",
    icon: "🏨",
    level: "A1",
    isPremium: false,
    systemPrompt: "",
  },
  {
    id: "shopping",
    title: "Faire les courses",
    description: "Tu es vendeur dans un magasin. L'utilisateur cherche des produits et demande des conseils.",
    icon: "🛒",
    level: "A1",
    isPremium: false,
    systemPrompt: "",
  },
  {
    id: "directions",
    title: "Demander son chemin",
    description: "Tu es un passant dans la rue. L'utilisateur te demande comment aller quelque part.",
    icon: "🗺️",
    level: "A2",
    isPremium: false,
    systemPrompt: "",
  },
  {
    id: "doctor",
    title: "Chez le médecin",
    description: "Tu es médecin généraliste. L'utilisateur vient pour une consultation.",
    icon: "🏥",
    level: "A2",
    isPremium: false,
    systemPrompt: "",
  },
  {
    id: "job-interview",
    title: "Entretien d'embauche",
    description: "Tu es recruteur dans une entreprise. L'utilisateur passe un entretien pour un poste.",
    icon: "💼",
    level: "B1",
    isPremium: true,
    systemPrompt: "",
  },
  {
    id: "debate",
    title: "Débat d'opinion",
    description: "Tu discutes d'un sujet d'actualité avec l'utilisateur. Argumente et demande son avis.",
    icon: "💬",
    level: "B2",
    isPremium: true,
    systemPrompt: "",
  },
  {
    id: "negotiation",
    title: "Négociation commerciale",
    description: "Tu es un client/fournisseur. L'utilisateur doit négocier un contrat ou un prix.",
    icon: "🤝",
    level: "B2",
    isPremium: true,
    systemPrompt: "",
  },
];
