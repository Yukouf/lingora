import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/* ═══════════════════════════════════════════════════════════
   SEED — Lingyou
   7 langues × cours A1/A2 (gratuit) + B1 (premium)
   Chapitres thématiques, leçons, exercices variés
   ═══════════════════════════════════════════════════════════ */

async function main() {
  console.log("🌱 Seeding database...\n");

  // ═══════ LANGUES ═══════
  const languages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "Anglais", flag: "🇬🇧" },
    { code: "es", name: "Espagnol", flag: "🇪🇸" },
    { code: "zh", name: "Chinois", flag: "🇨🇳" },
    { code: "ja", name: "Japonais", flag: "🇯🇵" },
    { code: "ru", name: "Russe", flag: "🇷🇺" },
    { code: "ko", name: "Coréen", flag: "🇰🇷" },
  ];

  const langMap: Record<string, string> = {};

  for (const lang of languages) {
    const created = await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name, flag: lang.flag },
      create: lang,
    });
    langMap[lang.code] = created.id;
    console.log(`  ✓ Langue: ${lang.flag} ${lang.name}`);
  }

  // ═══════ COURS & CONTENU ═══════

  // ---------- ANGLAIS ----------
  console.log("\n📚 Anglais...");
  const enA1 = await upsertCourse(langMap["en"], "A1", "Anglais — Débutant (A1)", "Apprends les bases pour te débrouiller au quotidien.", 1, false);
  const enA2 = await upsertCourse(langMap["en"], "A2", "Anglais — Élémentaire (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  const enB1 = await upsertCourse(langMap["en"], "B1", "Anglais — Intermédiaire (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

  // EN A1 Chapitres
  await seedChaptersWithContent(enA1, [
    {
      title: "Se présenter", icon: "👋", description: "Dire bonjour, donner son nom, poser des questions simples", order: 1,
      lessons: [
        {
          title: "Dire bonjour", description: "Les salutations de base", order: 1,
          vocabulary: [
            { word: "Hello", translation: "Bonjour", example: "Hello, my name is Sarah." },
            { word: "Hi", translation: "Salut", example: "Hi! How are you?" },
            { word: "Good morning", translation: "Bonjour (matin)", example: "Good morning, sir." },
            { word: "Good evening", translation: "Bonsoir", example: "Good evening, everyone." },
            { word: "Goodbye", translation: "Au revoir", example: "Goodbye, see you tomorrow!" },
            { word: "See you later", translation: "À plus tard", example: "See you later!" },
          ],
          grammarNote: "En anglais, 'Hello' est formel et 'Hi' est informel. On peut les utiliser à tout moment de la journée.",
        },
        {
          title: "Se présenter", description: "Dire son nom, son âge, d'où on vient", order: 2,
          vocabulary: [
            { word: "My name is...", translation: "Je m'appelle...", example: "My name is Pierre." },
            { word: "I am from...", translation: "Je viens de...", example: "I am from France." },
            { word: "I am ... years old", translation: "J'ai ... ans", example: "I am 25 years old." },
            { word: "Nice to meet you", translation: "Enchanté(e)", example: "Nice to meet you, Sarah!" },
            { word: "What is your name?", translation: "Comment t'appelles-tu ?", example: "What is your name?" },
          ],
          grammarNote: "Pour se présenter, on utilise 'I am' (je suis) suivi de l'information.",
        },
        {
          title: "Poser des questions simples", description: "Les questions de base pour faire connaissance", order: 3,
          vocabulary: [
            { word: "Where are you from?", translation: "D'où viens-tu ?", example: "Where are you from? I am from Spain." },
            { word: "How old are you?", translation: "Quel âge as-tu ?", example: "How old are you? I am 30." },
            { word: "What do you do?", translation: "Que fais-tu ?", example: "What do you do? I am a teacher." },
            { word: "Do you speak...?", translation: "Parles-tu... ?", example: "Do you speak French?" },
            { word: "Where do you live?", translation: "Où habites-tu ?", example: "Where do you live? I live in Paris." },
          ],
          grammarNote: "Les questions commencent par 'What', 'Where', 'How', ou 'Do you...?'.",
        },
      ],
    },
    {
      title: "Au restaurant", icon: "🍽️", description: "Commander, demander l'addition, poser des questions sur le menu", order: 2,
      lessons: [
        {
          title: "Réserver une table", description: "Appeler et réserver au restaurant", order: 1,
          vocabulary: [
            { word: "A table for two, please", translation: "Une table pour deux, s'il vous plaît", example: "A table for two, please." },
            { word: "Do you have a reservation?", translation: "Avez-vous une réservation ?", example: "Do you have a reservation?" },
            { word: "I'd like to book a table", translation: "Je voudrais réserver une table", example: "I'd like to book a table for tonight." },
            { word: "What time?", translation: "À quelle heure ?", example: "What time would you like?" },
            { word: "Is there a wait?", translation: "Y a-t-il de l'attente ?", example: "Is there a wait for a table?" },
          ],
          grammarNote: "'I'd like' = 'I would like' est une forme polie pour demander quelque chose.",
        },
        {
          title: "Commander un plat", description: "Lire le menu et commander", order: 2,
          vocabulary: [
            { word: "I'll have the...", translation: "Je prendrai le/la...", example: "I'll have the chicken, please." },
            { word: "What do you recommend?", translation: "Que recommandez-vous ?", example: "What do you recommend?" },
            { word: "Can I see the menu?", translation: "Puis-je voir le menu ?", example: "Can I see the menu, please?" },
            { word: "I'm allergic to...", translation: "Je suis allergique à...", example: "I'm allergic to nuts." },
            { word: "The bill, please", translation: "L'addition, s'il vous plaît", example: "The bill, please." },
          ],
          grammarNote: "'I'll have...' et 'Can I have...' sont les deux façons les plus courantes de commander.",
        },
      ],
    },
    {
      title: "Faire les courses", icon: "🛒", description: "Acheter des produits, demander les prix", order: 3,
      lessons: [
        {
          title: "Au supermarché", description: "Vocabulaire des courses", order: 1,
          vocabulary: [
            { word: "How much is this?", translation: "Combien ça coûte ?", example: "How much is this bottle of water?" },
            { word: "Where can I find...?", translation: "Où puis-je trouver... ?", example: "Where can I find the milk?" },
            { word: "Do you have...?", translation: "Avez-vous... ?", example: "Do you have any bread?" },
            { word: "I need...", translation: "J'ai besoin de...", example: "I need some eggs." },
            { word: "A bag, please", translation: "Un sac, s'il vous plaît", example: "A bag, please." },
          ],
          grammarNote: "'Some' pour les phrases affirmatives, 'any' pour les questions et négations.",
        },
        {
          title: "Payer et demander de l'aide", description: "Régler ses achats et interagir avec le caissier", order: 2,
          vocabulary: [
            { word: "Can I pay by card?", translation: "Puis-je payer par carte ?", example: "Can I pay by card or cash only?" },
            { word: "Do you have change?", translation: "Avez-vous de la monnaie ?", example: "Do you have change for a twenty?" },
            { word: "The receipt, please", translation: "Le ticket de caisse, s'il vous plaît", example: "Can I have the receipt, please?" },
            { word: "Is this on sale?", translation: "C'est en promotion ?", example: "Is this on sale this week?" },
            { word: "Where is the checkout?", translation: "Où est la caisse ?", example: "Excuse me, where is the checkout?" },
            { word: "I'd like to return this", translation: "Je voudrais retourner ceci", example: "I'd like to return this, I have the receipt." },
          ],
          grammarNote: "'Can I...?' et 'Could I...?' pour les demandes polies. 'Could' est légèrement plus formel.",
        },
      ],
    },
    {
      title: "Demander son chemin", icon: "🗺️", description: "S'orienter, comprendre les directions", order: 4,
      lessons: [
        {
          title: "Les directions", description: "Comprendre et donner des directions", order: 1,
          vocabulary: [
            { word: "Excuse me, where is...?", translation: "Excusez-moi, où est... ?", example: "Excuse me, where is the train station?" },
            { word: "Turn left / right", translation: "Tournez à gauche / droite", example: "Turn left at the traffic light." },
            { word: "Go straight", translation: "Allez tout droit", example: "Go straight for two blocks." },
            { word: "It's next to...", translation: "C'est à côté de...", example: "It's next to the bank." },
            { word: "How far is it?", translation: "C'est loin ?", example: "How far is it from here?" },
          ],
          grammarNote: "Pour les directions, on utilise l'impératif : 'Turn', 'Go', 'Walk'.",
        },
        {
          title: "Les lieux en ville", description: "Vocabulaire des endroits importants", order: 2,
          vocabulary: [
            { word: "The hospital", translation: "L'hôpital", example: "Where is the nearest hospital?" },
            { word: "The pharmacy", translation: "La pharmacie", example: "Is there a pharmacy nearby?" },
            { word: "The post office", translation: "La poste", example: "The post office is on the main street." },
            { word: "The supermarket", translation: "Le supermarché", example: "The supermarket closes at 9 pm." },
            { word: "Across the street", translation: "De l'autre côté de la rue", example: "The bank is across the street." },
            { word: "On the corner", translation: "Au coin", example: "There's a café on the corner." },
          ],
          grammarNote: "'There is' (singulier) et 'There are' (pluriel) pour indiquer l'existence d'un lieu.",
        },
      ],
    },
    {
      title: "À l'hôtel", icon: "🏨", description: "Réserver, check-in, demander des services", order: 5,
      lessons: [
        {
          title: "Le check-in", description: "Arriver et s'enregistrer à l'hôtel", order: 1,
          vocabulary: [
            { word: "I have a reservation", translation: "J'ai une réservation", example: "I have a reservation under the name Smith." },
            { word: "A single / double room", translation: "Une chambre simple / double", example: "I'd like a double room, please." },
            { word: "How many nights?", translation: "Combien de nuits ?", example: "How many nights will you be staying?" },
            { word: "Is breakfast included?", translation: "Le petit-déjeuner est inclus ?", example: "Is breakfast included in the price?" },
            { word: "What time is checkout?", translation: "À quelle heure est le checkout ?", example: "What time is checkout?" },
          ],
          grammarNote: "'Under the name' = 'au nom de'. Très utilisé pour les réservations.",
        },
        {
          title: "Les services de l'hôtel", description: "Demander des services pendant le séjour", order: 2,
          vocabulary: [
            { word: "Could I have extra towels?", translation: "Pourrais-je avoir des serviettes supplémentaires ?", example: "Could I have extra towels, please?" },
            { word: "The Wi-Fi password", translation: "Le mot de passe Wi-Fi", example: "What is the Wi-Fi password?" },
            { word: "Room service", translation: "Service en chambre", example: "I'd like to order room service." },
            { word: "Is there a pool?", translation: "Y a-t-il une piscine ?", example: "Is there a pool in the hotel?" },
            { word: "My room key doesn't work", translation: "Ma clé de chambre ne marche pas", example: "Excuse me, my room key doesn't work." },
            { word: "I'd like a wake-up call", translation: "Je voudrais un réveil téléphonique", example: "I'd like a wake-up call at 7 am." },
          ],
          grammarNote: "'Could I have...?' est plus poli que 'Can I have...?' pour les demandes à l'hôtel.",
        },
      ],
    },
    {
      title: "Les transports", icon: "🚇", description: "Prendre le bus, le métro, un taxi", order: 6,
      lessons: [
        {
          title: "Prendre les transports", description: "Se déplacer en ville", order: 1,
          vocabulary: [
            { word: "A ticket to...", translation: "Un billet pour...", example: "A ticket to the city center, please." },
            { word: "Which platform?", translation: "Quel quai ?", example: "Which platform for the train to London?" },
            { word: "Does this bus go to...?", translation: "Ce bus va à... ?", example: "Does this bus go to the airport?" },
            { word: "The next stop is...", translation: "Le prochain arrêt est...", example: "The next stop is Oxford Street." },
            { word: "How long does it take?", translation: "Combien de temps ça prend ?", example: "How long does it take to get there?" },
          ],
          grammarNote: "'How long does it take?' s'utilise pour demander la durée d'un trajet.",
        },
        {
          title: "Prendre un taxi", description: "Communiquer avec un chauffeur de taxi", order: 2,
          vocabulary: [
            { word: "Can you take me to...?", translation: "Pouvez-vous m'emmener à... ?", example: "Can you take me to the airport?" },
            { word: "How much will it cost?", translation: "Combien ça va coûter ?", example: "How much will it cost to go downtown?" },
            { word: "Stop here, please", translation: "Arrêtez-vous ici, s'il vous plaît", example: "Stop here, please. This is my hotel." },
            { word: "Keep the change", translation: "Gardez la monnaie", example: "Keep the change, thank you." },
            { word: "Is it far from here?", translation: "C'est loin d'ici ?", example: "Is the museum far from here?" },
            { word: "Can you wait for me?", translation: "Pouvez-vous m'attendre ?", example: "Can you wait for me? I'll be five minutes." },
          ],
          grammarNote: "'Will' pour le futur simple. 'How much will it cost?' = combien ça coûtera.",
        },
      ],
    },
  ]);

  // EN A2 Chapitres
  await seedChaptersWithContent(enA2, [
    {
      title: "Au travail", icon: "💼", description: "Vocabulaire professionnel de base", order: 1,
      lessons: [
        {
          title: "L'entretien d'embauche", description: "Se présenter professionnellement", order: 1,
          vocabulary: [
            { word: "I have experience in...", translation: "J'ai de l'expérience en...", example: "I have experience in marketing." },
            { word: "My strengths are...", translation: "Mes points forts sont...", example: "My strengths are communication and teamwork." },
            { word: "I graduated from...", translation: "J'ai obtenu mon diplôme de...", example: "I graduated from university in 2020." },
            { word: "Why should we hire you?", translation: "Pourquoi devrions-nous vous embaucher ?", example: "Why should we hire you?" },
            { word: "What's the salary?", translation: "Quel est le salaire ?", example: "What's the salary for this position?" },
          ],
          grammarNote: "Le present perfect ('I have worked...') est courant pour parler d'expérience professionnelle.",
        },
        {
          title: "La vie de bureau", description: "Communiquer au quotidien au travail", order: 2,
          vocabulary: [
            { word: "I have a meeting at...", translation: "J'ai une réunion à...", example: "I have a meeting at 3 pm." },
            { word: "Can you send me the report?", translation: "Peux-tu m'envoyer le rapport ?", example: "Can you send me the report by Friday?" },
            { word: "I'm working on...", translation: "Je travaille sur...", example: "I'm working on the new project." },
            { word: "Deadline", translation: "Date limite", example: "The deadline is next Monday." },
            { word: "I'll get back to you", translation: "Je reviens vers vous", example: "I'll get back to you this afternoon." },
            { word: "Could we schedule a call?", translation: "Pourrait-on planifier un appel ?", example: "Could we schedule a call for tomorrow?" },
          ],
          grammarNote: "Le present continuous ('I'm working on...') s'utilise pour parler de ce qu'on fait en ce moment.",
        },
      ],
    },
    {
      title: "Voyager", icon: "✈️", description: "À l'aéroport, réserver un vol", order: 2,
      lessons: [
        {
          title: "À l'aéroport", description: "Vocabulaire de l'aéroport", order: 1,
          vocabulary: [
            { word: "Boarding pass", translation: "Carte d'embarquement", example: "Can I see your boarding pass?" },
            { word: "Gate", translation: "Porte d'embarquement", example: "Your flight departs from gate 12." },
            { word: "Delayed / Cancelled", translation: "Retardé / Annulé", example: "The flight is delayed by two hours." },
            { word: "Luggage / Baggage", translation: "Bagages", example: "How many pieces of luggage do you have?" },
            { word: "Window / Aisle seat", translation: "Siège hublot / couloir", example: "Can I have a window seat, please?" },
          ],
          grammarNote: "'Can I have...?' et 'Could I get...?' pour les demandes polies.",
        },
        {
          title: "Réserver un hébergement", description: "Trouver et réserver un logement", order: 2,
          vocabulary: [
            { word: "I'd like to book a room", translation: "Je voudrais réserver une chambre", example: "I'd like to book a room for three nights." },
            { word: "Is there air conditioning?", translation: "Y a-t-il la climatisation ?", example: "Is there air conditioning in the room?" },
            { word: "What's the cancellation policy?", translation: "Quelle est la politique d'annulation ?", example: "What's the cancellation policy?" },
            { word: "Do you have any vacancies?", translation: "Avez-vous des chambres disponibles ?", example: "Do you have any vacancies for tonight?" },
            { word: "I'd like to extend my stay", translation: "Je voudrais prolonger mon séjour", example: "I'd like to extend my stay by two nights." },
          ],
          grammarNote: "'I'd like to...' (I would like to) est la forme polie standard pour faire une demande.",
        },
      ],
    },
    {
      title: "La santé", icon: "🏥", description: "Chez le médecin, à la pharmacie", order: 3,
      lessons: [
        {
          title: "Chez le médecin", description: "Décrire ses symptômes", order: 1,
          vocabulary: [
            { word: "I have a headache", translation: "J'ai mal à la tête", example: "I have a headache since this morning." },
            { word: "I feel sick", translation: "Je me sens malade", example: "I feel sick, I need to see a doctor." },
            { word: "It hurts here", translation: "Ça fait mal ici", example: "It hurts here when I breathe." },
            { word: "Prescription", translation: "Ordonnance", example: "You'll need a prescription for this medicine." },
            { word: "Take this medicine", translation: "Prenez ce médicament", example: "Take this medicine twice a day." },
          ],
          grammarNote: "'I have a...' + symptôme pour décrire un mal. 'I feel' + adjectif pour l'état général.",
        },
        {
          title: "À la pharmacie", description: "Acheter des médicaments et demander conseil", order: 2,
          vocabulary: [
            { word: "I need something for...", translation: "J'ai besoin de quelque chose pour...", example: "I need something for a cold." },
            { word: "Do I need a prescription?", translation: "Ai-je besoin d'une ordonnance ?", example: "Do I need a prescription for this?" },
            { word: "How often should I take it?", translation: "À quelle fréquence dois-je le prendre ?", example: "How often should I take this medicine?" },
            { word: "Are there any side effects?", translation: "Y a-t-il des effets secondaires ?", example: "Are there any side effects?" },
            { word: "Painkiller", translation: "Antidouleur", example: "Can I have some painkillers, please?" },
            { word: "I'm allergic to...", translation: "Je suis allergique à...", example: "I'm allergic to penicillin." },
          ],
          grammarNote: "'Should' exprime un conseil ou une recommandation. 'You should rest' = Tu devrais te reposer.",
        },
      ],
    },
    {
      title: "Le quotidien", icon: "🏠", description: "Parler de sa routine et de ses habitudes", order: 4,
      lessons: [
        {
          title: "Ma routine quotidienne", description: "Décrire ses habitudes du matin au soir", order: 1,
          vocabulary: [
            { word: "I usually wake up at...", translation: "Je me réveille habituellement à...", example: "I usually wake up at 7 am." },
            { word: "I commute by...", translation: "Je fais le trajet en...", example: "I commute by train every day." },
            { word: "I have lunch at...", translation: "Je déjeune à...", example: "I have lunch at noon." },
            { word: "After work, I...", translation: "Après le travail, je...", example: "After work, I go to the gym." },
            { word: "I go to bed at...", translation: "Je me couche à...", example: "I usually go to bed at 11 pm." },
          ],
          grammarNote: "Les adverbes de fréquence (always, usually, often, sometimes, never) se placent avant le verbe principal.",
        },
        {
          title: "Les tâches ménagères", description: "Vocabulaire de la maison et du ménage", order: 2,
          vocabulary: [
            { word: "To do the laundry", translation: "Faire la lessive", example: "I do the laundry every Sunday." },
            { word: "To clean the house", translation: "Nettoyer la maison", example: "We clean the house on Saturdays." },
            { word: "To do the dishes", translation: "Faire la vaisselle", example: "Can you do the dishes tonight?" },
            { word: "To go grocery shopping", translation: "Faire les courses", example: "I go grocery shopping twice a week." },
            { word: "To take out the trash", translation: "Sortir les poubelles", example: "Don't forget to take out the trash." },
            { word: "To cook dinner", translation: "Préparer le dîner", example: "I cook dinner every evening." },
          ],
          grammarNote: "En anglais, les tâches ménagères utilisent souvent 'do' + nom : 'do the dishes', 'do the laundry'.",
        },
      ],
    },
    {
      title: "Les loisirs", icon: "🎭", description: "Parler de ses hobbies et activités", order: 5,
      lessons: [
        {
          title: "Sports et hobbies", description: "Parler de ses activités préférées", order: 1,
          vocabulary: [
            { word: "I enjoy...", translation: "J'aime bien...", example: "I enjoy playing tennis on weekends." },
            { word: "I'm interested in...", translation: "Je m'intéresse à...", example: "I'm interested in photography." },
            { word: "In my free time...", translation: "Pendant mon temps libre...", example: "In my free time, I read books." },
            { word: "I've been playing... for...", translation: "Je joue à... depuis...", example: "I've been playing guitar for five years." },
            { word: "Would you like to join us?", translation: "Voudrais-tu nous rejoindre ?", example: "We're playing football. Would you like to join us?" },
          ],
          grammarNote: "'Enjoy' et 'like' sont suivis du gérondif (-ing) : 'I enjoy swimming', pas 'I enjoy to swim'.",
        },
        {
          title: "Sorties et événements", description: "Proposer et organiser des sorties", order: 2,
          vocabulary: [
            { word: "What are you doing this weekend?", translation: "Que fais-tu ce week-end ?", example: "What are you doing this weekend? Want to hang out?" },
            { word: "Let's go to...", translation: "Allons à...", example: "Let's go to the cinema tonight." },
            { word: "I'd rather...", translation: "Je préférerais...", example: "I'd rather stay home and watch a movie." },
            { word: "That sounds fun!", translation: "Ça a l'air sympa !", example: "A concert? That sounds fun!" },
            { word: "I can't make it", translation: "Je ne peux pas venir", example: "Sorry, I can't make it on Saturday." },
            { word: "How about...?", translation: "Et si on... ?", example: "How about going to the new restaurant?" },
          ],
          grammarNote: "'Let's' + verbe pour faire une suggestion. 'How about' + gérondif pour proposer une alternative.",
        },
      ],
    },
  ]);

  // EN B1 — placeholder chapters
  await seedChaptersWithContent(enB1, [
    {
      title: "Débattre et donner son opinion", icon: "💬", description: "Exprimer et défendre son point de vue", order: 1,
      lessons: [
        {
          title: "Donner son avis", description: "Exprimer son opinion avec nuance", order: 1,
          vocabulary: [
            { word: "In my opinion...", translation: "À mon avis...", example: "In my opinion, this is a good idea." },
            { word: "I agree / disagree", translation: "Je suis d'accord / pas d'accord", example: "I disagree with that statement." },
            { word: "On the other hand...", translation: "D'un autre côté...", example: "On the other hand, there are risks." },
            { word: "That's a good point", translation: "C'est un bon argument", example: "That's a good point, but consider this." },
            { word: "I see what you mean", translation: "Je vois ce que tu veux dire", example: "I see what you mean, however..." },
          ],
          grammarNote: "Pour nuancer : 'however', 'although', 'on the other hand', 'nevertheless'.",
        },
      ],
    },
  ]);

  // ---------- ESPAGNOL ----------
  console.log("📚 Espagnol...");
  const esA1 = await upsertCourse(langMap["es"], "A1", "Español — Principiante (A1)", "Aprende las bases para desenvolverte en situaciones cotidianas.", 1, false);
  const esA2 = await upsertCourse(langMap["es"], "A2", "Español — Elemental (A2)", "Refuerza tus bases y empieza a tener conversaciones simples.", 2, false);
  await upsertCourse(langMap["es"], "B1", "Español — Intermedio (B1)", "Desarrolla tu fluidez y aborda temas más complejos.", 3, true);

  await seedChaptersWithContent(esA1, [
    {
      title: "Presentarse", icon: "👋", description: "Saludar, dar tu nombre, hacer preguntas simples", order: 1,
      lessons: [
        {
          title: "Saludos básicos", description: "Las formas de saludar en español", order: 1,
          vocabulary: [
            { word: "Hola", translation: "Bonjour / Salut", example: "¡Hola! ¿Cómo estás?" },
            { word: "Buenos días", translation: "Bonjour (matin)", example: "Buenos días, señora." },
            { word: "Buenas tardes", translation: "Bon après-midi", example: "Buenas tardes, ¿cómo está usted?" },
            { word: "Buenas noches", translation: "Bonsoir / Bonne nuit", example: "Buenas noches, hasta mañana." },
            { word: "Adiós", translation: "Au revoir", example: "Adiós, ¡hasta luego!" },
            { word: "¿Cómo te llamas?", translation: "Comment t'appelles-tu ?", example: "¿Cómo te llamas? Me llamo María." },
          ],
          grammarNote: "En espagnol, il y a le tutoiement (tú) et le vouvoiement (usted). '¿Cómo estás?' (tu) vs '¿Cómo está usted?' (vous).",
        },
        {
          title: "Presentarse", description: "Dire son nom, d'où on vient", order: 2,
          vocabulary: [
            { word: "Me llamo...", translation: "Je m'appelle...", example: "Me llamo Carlos." },
            { word: "Soy de...", translation: "Je suis de...", example: "Soy de Francia." },
            { word: "Tengo ... años", translation: "J'ai ... ans", example: "Tengo veinticinco años." },
            { word: "Mucho gusto", translation: "Enchanté(e)", example: "Mucho gusto, soy Ana." },
            { word: "¿De dónde eres?", translation: "D'où viens-tu ?", example: "¿De dónde eres? Soy de Madrid." },
          ],
          grammarNote: "'Ser' (être permanent) vs 'Estar' (être temporaire). 'Soy francés' (je suis français) vs 'Estoy cansado' (je suis fatigué).",
        },
      ],
    },
    {
      title: "En el restaurante", icon: "🍽️", description: "Pedir comida, pedir la cuenta", order: 2,
      lessons: [
        {
          title: "Pedir comida", description: "Commander au restaurant", order: 1,
          vocabulary: [
            { word: "Una mesa para dos", translation: "Une table pour deux", example: "Una mesa para dos, por favor." },
            { word: "¿Qué me recomienda?", translation: "Que me recommandez-vous ?", example: "¿Qué me recomienda de postre?" },
            { word: "La cuenta, por favor", translation: "L'addition, s'il vous plaît", example: "La cuenta, por favor." },
            { word: "Quiero...", translation: "Je veux...", example: "Quiero una paella, por favor." },
            { word: "¿Tienen algo sin gluten?", translation: "Avez-vous quelque chose sans gluten ?", example: "¿Tienen algo sin gluten?" },
          ],
          grammarNote: "'Quiero' (je veux) est acceptable en espagnol, moins brusque qu'en français. Mais 'Me gustaría' (j'aimerais) est plus poli.",
        },
        {
          title: "Las bebidas y el postre", description: "Commander des boissons et des desserts", order: 2,
          vocabulary: [
            { word: "Un café con leche", translation: "Un café au lait", example: "Un café con leche, por favor." },
            { word: "¿Qué postres tienen?", translation: "Quels desserts avez-vous ?", example: "¿Qué postres tienen hoy?" },
            { word: "Una botella de agua", translation: "Une bouteille d'eau", example: "Una botella de agua sin gas, por favor." },
            { word: "¿Me trae la carta de vinos?", translation: "Pouvez-vous m'apporter la carte des vins ?", example: "¿Me trae la carta de vinos?" },
            { word: "Está riquísimo", translation: "C'est délicieux", example: "Este flan está riquísimo." },
            { word: "¿Aceptan tarjeta?", translation: "Acceptez-vous la carte ?", example: "¿Aceptan tarjeta de crédito?" },
          ],
          grammarNote: "'Traer' (apporter) est irrégulier : 'me trae' (vous m'apportez). Très utile au restaurant.",
        },
      ],
    },
    {
      title: "De compras", icon: "🛍️", description: "Acheter des vêtements, négocier", order: 3,
      lessons: [
        {
          title: "En la tienda", description: "Faire du shopping", order: 1,
          vocabulary: [
            { word: "¿Cuánto cuesta?", translation: "Combien ça coûte ?", example: "¿Cuánto cuesta esta camiseta?" },
            { word: "¿Tienen una talla más grande?", translation: "Avez-vous une taille plus grande ?", example: "¿Tienen una talla más grande?" },
            { word: "Me lo llevo", translation: "Je le prends", example: "Me lo llevo. ¿Dónde pago?" },
            { word: "¿Puedo probármelo?", translation: "Puis-je l'essayer ?", example: "¿Puedo probármelo?" },
            { word: "Es demasiado caro", translation: "C'est trop cher", example: "Es demasiado caro, ¿tiene algo más barato?" },
          ],
          grammarNote: "Les pronoms compléments se placent après l'infinitif ou le gérondif : 'probármelo' = me + lo + probar.",
        },
        {
          title: "En el mercado", description: "Acheter au marché et négocier les prix", order: 2,
          vocabulary: [
            { word: "¿A cuánto están las manzanas?", translation: "À combien sont les pommes ?", example: "¿A cuánto están las manzanas hoy?" },
            { word: "Medio kilo de...", translation: "Un demi-kilo de...", example: "Medio kilo de tomates, por favor." },
            { word: "¿Algo más?", translation: "Autre chose ?", example: "¿Algo más? — No, eso es todo." },
            { word: "¿Me puede dar una bolsa?", translation: "Pouvez-vous me donner un sac ?", example: "¿Me puede dar una bolsa, por favor?" },
            { word: "Está muy fresco", translation: "C'est très frais", example: "Este pescado está muy fresco." },
          ],
          grammarNote: "'Estar' s'utilise pour les états temporaires : 'Las manzanas están a 2 euros' (les pommes sont à 2 euros aujourd'hui).",
        },
      ],
    },
    {
      title: "Pedir direcciones", icon: "🗺️", description: "S'orienter et demander son chemin", order: 4,
      lessons: [
        {
          title: "¿Dónde está...?", description: "Demander et comprendre les directions", order: 1,
          vocabulary: [
            { word: "Perdone, ¿dónde está...?", translation: "Excusez-moi, où est... ?", example: "Perdone, ¿dónde está la estación de metro?" },
            { word: "Gire a la izquierda / derecha", translation: "Tournez à gauche / droite", example: "Gire a la derecha en el semáforo." },
            { word: "Siga todo recto", translation: "Continuez tout droit", example: "Siga todo recto hasta el final de la calle." },
            { word: "Está al lado de...", translation: "C'est à côté de...", example: "La farmacia está al lado del banco." },
            { word: "¿Está lejos de aquí?", translation: "C'est loin d'ici ?", example: "¿La playa está lejos de aquí?" },
          ],
          grammarNote: "L'impératif formel (usted) : 'gire' (tournez), 'siga' (continuez), 'cruce' (traversez).",
        },
        {
          title: "Los lugares de la ciudad", description: "Les lieux importants en ville", order: 2,
          vocabulary: [
            { word: "La estación de tren", translation: "La gare", example: "¿Cómo llego a la estación de tren?" },
            { word: "El hospital", translation: "L'hôpital", example: "El hospital está a dos calles de aquí." },
            { word: "La oficina de correos", translation: "La poste", example: "Busco la oficina de correos más cercana." },
            { word: "La plaza mayor", translation: "La place principale", example: "La plaza mayor está en el centro." },
            { word: "El supermercado", translation: "Le supermarché", example: "¿Hay un supermercado por aquí?" },
            { word: "Enfrente de...", translation: "En face de...", example: "El banco está enfrente de la iglesia." },
          ],
          grammarNote: "'Hay' (il y a) est invariable : 'Hay un banco' (il y a une banque), 'Hay dos bancos' (il y a deux banques).",
        },
      ],
    },
    {
      title: "En el hotel", icon: "🏨", description: "Réserver et séjourner à l'hôtel", order: 5,
      lessons: [
        {
          title: "La recepción", description: "Le check-in et les formalités", order: 1,
          vocabulary: [
            { word: "Tengo una reserva", translation: "J'ai une réservation", example: "Tengo una reserva a nombre de García." },
            { word: "Una habitación individual / doble", translation: "Une chambre simple / double", example: "Quiero una habitación doble, por favor." },
            { word: "¿Cuántas noches?", translation: "Combien de nuits ?", example: "¿Cuántas noches se queda?" },
            { word: "¿Está incluido el desayuno?", translation: "Le petit-déjeuner est-il inclus ?", example: "¿Está incluido el desayuno en el precio?" },
            { word: "¿A qué hora es la salida?", translation: "À quelle heure est le départ ?", example: "¿A qué hora es la salida?" },
          ],
          grammarNote: "'A nombre de' = au nom de. 'Quedarse' (rester) est un verbe pronominal : 'me quedo' (je reste).",
        },
        {
          title: "Los servicios del hotel", description: "Demander des services pendant le séjour", order: 2,
          vocabulary: [
            { word: "¿Pueden darme toallas extra?", translation: "Pouvez-vous me donner des serviettes supplémentaires ?", example: "¿Pueden darme toallas extra, por favor?" },
            { word: "¿Cuál es la contraseña del Wi-Fi?", translation: "Quel est le mot de passe Wi-Fi ?", example: "¿Cuál es la contraseña del Wi-Fi?" },
            { word: "¿Hay piscina?", translation: "Y a-t-il une piscine ?", example: "¿Hay piscina en el hotel?" },
            { word: "El aire acondicionado no funciona", translation: "La climatisation ne marche pas", example: "El aire acondicionado no funciona en mi habitación." },
            { word: "¿Pueden llamarme un taxi?", translation: "Pouvez-vous m'appeler un taxi ?", example: "¿Pueden llamarme un taxi para las 8?" },
            { word: "Quiero hacer el check-out", translation: "Je voudrais faire le check-out", example: "Buenos días, quiero hacer el check-out." },
          ],
          grammarNote: "'Poder' (pouvoir) au présent : puedo, puedes, puede, podemos, podéis, pueden.",
        },
      ],
    },
    {
      title: "El transporte", icon: "🚇", description: "Prendre les transports en commun", order: 6,
      lessons: [
        {
          title: "En el metro y el autobús", description: "Se déplacer en transports en commun", order: 1,
          vocabulary: [
            { word: "Un billete de ida", translation: "Un billet aller", example: "Un billete de ida a Barcelona, por favor." },
            { word: "¿Qué línea tengo que tomar?", translation: "Quelle ligne dois-je prendre ?", example: "¿Qué línea tengo que tomar para ir al centro?" },
            { word: "¿Este autobús va a...?", translation: "Ce bus va à... ?", example: "¿Este autobús va al aeropuerto?" },
            { word: "La próxima parada", translation: "Le prochain arrêt", example: "La próxima parada es Sol." },
            { word: "¿Cuánto tarda?", translation: "Combien de temps ça prend ?", example: "¿Cuánto tarda en llegar al centro?" },
          ],
          grammarNote: "'Tener que' + infinitif = devoir. 'Tengo que tomar el metro' = Je dois prendre le métro.",
        },
        {
          title: "En el taxi", description: "Prendre un taxi et communiquer avec le chauffeur", order: 2,
          vocabulary: [
            { word: "¿Me puede llevar a...?", translation: "Pouvez-vous m'emmener à... ?", example: "¿Me puede llevar al aeropuerto?" },
            { word: "¿Cuánto cuesta hasta...?", translation: "Combien ça coûte jusqu'à... ?", example: "¿Cuánto cuesta hasta el centro?" },
            { word: "Pare aquí, por favor", translation: "Arrêtez-vous ici, s'il vous plaît", example: "Pare aquí, por favor. Es este edificio." },
            { word: "Quédese con el cambio", translation: "Gardez la monnaie", example: "Quédese con el cambio, gracias." },
            { word: "¿Puede ir más rápido?", translation: "Pouvez-vous aller plus vite ?", example: "¿Puede ir más rápido? Llego tarde." },
            { word: "¿Tiene taxímetro?", translation: "Avez-vous un taximètre ?", example: "¿Tiene taxímetro? No quiero precio fijo." },
          ],
          grammarNote: "L'impératif formel négatif : 'no pare' (ne vous arrêtez pas). Le positif : 'pare' (arrêtez-vous).",
        },
      ],
    },
  ]);

  // ES A2 Chapitres
  await seedChaptersWithContent(esA2, [
    {
      title: "El trabajo", icon: "💼", description: "Le monde professionnel et les échanges au bureau", order: 1,
      lessons: [
        {
          title: "La entrevista de trabajo", description: "Se présenter lors d'un entretien", order: 1,
          vocabulary: [
            { word: "Tengo experiencia en...", translation: "J'ai de l'expérience en...", example: "Tengo experiencia en ventas." },
            { word: "Mis puntos fuertes son...", translation: "Mes points forts sont...", example: "Mis puntos fuertes son la comunicación y el trabajo en equipo." },
            { word: "Me gradué en...", translation: "J'ai obtenu mon diplôme en...", example: "Me gradué en la universidad en 2020." },
            { word: "¿Cuál es el sueldo?", translation: "Quel est le salaire ?", example: "¿Cuál es el sueldo para este puesto?" },
            { word: "Estoy disponible a partir de...", translation: "Je suis disponible à partir de...", example: "Estoy disponible a partir de lunes." },
          ],
          grammarNote: "Le pretérito perfecto (passé composé) : 'He trabajado en...' = J'ai travaillé dans...",
        },
        {
          title: "En la oficina", description: "La vie quotidienne au bureau", order: 2,
          vocabulary: [
            { word: "Tengo una reunión a las...", translation: "J'ai une réunion à...", example: "Tengo una reunión a las tres." },
            { word: "¿Puedes enviarme el informe?", translation: "Peux-tu m'envoyer le rapport ?", example: "¿Puedes enviarme el informe antes del viernes?" },
            { word: "Estoy trabajando en...", translation: "Je travaille sur...", example: "Estoy trabajando en el nuevo proyecto." },
            { word: "La fecha límite", translation: "La date limite", example: "La fecha límite es el lunes que viene." },
            { word: "Te contesto luego", translation: "Je te réponds plus tard", example: "Ahora no puedo, te contesto luego." },
            { word: "¿Podemos agendar una llamada?", translation: "Peut-on planifier un appel ?", example: "¿Podemos agendar una llamada para mañana?" },
          ],
          grammarNote: "'Estar' + gérondif pour les actions en cours : 'Estoy trabajando' = Je suis en train de travailler.",
        },
      ],
    },
    {
      title: "Viajar", icon: "✈️", description: "Voyager et découvrir de nouveaux endroits", order: 2,
      lessons: [
        {
          title: "En el aeropuerto", description: "Vocabulaire et phrases utiles à l'aéroport", order: 1,
          vocabulary: [
            { word: "La tarjeta de embarque", translation: "La carte d'embarquement", example: "¿Me puede mostrar su tarjeta de embarque?" },
            { word: "La puerta de embarque", translation: "La porte d'embarquement", example: "Su vuelo sale por la puerta 15." },
            { word: "El vuelo está retrasado", translation: "Le vol est retardé", example: "El vuelo está retrasado dos horas." },
            { word: "El equipaje", translation: "Les bagages", example: "¿Cuántas maletas de equipaje lleva?" },
            { word: "Asiento de ventanilla / pasillo", translation: "Siège hublot / couloir", example: "Quiero un asiento de ventanilla, por favor." },
          ],
          grammarNote: "'Llevar' a plusieurs sens : porter, emmener, emporter. 'Llevo dos maletas' = J'ai deux valises.",
        },
        {
          title: "Organizar un viaje", description: "Planifier et réserver un voyage", order: 2,
          vocabulary: [
            { word: "Quiero reservar un vuelo a...", translation: "Je veux réserver un vol pour...", example: "Quiero reservar un vuelo a Madrid." },
            { word: "¿Cuánto cuesta el viaje?", translation: "Combien coûte le voyage ?", example: "¿Cuánto cuesta el viaje de ida y vuelta?" },
            { word: "¿Hay descuentos?", translation: "Y a-t-il des réductions ?", example: "¿Hay descuentos para estudiantes?" },
            { word: "Necesito un seguro de viaje", translation: "J'ai besoin d'une assurance voyage", example: "¿Necesito un seguro de viaje para Europa?" },
            { word: "¿Cuándo sale el próximo tren?", translation: "Quand part le prochain train ?", example: "¿Cuándo sale el próximo tren a Sevilla?" },
            { word: "Ida y vuelta", translation: "Aller-retour", example: "Un billete de ida y vuelta, por favor." },
          ],
          grammarNote: "'Necesitar' (avoir besoin de) se conjugue régulièrement : necesito, necesitas, necesita...",
        },
      ],
    },
    {
      title: "La salud", icon: "🏥", description: "La santé, le médecin et la pharmacie", order: 3,
      lessons: [
        {
          title: "En el médico", description: "Décrire ses symptômes au médecin", order: 1,
          vocabulary: [
            { word: "Me duele la cabeza", translation: "J'ai mal à la tête", example: "Me duele la cabeza desde esta mañana." },
            { word: "Me siento mal", translation: "Je me sens mal", example: "Me siento mal, necesito ver a un médico." },
            { word: "Me duele aquí", translation: "J'ai mal ici", example: "Me duele aquí cuando respiro." },
            { word: "La receta médica", translation: "L'ordonnance", example: "Necesita una receta médica para este medicamento." },
            { word: "Tome este medicamento", translation: "Prenez ce médicament", example: "Tome este medicamento dos veces al día." },
          ],
          grammarNote: "'Doler' fonctionne comme 'gustar' : 'Me duele la cabeza' (la tête me fait mal). Sujet inversé !",
        },
        {
          title: "En la farmacia", description: "Acheter des médicaments", order: 2,
          vocabulary: [
            { word: "Necesito algo para...", translation: "J'ai besoin de quelque chose pour...", example: "Necesito algo para el dolor de estómago." },
            { word: "¿Necesito receta?", translation: "Ai-je besoin d'une ordonnance ?", example: "¿Necesito receta para comprar esto?" },
            { word: "¿Cada cuánto lo tomo?", translation: "À quelle fréquence dois-je le prendre ?", example: "¿Cada cuánto lo tomo?" },
            { word: "¿Tiene efectos secundarios?", translation: "Y a-t-il des effets secondaires ?", example: "¿Tiene efectos secundarios este medicamento?" },
            { word: "Soy alérgico/a a...", translation: "Je suis allergique à...", example: "Soy alérgico a la penicilina." },
            { word: "Un analgésico", translation: "Un antidouleur", example: "¿Tiene un analgésico sin receta?" },
          ],
          grammarNote: "Le genre des adjectifs : 'alérgico' (masc.) / 'alérgica' (fém.). Toujours accorder avec le sujet.",
        },
      ],
    },
    {
      title: "La vida diaria", icon: "🏠", description: "La routine quotidienne et les activités", order: 4,
      lessons: [
        {
          title: "Mi rutina", description: "Décrire sa routine quotidienne", order: 1,
          vocabulary: [
            { word: "Me despierto a las...", translation: "Je me réveille à...", example: "Me despierto a las siete de la mañana." },
            { word: "Desayuno a las...", translation: "Je prends le petit-déjeuner à...", example: "Desayuno a las ocho." },
            { word: "Voy al trabajo en...", translation: "Je vais au travail en...", example: "Voy al trabajo en metro." },
            { word: "Almuerzo a mediodía", translation: "Je déjeune à midi", example: "Almuerzo a mediodía en la cafetería." },
            { word: "Me acuesto a las...", translation: "Je me couche à...", example: "Me acuesto a las once de la noche." },
          ],
          grammarNote: "Les verbes pronominaux : 'despertarse' (se réveiller), 'acostarse' (se coucher). Le pronom change : me, te, se...",
        },
        {
          title: "Las tareas del hogar", description: "Le ménage et les tâches domestiques", order: 2,
          vocabulary: [
            { word: "Hacer la colada", translation: "Faire la lessive", example: "Hago la colada todos los domingos." },
            { word: "Limpiar la casa", translation: "Nettoyer la maison", example: "Limpiamos la casa los sábados." },
            { word: "Fregar los platos", translation: "Faire la vaisselle", example: "¿Puedes fregar los platos esta noche?" },
            { word: "Hacer la compra", translation: "Faire les courses", example: "Hago la compra dos veces por semana." },
            { word: "Sacar la basura", translation: "Sortir les poubelles", example: "No olvides sacar la basura." },
            { word: "Cocinar la cena", translation: "Préparer le dîner", example: "Cocino la cena todas las noches." },
          ],
          grammarNote: "'Hacer' (faire) est irrégulier : hago, haces, hace, hacemos, hacéis, hacen. Très utilisé au quotidien.",
        },
      ],
    },
  ]);

  // ---------- JAPONAIS ----------
  console.log("📚 Japonais...");
  const jaA1 = await upsertCourse(langMap["ja"], "A1", "日本語 — 初級 (A1)", "Les bases du japonais pour te débrouiller au quotidien.", 1, false);
  const jaA2 = await upsertCourse(langMap["ja"], "A2", "日本語 — 初中級 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  await upsertCourse(langMap["ja"], "B1", "日本語 — 中級 (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

  await seedChaptersWithContent(jaA1, [
    {
      title: "自己紹介 (Se présenter)", icon: "👋", description: "Se saluer et se présenter en japonais", order: 1,
      lessons: [
        {
          title: "あいさつ (Salutations)", description: "Les salutations de base", order: 1,
          vocabulary: [
            { word: "こんにちは", translation: "Bonjour", example: "こんにちは、お元気ですか？(Bonjour, comment allez-vous ?)" },
            { word: "おはようございます", translation: "Bonjour (matin)", example: "おはようございます！(Bonjour !)" },
            { word: "こんばんは", translation: "Bonsoir", example: "こんばんは。(Bonsoir.)" },
            { word: "さようなら", translation: "Au revoir", example: "さようなら、また明日。(Au revoir, à demain.)" },
            { word: "ありがとうございます", translation: "Merci beaucoup", example: "ありがとうございます！(Merci beaucoup !)" },
            { word: "すみません", translation: "Excusez-moi / Pardon", example: "すみません、駅はどこですか？(Excusez-moi, où est la gare ?)" },
          ],
          grammarNote: "En japonais, le niveau de politesse est essentiel. 'ございます' rend l'expression plus polie.",
        },
        {
          title: "名前と国 (Nom et pays)", description: "Dire son nom et sa nationalité", order: 2,
          vocabulary: [
            { word: "私は...です", translation: "Je suis...", example: "私はピエールです。(Je suis Pierre.)" },
            { word: "フランス人です", translation: "Je suis français(e)", example: "私はフランス人です。(Je suis français.)" },
            { word: "お名前は？", translation: "Votre nom ?", example: "お名前は何ですか？(Quel est votre nom ?)" },
            { word: "はじめまして", translation: "Enchanté(e)", example: "はじめまして、よろしくお願いします。(Enchanté, ravi de vous connaître.)" },
            { word: "どこから来ましたか？", translation: "D'où venez-vous ?", example: "どこから来ましたか？パリから来ました。(D'où venez-vous ? De Paris.)" },
          ],
          grammarNote: "La structure de base : [Sujet] は [Complément] です。'は' (wa) est la particule du sujet, 'です' marque la politesse.",
        },
      ],
    },
    {
      title: "レストランで (Au restaurant)", icon: "🍱", description: "Commander dans un restaurant japonais", order: 2,
      lessons: [
        {
          title: "注文する (Commander)", description: "Les phrases essentielles au restaurant", order: 1,
          vocabulary: [
            { word: "メニューをお願いします", translation: "Le menu, s'il vous plaît", example: "すみません、メニューをお願いします。" },
            { word: "これをください", translation: "Ceci, s'il vous plaît", example: "これをください。(Je prendrai ceci.)" },
            { word: "おすすめは何ですか？", translation: "Que recommandez-vous ?", example: "おすすめは何ですか？" },
            { word: "お会計お願いします", translation: "L'addition, s'il vous plaît", example: "お会計お願いします。" },
            { word: "おいしい！", translation: "Délicieux !", example: "このラーメンはおいしい！(Ce ramen est délicieux !)" },
          ],
          grammarNote: "'ください' = s'il vous plaît (quand on demande quelque chose). 'お願いします' = forme plus polie.",
        },
      ],
    },
    {
      title: "買い物 (Faire les courses)", icon: "🛒", description: "Acheter des produits, demander les prix", order: 3,
      lessons: [
        {
          title: "お店で (Au magasin)", description: "Vocabulaire pour faire du shopping", order: 1,
          vocabulary: [
            { word: "いくらですか？", translation: "Combien ça coûte ?", example: "これはいくらですか？(Combien coûte ceci ?)" },
            { word: "これをください", translation: "Ceci, s'il vous plaît", example: "この本をください。(Ce livre, s'il vous plaît.)" },
            { word: "大きい (ookii)", translation: "Grand", example: "もっと大きいサイズはありますか？(Avez-vous une taille plus grande ?)" },
            { word: "小さい (chiisai)", translation: "Petit", example: "小さいのをください。(Le petit, s'il vous plaît.)" },
            { word: "高い (takai)", translation: "Cher / Haut", example: "ちょっと高いですね。(C'est un peu cher.)" },
            { word: "安い (yasui)", translation: "Bon marché", example: "もっと安いのはありますか？(Y a-t-il quelque chose de moins cher ?)" },
          ],
          grammarNote: "'ありますか' = est-ce qu'il y a ? Pour les objets inanimés. Pour les êtres vivants, on utilise 'いますか'.",
        },
        {
          title: "コンビニで (Au konbini)", description: "Acheter au convenience store", order: 2,
          vocabulary: [
            { word: "袋はいりますか？(fukuro wa irimasu ka)", translation: "Voulez-vous un sac ?", example: "袋はいりますか？はい、お願いします。(Voulez-vous un sac ? Oui, s'il vous plaît.)" },
            { word: "温めますか？(atatamemasu ka)", translation: "Je vous le réchauffe ?", example: "お弁当、温めますか？(Je réchauffe le bentô ?)" },
            { word: "お箸 (ohashi)", translation: "Baguettes", example: "お箸をください。(Des baguettes, s'il vous plaît.)" },
            { word: "レシート (reshîto)", translation: "Reçu / Ticket", example: "レシートはいりますか？(Voulez-vous le reçu ?)" },
            { word: "カードで払います (kâdo de haraimasu)", translation: "Je paie par carte", example: "カードで払います。(Je paie par carte.)" },
          ],
          grammarNote: "Le konbini (コンビニ) est central au Japon. Les questions avec 'いりますか' demandent si vous voulez/avez besoin de quelque chose.",
        },
      ],
    },
    {
      title: "道を聞く (Demander son chemin)", icon: "🗺️", description: "S'orienter et comprendre les directions", order: 4,
      lessons: [
        {
          title: "方向 (Les directions)", description: "Comprendre et donner des directions", order: 1,
          vocabulary: [
            { word: "右 (migi)", translation: "Droite", example: "右に曲がってください。(Tournez à droite, s'il vous plaît.)" },
            { word: "左 (hidari)", translation: "Gauche", example: "左に曲がってください。(Tournez à gauche, s'il vous plaît.)" },
            { word: "まっすぐ (massugu)", translation: "Tout droit", example: "まっすぐ行ってください。(Allez tout droit, s'il vous plaît.)" },
            { word: "駅 (eki)", translation: "Gare", example: "駅はどこですか？(Où est la gare ?)" },
            { word: "近い (chikai)", translation: "Proche", example: "ここから近いですか？(C'est proche d'ici ?)" },
            { word: "遠い (toi)", translation: "Loin", example: "ちょっと遠いです。(C'est un peu loin.)" },
          ],
          grammarNote: "'〜てください' est la forme polie pour faire une demande. 'どこですか' = où est-ce ?",
        },
        {
          title: "場所を探す (Trouver un lieu)", description: "Demander où se trouvent les lieux", order: 2,
          vocabulary: [
            { word: "トイレはどこですか？", translation: "Où sont les toilettes ?", example: "すみません、トイレはどこですか？(Excusez-moi, où sont les toilettes ?)" },
            { word: "〜の隣 (no tonari)", translation: "À côté de...", example: "銀行の隣にあります。(C'est à côté de la banque.)" },
            { word: "〜の前 (no mae)", translation: "Devant...", example: "駅の前にあります。(C'est devant la gare.)" },
            { word: "〜の後ろ (no ushiro)", translation: "Derrière...", example: "コンビニの後ろにあります。(C'est derrière le konbini.)" },
            { word: "交差点 (kôsaten)", translation: "Carrefour / Intersection", example: "次の交差点を右に曲がってください。(Tournez à droite au prochain carrefour.)" },
          ],
          grammarNote: "Pour localiser : [Lieu A] の [position] に [Lieu B] があります。Les particules の et に sont essentielles ici.",
        },
      ],
    },
    {
      title: "ホテルで (À l'hôtel)", icon: "🏨", description: "Réserver, check-in, demander des services", order: 5,
      lessons: [
        {
          title: "チェックイン (Le check-in)", description: "S'enregistrer à l'hôtel", order: 1,
          vocabulary: [
            { word: "予約 (yoyaku)", translation: "Réservation", example: "予約があります。(J'ai une réservation.)" },
            { word: "一泊 (ippaku)", translation: "Une nuit", example: "二泊お願いします。(Deux nuits, s'il vous plaît.)" },
            { word: "シングルルーム (shinguru rûmu)", translation: "Chambre simple", example: "シングルルームをお願いします。(Une chambre simple, s'il vous plaît.)" },
            { word: "朝食付き (chôshoku tsuki)", translation: "Petit-déjeuner inclus", example: "朝食付きですか？(Le petit-déjeuner est-il inclus ?)" },
            { word: "チェックアウト (chekkuauto)", translation: "Check-out", example: "チェックアウトは何時ですか？(Le check-out est à quelle heure ?)" },
          ],
          grammarNote: "Beaucoup de mots d'hôtellerie en japonais sont des emprunts à l'anglais écrits en katakana (シングル, チェックイン, etc.).",
        },
        {
          title: "ホテルのサービス (Services de l'hôtel)", description: "Demander des services", order: 2,
          vocabulary: [
            { word: "Wi-Fiのパスワード", translation: "Mot de passe Wi-Fi", example: "Wi-Fiのパスワードを教えてください。(Le mot de passe Wi-Fi, s'il vous plaît.)" },
            { word: "タオル (taoru)", translation: "Serviette", example: "タオルをもう一枚お願いします。(Une serviette de plus, s'il vous plaît.)" },
            { word: "鍵 (kagi)", translation: "Clé", example: "鍵をなくしました。(J'ai perdu ma clé.)" },
            { word: "エレベーター (erebêtâ)", translation: "Ascenseur", example: "エレベーターはどこですか？(Où est l'ascenseur ?)" },
            { word: "荷物 (nimotsu)", translation: "Bagages", example: "荷物を預かってもらえますか？(Pouvez-vous garder mes bagages ?)" },
          ],
          grammarNote: "'〜てもらえますか' est une forme polie pour demander un service. Plus poli que '〜てください'.",
        },
      ],
    },
    {
      title: "日常生活 (Vie quotidienne)", icon: "🏠", description: "Parler de sa routine et de sa vie de tous les jours", order: 6,
      lessons: [
        {
          title: "毎日の生活 (La routine)", description: "Décrire sa routine quotidienne", order: 1,
          vocabulary: [
            { word: "起きます (okimasu)", translation: "Se lever", example: "毎朝7時に起きます。(Je me lève à 7h chaque matin.)" },
            { word: "食べます (tabemasu)", translation: "Manger", example: "朝ごはんを食べます。(Je mange le petit-déjeuner.)" },
            { word: "仕事 (shigoto)", translation: "Travail", example: "9時から仕事です。(Le travail commence à 9h.)" },
            { word: "寝ます (nemasu)", translation: "Dormir / Se coucher", example: "11時に寝ます。(Je me couche à 23h.)" },
            { word: "〜時 (ji)", translation: "...heure(s)", example: "今、何時ですか？3時です。(Quelle heure est-il ? Il est 3h.)" },
            { word: "毎日 (mainichi)", translation: "Chaque jour", example: "毎日日本語を勉強します。(J'étudie le japonais chaque jour.)" },
          ],
          grammarNote: "Les verbes en '-ます' (masu) sont la forme polie. L'heure se dit : [nombre]時 (ji). Les minutes : [nombre]分 (fun/pun).",
        },
        {
          title: "趣味 (Les loisirs)", description: "Parler de ses hobbies et passe-temps", order: 2,
          vocabulary: [
            { word: "趣味 (shumi)", translation: "Hobby / Loisir", example: "趣味は何ですか？(Quel est votre hobby ?)" },
            { word: "映画 (eiga)", translation: "Film / Cinéma", example: "映画を見るのが好きです。(J'aime regarder des films.)" },
            { word: "音楽 (ongaku)", translation: "Musique", example: "音楽を聞きます。(J'écoute de la musique.)" },
            { word: "読書 (dokusho)", translation: "Lecture", example: "読書が好きです。(J'aime la lecture.)" },
            { word: "スポーツ (supôtsu)", translation: "Sport", example: "スポーツをしますか？(Faites-vous du sport ?)" },
          ],
          grammarNote: "'〜のが好きです' = j'aime [faire quelque chose]. Le 'の' transforme un verbe en nom (nominalisation).",
        },
      ],
    },
  ]);

  // JA A2 Chapitres
  await seedChaptersWithContent(jaA2, [
    {
      title: "仕事で (Au travail)", icon: "💼", description: "Vocabulaire professionnel de base", order: 1,
      lessons: [
        {
          title: "面接 (L'entretien)", description: "Se présenter dans un contexte professionnel", order: 1,
          vocabulary: [
            { word: "経験 (keiken)", translation: "Expérience", example: "マーケティングの経験があります。(J'ai de l'expérience en marketing.)" },
            { word: "得意 (tokui)", translation: "Point fort / Spécialité", example: "コミュニケーションが得意です。(La communication est mon point fort.)" },
            { word: "大学 (daigaku)", translation: "Université", example: "2020年に大学を卒業しました。(J'ai obtenu mon diplôme en 2020.)" },
            { word: "給料 (kyûryô)", translation: "Salaire", example: "給料はいくらですか？(Quel est le salaire ?)" },
            { word: "よろしくお願いします", translation: "Je compte sur vous / Merci d'avance", example: "よろしくお願いします。(Expression clé en milieu pro.)" },
          ],
          grammarNote: "'〜があります' exprime la possession ou l'existence. '卒業しました' (sotsugyô shimashita) = forme passée polie de 'obtenir son diplôme'.",
        },
        {
          title: "職場で (Au bureau)", description: "Les interactions quotidiennes au travail", order: 2,
          vocabulary: [
            { word: "会議 (kaigi)", translation: "Réunion", example: "3時に会議があります。(Il y a une réunion à 15h.)" },
            { word: "報告 (hôkoku)", translation: "Rapport", example: "報告書を書きます。(J'écris un rapport.)" },
            { word: "お疲れ様です (otsukaresama desu)", translation: "Bon travail (salutation au bureau)", example: "お疲れ様です！(Expression utilisée chaque jour au bureau.)" },
            { word: "締め切り (shimekiri)", translation: "Date limite / Deadline", example: "締め切りはいつですか？(Quelle est la date limite ?)" },
            { word: "メールを送る (mêru wo okuru)", translation: "Envoyer un e-mail", example: "メールを送りました。(J'ai envoyé un e-mail.)" },
          ],
          grammarNote: "'お疲れ様です' est une expression incontournable au travail au Japon. Elle sert de salutation, remerciement et au revoir entre collègues.",
        },
      ],
    },
    {
      title: "旅行 (Voyager)", icon: "✈️", description: "À l'aéroport, réserver un vol", order: 2,
      lessons: [
        {
          title: "空港で (À l'aéroport)", description: "Vocabulaire de l'aéroport", order: 1,
          vocabulary: [
            { word: "搭乗券 (tôjôken)", translation: "Carte d'embarquement", example: "搭乗券を見せてください。(Montrez votre carte d'embarquement.)" },
            { word: "ゲート (gêto)", translation: "Porte d'embarquement", example: "12番ゲートから出発します。(Le départ est à la porte 12.)" },
            { word: "遅延 (chien)", translation: "Retard", example: "飛行機が2時間遅延しています。(L'avion a 2 heures de retard.)" },
            { word: "荷物 (nimotsu)", translation: "Bagages", example: "荷物はいくつありますか？(Combien de bagages avez-vous ?)" },
            { word: "窓側 / 通路側 (madogawa / tsûrogawa)", translation: "Côté hublot / couloir", example: "窓側の席をお願いします。(Un siège côté hublot, s'il vous plaît.)" },
          ],
          grammarNote: "'〜ています' exprime un état en cours. '遅延しています' = est retardé (état actuel). Différent de '遅延します' (sera retardé).",
        },
        {
          title: "電車に乗る (Prendre le train)", description: "Se déplacer en train au Japon", order: 2,
          vocabulary: [
            { word: "切符 (kippu)", translation: "Billet", example: "切符を買います。(J'achète un billet.)" },
            { word: "乗り換え (norikae)", translation: "Correspondance", example: "新宿で乗り換えてください。(Changez à Shinjuku.)" },
            { word: "次の駅 (tsugi no eki)", translation: "La prochaine gare", example: "次の駅は渋谷です。(La prochaine gare est Shibuya.)" },
            { word: "出口 (deguchi)", translation: "Sortie", example: "東口から出てください。(Sortez par la sortie Est.)" },
            { word: "片道 / 往復 (katamichi / ôfuku)", translation: "Aller simple / Aller-retour", example: "往復切符をお願いします。(Un billet aller-retour, s'il vous plaît.)" },
          ],
          grammarNote: "'〜で乗り換える' = changer à [lieu]. Le système de trains japonais est très ponctuel, les annonces sont claires et souvent bilingues.",
        },
      ],
    },
    {
      title: "健康 (La santé)", icon: "🏥", description: "Chez le médecin, à la pharmacie", order: 3,
      lessons: [
        {
          title: "病院で (Chez le médecin)", description: "Décrire ses symptômes", order: 1,
          vocabulary: [
            { word: "頭が痛い (atama ga itai)", translation: "J'ai mal à la tête", example: "今朝から頭が痛いです。(J'ai mal à la tête depuis ce matin.)" },
            { word: "熱がある (netsu ga aru)", translation: "Avoir de la fièvre", example: "熱があります。(J'ai de la fièvre.)" },
            { word: "薬 (kusuri)", translation: "Médicament", example: "薬を飲んでください。(Prenez ce médicament.)" },
            { word: "お腹が痛い (onaka ga itai)", translation: "J'ai mal au ventre", example: "昨日からお腹が痛いです。(J'ai mal au ventre depuis hier.)" },
            { word: "病院 (byôin)", translation: "Hôpital", example: "近くに病院はありますか？(Y a-t-il un hôpital à proximité ?)" },
          ],
          grammarNote: "Pour décrire une douleur : [partie du corps] が痛い (itai). Pour dire 'depuis' : 〜から. Ex : '昨日から' = depuis hier.",
        },
        {
          title: "薬局で (À la pharmacie)", description: "Acheter des médicaments", order: 2,
          vocabulary: [
            { word: "風邪薬 (kazegusuri)", translation: "Médicament contre le rhume", example: "風邪薬はありますか？(Avez-vous un médicament contre le rhume ?)" },
            { word: "アレルギー (arerugî)", translation: "Allergie", example: "アレルギーがあります。(J'ai des allergies.)" },
            { word: "処方箋 (shohôsen)", translation: "Ordonnance", example: "処方箋が必要ですか？(Faut-il une ordonnance ?)" },
            { word: "一日三回 (ichinichi sankai)", translation: "Trois fois par jour", example: "一日三回飲んでください。(Prenez-le trois fois par jour.)" },
            { word: "食後 (shokugo)", translation: "Après le repas", example: "食後に飲んでください。(Prenez-le après le repas.)" },
          ],
          grammarNote: "Les fréquences : 一日 (ichinichi) = par jour, 一回 (ikkai) = une fois, 二回 (nikai) = deux fois, 三回 (sankai) = trois fois.",
        },
      ],
    },
  ]);

  // ---------- CHINOIS ----------
  console.log("📚 Chinois...");
  const zhA1 = await upsertCourse(langMap["zh"], "A1", "中文 — 入门 (A1)", "Les bases du chinois mandarin pour te débrouiller au quotidien.", 1, false);
  const zhA2 = await upsertCourse(langMap["zh"], "A2", "中文 — 基础 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  await upsertCourse(langMap["zh"], "B1", "中文 — 中级 (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

  await seedChaptersWithContent(zhA1, [
    {
      title: "自我介绍 (Se présenter)", icon: "👋", description: "Se saluer et se présenter en chinois", order: 1,
      lessons: [
        {
          title: "你好 (Salutations)", description: "Les salutations de base en chinois", order: 1,
          vocabulary: [
            { word: "你好 (nǐ hǎo)", translation: "Bonjour", example: "你好！你好吗？(Bonjour ! Comment vas-tu ?)" },
            { word: "谢谢 (xiè xie)", translation: "Merci", example: "谢谢你！(Merci !)" },
            { word: "再见 (zài jiàn)", translation: "Au revoir", example: "再见，明天见！(Au revoir, à demain !)" },
            { word: "对不起 (duì bu qǐ)", translation: "Pardon / Excusez-moi", example: "对不起，请问...(Excusez-moi, s'il vous plaît...)" },
            { word: "你叫什么名字？", translation: "Comment t'appelles-tu ?", example: "你叫什么名字？我叫Pierre。" },
            { word: "我是法国人", translation: "Je suis français(e)", example: "我是法国人，我来自巴黎。(Je suis français, je viens de Paris.)" },
          ],
          grammarNote: "Le chinois est une langue tonale avec 4 tons. L'ordre des mots est Sujet-Verbe-Objet comme en français.",
        },
      ],
    },
    {
      title: "在餐厅 (Au restaurant)", icon: "🥢", description: "Commander dans un restaurant chinois", order: 2,
      lessons: [
        {
          title: "点菜 (Commander)", description: "Les phrases essentielles au restaurant", order: 1,
          vocabulary: [
            { word: "服务员！(fúwùyuán)", translation: "Serveur !", example: "服务员！请给我菜单。(Serveur ! Le menu, s'il vous plaît.)" },
            { word: "我要这个 (wǒ yào zhè ge)", translation: "Je veux ceci", example: "我要这个，谢谢。(Je veux ceci, merci.)" },
            { word: "多少钱？(duōshao qián)", translation: "Combien ça coûte ?", example: "这个多少钱？(Combien coûte ceci ?)" },
            { word: "买单 (mǎi dān)", translation: "L'addition", example: "买单！(L'addition !)" },
            { word: "好吃！(hǎo chī)", translation: "Délicieux !", example: "这个菜好吃！(Ce plat est délicieux !)" },
          ],
          grammarNote: "En chinois, on peut interpeller le serveur directement avec '服务员'. C'est normal et pas impoli.",
        },
      ],
    },
    {
      title: "购物 (Faire les courses)", icon: "🛒", description: "Acheter des produits, demander les prix", order: 3,
      lessons: [
        {
          title: "在商店 (Au magasin)", description: "Vocabulaire pour faire du shopping", order: 1,
          vocabulary: [
            { word: "多少钱？(duōshao qián)", translation: "Combien ça coûte ?", example: "这个多少钱？(Combien coûte ceci ?)" },
            { word: "太贵了 (tài guì le)", translation: "C'est trop cher", example: "太贵了！便宜一点吧。(C'est trop cher ! Un peu moins cher, s'il vous plaît.)" },
            { word: "便宜 (piányi)", translation: "Bon marché / Pas cher", example: "这个很便宜。(C'est pas cher.)" },
            { word: "大 (dà)", translation: "Grand", example: "有大的吗？(Avez-vous en grand ?)" },
            { word: "小 (xiǎo)", translation: "Petit", example: "我要小的。(Je veux le petit.)" },
            { word: "可以试试吗？(kěyǐ shì shi ma)", translation: "Puis-je essayer ?", example: "可以试试吗？(Puis-je essayer ?)" },
          ],
          grammarNote: "'太...了' = trop... Ex : 太贵了 (trop cher), 太大了 (trop grand). '吧' en fin de phrase adoucit une suggestion.",
        },
        {
          title: "在超市 (Au supermarché)", description: "Acheter au supermarché", order: 2,
          vocabulary: [
            { word: "袋子 (dàizi)", translation: "Sac", example: "要袋子吗？(Voulez-vous un sac ?)" },
            { word: "水果 (shuǐguǒ)", translation: "Fruits", example: "我要买水果。(Je veux acheter des fruits.)" },
            { word: "蔬菜 (shūcài)", translation: "Légumes", example: "这些蔬菜很新鲜。(Ces légumes sont très frais.)" },
            { word: "牛奶 (niúnǎi)", translation: "Lait", example: "牛奶在哪里？(Où est le lait ?)" },
            { word: "刷卡 (shuā kǎ)", translation: "Payer par carte", example: "可以刷卡吗？(Puis-je payer par carte ?)" },
          ],
          grammarNote: "'在哪里？' (zài nǎlǐ) = où est... ? Structure : [objet] + 在哪里？Le '吗' en fin de phrase transforme une affirmation en question.",
        },
      ],
    },
    {
      title: "问路 (Demander son chemin)", icon: "🗺️", description: "S'orienter et comprendre les directions", order: 4,
      lessons: [
        {
          title: "方向 (Les directions)", description: "Comprendre et donner des directions", order: 1,
          vocabulary: [
            { word: "左 (zuǒ)", translation: "Gauche", example: "往左拐。(Tournez à gauche.)" },
            { word: "右 (yòu)", translation: "Droite", example: "往右拐。(Tournez à droite.)" },
            { word: "一直走 (yìzhí zǒu)", translation: "Tout droit", example: "一直走，然后往右拐。(Allez tout droit, puis tournez à droite.)" },
            { word: "在哪里？(zài nǎlǐ)", translation: "Où est... ?", example: "地铁站在哪里？(Où est la station de métro ?)" },
            { word: "远 (yuǎn)", translation: "Loin", example: "远不远？(C'est loin ?)" },
            { word: "近 (jìn)", translation: "Proche", example: "很近，走路五分钟。(C'est très proche, 5 minutes à pied.)" },
          ],
          grammarNote: "'往' (wǎng) + direction + '拐' (guǎi) = tourner vers. '走路' (zǒulù) = à pied. Les distances se donnent souvent en minutes de marche.",
        },
        {
          title: "找地方 (Trouver un lieu)", description: "Demander où se trouvent les lieux importants", order: 2,
          vocabulary: [
            { word: "请问 (qǐng wèn)", translation: "Excusez-moi (pour poser une question)", example: "请问，银行在哪里？(Excusez-moi, où est la banque ?)" },
            { word: "旁边 (pángbiān)", translation: "À côté", example: "在银行旁边。(C'est à côté de la banque.)" },
            { word: "对面 (duìmiàn)", translation: "En face", example: "在超市对面。(C'est en face du supermarché.)" },
            { word: "后面 (hòumiàn)", translation: "Derrière", example: "在酒店后面。(C'est derrière l'hôtel.)" },
            { word: "厕所 (cèsuǒ)", translation: "Toilettes", example: "请问，厕所在哪里？(Excusez-moi, où sont les toilettes ?)" },
          ],
          grammarNote: "'请问' est la formule polie pour aborder quelqu'un. Position : 在 + [lieu] + [position]. Ex : 在银行旁边 = à côté de la banque.",
        },
      ],
    },
    {
      title: "在酒店 (À l'hôtel)", icon: "🏨", description: "Réserver, check-in, demander des services", order: 5,
      lessons: [
        {
          title: "入住 (Le check-in)", description: "S'enregistrer à l'hôtel", order: 1,
          vocabulary: [
            { word: "预订 (yùdìng)", translation: "Réservation", example: "我有预订。(J'ai une réservation.)" },
            { word: "单人房 (dānrénfáng)", translation: "Chambre simple", example: "我要一间单人房。(Je veux une chambre simple.)" },
            { word: "双人房 (shuāngrénfáng)", translation: "Chambre double", example: "有双人房吗？(Avez-vous une chambre double ?)" },
            { word: "住几天？(zhù jǐ tiān)", translation: "Combien de nuits ?", example: "您住几天？两天。(Combien de nuits ? Deux nuits.)" },
            { word: "退房 (tuì fáng)", translation: "Check-out", example: "退房是几点？(Le check-out est à quelle heure ?)" },
          ],
          grammarNote: "'几' (jǐ) = combien (pour de petits nombres). '住' = séjourner/habiter. '间' est le classificateur pour les chambres.",
        },
        {
          title: "酒店服务 (Services de l'hôtel)", description: "Demander des services à l'hôtel", order: 2,
          vocabulary: [
            { word: "WiFi密码 (WiFi mìmǎ)", translation: "Mot de passe WiFi", example: "WiFi密码是什么？(Quel est le mot de passe WiFi ?)" },
            { word: "毛巾 (máojīn)", translation: "Serviette", example: "请再给我一条毛巾。(Une serviette de plus, s'il vous plaît.)" },
            { word: "钥匙 (yàoshi)", translation: "Clé", example: "我的钥匙丢了。(J'ai perdu ma clé.)" },
            { word: "电梯 (diàntī)", translation: "Ascenseur", example: "电梯在哪里？(Où est l'ascenseur ?)" },
            { word: "行李 (xíngli)", translation: "Bagages", example: "可以帮我放行李吗？(Pouvez-vous m'aider avec mes bagages ?)" },
          ],
          grammarNote: "'请' (qǐng) + verbe = s'il vous plaît + action. '再' (zài) = encore/de plus. '条' est le classificateur pour les serviettes.",
        },
      ],
    },
    {
      title: "交通 (Les transports)", icon: "🚇", description: "Prendre le bus, le métro, un taxi", order: 6,
      lessons: [
        {
          title: "坐车 (Prendre les transports)", description: "Se déplacer en ville", order: 1,
          vocabulary: [
            { word: "地铁 (dìtiě)", translation: "Métro", example: "我坐地铁去。(J'y vais en métro.)" },
            { word: "公交车 (gōngjiāochē)", translation: "Bus", example: "这路公交车去火车站吗？(Ce bus va à la gare ?)" },
            { word: "出租车 (chūzūchē)", translation: "Taxi", example: "请帮我叫一辆出租车。(Appelez-moi un taxi, s'il vous plaît.)" },
            { word: "票 (piào)", translation: "Billet", example: "一张票多少钱？(Combien coûte un billet ?)" },
            { word: "下一站 (xià yí zhàn)", translation: "Le prochain arrêt", example: "下一站是哪里？(Quel est le prochain arrêt ?)" },
            { word: "到了 (dào le)", translation: "On est arrivé", example: "到了！谢谢。(On est arrivé ! Merci.)" },
          ],
          grammarNote: "'坐' (zuò) + moyen de transport = prendre le [transport]. '辆' est le classificateur pour les véhicules. '张' pour les billets.",
        },
      ],
    },
  ]);

  // ZH A2 Chapitres
  await seedChaptersWithContent(zhA2, [
    {
      title: "工作 (Au travail)", icon: "💼", description: "Vocabulaire professionnel de base", order: 1,
      lessons: [
        {
          title: "面试 (L'entretien)", description: "Se présenter dans un contexte professionnel", order: 1,
          vocabulary: [
            { word: "经验 (jīngyàn)", translation: "Expérience", example: "我有营销经验。(J'ai de l'expérience en marketing.)" },
            { word: "优点 (yōudiǎn)", translation: "Point fort / Qualité", example: "我的优点是沟通能力。(Mon point fort est la communication.)" },
            { word: "毕业 (bìyè)", translation: "Diplômé", example: "我2020年大学毕业。(J'ai obtenu mon diplôme en 2020.)" },
            { word: "工资 (gōngzī)", translation: "Salaire", example: "工资是多少？(Quel est le salaire ?)" },
            { word: "简历 (jiǎnlì)", translation: "CV", example: "请看我的简历。(Veuillez consulter mon CV.)" },
          ],
          grammarNote: "'有' (yǒu) = avoir. '是多少' = est combien. En chinois, les dates se disent : année + 年 + mois + 月.",
        },
        {
          title: "办公室 (Au bureau)", description: "Les interactions quotidiennes au travail", order: 2,
          vocabulary: [
            { word: "开会 (kāi huì)", translation: "Avoir une réunion", example: "下午三点开会。(Réunion à 15h.)" },
            { word: "同事 (tóngshì)", translation: "Collègue", example: "他是我的同事。(C'est mon collègue.)" },
            { word: "发邮件 (fā yóujiàn)", translation: "Envoyer un e-mail", example: "我已经发邮件了。(J'ai déjà envoyé l'e-mail.)" },
            { word: "加班 (jiā bān)", translation: "Faire des heures supplémentaires", example: "今天要加班。(Je dois faire des heures sup aujourd'hui.)" },
            { word: "截止日期 (jiézhǐ rìqī)", translation: "Date limite / Deadline", example: "截止日期是什么时候？(Quelle est la date limite ?)" },
          ],
          grammarNote: "'已经...了' = déjà (action accomplie). '要' = devoir/vouloir. '什么时候' = quand.",
        },
      ],
    },
    {
      title: "旅行 (Voyager)", icon: "✈️", description: "À l'aéroport, réserver un vol", order: 2,
      lessons: [
        {
          title: "在机场 (À l'aéroport)", description: "Vocabulaire de l'aéroport", order: 1,
          vocabulary: [
            { word: "登机牌 (dēngjī pái)", translation: "Carte d'embarquement", example: "请出示您的登机牌。(Montrez votre carte d'embarquement.)" },
            { word: "登机口 (dēngjī kǒu)", translation: "Porte d'embarquement", example: "登机口在12号。(La porte d'embarquement est au numéro 12.)" },
            { word: "晚点 (wǎn diǎn)", translation: "Retardé", example: "飞机晚点两个小时。(L'avion a 2 heures de retard.)" },
            { word: "行李 (xíngli)", translation: "Bagages", example: "你有几件行李？(Combien de bagages avez-vous ?)" },
            { word: "靠窗 / 靠走道 (kào chuāng / kào zǒudào)", translation: "Côté hublot / couloir", example: "我要靠窗的座位。(Je veux un siège côté hublot.)" },
          ],
          grammarNote: "'请出示' = veuillez montrer. '几件' = combien de (avec classificateur '件' pour les bagages). '靠' = du côté de.",
        },
        {
          title: "坐火车 (Prendre le train)", description: "Se déplacer en train en Chine", order: 2,
          vocabulary: [
            { word: "火车票 (huǒchē piào)", translation: "Billet de train", example: "我要买一张火车票。(Je veux acheter un billet de train.)" },
            { word: "高铁 (gāotiě)", translation: "TGV chinois", example: "坐高铁很快。(Le TGV chinois est très rapide.)" },
            { word: "站台 (zhàntái)", translation: "Quai", example: "在几号站台？(C'est sur quel quai ?)" },
            { word: "换乘 (huàn chéng)", translation: "Correspondance", example: "在北京换乘。(Correspondance à Pékin.)" },
            { word: "单程 / 往返 (dānchéng / wǎngfǎn)", translation: "Aller simple / Aller-retour", example: "我要一张往返票。(Je veux un billet aller-retour.)" },
          ],
          grammarNote: "'在' + lieu + verbe = faire qqch à [lieu]. '几号' = quel numéro. Le réseau de TGV chinois (高铁) est le plus grand au monde.",
        },
      ],
    },
    {
      title: "健康 (La santé)", icon: "🏥", description: "Chez le médecin, à la pharmacie", order: 3,
      lessons: [
        {
          title: "看病 (Chez le médecin)", description: "Décrire ses symptômes", order: 1,
          vocabulary: [
            { word: "头疼 (tóu téng)", translation: "Mal de tête", example: "我头疼。(J'ai mal à la tête.)" },
            { word: "发烧 (fā shāo)", translation: "Avoir de la fièvre", example: "我发烧了。(J'ai de la fièvre.)" },
            { word: "药 (yào)", translation: "Médicament", example: "吃这个药。(Prenez ce médicament.)" },
            { word: "肚子疼 (dùzi téng)", translation: "Mal au ventre", example: "我肚子疼。(J'ai mal au ventre.)" },
            { word: "医院 (yīyuàn)", translation: "Hôpital", example: "附近有医院吗？(Y a-t-il un hôpital à proximité ?)" },
          ],
          grammarNote: "Douleur : [partie du corps] + 疼 (téng). '附近' (fùjìn) = à proximité. '了' en fin de phrase indique un changement d'état.",
        },
        {
          title: "在药店 (À la pharmacie)", description: "Acheter des médicaments", order: 2,
          vocabulary: [
            { word: "感冒药 (gǎnmào yào)", translation: "Médicament contre le rhume", example: "有感冒药吗？(Avez-vous un médicament contre le rhume ?)" },
            { word: "过敏 (guòmǐn)", translation: "Allergie", example: "我过敏。(J'ai des allergies.)" },
            { word: "处方 (chǔfāng)", translation: "Ordonnance", example: "需要处方吗？(Faut-il une ordonnance ?)" },
            { word: "一天三次 (yì tiān sān cì)", translation: "Trois fois par jour", example: "一天三次，饭后吃。(Trois fois par jour, après le repas.)" },
            { word: "饭后 (fàn hòu)", translation: "Après le repas", example: "饭后吃药。(Prenez le médicament après le repas.)" },
          ],
          grammarNote: "'需要' (xūyào) = avoir besoin de. '次' (cì) = fois (classificateur). '饭后' = après le repas, '饭前' = avant le repas.",
        },
      ],
    },
  ]);

  // ---------- RUSSE ----------
  console.log("📚 Russe...");
  const ruA1 = await upsertCourse(langMap["ru"], "A1", "Русский — Начальный (A1)", "Les bases du russe pour te débrouiller au quotidien.", 1, false);
  const ruA2 = await upsertCourse(langMap["ru"], "A2", "Русский — Элементарный (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  await upsertCourse(langMap["ru"], "B1", "Русский — Средний (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

  await seedChaptersWithContent(ruA1, [
    {
      title: "Знакомство (Se présenter)", icon: "👋", description: "Se saluer et se présenter en russe", order: 1,
      lessons: [
        {
          title: "Приветствие (Salutations)", description: "Les salutations de base en russe", order: 1,
          vocabulary: [
            { word: "Здравствуйте (Zdravstvuyte)", translation: "Bonjour (formel)", example: "Здравствуйте! Как дела? (Bonjour ! Comment allez-vous ?)" },
            { word: "Привет (Privet)", translation: "Salut", example: "Привет! Как ты? (Salut ! Comment vas-tu ?)" },
            { word: "Спасибо (Spasibo)", translation: "Merci", example: "Спасибо большое! (Merci beaucoup !)" },
            { word: "До свидания (Do svidaniya)", translation: "Au revoir", example: "До свидания! (Au revoir !)" },
            { word: "Меня зовут... (Menya zovut...)", translation: "Je m'appelle...", example: "Меня зовут Пьер. (Je m'appelle Pierre.)" },
            { word: "Очень приятно (Ochen' priyatno)", translation: "Enchanté(e)", example: "Очень приятно! (Enchanté !)" },
          ],
          grammarNote: "Le russe a 6 cas grammaticaux. Ne panique pas — on commence avec le nominatif (sujet) seulement !",
        },
      ],
    },
    {
      title: "В ресторане (Au restaurant)", icon: "🍽️", description: "Commander dans un restaurant russe", order: 2,
      lessons: [
        {
          title: "Заказ (Commander)", description: "Les phrases essentielles au restaurant", order: 1,
          vocabulary: [
            { word: "Меню, пожалуйста", translation: "Le menu, s'il vous plaît", example: "Меню, пожалуйста. (Le menu, s'il vous plaît.)" },
            { word: "Я хочу... (Ya khochu)", translation: "Je veux...", example: "Я хочу борщ. (Je veux du bortch.)" },
            { word: "Счёт, пожалуйста", translation: "L'addition, s'il vous plaît", example: "Счёт, пожалуйста. (L'addition, s'il vous plaît.)" },
            { word: "Очень вкусно! (Ochen' vkusno)", translation: "Très bon !", example: "Очень вкусно! (Très bon !)" },
            { word: "Что вы рекомендуете?", translation: "Que recommandez-vous ?", example: "Что вы рекомендуете? (Que recommandez-vous ?)" },
          ],
          grammarNote: "'Пожалуйста' (pojalouysta) = s'il vous plaît. Mot essentiel en russe !",
        },
      ],
    },
    {
      title: "Покупки (Faire les courses)", icon: "🛒", description: "Acheter des produits, demander les prix", order: 3,
      lessons: [
        {
          title: "В магазине (Au magasin)", description: "Vocabulaire pour faire du shopping", order: 1,
          vocabulary: [
            { word: "Сколько стоит? (Skol'ko stoit?)", translation: "Combien ça coûte ?", example: "Сколько стоит эта книга? (Combien coûte ce livre ?)" },
            { word: "Дорого (Dorogo)", translation: "Cher", example: "Это слишком дорого. (C'est trop cher.)" },
            { word: "Дёшево (Dyoshevo)", translation: "Bon marché", example: "Здесь очень дёшево. (C'est très bon marché ici.)" },
            { word: "Размер (Razmer)", translation: "Taille", example: "Какой у вас размер? (Quelle est votre taille ?)" },
            { word: "Можно примерить? (Mozhno primerit'?)", translation: "Puis-je essayer ?", example: "Можно примерить эту рубашку? (Puis-je essayer cette chemise ?)" },
            { word: "Я возьму это (Ya voz'mu eto)", translation: "Je prends ceci", example: "Я возьму это. Спасибо! (Je prends ceci. Merci !)" },
          ],
          grammarNote: "'Можно' + infinitif = est-ce qu'on peut / puis-je. 'Слишком' = trop. Le cas accusatif s'utilise pour l'objet direct.",
        },
        {
          title: "В супермаркете (Au supermarché)", description: "Acheter au supermarché", order: 2,
          vocabulary: [
            { word: "Пакет (Paket)", translation: "Sac", example: "Пакет нужен? (Avez-vous besoin d'un sac ?)" },
            { word: "Молоко (Moloko)", translation: "Lait", example: "Где молоко? (Où est le lait ?)" },
            { word: "Хлеб (Khleb)", translation: "Pain", example: "Мне нужен хлеб. (J'ai besoin de pain.)" },
            { word: "Картой (Kartoy)", translation: "Par carte", example: "Можно картой? (Puis-je payer par carte ?)" },
            { word: "Наличными (Nalichnymi)", translation: "En espèces", example: "Только наличными. (Seulement en espèces.)" },
          ],
          grammarNote: "'Нужен/нужна/нужно' = avoir besoin de (s'accorde en genre). 'Где' = où. 'Только' = seulement.",
        },
      ],
    },
    {
      title: "Как пройти? (Demander son chemin)", icon: "🗺️", description: "S'orienter et comprendre les directions", order: 4,
      lessons: [
        {
          title: "Направления (Les directions)", description: "Comprendre et donner des directions", order: 1,
          vocabulary: [
            { word: "Направо (Napravo)", translation: "À droite", example: "Поверните направо. (Tournez à droite.)" },
            { word: "Налево (Nalevo)", translation: "À gauche", example: "Поверните налево. (Tournez à gauche.)" },
            { word: "Прямо (Pryamo)", translation: "Tout droit", example: "Идите прямо. (Allez tout droit.)" },
            { word: "Где находится...? (Gde nakhoditsya?)", translation: "Où se trouve... ?", example: "Где находится вокзал? (Où se trouve la gare ?)" },
            { word: "Далеко (Daleko)", translation: "Loin", example: "Это далеко? (C'est loin ?)" },
            { word: "Близко (Blizko)", translation: "Proche", example: "Нет, это близко. (Non, c'est proche.)" },
          ],
          grammarNote: "'Идите' = allez (impératif poli). 'Поверните' = tournez (impératif poli). Le verbe 'находиться' = se trouver.",
        },
        {
          title: "Найти место (Trouver un lieu)", description: "Demander où se trouvent les lieux", order: 2,
          vocabulary: [
            { word: "Извините (Izvinite)", translation: "Excusez-moi", example: "Извините, где туалет? (Excusez-moi, où sont les toilettes ?)" },
            { word: "Рядом с... (Ryadom s...)", translation: "À côté de...", example: "Рядом с банком. (À côté de la banque.)" },
            { word: "Напротив (Naprotiv)", translation: "En face", example: "Напротив магазина. (En face du magasin.)" },
            { word: "За (Za)", translation: "Derrière", example: "За гостиницей. (Derrière l'hôtel.)" },
            { word: "Перекрёсток (Perekryostok)", translation: "Carrefour", example: "На следующем перекрёстке. (Au prochain carrefour.)" },
          ],
          grammarNote: "'Рядом с' + instrumental = à côté de. 'На' + prépositionnel = à/sur. Les prépositions russes demandent des cas spécifiques.",
        },
      ],
    },
    {
      title: "В гостинице (À l'hôtel)", icon: "🏨", description: "Réserver, check-in, demander des services", order: 5,
      lessons: [
        {
          title: "Регистрация (Le check-in)", description: "S'enregistrer à l'hôtel", order: 1,
          vocabulary: [
            { word: "Бронирование (Bronirovanie)", translation: "Réservation", example: "У меня есть бронирование. (J'ai une réservation.)" },
            { word: "Одноместный номер (Odnomestnyy nomer)", translation: "Chambre simple", example: "Одноместный номер, пожалуйста. (Une chambre simple, s'il vous plaît.)" },
            { word: "На сколько ночей? (Na skol'ko nochey?)", translation: "Pour combien de nuits ?", example: "На сколько ночей? На две. (Pour combien de nuits ? Deux.)" },
            { word: "Завтрак включён? (Zavtrak vklyuchyon?)", translation: "Le petit-déjeuner est inclus ?", example: "Завтрак включён? (Le petit-déjeuner est inclus ?)" },
            { word: "Выезд (Vyezd)", translation: "Check-out", example: "Во сколько выезд? (À quelle heure est le check-out ?)" },
          ],
          grammarNote: "'У меня есть' = j'ai. 'Во сколько' = à quelle heure. 'Включён' = inclus (participe passé passif).",
        },
        {
          title: "Услуги гостиницы (Services de l'hôtel)", description: "Demander des services", order: 2,
          vocabulary: [
            { word: "Пароль от WiFi (Parol' ot WiFi)", translation: "Mot de passe WiFi", example: "Какой пароль от WiFi? (Quel est le mot de passe WiFi ?)" },
            { word: "Полотенце (Polotentse)", translation: "Serviette", example: "Можно ещё одно полотенце? (Puis-je avoir une serviette de plus ?)" },
            { word: "Ключ (Klyuch)", translation: "Clé", example: "Я потерял ключ. (J'ai perdu ma clé.)" },
            { word: "Лифт (Lift)", translation: "Ascenseur", example: "Где лифт? (Où est l'ascenseur ?)" },
            { word: "Багаж (Bagazh)", translation: "Bagages", example: "Можно оставить багаж? (Puis-je laisser mes bagages ?)" },
          ],
          grammarNote: "'Ещё' = encore/de plus. 'Потерял' = j'ai perdu (passé masculin). 'Оставить' = laisser.",
        },
      ],
    },
    {
      title: "Повседневная жизнь (Vie quotidienne)", icon: "🏠", description: "Parler de sa routine et de sa vie de tous les jours", order: 6,
      lessons: [
        {
          title: "Мой день (Ma journée)", description: "Décrire sa routine quotidienne", order: 1,
          vocabulary: [
            { word: "Вставать (Vstavat')", translation: "Se lever", example: "Я встаю в семь утра. (Je me lève à 7h du matin.)" },
            { word: "Завтракать (Zavtrakat')", translation: "Prendre le petit-déjeuner", example: "Я завтракаю в восемь. (Je prends le petit-déjeuner à 8h.)" },
            { word: "Работа (Rabota)", translation: "Travail", example: "Работа начинается в девять. (Le travail commence à 9h.)" },
            { word: "Ложиться спать (Lozhit'sya spat')", translation: "Se coucher", example: "Я ложусь спать в одиннадцать. (Je me couche à 23h.)" },
            { word: "Каждый день (Kazhdyy den')", translation: "Chaque jour", example: "Каждый день я учу русский. (Chaque jour j'étudie le russe.)" },
            { word: "Час (Chas)", translation: "Heure", example: "Который час? Три часа. (Quelle heure est-il ? 3 heures.)" },
          ],
          grammarNote: "Les verbes réfléchis en '-ся/-сь' sont courants en russe. L'heure utilise différentes formes : час (1h), часа (2-4h), часов (5-12h).",
        },
        {
          title: "Хобби (Les loisirs)", description: "Parler de ses hobbies et passe-temps", order: 2,
          vocabulary: [
            { word: "Хобби (Khobbi)", translation: "Hobby / Loisir", example: "Какое у тебя хобби? (Quel est ton hobby ?)" },
            { word: "Фильм (Fil'm)", translation: "Film", example: "Я люблю смотреть фильмы. (J'aime regarder des films.)" },
            { word: "Музыка (Muzyka)", translation: "Musique", example: "Я слушаю музыку. (J'écoute de la musique.)" },
            { word: "Читать (Chitat')", translation: "Lire", example: "Я люблю читать. (J'aime lire.)" },
            { word: "Спорт (Sport)", translation: "Sport", example: "Ты занимаешься спортом? (Tu fais du sport ?)" },
          ],
          grammarNote: "'Люблю' + infinitif = j'aime [faire qqch]. 'Заниматься' + instrumental = pratiquer/faire. Le cas instrumental est utilisé avec 'заниматься'.",
        },
      ],
    },
  ]);

  // RU A2 Chapitres
  await seedChaptersWithContent(ruA2, [
    {
      title: "На работе (Au travail)", icon: "💼", description: "Vocabulaire professionnel de base", order: 1,
      lessons: [
        {
          title: "Собеседование (L'entretien)", description: "Se présenter dans un contexte professionnel", order: 1,
          vocabulary: [
            { word: "Опыт работы (Opyt raboty)", translation: "Expérience professionnelle", example: "У меня есть опыт в маркетинге. (J'ai de l'expérience en marketing.)" },
            { word: "Сильные стороны (Sil'nye storony)", translation: "Points forts", example: "Мои сильные стороны — общение и работа в команде. (Mes points forts sont la communication et le travail d'équipe.)" },
            { word: "Диплом (Diplom)", translation: "Diplôme", example: "Я получил диплом в 2020 году. (J'ai obtenu mon diplôme en 2020.)" },
            { word: "Зарплата (Zarplata)", translation: "Salaire", example: "Какая зарплата? (Quel est le salaire ?)" },
            { word: "Резюме (Rezyume)", translation: "CV", example: "Вот моё резюме. (Voici mon CV.)" },
          ],
          grammarNote: "'У меня есть опыт в' + prépositionnel = j'ai de l'expérience en. 'Какой/какая/какое' = quel/quelle (s'accorde en genre).",
        },
        {
          title: "В офисе (Au bureau)", description: "Les interactions quotidiennes au travail", order: 2,
          vocabulary: [
            { word: "Совещание (Soveshchanie)", translation: "Réunion", example: "В три часа совещание. (Il y a une réunion à 15h.)" },
            { word: "Коллега (Kollega)", translation: "Collègue", example: "Это мой коллега. (C'est mon collègue.)" },
            { word: "Отправить письмо (Otpravit' pis'mo)", translation: "Envoyer un e-mail", example: "Я отправил письмо. (J'ai envoyé un e-mail.)" },
            { word: "Срок (Srok)", translation: "Délai / Date limite", example: "Какой срок? (Quel est le délai ?)" },
            { word: "Перерыв (Pereryv)", translation: "Pause", example: "Когда перерыв? (Quand est la pause ?)" },
          ],
          grammarNote: "'Когда' = quand. Le passé se forme en ajoutant '-л/-ла/-ло/-ли' au radical : отправить → отправил (masc.), отправила (fém.).",
        },
      ],
    },
    {
      title: "Путешествие (Voyager)", icon: "✈️", description: "À l'aéroport, réserver un vol", order: 2,
      lessons: [
        {
          title: "В аэропорту (À l'aéroport)", description: "Vocabulaire de l'aéroport", order: 1,
          vocabulary: [
            { word: "Посадочный талон (Posadochnyy talon)", translation: "Carte d'embarquement", example: "Покажите посадочный талон. (Montrez votre carte d'embarquement.)" },
            { word: "Выход (Vykhod)", translation: "Porte d'embarquement / Sortie", example: "Выход номер 12. (Porte numéro 12.)" },
            { word: "Задержка рейса (Zaderzhka reysa)", translation: "Retard de vol", example: "Задержка рейса на два часа. (Retard de vol de 2 heures.)" },
            { word: "Багаж (Bagazh)", translation: "Bagages", example: "Сколько у вас мест багажа? (Combien de bagages avez-vous ?)" },
            { word: "У окна / У прохода (U okna / U prokhoda)", translation: "Côté hublot / couloir", example: "Место у окна, пожалуйста. (Un siège côté hublot, s'il vous plaît.)" },
          ],
          grammarNote: "'Покажите' = montrez (impératif poli). 'Номер' + nombre = numéro. 'На' + durée = pendant / de (pour les retards).",
        },
        {
          title: "На поезде (En train)", description: "Se déplacer en train en Russie", order: 2,
          vocabulary: [
            { word: "Билет (Bilet)", translation: "Billet", example: "Один билет до Москвы. (Un billet pour Moscou.)" },
            { word: "Платформа (Platforma)", translation: "Quai", example: "Какая платформа? (Quel quai ?)" },
            { word: "Пересадка (Peresadka)", translation: "Correspondance", example: "Пересадка в Москве. (Correspondance à Moscou.)" },
            { word: "Следующая остановка (Sleduyushchaya ostanovka)", translation: "Le prochain arrêt", example: "Следующая остановка — Невский проспект. (Le prochain arrêt est Nevsky Prospekt.)" },
            { word: "В одну сторону / Туда и обратно (V odnu storonu / Tuda i obratno)", translation: "Aller simple / Aller-retour", example: "Туда и обратно, пожалуйста. (Aller-retour, s'il vous plaît.)" },
          ],
          grammarNote: "'До' + génitif = jusqu'à / pour (destination). Le Transsibérien est le plus long chemin de fer au monde (9 288 km) !",
        },
      ],
    },
    {
      title: "Здоровье (La santé)", icon: "🏥", description: "Chez le médecin, à la pharmacie", order: 3,
      lessons: [
        {
          title: "У врача (Chez le médecin)", description: "Décrire ses symptômes", order: 1,
          vocabulary: [
            { word: "Голова болит (Golova bolit)", translation: "J'ai mal à la tête", example: "У меня болит голова с утра. (J'ai mal à la tête depuis ce matin.)" },
            { word: "Температура (Temperatura)", translation: "Fièvre / Température", example: "У меня температура. (J'ai de la fièvre.)" },
            { word: "Лекарство (Lekarstvo)", translation: "Médicament", example: "Примите это лекарство. (Prenez ce médicament.)" },
            { word: "Живот болит (Zhivot bolit)", translation: "J'ai mal au ventre", example: "У меня болит живот. (J'ai mal au ventre.)" },
            { word: "Больница (Bol'nitsa)", translation: "Hôpital", example: "Где ближайшая больница? (Où est l'hôpital le plus proche ?)" },
          ],
          grammarNote: "'У меня болит' + partie du corps = j'ai mal à... 'С утра' = depuis ce matin. 'Ближайший' = le plus proche (superlatif).",
        },
        {
          title: "В аптеке (À la pharmacie)", description: "Acheter des médicaments", order: 2,
          vocabulary: [
            { word: "Лекарство от простуды (Lekarstvo ot prostudy)", translation: "Médicament contre le rhume", example: "Есть лекарство от простуды? (Avez-vous un médicament contre le rhume ?)" },
            { word: "Аллергия (Allergiya)", translation: "Allergie", example: "У меня аллергия. (J'ai des allergies.)" },
            { word: "Рецепт (Retsept)", translation: "Ordonnance", example: "Нужен рецепт? (Faut-il une ordonnance ?)" },
            { word: "Три раза в день (Tri raza v den')", translation: "Trois fois par jour", example: "Три раза в день после еды. (Trois fois par jour après le repas.)" },
            { word: "После еды (Posle yedy)", translation: "Après le repas", example: "Принимайте после еды. (Prenez après le repas.)" },
          ],
          grammarNote: "'От' + génitif = contre (pour les médicaments). 'Нужен/нужна' = il faut (s'accorde en genre). 'Раз' = fois.",
        },
      ],
    },
  ]);

  // ---------- CORÉEN ----------
  console.log("📚 Coréen...");
  const koA1 = await upsertCourse(langMap["ko"], "A1", "한국어 — 초급 (A1)", "Les bases du coréen pour te débrouiller au quotidien.", 1, false);
  const koA2 = await upsertCourse(langMap["ko"], "A2", "한국어 — 초중급 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  await upsertCourse(langMap["ko"], "B1", "한국어 — 중급 (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

  await seedChaptersWithContent(koA1, [
    {
      title: "자기소개 (Se présenter)", icon: "👋", description: "Se saluer et se présenter en coréen", order: 1,
      lessons: [
        {
          title: "인사 (Salutations)", description: "Les salutations de base en coréen", order: 1,
          vocabulary: [
            { word: "안녕하세요 (Annyeonghaseyo)", translation: "Bonjour", example: "안녕하세요! 잘 지내세요? (Bonjour ! Comment allez-vous ?)" },
            { word: "감사합니다 (Gamsahamnida)", translation: "Merci", example: "감사합니다! (Merci !)" },
            { word: "안녕히 가세요 (Annyeonghi gaseyo)", translation: "Au revoir (à celui qui part)", example: "안녕히 가세요! (Au revoir !)" },
            { word: "제 이름은...입니다", translation: "Mon nom est...", example: "제 이름은 피에르입니다. (Mon nom est Pierre.)" },
            { word: "만나서 반갑습니다", translation: "Enchanté(e)", example: "만나서 반갑습니다! (Enchanté !)" },
            { word: "죄송합니다 (Joesonghamnida)", translation: "Je suis désolé(e) / Excusez-moi", example: "죄송합니다. (Je suis désolé.)" },
          ],
          grammarNote: "Le coréen a des niveaux de politesse. '-세요/-습니다' est le niveau poli standard. La structure de phrase est Sujet-Objet-Verbe.",
        },
      ],
    },
    {
      title: "식당에서 (Au restaurant)", icon: "🍜", description: "Commander dans un restaurant coréen", order: 2,
      lessons: [
        {
          title: "주문하기 (Commander)", description: "Les phrases essentielles au restaurant", order: 1,
          vocabulary: [
            { word: "메뉴 주세요 (menyu juseyo)", translation: "Le menu, s'il vous plaît", example: "메뉴 주세요. (Le menu, s'il vous plaît.)" },
            { word: "이거 주세요 (igeo juseyo)", translation: "Ceci, s'il vous plaît", example: "이거 주세요. (Ceci, s'il vous plaît.)" },
            { word: "얼마예요? (eolmayeyo)", translation: "Combien ça coûte ?", example: "이거 얼마예요? (Combien ça coûte ?)" },
            { word: "맛있어요! (masisseoyo)", translation: "C'est bon !", example: "이 비빔밥 맛있어요! (Ce bibimbap est bon !)" },
            { word: "계산해 주세요 (gyesanhae juseyo)", translation: "L'addition, s'il vous plaît", example: "계산해 주세요. (L'addition, s'il vous plaît.)" },
          ],
          grammarNote: "'주세요' (juseyo) = donnez-moi / s'il vous plaît. Le mot magique pour tout demander poliment !",
        },
      ],
    },
    {
      title: "쇼핑하기 (Faire les courses)", icon: "🛒", description: "Acheter des produits, demander les prix", order: 3,
      lessons: [
        {
          title: "가게에서 (Au magasin)", description: "Vocabulaire pour faire du shopping", order: 1,
          vocabulary: [
            { word: "얼마예요? (eolmayeyo)", translation: "Combien ça coûte ?", example: "이거 얼마예요? (Combien coûte ceci ?)" },
            { word: "너무 비싸요 (neomu bissayo)", translation: "C'est trop cher", example: "너무 비싸요. 깎아 주세요. (C'est trop cher. Faites-moi un prix.)" },
            { word: "싸다 (ssada)", translation: "Bon marché", example: "여기는 싸요. (C'est bon marché ici.)" },
            { word: "큰 거 (keun geo)", translation: "Le grand", example: "큰 거 있어요? (Avez-vous en grand ?)" },
            { word: "작은 거 (jageun geo)", translation: "Le petit", example: "작은 거 주세요. (Le petit, s'il vous plaît.)" },
            { word: "입어 봐도 돼요? (ibeo bwado dwaeyo)", translation: "Puis-je l'essayer ?", example: "이거 입어 봐도 돼요? (Puis-je essayer ceci ?)" },
          ],
          grammarNote: "'~아/어 봐도 돼요?' = puis-je essayer de... ? '깎다' = réduire (le prix). En Corée, on négocie souvent dans les marchés traditionnels.",
        },
        {
          title: "편의점에서 (Au konbini coréen)", description: "Acheter au convenience store", order: 2,
          vocabulary: [
            { word: "봉투 필요하세요? (bongtu piryohaseyo)", translation: "Avez-vous besoin d'un sac ?", example: "봉투 필요하세요? 네, 주세요. (Avez-vous besoin d'un sac ? Oui, s'il vous plaît.)" },
            { word: "데워 드릴까요? (dewo deurilkkayo)", translation: "Je vous le réchauffe ?", example: "도시락 데워 드릴까요? (Je réchauffe le bentô ?)" },
            { word: "젓가락 (jeotgarak)", translation: "Baguettes", example: "젓가락 주세요. (Des baguettes, s'il vous plaît.)" },
            { word: "영수증 (yeongsujeung)", translation: "Reçu / Ticket", example: "영수증 필요하세요? (Avez-vous besoin du reçu ?)" },
            { word: "카드로 결제할게요 (kadeuro gyeoljehalgeyo)", translation: "Je paie par carte", example: "카드로 결제할게요. (Je paie par carte.)" },
          ],
          grammarNote: "'~(으)ㄹ까요?' = forme de proposition polie. '드리다' est la forme honorifique de '주다' (donner). '~할게요' = je vais faire (intention).",
        },
      ],
    },
    {
      title: "길 묻기 (Demander son chemin)", icon: "🗺️", description: "S'orienter et comprendre les directions", order: 4,
      lessons: [
        {
          title: "방향 (Les directions)", description: "Comprendre et donner des directions", order: 1,
          vocabulary: [
            { word: "오른쪽 (oreunjjok)", translation: "Droite", example: "오른쪽으로 가세요. (Allez à droite.)" },
            { word: "왼쪽 (oenjjok)", translation: "Gauche", example: "왼쪽으로 가세요. (Allez à gauche.)" },
            { word: "직진 (jikjin)", translation: "Tout droit", example: "직진하세요. (Allez tout droit.)" },
            { word: "역 (yeok)", translation: "Station / Gare", example: "역이 어디에요? (Où est la station ?)" },
            { word: "가까워요 (gakkawoyo)", translation: "C'est proche", example: "여기서 가까워요? (C'est proche d'ici ?)" },
            { word: "멀어요 (meoreoyo)", translation: "C'est loin", example: "좀 멀어요. (C'est un peu loin.)" },
          ],
          grammarNote: "'~(으)로 가세요' = allez vers [direction]. '어디에요?' = où est-ce ? '여기서' = d'ici (point de départ).",
        },
        {
          title: "장소 찾기 (Trouver un lieu)", description: "Demander où se trouvent les lieux", order: 2,
          vocabulary: [
            { word: "화장실이 어디에요? (hwajangsiri eodieyo)", translation: "Où sont les toilettes ?", example: "실례합니다, 화장실이 어디에요? (Excusez-moi, où sont les toilettes ?)" },
            { word: "옆에 (yeope)", translation: "À côté de", example: "은행 옆에 있어요. (C'est à côté de la banque.)" },
            { word: "앞에 (ape)", translation: "Devant", example: "역 앞에 있어요. (C'est devant la station.)" },
            { word: "뒤에 (dwie)", translation: "Derrière", example: "편의점 뒤에 있어요. (C'est derrière le konbini.)" },
            { word: "사거리 (sageori)", translation: "Carrefour", example: "다음 사거리에서 오른쪽으로 가세요. (Tournez à droite au prochain carrefour.)" },
          ],
          grammarNote: "Position : [lieu] + 에 (particule de lieu). '있어요' = il y a / c'est. '실례합니다' = excusez-moi (très poli).",
        },
      ],
    },
    {
      title: "호텔에서 (À l'hôtel)", icon: "🏨", description: "Réserver, check-in, demander des services", order: 5,
      lessons: [
        {
          title: "체크인 (Le check-in)", description: "S'enregistrer à l'hôtel", order: 1,
          vocabulary: [
            { word: "예약 (yeyak)", translation: "Réservation", example: "예약했어요. (J'ai réservé.)" },
            { word: "1박 (ilbak)", translation: "Une nuit", example: "2박이요. (Deux nuits.)" },
            { word: "싱글룸 (singgeullum)", translation: "Chambre simple", example: "싱글룸 주세요. (Une chambre simple, s'il vous plaît.)" },
            { word: "아침 포함 (achim poham)", translation: "Petit-déjeuner inclus", example: "아침 포함인가요? (Le petit-déjeuner est-il inclus ?)" },
            { word: "체크아웃 (chekeauut)", translation: "Check-out", example: "체크아웃이 몇 시예요? (Le check-out est à quelle heure ?)" },
          ],
          grammarNote: "'~했어요' = forme passée polie. '몇 시' = quelle heure. '인가요?' = est-ce que c'est... ? (forme interrogative polie).",
        },
        {
          title: "호텔 서비스 (Services de l'hôtel)", description: "Demander des services", order: 2,
          vocabulary: [
            { word: "와이파이 비밀번호 (waipai bimilbeonho)", translation: "Mot de passe WiFi", example: "와이파이 비밀번호가 뭐예요? (Quel est le mot de passe WiFi ?)" },
            { word: "수건 (sugeon)", translation: "Serviette", example: "수건 하나 더 주세요. (Une serviette de plus, s'il vous plaît.)" },
            { word: "열쇠 (yeolsoe)", translation: "Clé", example: "열쇠를 잃어버렸어요. (J'ai perdu ma clé.)" },
            { word: "엘리베이터 (ellibeiteo)", translation: "Ascenseur", example: "엘리베이터가 어디에요? (Où est l'ascenseur ?)" },
            { word: "짐 (jim)", translation: "Bagages", example: "짐을 맡아 주세요. (Gardez mes bagages, s'il vous plaît.)" },
          ],
          grammarNote: "'잃어버리다' = perdre (quelque chose). '맡다' = confier/garder. '하나 더' = un de plus. '뭐예요?' = qu'est-ce que c'est ?",
        },
      ],
    },
    {
      title: "일상생활 (Vie quotidienne)", icon: "🏠", description: "Parler de sa routine et de sa vie de tous les jours", order: 6,
      lessons: [
        {
          title: "하루 일과 (La routine)", description: "Décrire sa routine quotidienne", order: 1,
          vocabulary: [
            { word: "일어나다 (ireonada)", translation: "Se lever", example: "매일 아침 7시에 일어나요. (Je me lève à 7h chaque matin.)" },
            { word: "먹다 (meokda)", translation: "Manger", example: "아침을 먹어요. (Je mange le petit-déjeuner.)" },
            { word: "일 (il)", translation: "Travail", example: "9시부터 일해요. (Je travaille à partir de 9h.)" },
            { word: "자다 (jada)", translation: "Dormir", example: "11시에 자요. (Je me couche à 23h.)" },
            { word: "몇 시 (myeot si)", translation: "Quelle heure", example: "지금 몇 시예요? 3시예요. (Quelle heure est-il ? Il est 3h.)" },
            { word: "매일 (maeil)", translation: "Chaque jour", example: "매일 한국어를 공부해요. (J'étudie le coréen chaque jour.)" },
          ],
          grammarNote: "L'heure : [nombre sino-coréen] + 시 (si). Les minutes : [nombre sino-coréen] + 분 (bun). '부터' = à partir de.",
        },
        {
          title: "취미 (Les loisirs)", description: "Parler de ses hobbies et passe-temps", order: 2,
          vocabulary: [
            { word: "취미 (chwimi)", translation: "Hobby / Loisir", example: "취미가 뭐예요? (Quel est votre hobby ?)" },
            { word: "영화 (yeonghwa)", translation: "Film / Cinéma", example: "영화 보는 것을 좋아해요. (J'aime regarder des films.)" },
            { word: "음악 (eumak)", translation: "Musique", example: "음악을 들어요. (J'écoute de la musique.)" },
            { word: "독서 (dokseo)", translation: "Lecture", example: "독서를 좋아해요. (J'aime la lecture.)" },
            { word: "운동 (undong)", translation: "Sport / Exercice", example: "운동을 하세요? (Faites-vous du sport ?)" },
          ],
          grammarNote: "'~는 것을 좋아하다' = aimer [faire quelque chose]. '것' (geot) = chose/fait (nominalisation). '좋아하다' = aimer.",
        },
      ],
    },
  ]);

  // KO A2 Chapitres
  await seedChaptersWithContent(koA2, [
    {
      title: "직장에서 (Au travail)", icon: "💼", description: "Vocabulaire professionnel de base", order: 1,
      lessons: [
        {
          title: "면접 (L'entretien)", description: "Se présenter dans un contexte professionnel", order: 1,
          vocabulary: [
            { word: "경험 (gyeongheom)", translation: "Expérience", example: "마케팅 경험이 있어요. (J'ai de l'expérience en marketing.)" },
            { word: "장점 (jangjeom)", translation: "Point fort / Qualité", example: "제 장점은 소통 능력이에요. (Mon point fort est la communication.)" },
            { word: "대학교 (daehakgyo)", translation: "Université", example: "2020년에 대학교를 졸업했어요. (J'ai obtenu mon diplôme en 2020.)" },
            { word: "월급 (wolgeup)", translation: "Salaire", example: "월급이 얼마예요? (Quel est le salaire ?)" },
            { word: "이력서 (iryeokseo)", translation: "CV", example: "이력서를 보내드릴게요. (Je vous enverrai mon CV.)" },
          ],
          grammarNote: "'~이/가 있어요' = avoir (quelque chose). '졸업하다' = obtenir un diplôme. '~드리다' est la forme humble de '주다'.",
        },
        {
          title: "사무실에서 (Au bureau)", description: "Les interactions quotidiennes au travail", order: 2,
          vocabulary: [
            { word: "회의 (hoeui)", translation: "Réunion", example: "3시에 회의가 있어요. (Il y a une réunion à 15h.)" },
            { word: "동료 (dongnyo)", translation: "Collègue", example: "제 동료예요. (C'est mon collègue.)" },
            { word: "수고하셨습니다 (sugohasyeossseumnida)", translation: "Bon travail (en partant du bureau)", example: "수고하셨습니다! (Bon travail ! / Au revoir en fin de journée.)" },
            { word: "마감 (magam)", translation: "Date limite / Deadline", example: "마감이 언제예요? (Quelle est la date limite ?)" },
            { word: "이메일을 보내다 (imeireul bonaeda)", translation: "Envoyer un e-mail", example: "이메일을 보냈어요. (J'ai envoyé un e-mail.)" },
          ],
          grammarNote: "'수고하셨습니다' est l'équivalent coréen du japonais 'お疲れ様です'. Expression essentielle en milieu professionnel coréen.",
        },
      ],
    },
    {
      title: "여행 (Voyager)", icon: "✈️", description: "À l'aéroport, réserver un vol", order: 2,
      lessons: [
        {
          title: "공항에서 (À l'aéroport)", description: "Vocabulaire de l'aéroport", order: 1,
          vocabulary: [
            { word: "탑승권 (tapseunggwon)", translation: "Carte d'embarquement", example: "탑승권을 보여 주세요. (Montrez votre carte d'embarquement.)" },
            { word: "게이트 (geiteu)", translation: "Porte d'embarquement", example: "12번 게이트에서 출발해요. (Le départ est à la porte 12.)" },
            { word: "지연 (jiyeon)", translation: "Retard", example: "비행기가 2시간 지연됐어요. (L'avion a 2 heures de retard.)" },
            { word: "수하물 (suhamul)", translation: "Bagages", example: "수하물이 몇 개예요? (Combien de bagages avez-vous ?)" },
            { word: "창가 / 통로 (changga / tongno)", translation: "Côté hublot / couloir", example: "창가 좌석 주세요. (Un siège côté hublot, s'il vous plaît.)" },
          ],
          grammarNote: "'~됐어요' (dwaesseoyo) = forme passive passée. '번' = numéro (compteur). '개' = compteur général pour les objets.",
        },
        {
          title: "기차 타기 (Prendre le train)", description: "Se déplacer en train en Corée", order: 2,
          vocabulary: [
            { word: "표 (pyo)", translation: "Billet", example: "표를 사요. (J'achète un billet.)" },
            { word: "KTX (케이티엑스)", translation: "TGV coréen", example: "KTX로 부산에 가요. (Je vais à Busan en KTX.)" },
            { word: "환승 (hwanseung)", translation: "Correspondance", example: "서울역에서 환승하세요. (Changez à la gare de Séoul.)" },
            { word: "다음 역 (daeum yeok)", translation: "La prochaine gare", example: "다음 역은 강남이에요. (La prochaine gare est Gangnam.)" },
            { word: "편도 / 왕복 (pyeondo / wangbok)", translation: "Aller simple / Aller-retour", example: "왕복 표 주세요. (Un billet aller-retour, s'il vous plaît.)" },
          ],
          grammarNote: "'~로' = par/avec (moyen de transport). '에서' = à/de (lieu d'action). Le KTX relie Séoul à Busan en seulement 2h30.",
        },
      ],
    },
    {
      title: "건강 (La santé)", icon: "🏥", description: "Chez le médecin, à la pharmacie", order: 3,
      lessons: [
        {
          title: "병원에서 (Chez le médecin)", description: "Décrire ses symptômes", order: 1,
          vocabulary: [
            { word: "머리가 아파요 (meoriga apayo)", translation: "J'ai mal à la tête", example: "오늘 아침부터 머리가 아파요. (J'ai mal à la tête depuis ce matin.)" },
            { word: "열이 나요 (yeori nayo)", translation: "J'ai de la fièvre", example: "열이 나요. (J'ai de la fièvre.)" },
            { word: "약 (yak)", translation: "Médicament", example: "이 약을 드세요. (Prenez ce médicament.)" },
            { word: "배가 아파요 (baega apayo)", translation: "J'ai mal au ventre", example: "어제부터 배가 아파요. (J'ai mal au ventre depuis hier.)" },
            { word: "병원 (byeongwon)", translation: "Hôpital", example: "근처에 병원이 있어요? (Y a-t-il un hôpital à proximité ?)" },
          ],
          grammarNote: "Douleur : [partie du corps] + 이/가 아파요. '부터' = depuis. '드세요' est la forme honorifique de '먹으세요' (mangez/prenez).",
        },
        {
          title: "약국에서 (À la pharmacie)", description: "Acheter des médicaments", order: 2,
          vocabulary: [
            { word: "감기약 (gamgiyak)", translation: "Médicament contre le rhume", example: "감기약 있어요? (Avez-vous un médicament contre le rhume ?)" },
            { word: "알레르기 (allereugi)", translation: "Allergie", example: "알레르기가 있어요. (J'ai des allergies.)" },
            { word: "처방전 (cheobangcheon)", translation: "Ordonnance", example: "처방전이 필요해요? (Faut-il une ordonnance ?)" },
            { word: "하루 세 번 (haru se beon)", translation: "Trois fois par jour", example: "하루 세 번 드세요. (Prenez-le trois fois par jour.)" },
            { word: "식후 (sikhu)", translation: "Après le repas", example: "식후에 드세요. (Prenez-le après le repas.)" },
          ],
          grammarNote: "'필요하다' = avoir besoin de. '번' (beon) = fois (compteur). '식후' = après le repas, '식전' = avant le repas.",
        },
      ],
    },
  ]);

  // ---------- FRANÇAIS ----------
  console.log("📚 Français...");
  const frA1 = await upsertCourse(langMap["fr"], "A1", "Français — Débutant (A1)", "Les bases du français pour te débrouiller au quotidien.", 1, false);
  const frA2 = await upsertCourse(langMap["fr"], "A2", "Français — Élémentaire (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  await upsertCourse(langMap["fr"], "B1", "Français — Intermédiaire (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

  await seedChaptersWithContent(frA1, [
    {
      title: "Se présenter", icon: "👋", description: "Dire bonjour, donner son nom", order: 1,
      lessons: [
        {
          title: "Les salutations", description: "Les formes de salutation en français", order: 1,
          vocabulary: [
            { word: "Bonjour", translation: "Hello / Good morning", example: "Bonjour, comment allez-vous ?" },
            { word: "Bonsoir", translation: "Good evening", example: "Bonsoir madame." },
            { word: "Salut", translation: "Hi (informal)", example: "Salut ! Ça va ?" },
            { word: "Au revoir", translation: "Goodbye", example: "Au revoir, à bientôt !" },
            { word: "Merci", translation: "Thank you", example: "Merci beaucoup !" },
            { word: "S'il vous plaît", translation: "Please", example: "Un café, s'il vous plaît." },
          ],
          grammarNote: "French has formal (vous) and informal (tu) forms. Use 'vous' with strangers and 'tu' with friends.",
        },
        {
          title: "Se présenter", description: "Saying your name, age, and where you're from", order: 2,
          vocabulary: [
            { word: "Je m'appelle...", translation: "My name is...", example: "Je m'appelle Marie." },
            { word: "J'ai ... ans", translation: "I am ... years old", example: "J'ai vingt-cinq ans." },
            { word: "Je suis de...", translation: "I am from...", example: "Je suis de Paris." },
            { word: "Enchanté(e)", translation: "Nice to meet you", example: "Enchanté ! Je m'appelle Pierre." },
            { word: "Comment allez-vous ?", translation: "How are you? (formal)", example: "Bonjour, comment allez-vous ?" },
            { word: "Ça va ?", translation: "How are you? (informal)", example: "Salut ! Ça va ?" },
          ],
          grammarNote: "In French, age uses 'avoir' (to have), not 'être' (to be): 'J'ai 25 ans' (I have 25 years), not 'Je suis 25 ans'.",
        },
      ],
    },
    {
      title: "Au restaurant", icon: "🍽️", description: "Commander, demander l'addition", order: 2,
      lessons: [
        {
          title: "Commander", description: "Les phrases essentielles au restaurant", order: 1,
          vocabulary: [
            { word: "Une table pour deux", translation: "A table for two", example: "Une table pour deux, s'il vous plaît." },
            { word: "La carte, s'il vous plaît", translation: "The menu, please", example: "La carte, s'il vous plaît." },
            { word: "Je voudrais...", translation: "I would like...", example: "Je voudrais un steak-frites." },
            { word: "L'addition, s'il vous plaît", translation: "The bill, please", example: "L'addition, s'il vous plaît." },
            { word: "C'est délicieux !", translation: "It's delicious!", example: "C'est délicieux, merci !" },
          ],
          grammarNote: "'Je voudrais' (I would like) is more polite than 'Je veux' (I want). Always use it at restaurants!",
        },
        {
          title: "Les boissons et le dessert", description: "Ordering drinks and desserts", order: 2,
          vocabulary: [
            { word: "Un café, s'il vous plaît", translation: "A coffee, please", example: "Un café, s'il vous plaît." },
            { word: "Une carafe d'eau", translation: "A jug of water", example: "Une carafe d'eau, s'il vous plaît." },
            { word: "Qu'est-ce que vous avez comme desserts ?", translation: "What desserts do you have?", example: "Qu'est-ce que vous avez comme desserts ?" },
            { word: "L'entrée / Le plat / Le dessert", translation: "Starter / Main course / Dessert", example: "Je prends une entrée et un plat." },
            { word: "C'est compris dans le menu ?", translation: "Is it included in the set menu?", example: "Le dessert, c'est compris dans le menu ?" },
          ],
          grammarNote: "In France, 'une carafe d'eau' (tap water) is free at restaurants. Use 'de l'' before vowels: 'une carafe d'eau'.",
        },
      ],
    },
    {
      title: "Faire les courses", icon: "🛒", description: "Acheter au supermarché et au marché", order: 3,
      lessons: [
        {
          title: "Au supermarché", description: "Shopping for groceries at the supermarket", order: 1,
          vocabulary: [
            { word: "Combien ça coûte ?", translation: "How much does it cost?", example: "Combien ça coûte, cette bouteille de vin ?" },
            { word: "Où se trouve... ?", translation: "Where is...?", example: "Où se trouve le rayon boulangerie ?" },
            { word: "Est-ce que vous avez... ?", translation: "Do you have...?", example: "Est-ce que vous avez du lait sans lactose ?" },
            { word: "Un sac, s'il vous plaît", translation: "A bag, please", example: "Un sac, s'il vous plaît." },
            { word: "Je cherche...", translation: "I'm looking for...", example: "Je cherche le rayon fruits et légumes." },
          ],
          grammarNote: "'Est-ce que' turns any statement into a question: 'Vous avez du lait' → 'Est-ce que vous avez du lait ?'",
        },
        {
          title: "Au marché", description: "Buying fresh produce at the market", order: 2,
          vocabulary: [
            { word: "C'est combien le kilo ?", translation: "How much per kilo?", example: "Les tomates, c'est combien le kilo ?" },
            { word: "Je voudrais un kilo de...", translation: "I'd like a kilo of...", example: "Je voudrais un kilo de pommes." },
            { word: "C'est tout, merci", translation: "That's all, thank you", example: "C'est tout, merci !" },
            { word: "Vous pouvez me donner un sac ?", translation: "Can you give me a bag?", example: "Vous pouvez me donner un sac, s'il vous plaît ?" },
            { word: "C'est frais ?", translation: "Is it fresh?", example: "Ce poisson, c'est frais ?" },
            { word: "Je vais prendre...", translation: "I'll take...", example: "Je vais prendre six œufs et du fromage." },
          ],
          grammarNote: "'Du', 'de la', 'des' are partitive articles used for unspecified quantities: 'du pain' (some bread), 'de la confiture' (some jam).",
        },
      ],
    },
    {
      title: "Demander son chemin", icon: "🗺️", description: "S'orienter et comprendre les directions", order: 4,
      lessons: [
        {
          title: "Les directions", description: "Asking for and understanding directions", order: 1,
          vocabulary: [
            { word: "Excusez-moi, où est... ?", translation: "Excuse me, where is...?", example: "Excusez-moi, où est la gare ?" },
            { word: "Tournez à gauche / à droite", translation: "Turn left / right", example: "Tournez à gauche au feu rouge." },
            { word: "Allez tout droit", translation: "Go straight ahead", example: "Allez tout droit pendant deux cents mètres." },
            { word: "C'est à côté de...", translation: "It's next to...", example: "C'est à côté de la boulangerie." },
            { word: "C'est loin d'ici ?", translation: "Is it far from here?", example: "La plage, c'est loin d'ici ?" },
          ],
          grammarNote: "Imperative forms for 'vous': 'Tournez' (turn), 'Allez' (go), 'Continuez' (continue), 'Traversez' (cross).",
        },
        {
          title: "Les lieux en ville", description: "Important places around town", order: 2,
          vocabulary: [
            { word: "La boulangerie", translation: "The bakery", example: "La boulangerie est au coin de la rue." },
            { word: "La pharmacie", translation: "The pharmacy", example: "Il y a une pharmacie en face de la poste." },
            { word: "La poste", translation: "The post office", example: "Je cherche la poste la plus proche." },
            { word: "En face de...", translation: "Across from...", example: "Le restaurant est en face de l'église." },
            { word: "Au coin de la rue", translation: "On the street corner", example: "Il y a un café au coin de la rue." },
            { word: "Tout près d'ici", translation: "Very close to here", example: "Le métro est tout près d'ici." },
          ],
          grammarNote: "'Il y a' means 'there is/are'. It's invariable: 'Il y a une pharmacie' / 'Il y a deux pharmacies'.",
        },
      ],
    },
    {
      title: "À l'hôtel", icon: "🏨", description: "Réserver et séjourner à l'hôtel", order: 5,
      lessons: [
        {
          title: "La réservation", description: "Booking a room and checking in", order: 1,
          vocabulary: [
            { word: "J'ai une réservation", translation: "I have a reservation", example: "J'ai une réservation au nom de Martin." },
            { word: "Une chambre simple / double", translation: "A single / double room", example: "Je voudrais une chambre double, s'il vous plaît." },
            { word: "Pour combien de nuits ?", translation: "For how many nights?", example: "Pour combien de nuits ? — Trois nuits." },
            { word: "Le petit-déjeuner est inclus ?", translation: "Is breakfast included?", example: "Le petit-déjeuner est inclus dans le prix ?" },
            { word: "À quelle heure est le départ ?", translation: "What time is checkout?", example: "À quelle heure est le départ ?" },
          ],
          grammarNote: "'Au nom de' means 'under the name of'. Used for reservations: 'Au nom de Dupont'.",
        },
        {
          title: "Les services de l'hôtel", description: "Requesting services during your stay", order: 2,
          vocabulary: [
            { word: "Est-ce qu'il y a le Wi-Fi ?", translation: "Is there Wi-Fi?", example: "Est-ce qu'il y a le Wi-Fi gratuit ?" },
            { word: "Je voudrais des serviettes supplémentaires", translation: "I'd like extra towels", example: "Je voudrais des serviettes supplémentaires, s'il vous plaît." },
            { word: "La climatisation ne marche pas", translation: "The air conditioning doesn't work", example: "Excusez-moi, la climatisation ne marche pas." },
            { word: "Pouvez-vous m'appeler un taxi ?", translation: "Can you call me a taxi?", example: "Pouvez-vous m'appeler un taxi pour demain matin ?" },
            { word: "Où est la piscine ?", translation: "Where is the pool?", example: "Où est la piscine de l'hôtel ?" },
            { word: "Je voudrais un réveil à...", translation: "I'd like a wake-up call at...", example: "Je voudrais un réveil à sept heures." },
          ],
          grammarNote: "'Ne...pas' surrounds the verb to form negation: 'La clé ne marche pas' (The key doesn't work).",
        },
      ],
    },
    {
      title: "Les transports", icon: "🚇", description: "Prendre le métro, le bus, un taxi", order: 6,
      lessons: [
        {
          title: "Les transports en commun", description: "Using public transportation", order: 1,
          vocabulary: [
            { word: "Un billet pour...", translation: "A ticket to...", example: "Un billet pour Lyon, s'il vous plaît." },
            { word: "Quel quai ?", translation: "Which platform?", example: "Le train pour Marseille, c'est quel quai ?" },
            { word: "Ce bus va à... ?", translation: "Does this bus go to...?", example: "Ce bus va à la gare ?" },
            { word: "Le prochain arrêt", translation: "The next stop", example: "Le prochain arrêt, c'est Châtelet." },
            { word: "Combien de temps ça prend ?", translation: "How long does it take?", example: "Pour aller à l'aéroport, combien de temps ça prend ?" },
          ],
          grammarNote: "'Aller à' means 'to go to'. Before 'le', use 'au' (à + le = au): 'Je vais au cinéma'.",
        },
        {
          title: "Prendre un taxi", description: "Communicating with a taxi driver", order: 2,
          vocabulary: [
            { word: "Pouvez-vous m'emmener à... ?", translation: "Can you take me to...?", example: "Pouvez-vous m'emmener à la gare ?" },
            { word: "C'est combien pour aller à... ?", translation: "How much to go to...?", example: "C'est combien pour aller à l'aéroport ?" },
            { word: "Arrêtez-vous ici, s'il vous plaît", translation: "Stop here, please", example: "Arrêtez-vous ici, s'il vous plaît." },
            { word: "Gardez la monnaie", translation: "Keep the change", example: "Gardez la monnaie, merci." },
            { word: "C'est encore loin ?", translation: "Is it much further?", example: "C'est encore loin, le restaurant ?" },
            { word: "Vous pouvez m'attendre ?", translation: "Can you wait for me?", example: "Vous pouvez m'attendre cinq minutes ?" },
          ],
          grammarNote: "'Emmener' (to take someone) vs 'Apporter' (to bring something). People are 'emmenés', objects are 'apportés'.",
        },
      ],
    },
  ]);

  // FR A2 Chapitres
  await seedChaptersWithContent(frA2, [
    {
      title: "Le travail et les études", icon: "💼", description: "Le monde professionnel et scolaire", order: 1,
      lessons: [
        {
          title: "L'entretien d'embauche", description: "Talking about your professional experience", order: 1,
          vocabulary: [
            { word: "J'ai de l'expérience en...", translation: "I have experience in...", example: "J'ai de l'expérience en marketing." },
            { word: "Mes points forts sont...", translation: "My strengths are...", example: "Mes points forts sont la communication et le travail d'équipe." },
            { word: "J'ai un diplôme en...", translation: "I have a degree in...", example: "J'ai un diplôme en informatique." },
            { word: "Pourquoi ce poste vous intéresse ?", translation: "Why are you interested in this position?", example: "Pourquoi ce poste vous intéresse ?" },
            { word: "Je suis disponible à partir de...", translation: "I'm available starting from...", example: "Je suis disponible à partir de lundi prochain." },
          ],
          grammarNote: "The passé composé with 'avoir': 'J'ai travaillé' (I worked/have worked). Used for completed past actions.",
        },
        {
          title: "La vie au bureau", description: "Everyday communication at work", order: 2,
          vocabulary: [
            { word: "J'ai une réunion à...", translation: "I have a meeting at...", example: "J'ai une réunion à quatorze heures." },
            { word: "Tu peux m'envoyer le dossier ?", translation: "Can you send me the file?", example: "Tu peux m'envoyer le dossier avant vendredi ?" },
            { word: "Je travaille sur...", translation: "I'm working on...", example: "Je travaille sur le nouveau projet." },
            { word: "La date limite", translation: "The deadline", example: "La date limite, c'est lundi prochain." },
            { word: "Je vous recontacte", translation: "I'll get back to you", example: "Je vous recontacte cet après-midi." },
            { word: "On peut planifier un appel ?", translation: "Can we schedule a call?", example: "On peut planifier un appel pour demain ?" },
          ],
          grammarNote: "'On' is widely used in spoken French instead of 'nous': 'On peut...' = 'Nous pouvons...' (We can...).",
        },
      ],
    },
    {
      title: "Les voyages", icon: "✈️", description: "Organiser et raconter un voyage", order: 2,
      lessons: [
        {
          title: "À l'aéroport", description: "Navigating the airport", order: 1,
          vocabulary: [
            { word: "La carte d'embarquement", translation: "Boarding pass", example: "Voici ma carte d'embarquement." },
            { word: "La porte d'embarquement", translation: "Boarding gate", example: "Le vol part de la porte 15." },
            { word: "Le vol est retardé / annulé", translation: "The flight is delayed / cancelled", example: "Le vol est retardé de deux heures." },
            { word: "Les bagages", translation: "Luggage", example: "Combien de bagages avez-vous ?" },
            { word: "Un siège côté hublot / couloir", translation: "A window / aisle seat", example: "Je préfère un siège côté hublot." },
          ],
          grammarNote: "'Voici' (here is) and 'Voilà' (there is) are useful presentation words. 'Voici mon passeport.'",
        },
        {
          title: "Raconter ses vacances", description: "Talking about past trips and holidays", order: 2,
          vocabulary: [
            { word: "L'été dernier, je suis allé(e) à...", translation: "Last summer, I went to...", example: "L'été dernier, je suis allée en Espagne." },
            { word: "C'était magnifique", translation: "It was wonderful", example: "C'était magnifique, j'ai adoré !" },
            { word: "On a visité...", translation: "We visited...", example: "On a visité le musée du Louvre." },
            { word: "J'ai goûté...", translation: "I tasted...", example: "J'ai goûté la paella, c'était délicieux." },
            { word: "Je recommande...", translation: "I recommend...", example: "Je recommande cet hôtel, il est super." },
            { word: "J'aimerais y retourner", translation: "I'd like to go back", example: "J'aimerais y retourner l'année prochaine." },
          ],
          grammarNote: "Some verbs use 'être' in passé composé (movement verbs): 'je suis allé' (I went), 'je suis parti' (I left). The past participle agrees with the subject.",
        },
      ],
    },
    {
      title: "La vie quotidienne", icon: "🏠", description: "La routine, la maison, les activités", order: 3,
      lessons: [
        {
          title: "Ma routine", description: "Describing your daily routine", order: 1,
          vocabulary: [
            { word: "Je me réveille à...", translation: "I wake up at...", example: "Je me réveille à sept heures du matin." },
            { word: "Je prends le petit-déjeuner", translation: "I have breakfast", example: "Je prends le petit-déjeuner à huit heures." },
            { word: "Je vais au travail en...", translation: "I go to work by...", example: "Je vais au travail en métro." },
            { word: "Je déjeune à midi", translation: "I have lunch at noon", example: "Je déjeune à midi à la cantine." },
            { word: "Je me couche à...", translation: "I go to bed at...", example: "Je me couche à vingt-trois heures." },
          ],
          grammarNote: "Reflexive verbs use 'se': 'se réveiller' (to wake up), 'se coucher' (to go to bed). 'Je me réveille', 'Tu te réveilles'...",
        },
        {
          title: "Les tâches ménagères", description: "Housework and chores", order: 2,
          vocabulary: [
            { word: "Faire la lessive", translation: "To do the laundry", example: "Je fais la lessive tous les dimanches." },
            { word: "Faire le ménage", translation: "To clean the house", example: "On fait le ménage le samedi." },
            { word: "Faire la vaisselle", translation: "To do the dishes", example: "Tu peux faire la vaisselle ce soir ?" },
            { word: "Faire les courses", translation: "To go grocery shopping", example: "Je fais les courses deux fois par semaine." },
            { word: "Sortir les poubelles", translation: "To take out the trash", example: "N'oublie pas de sortir les poubelles !" },
            { word: "Passer l'aspirateur", translation: "To vacuum", example: "Je passe l'aspirateur tous les deux jours." },
          ],
          grammarNote: "'Faire' (to do/make) is very common: 'faire la cuisine' (to cook), 'faire le ménage' (to clean), 'faire les courses' (to shop).",
        },
      ],
    },
  ]);

  // ═══════ CERTIFICATION EXAMS ═══════
  console.log("\n🎓 Seeding certification exams...");
  const certificationExams = [
    { languageCode: "en", level: "A1" as const, title: "Certification Anglais — A1 Débutant", description: "Évalue tes connaissances de base en anglais : salutations, présentations, vocabulaire du quotidien.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "What does 'Hello' mean?", options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"], correctAnswer: 0 },
      { type: "mcq", question: "Complete: 'I ___ from France.'", options: ["am", "is", "are", "be"], correctAnswer: 0 },
      { type: "mcq", question: "What is the English word for 'chat' (animal)?", options: ["Dog", "Cat", "Bird", "Fish"], correctAnswer: 1 },
      { type: "mcq", question: "How do you say 'Merci' in English?", options: ["Please", "Sorry", "Thank you", "Excuse me"], correctAnswer: 2 },
      { type: "mcq", question: "'Good morning' is used in the ___.", options: ["morning", "afternoon", "evening", "night"], correctAnswer: 0 },
      { type: "mcq", question: "What does 'My name is Sarah' mean?", options: ["Je m'appelle Sarah", "Sarah est mon amie", "J'aime Sarah", "Sarah est là"], correctAnswer: 0 },
      { type: "mcq", question: "Choose the correct sentence:", options: ["I is happy.", "I am happy.", "I are happy.", "I be happy."], correctAnswer: 1 },
      { type: "mcq", question: "What color is 'blue' in French?", options: ["Rouge", "Vert", "Bleu", "Jaune"], correctAnswer: 2 },
      { type: "writing", question: "Write a sentence to introduce yourself in English. (Ex: My name is...)", expectedKeywords: ["my name", "I am", "hello", "hi"], maxScore: 10 },
      { type: "writing", question: "Write a sentence to say where you are from in English.", expectedKeywords: ["I am from", "I come from", "from"], maxScore: 10 },
    ] },
    { languageCode: "en", level: "A2" as const, title: "Certification Anglais — A2 Élémentaire", description: "Vérifie ta capacité à tenir des conversations simples en anglais : décrire ton quotidien, poser des questions, parler au passé.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Complete: 'She ___ to the store yesterday.'", options: ["go", "goes", "went", "going"], correctAnswer: 2 },
      { type: "mcq", question: "What does 'I usually wake up at 7' mean?", options: ["Je me réveille parfois à 7h", "Je me réveille d'habitude à 7h", "Je me suis réveillé à 7h", "Je vais me réveiller à 7h"], correctAnswer: 1 },
      { type: "mcq", question: "Choose the correct question:", options: ["Where you live?", "Where do you live?", "Where does you live?", "Where are you live?"], correctAnswer: 1 },
      { type: "mcq", question: "'I have been waiting for 10 minutes' — What tense is this?", options: ["Present simple", "Past simple", "Present perfect continuous", "Future"], correctAnswer: 2 },
      { type: "mcq", question: "What is the opposite of 'cheap'?", options: ["Small", "Expensive", "Old", "Fast"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'There ___ many people at the party.'", options: ["was", "were", "is", "has"], correctAnswer: 1 },
      { type: "mcq", question: "'Can I have the bill, please?' is used ___.", options: ["at a restaurant", "at school", "at the gym", "at home"], correctAnswer: 0 },
      { type: "mcq", question: "What does 'I'm looking forward to it' mean?", options: ["J'ai peur", "J'ai hâte", "Je suis en retard", "Je m'en fiche"], correctAnswer: 1 },
      { type: "writing", question: "Describe your typical day in 2-3 sentences in English.", expectedKeywords: ["I wake up", "I go", "I eat", "morning", "evening", "work", "school"], maxScore: 10 },
      { type: "writing", question: "Write about what you did last weekend in English (2-3 sentences).", expectedKeywords: ["I went", "I played", "I watched", "last weekend", "yesterday", "was"], maxScore: 10 },
    ] },
    { languageCode: "es", level: "A1" as const, title: "Certification Espagnol — A1 Débutant", description: "Évalue tes bases en espagnol : salutations, présentations, vocabulaire essentiel.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "¿Qué significa 'Hola'?", options: ["Au revoir", "Bonjour", "Merci", "Pardon"], correctAnswer: 1 },
      { type: "mcq", question: "Completa: 'Yo ___ de Francia.'", options: ["soy", "es", "eres", "son"], correctAnswer: 0 },
      { type: "mcq", question: "¿Cómo se dice 'eau' en español?", options: ["Leche", "Agua", "Jugo", "Café"], correctAnswer: 1 },
      { type: "mcq", question: "¿Qué significa 'Gracias'?", options: ["S'il vous plaît", "Pardon", "Merci", "De rien"], correctAnswer: 2 },
      { type: "mcq", question: "'Buenos días' se usa por la ___.", options: ["mañana", "tarde", "noche", "madrugada"], correctAnswer: 0 },
      { type: "mcq", question: "¿Qué significa 'Me llamo Pedro'?", options: ["J'aime Pedro", "Je m'appelle Pedro", "Pedro est mon ami", "Je cherche Pedro"], correctAnswer: 1 },
      { type: "mcq", question: "Elige la frase correcta:", options: ["Yo tiene 20 años.", "Yo tengo 20 años.", "Yo tiene 20 año.", "Yo tener 20 años."], correctAnswer: 1 },
      { type: "mcq", question: "¿De qué color es 'rojo'?", options: ["Bleu", "Vert", "Rouge", "Jaune"], correctAnswer: 2 },
      { type: "writing", question: "Escribe una frase para presentarte en español. (Ej: Me llamo...)", expectedKeywords: ["me llamo", "soy", "hola", "tengo"], maxScore: 10 },
      { type: "writing", question: "Escribe una frase para decir de dónde eres en español.", expectedKeywords: ["soy de", "vengo de", "de"], maxScore: 10 },
    ] },
    { languageCode: "es", level: "A2" as const, title: "Certification Espagnol — A2 Élémentaire", description: "Vérifie ta capacité à t'exprimer en espagnol au quotidien : décrire ta routine, utiliser le passé, faire des achats.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Completa: 'Ayer yo ___ al cine.'", options: ["voy", "fui", "ir", "iba"], correctAnswer: 1 },
      { type: "mcq", question: "¿Qué significa 'Normalmente me despierto a las 7'?", options: ["Je me suis réveillé à 7h", "D'habitude je me réveille à 7h", "Je vais me réveiller à 7h", "Je me réveillais à 7h"], correctAnswer: 1 },
      { type: "mcq", question: "Elige la pregunta correcta:", options: ["¿Dónde tú vives?", "¿Dónde vives?", "¿Dónde vives tú?", "¿Dónde vivir tú?"], correctAnswer: 1 },
      { type: "mcq", question: "'Me gusta mucho la música' significa:", options: ["Je n'aime pas la musique", "J'aime beaucoup la musique", "J'écoute de la musique", "La musique est forte"], correctAnswer: 1 },
      { type: "mcq", question: "¿Cuál es el contrario de 'barato'?", options: ["Pequeño", "Caro", "Viejo", "Rápido"], correctAnswer: 1 },
      { type: "mcq", question: "Completa: 'Nosotros ___ en un restaurante anoche.'", options: ["comemos", "comimos", "comer", "comíamos"], correctAnswer: 1 },
      { type: "mcq", question: "'¿Cuánto cuesta?' se usa para ___.", options: ["demander le prix", "demander l'heure", "demander la direction", "demander le nom"], correctAnswer: 0 },
      { type: "mcq", question: "¿Qué significa 'Tengo que irme'?", options: ["Je dois partir", "J'ai envie de rester", "Je suis fatigué", "J'arrive bientôt"], correctAnswer: 0 },
      { type: "writing", question: "Describe tu día típico en 2-3 frases en español.", expectedKeywords: ["me despierto", "voy", "como", "trabajo", "mañana", "tarde"], maxScore: 10 },
      { type: "writing", question: "Escribe lo que hiciste el fin de semana pasado en español (2-3 frases).", expectedKeywords: ["fui", "comí", "vi", "el fin de semana", "ayer"], maxScore: 10 },
    ] },
    { languageCode: "ja", level: "A1" as const, title: "Certification Japonais — A1 Débutant", description: "Évalue tes bases en japonais : salutations, hiragana, présentations, vocabulaire du quotidien.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "「こんにちは」はどういう意味ですか？", options: ["Au revoir", "Bonjour", "Merci", "Excusez-moi"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「わたしは フランスじん＿＿＿。」", options: ["です", "ます", "した", "ない"], correctAnswer: 0 },
      { type: "mcq", question: "Comment dit-on 'eau' en japonais ?", options: ["おちゃ (ocha)", "みず (mizu)", "ぎゅうにゅう (gyuunyuu)", "ジュース (juusu)"], correctAnswer: 1 },
      { type: "mcq", question: "「ありがとう」signifie :", options: ["S'il vous plaît", "Pardon", "Merci", "De rien"], correctAnswer: 2 },
      { type: "mcq", question: "「おはようございます」s'utilise :", options: ["Le matin", "L'après-midi", "Le soir", "La nuit"], correctAnswer: 0 },
      { type: "mcq", question: "「わたしの なまえは たろう です」signifie :", options: ["J'aime Taro", "Je m'appelle Taro", "Taro est mon ami", "Je cherche Taro"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la bonne phrase pour dire 'j'ai 20 ans' ?", options: ["にじゅっさい です", "にじゅう ねん です", "にじゅう じかん です", "にじゅう にち です"], correctAnswer: 0 },
      { type: "mcq", question: "「あか」signifie quelle couleur ?", options: ["Bleu", "Vert", "Rouge", "Jaune"], correctAnswer: 2 },
      { type: "writing", question: "Présentez-vous en japonais en utilisant 「わたしは...です」.", expectedKeywords: ["わたし", "です", "なまえ"], maxScore: 10 },
      { type: "writing", question: "Écrivez une salutation en japonais et dites d'où vous venez.", expectedKeywords: ["こんにちは", "から", "きました", "です"], maxScore: 10 },
    ] },
    { languageCode: "ja", level: "A2" as const, title: "Certification Japonais — A2 Élémentaire", description: "Vérifie ta capacité à utiliser le japonais au quotidien : décrire ta routine, utiliser les particules, conjuguer au passé.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Complétez : 「きのう えいが＿＿ みました。」", options: ["は", "が", "を", "に"], correctAnswer: 2 },
      { type: "mcq", question: "「まいにち 7じに おきます」signifie :", options: ["Je me suis réveillé à 7h hier", "Tous les jours je me réveille à 7h", "Je vais me réveiller à 7h", "Parfois je me réveille à 7h"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la forme passée de 「たべます」(manger) ?", options: ["たべません", "たべました", "たべて", "たべたい"], correctAnswer: 1 },
      { type: "mcq", question: "「すきな たべものは なんですか」signifie :", options: ["Quel est ton plat préféré ?", "Qu'est-ce que tu manges ?", "Tu as faim ?", "Tu sais cuisiner ?"], correctAnswer: 0 },
      { type: "mcq", question: "Comment dit-on 'cher' (prix élevé) en japonais ?", options: ["やすい", "たかい", "おおきい", "ちいさい"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「わたしは がっこう＿＿ いきます。」", options: ["を", "が", "に", "は"], correctAnswer: 2 },
      { type: "mcq", question: "「いくらですか」s'utilise pour :", options: ["demander le prix", "demander l'heure", "demander la direction", "demander le nom"], correctAnswer: 0 },
      { type: "mcq", question: "「もう いかなければ なりません」signifie :", options: ["Je dois partir", "Je veux rester", "Je suis fatigué", "J'arrive bientôt"], correctAnswer: 0 },
      { type: "writing", question: "Décrivez votre journée typique en 2-3 phrases en japonais.", expectedKeywords: ["おきます", "いきます", "たべます", "まいにち", "じ"], maxScore: 10 },
      { type: "writing", question: "Écrivez ce que vous avez fait hier en japonais (2-3 phrases).", expectedKeywords: ["ました", "きのう", "いきました", "たべました"], maxScore: 10 },
    ] },
    { languageCode: "zh", level: "A1" as const, title: "Certification Chinois — A1 Débutant", description: "Évalue tes bases en chinois mandarin : salutations, tons, présentations, vocabulaire essentiel.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "「你好」(nǐ hǎo) signifie :", options: ["Au revoir", "Bonjour", "Merci", "Pardon"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「我___法国人。」", options: ["是 (shì)", "有 (yǒu)", "在 (zài)", "去 (qù)"], correctAnswer: 0 },
      { type: "mcq", question: "Comment dit-on 'eau' en chinois ?", options: ["茶 (chá)", "水 (shuǐ)", "牛奶 (niúnǎi)", "果汁 (guǒzhī)"], correctAnswer: 1 },
      { type: "mcq", question: "「谢谢」(xièxie) signifie :", options: ["S'il vous plaît", "Pardon", "Merci", "De rien"], correctAnswer: 2 },
      { type: "mcq", question: "「早上好」(zǎoshang hǎo) s'utilise :", options: ["Le matin", "L'après-midi", "Le soir", "La nuit"], correctAnswer: 0 },
      { type: "mcq", question: "「我叫小明」(wǒ jiào Xiǎo Míng) signifie :", options: ["J'aime Xiao Ming", "Je m'appelle Xiao Ming", "Xiao Ming est mon ami", "Je cherche Xiao Ming"], correctAnswer: 1 },
      { type: "mcq", question: "Comment dit-on 'j'ai 20 ans' en chinois ?", options: ["我二十岁 (wǒ èrshí suì)", "我二十年 (wǒ èrshí nián)", "我二十天 (wǒ èrshí tiān)", "我二十个 (wǒ èrshí gè)"], correctAnswer: 0 },
      { type: "mcq", question: "「红」(hóng) signifie quelle couleur ?", options: ["Bleu", "Vert", "Rouge", "Jaune"], correctAnswer: 2 },
      { type: "writing", question: "Présentez-vous en chinois en utilisant 「我叫...」et「我是...人」.", expectedKeywords: ["我叫", "我是", "人"], maxScore: 10 },
      { type: "writing", question: "Écrivez une salutation en chinois et dites d'où vous venez.", expectedKeywords: ["你好", "我", "来自", "是", "人"], maxScore: 10 },
    ] },
    { languageCode: "zh", level: "A2" as const, title: "Certification Chinois — A2 Élémentaire", description: "Vérifie ta capacité à t'exprimer en chinois au quotidien : routine, achats, passé simple.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Complétez : 「昨天我___电影了。」", options: ["看 (kàn)", "看了 (kànle)", "看过 (kànguò)", "在看 (zài kàn)"], correctAnswer: 0 },
      { type: "mcq", question: "「我每天七点起床」signifie :", options: ["Je me suis levé à 7h hier", "Tous les jours je me lève à 7h", "Je vais me lever à 7h", "Parfois je me lève à 7h"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle phrase est correcte pour demander 'tu veux quoi' ?", options: ["你要什么？", "你什么要？", "什么你要？", "要你什么？"], correctAnswer: 0 },
      { type: "mcq", question: "「你喜欢吃什么」signifie :", options: ["Qu'est-ce que tu aimes manger ?", "Tu as mangé quoi ?", "Tu as faim ?", "Tu sais cuisiner ?"], correctAnswer: 0 },
      { type: "mcq", question: "Comment dit-on 'cher' (prix) en chinois ?", options: ["便宜 (piányi)", "贵 (guì)", "大 (dà)", "小 (xiǎo)"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「我去___学校。」", options: ["了", "过", "在", "的"], correctAnswer: 0 },
      { type: "mcq", question: "「多少钱？」(duōshao qián) s'utilise pour :", options: ["demander le prix", "demander l'heure", "demander la direction", "demander le nom"], correctAnswer: 0 },
      { type: "mcq", question: "「我得走了」signifie :", options: ["Je dois partir", "Je veux rester", "Je suis fatigué", "J'arrive bientôt"], correctAnswer: 0 },
      { type: "writing", question: "Décrivez votre journée typique en 2-3 phrases en chinois.", expectedKeywords: ["起床", "去", "吃", "每天", "点"], maxScore: 10 },
      { type: "writing", question: "Écrivez ce que vous avez fait hier en chinois (2-3 phrases).", expectedKeywords: ["了", "昨天", "去了", "吃了"], maxScore: 10 },
    ] },
    { languageCode: "ru", level: "A1" as const, title: "Certification Russe — A1 Débutant", description: "Évalue tes bases en russe : alphabet cyrillique, salutations, présentations, vocabulaire de base.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "Что значит «Здравствуйте» ?", options: ["Au revoir", "Bonjour", "Merci", "Pardon"], correctAnswer: 1 },
      { type: "mcq", question: "Дополните: «Я ___ из Франции.»", options: ["— (rien)", "есть", "быть", "был"], correctAnswer: 0 },
      { type: "mcq", question: "Comment dit-on 'eau' en russe ?", options: ["Чай (tchaï)", "Вода (voda)", "Молоко (moloko)", "Сок (sok)"], correctAnswer: 1 },
      { type: "mcq", question: "«Спасибо» signifie :", options: ["S'il vous plaît", "Pardon", "Merci", "De rien"], correctAnswer: 2 },
      { type: "mcq", question: "«Доброе утро» s'utilise :", options: ["Le matin", "L'après-midi", "Le soir", "La nuit"], correctAnswer: 0 },
      { type: "mcq", question: "«Меня зовут Иван» signifie :", options: ["J'aime Ivan", "Je m'appelle Ivan", "Ivan est mon ami", "Je cherche Ivan"], correctAnswer: 1 },
      { type: "mcq", question: "Comment dit-on 'j'ai 20 ans' en russe ?", options: ["Мне двадцать лет", "Я двадцать год", "Мне двадцать год", "Я двадцать лет"], correctAnswer: 0 },
      { type: "mcq", question: "«Красный» signifie quelle couleur ?", options: ["Bleu", "Vert", "Rouge", "Jaune"], correctAnswer: 2 },
      { type: "writing", question: "Présentez-vous en russe en utilisant «Меня зовут...» et «Я из...».", expectedKeywords: ["Меня зовут", "Я из", "Здравствуйте", "Привет"], maxScore: 10 },
      { type: "writing", question: "Écrivez une salutation en russe et dites d'où vous venez.", expectedKeywords: ["Здравствуйте", "Привет", "Я из", "Франции"], maxScore: 10 },
    ] },
    { languageCode: "ru", level: "A2" as const, title: "Certification Russe — A2 Élémentaire", description: "Vérifie ta capacité à t'exprimer en russe au quotidien : routine, passé, faire des courses.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Дополните: «Вчера я ___ в кино.»", options: ["иду", "ходил", "хожу", "пойду"], correctAnswer: 1 },
      { type: "mcq", question: "«Каждый день я встаю в 7 часов» signifie :", options: ["Je me suis levé à 7h hier", "Tous les jours je me lève à 7h", "Je vais me lever à 7h", "Parfois je me lève à 7h"], correctAnswer: 1 },
      { type: "mcq", question: "Choisissez la question correcte :", options: ["Где ты живёшь?", "Где ты жить?", "Где живёшь ты?", "Ты где жить?"], correctAnswer: 0 },
      { type: "mcq", question: "«Мне очень нравится музыка» signifie :", options: ["Je n'aime pas la musique", "J'aime beaucoup la musique", "J'écoute de la musique", "La musique est forte"], correctAnswer: 1 },
      { type: "mcq", question: "Quel est le contraire de «дешёвый» (bon marché) ?", options: ["Маленький", "Дорогой", "Старый", "Быстрый"], correctAnswer: 1 },
      { type: "mcq", question: "Дополните: «Мы ___ в ресторане вчера.»", options: ["едим", "ели", "есть", "будем есть"], correctAnswer: 1 },
      { type: "mcq", question: "«Сколько стоит?» s'utilise pour :", options: ["demander le prix", "demander l'heure", "demander la direction", "demander le nom"], correctAnswer: 0 },
      { type: "mcq", question: "«Мне нужно идти» signifie :", options: ["Je dois partir", "Je veux rester", "Je suis fatigué", "J'arrive bientôt"], correctAnswer: 0 },
      { type: "writing", question: "Décrivez votre journée typique en 2-3 phrases en russe.", expectedKeywords: ["встаю", "иду", "ем", "каждый день", "часов"], maxScore: 10 },
      { type: "writing", question: "Écrivez ce que vous avez fait hier en russe (2-3 phrases).", expectedKeywords: ["вчера", "ходил", "ел", "смотрел", "был"], maxScore: 10 },
    ] },
    { languageCode: "ko", level: "A1" as const, title: "Certification Coréen — A1 Débutant", description: "Évalue tes bases en coréen : hangeul, salutations, présentations, vocabulaire essentiel.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "「안녕하세요」signifie :", options: ["Au revoir", "Bonjour", "Merci", "Pardon"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「저는 프랑스 사람___。」", options: ["입니다", "있습니다", "합니다", "됩니다"], correctAnswer: 0 },
      { type: "mcq", question: "Comment dit-on 'eau' en coréen ?", options: ["차 (cha)", "물 (mul)", "우유 (uyu)", "주스 (juseu)"], correctAnswer: 1 },
      { type: "mcq", question: "「감사합니다」signifie :", options: ["S'il vous plaît", "Pardon", "Merci", "De rien"], correctAnswer: 2 },
      { type: "mcq", question: "「좋은 아침이에요」s'utilise :", options: ["Le matin", "L'après-midi", "Le soir", "La nuit"], correctAnswer: 0 },
      { type: "mcq", question: "「제 이름은 민수입니다」signifie :", options: ["J'aime Minsu", "Je m'appelle Minsu", "Minsu est mon ami", "Je cherche Minsu"], correctAnswer: 1 },
      { type: "mcq", question: "Comment dit-on 'j'ai 20 ans' en coréen ?", options: ["저는 스무 살이에요", "저는 이십 년이에요", "저는 이십 일이에요", "저는 스무 개예요"], correctAnswer: 0 },
      { type: "mcq", question: "「빨간색」signifie quelle couleur ?", options: ["Bleu", "Vert", "Rouge", "Jaune"], correctAnswer: 2 },
      { type: "writing", question: "Présentez-vous en coréen en utilisant 「저는...입니다」.", expectedKeywords: ["저는", "입니다", "이름", "안녕하세요"], maxScore: 10 },
      { type: "writing", question: "Écrivez une salutation en coréen et dites d'où vous venez.", expectedKeywords: ["안녕하세요", "저는", "에서", "왔습니다", "사람"], maxScore: 10 },
    ] },
    { languageCode: "ko", level: "A2" as const, title: "Certification Coréen — A2 Élémentaire", description: "Vérifie ta capacité à t'exprimer en coréen au quotidien : routine, passé, faire des achats.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Complétez : 「어제 영화를 ___。」", options: ["봅니다", "봤습니다", "볼 거예요", "보고 있어요"], correctAnswer: 1 },
      { type: "mcq", question: "「매일 7시에 일어나요」signifie :", options: ["Je me suis levé à 7h hier", "Tous les jours je me lève à 7h", "Je vais me lever à 7h", "Parfois je me lève à 7h"], correctAnswer: 1 },
      { type: "mcq", question: "Choisissez la question correcte :", options: ["어디 살아요?", "어디 살다?", "살아요 어디?", "어디에 살다요?"], correctAnswer: 0 },
      { type: "mcq", question: "「음악을 정말 좋아해요」signifie :", options: ["Je n'aime pas la musique", "J'aime beaucoup la musique", "J'écoute de la musique", "La musique est forte"], correctAnswer: 1 },
      { type: "mcq", question: "Quel est le contraire de 「싸다」(bon marché) ?", options: ["작다", "비싸다", "오래되다", "빠르다"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「우리는 어젯밤에 식당에서 ___。」", options: ["먹어요", "먹었어요", "먹을 거예요", "먹고 있어요"], correctAnswer: 1 },
      { type: "mcq", question: "「얼마예요?」s'utilise pour :", options: ["demander le prix", "demander l'heure", "demander la direction", "demander le nom"], correctAnswer: 0 },
      { type: "mcq", question: "「가야 돼요」signifie :", options: ["Je dois partir", "Je veux rester", "Je suis fatigué", "J'arrive bientôt"], correctAnswer: 0 },
      { type: "writing", question: "Décrivez votre journée typique en 2-3 phrases en coréen.", expectedKeywords: ["일어나요", "가요", "먹어요", "매일", "시"], maxScore: 10 },
      { type: "writing", question: "Écrivez ce que vous avez fait hier en coréen (2-3 phrases).", expectedKeywords: ["었", "았", "어제", "갔", "먹었"], maxScore: 10 },
    ] },
    { languageCode: "fr", level: "A1" as const, title: "Certification Français — A1 Débutant", description: "Evaluate your basic French: greetings, introductions, essential vocabulary.", durationMin: 15, passScore: 60, questions: [
      { type: "mcq", question: "What does 'Bonjour' mean?", options: ["Goodbye", "Hello", "Thank you", "Sorry"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'Je ___ français.'", options: ["suis", "es", "est", "êtes"], correctAnswer: 0 },
      { type: "mcq", question: "How do you say 'water' in French?", options: ["Lait", "Eau", "Jus", "Café"], correctAnswer: 1 },
      { type: "mcq", question: "'Merci' means:", options: ["Please", "Sorry", "Thank you", "You're welcome"], correctAnswer: 2 },
      { type: "mcq", question: "'Bonsoir' is used in the:", options: ["Morning", "Afternoon", "Evening", "Night"], correctAnswer: 2 },
      { type: "mcq", question: "'Je m'appelle Pierre' means:", options: ["I like Pierre", "My name is Pierre", "Pierre is my friend", "I'm looking for Pierre"], correctAnswer: 1 },
      { type: "mcq", question: "How do you say 'I am 20 years old' in French?", options: ["J'ai 20 ans", "Je suis 20 ans", "J'ai 20 années", "Je suis 20 âge"], correctAnswer: 0 },
      { type: "mcq", question: "'Rouge' means which color?", options: ["Blue", "Green", "Red", "Yellow"], correctAnswer: 2 },
      { type: "writing", question: "Introduce yourself in French using 'Je m'appelle...' and 'J'ai... ans'.", expectedKeywords: ["je m'appelle", "j'ai", "ans", "bonjour"], maxScore: 10 },
      { type: "writing", question: "Write a greeting in French and say where you are from.", expectedKeywords: ["bonjour", "je suis", "je viens de", "de"], maxScore: 10 },
    ] },
    { languageCode: "fr", level: "A2" as const, title: "Certification Français — A2 Élémentaire", description: "Check your ability to express yourself in everyday French: routine, past tense, shopping.", durationMin: 20, passScore: 65, questions: [
      { type: "mcq", question: "Complete: 'Hier, je ___ au cinéma.'", options: ["vais", "suis allé", "aller", "allais"], correctAnswer: 1 },
      { type: "mcq", question: "'D'habitude, je me réveille à 7h' means:", options: ["I woke up at 7 yesterday", "I usually wake up at 7", "I will wake up at 7", "I sometimes wake up at 7"], correctAnswer: 1 },
      { type: "mcq", question: "Choose the correct question:", options: ["Où tu habites?", "Où habites-tu?", "Où tu habiter?", "Both A and B are correct"], correctAnswer: 3 },
      { type: "mcq", question: "'J'aime beaucoup la musique' means:", options: ["I don't like music", "I really like music", "I listen to music", "The music is loud"], correctAnswer: 1 },
      { type: "mcq", question: "What is the opposite of 'bon marché'?", options: ["Petit", "Cher", "Vieux", "Rapide"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'Nous ___ au restaurant hier soir.'", options: ["mangeons", "avons mangé", "manger", "mangions"], correctAnswer: 1 },
      { type: "mcq", question: "'Combien ça coûte ?' is used to:", options: ["Ask the price", "Ask the time", "Ask for directions", "Ask someone's name"], correctAnswer: 0 },
      { type: "mcq", question: "'Je dois y aller' means:", options: ["I have to go", "I want to stay", "I'm tired", "I'm coming soon"], correctAnswer: 0 },
      { type: "writing", question: "Describe your typical day in 2-3 sentences in French.", expectedKeywords: ["je me réveille", "je vais", "je mange", "matin", "soir"], maxScore: 10 },
      { type: "writing", question: "Write about what you did last weekend in French (2-3 sentences).", expectedKeywords: ["je suis allé", "j'ai", "le week-end dernier", "hier"], maxScore: 10 },
    ] },
  ];
  for (const exam of certificationExams) {
    await prisma.certificationExam.upsert({
      where: { languageCode_level: { languageCode: exam.languageCode, level: exam.level } },
      update: { title: exam.title, description: exam.description, durationMin: exam.durationMin, passScore: exam.passScore, questions: exam.questions, isActive: true },
      create: { languageCode: exam.languageCode, level: exam.level, title: exam.title, description: exam.description, durationMin: exam.durationMin, passScore: exam.passScore, questions: exam.questions, isActive: true },
    });
    console.log(`  ✅ Exam: ${exam.title}`);
  }

  // ═══════ PROMO CODES ═══════
  console.log("🎟️  Seeding promo codes...");

  const promoCodes = [
    { code: "youssefleplusbeau", label: "Fondateur", maxUses: null, expiresAt: null },
  ];

  for (const pc of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: pc.code },
      create: {
        code: pc.code,
        label: pc.label,
        maxUses: pc.maxUses,
        expiresAt: pc.expiresAt,
        isActive: true,
      },
      update: {},
    });
    console.log(`  ✅ Promo code: ${pc.code} (${pc.label})`);
  }

  console.log("\n✅ Seed completed!\n");
}

// ═══════ HELPERS ═══════

interface LessonData {
  title: string;
  description: string;
  order: number;
  vocabulary: { word: string; translation: string; example: string }[];
  grammarNote: string;
}

interface ChapterData {
  title: string;
  icon: string;
  description: string;
  order: number;
  lessons: LessonData[];
}

async function upsertCourse(
  languageId: string,
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  title: string,
  description: string,
  order: number,
  isPremium: boolean
) {
  // Check if course already exists for this language + level
  const existing = await prisma.course.findFirst({
    where: { languageId, level },
  });

  if (existing) {
    return await prisma.course.update({
      where: { id: existing.id },
      data: { title, description, order, isPremium },
    });
  }

  return await prisma.course.create({
    data: { languageId, level, title, description, order, isPremium },
  });
}

async function seedChaptersWithContent(course: { id: string }, chapters: ChapterData[]) {
  for (const ch of chapters) {
    // Check if chapter already exists
    const existingChapter = await prisma.chapter.findFirst({
      where: { courseId: course.id, order: ch.order },
    });

    let chapter;
    if (existingChapter) {
      chapter = await prisma.chapter.update({
        where: { id: existingChapter.id },
        data: { title: ch.title, icon: ch.icon, description: ch.description },
      });
    } else {
      chapter = await prisma.chapter.create({
        data: {
          courseId: course.id,
          title: ch.title,
          icon: ch.icon,
          description: ch.description,
          order: ch.order,
        },
      });
    }

    for (const lesson of ch.lessons) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { chapterId: chapter.id, order: lesson.order },
      });

      let createdLesson;
      if (existingLesson) {
        createdLesson = await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            title: lesson.title,
            description: lesson.description,
            content: { vocabulary: lesson.vocabulary, grammarNote: lesson.grammarNote },
          },
        });
      } else {
        createdLesson = await prisma.lesson.create({
          data: {
            chapterId: chapter.id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            content: { vocabulary: lesson.vocabulary, grammarNote: lesson.grammarNote },
          },
        });
      }

      // Create exercises (delete old ones first to avoid duplicates)
      await prisma.exercise.deleteMany({ where: { lessonId: createdLesson.id } });

      const exercises = generateExercises(createdLesson.id, lesson);
      if (exercises.length > 0) {
        await prisma.exercise.createMany({ data: exercises });
      }
    }

    console.log(`  ✓ ${ch.icon} ${ch.title} (${ch.lessons.length} leçon${ch.lessons.length > 1 ? "s" : ""})`);
  }
}

type ExType =
  | "MULTIPLE_CHOICE" | "TRANSLATION" | "FILL_IN_BLANK" | "REORDER" | "MATCHING"
  | "CONTEXT_GUESS" | "SPOT_ERROR" | "DIALOGUE_COMPLETE" | "FREE_PRODUCTION";

function generateExercises(lessonId: string, lesson: LessonData) {
  const exercises: {
    lessonId: string;
    type: ExType;
    order: number;
    question: Record<string, string | string[] | boolean | number | null | Record<string, string>[]>;
  }[] = [];

  const vocab = lesson.vocabulary;
  if (vocab.length < 3) return exercises;

  // 1. QCM — "Comment dit-on X ?"
  exercises.push({
    lessonId,
    type: "MULTIPLE_CHOICE",
    order: 1,
    question: {
      text: `Comment dit-on « ${vocab[0].translation} » ?`,
      options: [vocab[0].word, vocab[1].word, vocab[2].word, vocab[3]?.word ?? vocab[vocab.length - 1].word],
      correctAnswer: 0,
      hint: vocab[0].example,
    },
  });

  // 2. Traduction
  exercises.push({
    lessonId,
    type: "TRANSLATION",
    order: 2,
    question: {
      text: vocab[1].word,
      correctAnswer: vocab[1].translation,
      direction: "target_to_native",
      hint: vocab[1].example,
    },
  });

  // 3. Fill in the blank
  const fillWord = vocab[2];
  const blankText = fillWord.example.replace(fillWord.word, "___");
  exercises.push({
    lessonId,
    type: "FILL_IN_BLANK",
    order: 3,
    question: {
      text: blankText,
      correctAnswer: fillWord.word,
      hint: fillWord.translation,
    },
  });

  // 4. Matching (si assez de vocabulaire)
  if (vocab.length >= 4) {
    exercises.push({
      lessonId,
      type: "MATCHING",
      order: 4,
      question: {
        pairs: vocab.slice(0, 4).map((v) => ({
          left: v.word,
          right: v.translation,
        })),
      },
    });
  }

  // 5. QCM inversé — "Que signifie X ?"
  if (vocab.length >= 4) {
    exercises.push({
      lessonId,
      type: "MULTIPLE_CHOICE",
      order: 5,
      question: {
        text: `Que signifie « ${vocab[3].word} » ?`,
        options: [vocab[3].translation, vocab[0].translation, vocab[1].translation, vocab[2].translation],
        correctAnswer: 0,
        hint: vocab[3].example,
      },
    });
  }

  // ===== NOUVEAUX TYPES (profils d'apprentissage variés) =====

  // 6. CONTEXT_GUESS — Deviner le sens d'un mot par le contexte (profil immersif)
  // On affiche la phrase d'exemple et on demande ce que le mot signifie
  if (vocab.length >= 4) {
    const guessWord = vocab[Math.min(4, vocab.length - 1)];
    const wrongOptions = vocab
      .filter((v) => v.word !== guessWord.word)
      .slice(0, 3)
      .map((v) => v.translation);
    exercises.push({
      lessonId,
      type: "CONTEXT_GUESS",
      order: 6,
      question: {
        context: guessWord.example,
        targetWord: guessWord.word,
        options: [guessWord.translation, ...wrongOptions],
        correctAnswer: 0,
        instruction: `Lis la phrase et devine le sens de « ${guessWord.word} » grâce au contexte.`,
      },
    });
  }

  // 7. SPOT_ERROR — Trouver l'erreur dans une phrase (profil analytique)
  // On prend une phrase correcte et on introduit une erreur subtile
  if (vocab.length >= 3) {
    const correctPhrase = vocab[0].example;
    const wrongWord = vocab[1].word;
    // Replace the correct word with a wrong one to create an error
    const errorPhrase = correctPhrase.replace(vocab[0].word, wrongWord);
    exercises.push({
      lessonId,
      type: "SPOT_ERROR",
      order: 7,
      question: {
        text: errorPhrase,
        errorWord: wrongWord,
        correctWord: vocab[0].word,
        explanation: `« ${wrongWord} » signifie « ${vocab[1].translation} ». La bonne réponse est « ${vocab[0].word} » (${vocab[0].translation}).`,
        instruction: "Trouve et corrige l'erreur dans cette phrase.",
      },
    });
  }

  // 8. DIALOGUE_COMPLETE — Compléter un dialogue réaliste (profil communicatif)
  // On crée un mini-dialogue avec un trou à compléter
  if (vocab.length >= 3) {
    const dialogueWord = vocab[Math.min(2, vocab.length - 1)];
    const wrongAnswers = vocab
      .filter((v) => v.word !== dialogueWord.word)
      .slice(0, 2)
      .map((v) => v.word);
    exercises.push({
      lessonId,
      type: "DIALOGUE_COMPLETE",
      order: 8,
      question: {
        dialogue: [
          { speaker: "A", text: dialogueWord.example.split(".")[0] + "?" },
          { speaker: "B", text: "___" },
        ],
        options: [dialogueWord.word, ...wrongAnswers],
        correctAnswer: 0,
        context: lesson.title,
        instruction: "Complète le dialogue avec la réponse la plus appropriée.",
      },
    });
  }

  // 9. FREE_PRODUCTION — Production libre évaluée par IA (profil actif)
  // On donne un contexte et on demande de produire une phrase
  exercises.push({
    lessonId,
    type: "FREE_PRODUCTION",
    order: 9,
    question: {
      prompt: `Utilise le vocabulaire de la leçon « ${lesson.title} » pour écrire une phrase dans la situation suivante :`,
      situation: lesson.description,
      expectedVocabulary: vocab.slice(0, 3).map((v) => v.word),
      grammarFocus: lesson.grammarNote,
      instruction: "Écris une phrase ou une courte réponse en utilisant ce que tu as appris.",
      evaluationCriteria: [
        "Utilisation correcte du vocabulaire",
        "Grammaire appropriée au niveau",
        "Naturel de l'expression",
      ],
    },
  });

  return exercises;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
