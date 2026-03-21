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

  // EN B1 Chapitres
  await seedChaptersWithContent(enB1, [
    {
      title: "L'entretien d'embauche", icon: "💼", description: "Préparer et réussir un entretien d'embauche en anglais", order: 1,
      lessons: [
        {
          title: "Se présenter professionnellement", description: "Parler de son parcours et de ses compétences", order: 1,
          vocabulary: [
            { word: "I have a background in...", translation: "J'ai une formation en...", example: "I have a background in software engineering." },
            { word: "I'm currently working as...", translation: "Je travaille actuellement en tant que...", example: "I'm currently working as a project manager." },
            { word: "My main responsibility is...", translation: "Ma responsabilité principale est...", example: "My main responsibility is managing the team." },
            { word: "I'm looking for a new challenge", translation: "Je cherche un nouveau défi", example: "I'm looking for a new challenge in a dynamic company." },
            { word: "I would describe myself as...", translation: "Je me décrirais comme...", example: "I would describe myself as reliable and motivated." },
            { word: "I've been working in this field for...", translation: "Je travaille dans ce domaine depuis...", example: "I've been working in this field for five years." },
            { word: "My previous role involved...", translation: "Mon poste précédent impliquait...", example: "My previous role involved client management." },
            { word: "I hold a degree in...", translation: "Je suis diplômé(e) en...", example: "I hold a degree in business administration." },
          ],
          grammarNote: "Le present perfect continuous ('I've been working...') exprime une action commencée dans le passé et qui continue. Très courant en entretien.",
        },
        {
          title: "Questions et négociation", description: "Répondre aux questions difficiles et négocier", order: 2,
          vocabulary: [
            { word: "What are your salary expectations?", translation: "Quelles sont vos prétentions salariales ?", example: "What are your salary expectations for this role?" },
            { word: "I'm open to negotiation", translation: "Je suis ouvert à la négociation", example: "I'm open to negotiation depending on the benefits." },
            { word: "Where do you see yourself in five years?", translation: "Où vous voyez-vous dans cinq ans ?", example: "Where do you see yourself in five years?" },
            { word: "My biggest weakness is...", translation: "Mon plus grand défaut est...", example: "My biggest weakness is being too detail-oriented." },
            { word: "Could you tell me more about the team?", translation: "Pourriez-vous m'en dire plus sur l'équipe ?", example: "Could you tell me more about the team I'd be joining?" },
            { word: "What does a typical day look like?", translation: "À quoi ressemble une journée type ?", example: "What does a typical day look like in this position?" },
            { word: "I'm particularly interested in...", translation: "Je suis particulièrement intéressé(e) par...", example: "I'm particularly interested in your sustainability projects." },
            { word: "When can I expect to hear back?", translation: "Quand puis-je espérer avoir une réponse ?", example: "When can I expect to hear back from you?" },
          ],
          grammarNote: "Les questions indirectes sont plus polies : 'Could you tell me...' au lieu de 'Tell me...'. Utilise 'would' pour les hypothèses.",
        },
      ],
    },
    {
      title: "Débattre et donner son avis", icon: "💬", description: "Exprimer et défendre son point de vue avec nuance", order: 2,
      lessons: [
        {
          title: "Donner son opinion", description: "Exprimer son avis et réagir à celui des autres", order: 1,
          vocabulary: [
            { word: "In my opinion...", translation: "À mon avis...", example: "In my opinion, remote work is more productive." },
            { word: "I strongly believe that...", translation: "Je crois fermement que...", example: "I strongly believe that education should be free." },
            { word: "I see what you mean, but...", translation: "Je vois ce que tu veux dire, mais...", example: "I see what you mean, but I disagree." },
            { word: "That's a fair point", translation: "C'est un argument valable", example: "That's a fair point, I hadn't considered that." },
            { word: "On the other hand...", translation: "D'un autre côté...", example: "On the other hand, there are significant risks." },
            { word: "I tend to think that...", translation: "J'ai tendance à penser que...", example: "I tend to think that technology improves our lives." },
            { word: "I couldn't agree more", translation: "Je suis tout à fait d'accord", example: "I couldn't agree more with your analysis." },
            { word: "That's not necessarily true", translation: "Ce n'est pas forcément vrai", example: "That's not necessarily true in every situation." },
          ],
          grammarNote: "Pour nuancer une opinion : 'tend to', 'not necessarily', 'to some extent'. Évite 'I think' répétitif en variant avec 'I believe', 'I feel', 'I reckon'.",
        },
        {
          title: "Argumenter et convaincre", description: "Structurer un argument et convaincre son interlocuteur", order: 2,
          vocabulary: [
            { word: "First of all...", translation: "Tout d'abord...", example: "First of all, let me explain my reasoning." },
            { word: "Furthermore...", translation: "De plus...", example: "Furthermore, the data supports this conclusion." },
            { word: "However...", translation: "Cependant...", example: "However, we need to consider the costs." },
            { word: "To sum up...", translation: "Pour résumer...", example: "To sum up, the advantages outweigh the disadvantages." },
            { word: "The main issue is...", translation: "Le problème principal est...", example: "The main issue is the lack of funding." },
            { word: "Let me give you an example", translation: "Laisse-moi te donner un exemple", example: "Let me give you an example to illustrate my point." },
            { word: "According to...", translation: "Selon...", example: "According to recent studies, this is effective." },
            { word: "In conclusion...", translation: "En conclusion...", example: "In conclusion, I think we should proceed." },
          ],
          grammarNote: "Les connecteurs logiques structurent l'argumentation : 'first of all', 'furthermore', 'however', 'in conclusion'. Ils rendent le discours plus fluide et convaincant.",
        },
      ],
    },
    {
      title: "Voyager seul", icon: "🌍", description: "Se débrouiller en voyage de manière autonome", order: 3,
      lessons: [
        {
          title: "Gérer les imprévus", description: "Résoudre des problèmes en voyage", order: 1,
          vocabulary: [
            { word: "I've lost my passport", translation: "J'ai perdu mon passeport", example: "I've lost my passport, where is the embassy?" },
            { word: "My flight has been cancelled", translation: "Mon vol a été annulé", example: "My flight has been cancelled, can you rebook me?" },
            { word: "I need to file a complaint", translation: "Je dois déposer une réclamation", example: "I need to file a complaint about my hotel room." },
            { word: "Could you help me find...?", translation: "Pourriez-vous m'aider à trouver... ?", example: "Could you help me find the nearest pharmacy?" },
            { word: "I'm not sure how to get to...", translation: "Je ne sais pas comment aller à...", example: "I'm not sure how to get to the train station." },
            { word: "Is there an alternative?", translation: "Y a-t-il une alternative ?", example: "Is there an alternative route to the airport?" },
            { word: "I've been waiting for over an hour", translation: "J'attends depuis plus d'une heure", example: "I've been waiting for over an hour for my luggage." },
            { word: "Who should I contact about this?", translation: "Qui dois-je contacter à ce sujet ?", example: "Who should I contact about this issue?" },
          ],
          grammarNote: "Le present perfect ('I've lost', 'I've been waiting') est essentiel pour décrire des situations qui ont un impact sur le présent.",
        },
        {
          title: "Découvrir et interagir", description: "Échanger avec les locaux et découvrir la culture", order: 2,
          vocabulary: [
            { word: "What's this area known for?", translation: "Pour quoi ce quartier est-il connu ?", example: "What's this area known for? Any local specialties?" },
            { word: "Can you recommend a good restaurant?", translation: "Pouvez-vous recommander un bon restaurant ?", example: "Can you recommend a good restaurant nearby?" },
            { word: "How do locals usually...?", translation: "Comment les locaux font-ils habituellement... ?", example: "How do locals usually get around the city?" },
            { word: "I'd love to try...", translation: "J'adorerais essayer...", example: "I'd love to try some traditional food." },
            { word: "Is it safe to walk around here at night?", translation: "Est-ce sûr de se promener ici la nuit ?", example: "Is it safe to walk around here at night?" },
            { word: "What time does it open/close?", translation: "À quelle heure ça ouvre/ferme ?", example: "What time does the museum open?" },
            { word: "Do you have any tips for tourists?", translation: "Avez-vous des conseils pour les touristes ?", example: "Do you have any tips for tourists visiting this city?" },
            { word: "I'm traveling on my own", translation: "Je voyage seul(e)", example: "I'm traveling on my own for the first time." },
          ],
          grammarNote: "'Known for' = connu pour. 'I'd love to' = j'adorerais (conditionnel de politesse). Les questions avec 'How do...' servent à comprendre les habitudes.",
        },
      ],
    },
    {
      title: "Raconter une histoire", icon: "📖", description: "Narrer des événements passés avec détails et émotions", order: 4,
      lessons: [
        {
          title: "Raconter un souvenir", description: "Parler d'événements passés de manière vivante", order: 1,
          vocabulary: [
            { word: "It all started when...", translation: "Tout a commencé quand...", example: "It all started when I moved to London." },
            { word: "At that time, I was...", translation: "À cette époque, j'étais...", example: "At that time, I was still a student." },
            { word: "Suddenly...", translation: "Soudainement...", example: "Suddenly, everything changed." },
            { word: "I had never experienced anything like it", translation: "Je n'avais jamais vécu quelque chose comme ça", example: "I had never experienced anything like it before." },
            { word: "Looking back, I realize...", translation: "Avec le recul, je réalise...", example: "Looking back, I realize it was the best decision." },
            { word: "The most memorable part was...", translation: "La partie la plus mémorable était...", example: "The most memorable part was meeting the locals." },
            { word: "It turned out that...", translation: "Il s'est avéré que...", example: "It turned out that we were completely wrong." },
            { word: "I'll never forget the time when...", translation: "Je n'oublierai jamais le moment où...", example: "I'll never forget the time when I got lost in Tokyo." },
          ],
          grammarNote: "Le past simple ('started', 'changed') pour les actions principales. Le past continuous ('I was living') pour le contexte. Le past perfect ('I had never') pour les événements antérieurs.",
        },
        {
          title: "Décrire des émotions et réactions", description: "Exprimer des sentiments dans un récit", order: 2,
          vocabulary: [
            { word: "I was absolutely thrilled", translation: "J'étais absolument ravi(e)", example: "I was absolutely thrilled when I got the news." },
            { word: "I couldn't believe my eyes", translation: "Je n'en croyais pas mes yeux", example: "I couldn't believe my eyes when I saw the view." },
            { word: "It made me feel...", translation: "Ça m'a fait sentir...", example: "It made me feel grateful for everything." },
            { word: "I was so relieved that...", translation: "J'étais tellement soulagé(e) que...", example: "I was so relieved that everyone was safe." },
            { word: "At first I was scared, but then...", translation: "Au début j'avais peur, mais ensuite...", example: "At first I was scared, but then I started enjoying it." },
            { word: "It was a bittersweet moment", translation: "C'était un moment doux-amer", example: "It was a bittersweet moment saying goodbye." },
            { word: "I felt a sense of accomplishment", translation: "J'ai ressenti un sentiment d'accomplissement", example: "I felt a sense of accomplishment after finishing the race." },
            { word: "It was overwhelming", translation: "C'était bouleversant", example: "It was overwhelming to see so many people supporting us." },
          ],
          grammarNote: "Les adverbes d'intensité enrichissent le récit : 'absolutely', 'completely', 'totally'. Les expressions idiomatiques ('couldn't believe my eyes') rendent le récit plus naturel.",
        },
      ],
    },
    {
      title: "Communication professionnelle", icon: "📧", description: "Maîtriser les emails et appels téléphoniques professionnels", order: 5,
      lessons: [
        {
          title: "Écrire un email professionnel", description: "Rédiger des emails clairs et polis", order: 1,
          vocabulary: [
            { word: "Dear Sir/Madam", translation: "Madame, Monsieur", example: "Dear Sir/Madam, I am writing to inquire about..." },
            { word: "I am writing to...", translation: "Je vous écris pour...", example: "I am writing to follow up on our meeting." },
            { word: "Please find attached...", translation: "Veuillez trouver ci-joint...", example: "Please find attached the report you requested." },
            { word: "I would appreciate it if...", translation: "Je vous serais reconnaissant(e) si...", example: "I would appreciate it if you could reply by Friday." },
            { word: "I look forward to hearing from you", translation: "J'attends votre réponse avec impatience", example: "I look forward to hearing from you soon." },
            { word: "Kind regards", translation: "Cordialement", example: "Kind regards, Marie Dupont." },
            { word: "As per our conversation...", translation: "Suite à notre conversation...", example: "As per our conversation, I'm sending the details." },
            { word: "I apologize for the delay", translation: "Je m'excuse du retard", example: "I apologize for the delay in responding." },
          ],
          grammarNote: "L'email professionnel utilise des formules fixes : 'I am writing to...', 'Please find attached...', 'I look forward to + -ing'. Le ton est formel mais pas rigide.",
        },
        {
          title: "Au téléphone", description: "Gérer des appels professionnels en anglais", order: 2,
          vocabulary: [
            { word: "Good morning, this is ... speaking", translation: "Bonjour, c'est ... à l'appareil", example: "Good morning, this is Sarah speaking. How can I help?" },
            { word: "Could I speak to...?", translation: "Pourrais-je parler à... ?", example: "Could I speak to the marketing manager, please?" },
            { word: "I'm calling regarding...", translation: "J'appelle au sujet de...", example: "I'm calling regarding the invoice we received." },
            { word: "Could you hold for a moment?", translation: "Pourriez-vous patienter un instant ?", example: "Could you hold for a moment? I'll transfer you." },
            { word: "I'll get back to you on that", translation: "Je reviendrai vers vous à ce sujet", example: "I'll get back to you on that by tomorrow." },
            { word: "Could you repeat that, please?", translation: "Pourriez-vous répéter, s'il vous plaît ?", example: "Could you repeat that, please? The line is bad." },
            { word: "Let me take a message", translation: "Laissez-moi prendre un message", example: "He's not available. Let me take a message." },
            { word: "Thank you for your time", translation: "Merci pour votre temps", example: "Thank you for your time. Have a good day." },
          ],
          grammarNote: "Au téléphone, 'Could' est préféré à 'Can' pour la politesse. 'Speaking' s'utilise pour s'identifier. 'Regarding' est plus formel que 'about'.",
        },
      ],
    },
  ]);

  // ---------- ESPAGNOL ----------
  console.log("📚 Espagnol...");
  const esA1 = await upsertCourse(langMap["es"], "A1", "Español — Principiante (A1)", "Aprende las bases para desenvolverte en situaciones cotidianas.", 1, false);
  const esA2 = await upsertCourse(langMap["es"], "A2", "Español — Elemental (A2)", "Refuerza tus bases y empieza a tener conversaciones simples.", 2, false);
  const esB1 = await upsertCourse(langMap["es"], "B1", "Español — Intermedio (B1)", "Desarrolla tu fluidez y aborda temas más complejos.", 3, true);

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

  // ES B1 Chapitres
  await seedChaptersWithContent(esB1, [
    {
      title: "La entrevista de trabajo", icon: "💼", description: "Preparar y superar una entrevista de trabajo en español", order: 1,
      lessons: [
        {
          title: "Presentarse profesionalmente", description: "Hablar de tu trayectoria y competencias", order: 1,
          vocabulary: [
            { word: "Tengo experiencia en el campo de...", translation: "J'ai de l'expérience dans le domaine de...", example: "Tengo experiencia en el campo de la informática." },
            { word: "Actualmente trabajo como...", translation: "Je travaille actuellement en tant que...", example: "Actualmente trabajo como diseñador gráfico." },
            { word: "Mi principal fortaleza es...", translation: "Mon principal point fort est...", example: "Mi principal fortaleza es la comunicación." },
            { word: "Estoy buscando nuevos retos", translation: "Je cherche de nouveaux défis", example: "Estoy buscando nuevos retos profesionales." },
            { word: "Me considero una persona...", translation: "Je me considère comme une personne...", example: "Me considero una persona organizada y responsable." },
            { word: "Llevo cinco años trabajando en...", translation: "Cela fait cinq ans que je travaille dans...", example: "Llevo cinco años trabajando en marketing digital." },
            { word: "Mi puesto anterior consistía en...", translation: "Mon poste précédent consistait à...", example: "Mi puesto anterior consistía en gestionar el equipo de ventas." },
            { word: "Soy licenciado/a en...", translation: "Je suis diplômé(e) en...", example: "Soy licenciada en administración de empresas." },
          ],
          grammarNote: "'Llevar + tiempo + gerundio' exprime la durée : 'Llevo tres años viviendo aquí' = ça fait trois ans que j'habite ici. Très courant en espagnol.",
        },
        {
          title: "Preguntas y negociación", description: "Responder a preguntas difíciles y negociar", order: 2,
          vocabulary: [
            { word: "¿Cuáles son sus expectativas salariales?", translation: "Quelles sont vos prétentions salariales ?", example: "¿Cuáles son sus expectativas salariales para este puesto?" },
            { word: "Estoy abierto/a a negociar", translation: "Je suis ouvert(e) à la négociation", example: "Estoy abierto a negociar según las condiciones." },
            { word: "¿Dónde se ve en cinco años?", translation: "Où vous voyez-vous dans cinq ans ?", example: "¿Dónde se ve en cinco años?" },
            { word: "Mi mayor debilidad es...", translation: "Mon plus grand défaut est...", example: "Mi mayor debilidad es que soy perfeccionista." },
            { word: "¿Podría contarme más sobre el equipo?", translation: "Pourriez-vous m'en dire plus sur l'équipe ?", example: "¿Podría contarme más sobre el equipo de trabajo?" },
            { word: "¿Cómo es un día típico en este puesto?", translation: "À quoi ressemble une journée type à ce poste ?", example: "¿Cómo es un día típico en este puesto?" },
            { word: "Me interesa especialmente...", translation: "Je suis particulièrement intéressé(e) par...", example: "Me interesa especialmente el proyecto de expansión." },
            { word: "¿Cuándo podría tener noticias?", translation: "Quand pourrais-je avoir des nouvelles ?", example: "¿Cuándo podría tener noticias sobre el proceso?" },
          ],
          grammarNote: "Le conditionnel de politesse : '¿Podría...?' (pourriez-vous). Le subjonctif après 'espero que' : 'Espero que me contacten pronto'.",
        },
      ],
    },
    {
      title: "Debatir y opinar", icon: "💬", description: "Expresar y defender tu punto de vista con matices", order: 2,
      lessons: [
        {
          title: "Dar tu opinión", description: "Expresar tu opinión y reaccionar a la de otros", order: 1,
          vocabulary: [
            { word: "En mi opinión...", translation: "À mon avis...", example: "En mi opinión, el teletrabajo es más productivo." },
            { word: "Estoy convencido/a de que...", translation: "Je suis convaincu(e) que...", example: "Estoy convencida de que la educación es clave." },
            { word: "Entiendo tu punto de vista, pero...", translation: "Je comprends ton point de vue, mais...", example: "Entiendo tu punto de vista, pero no estoy de acuerdo." },
            { word: "Es un buen argumento", translation: "C'est un bon argument", example: "Es un buen argumento, no lo había pensado." },
            { word: "Por otro lado...", translation: "D'un autre côté...", example: "Por otro lado, hay riesgos importantes." },
            { word: "Tiendo a pensar que...", translation: "J'ai tendance à penser que...", example: "Tiendo a pensar que la tecnología mejora nuestras vidas." },
            { word: "Estoy totalmente de acuerdo", translation: "Je suis tout à fait d'accord", example: "Estoy totalmente de acuerdo con tu análisis." },
            { word: "No necesariamente es así", translation: "Ce n'est pas forcément le cas", example: "No necesariamente es así en todas las situaciones." },
          ],
          grammarNote: "Le subjonctif s'utilise après les expressions d'opinion négatives : 'No creo que sea verdad'. Après 'creo que' (affirmatif) → indicatif.",
        },
        {
          title: "Argumentar y convencer", description: "Estructurar un argumento y convencer", order: 2,
          vocabulary: [
            { word: "En primer lugar...", translation: "En premier lieu...", example: "En primer lugar, déjame explicar mi razonamiento." },
            { word: "Además...", translation: "De plus...", example: "Además, los datos respaldan esta conclusión." },
            { word: "Sin embargo...", translation: "Cependant...", example: "Sin embargo, debemos considerar los costes." },
            { word: "En resumen...", translation: "En résumé...", example: "En resumen, las ventajas superan los inconvenientes." },
            { word: "El problema principal es...", translation: "Le problème principal est...", example: "El problema principal es la falta de financiación." },
            { word: "Déjame darte un ejemplo", translation: "Laisse-moi te donner un exemple", example: "Déjame darte un ejemplo para ilustrar mi punto." },
            { word: "Según los estudios...", translation: "Selon les études...", example: "Según los estudios recientes, esto es efectivo." },
            { word: "En conclusión...", translation: "En conclusion...", example: "En conclusión, creo que deberíamos seguir adelante." },
          ],
          grammarNote: "Les connecteurs : 'en primer lugar', 'además', 'sin embargo', 'por lo tanto', 'en conclusión'. Ils structurent le discours de manière logique.",
        },
      ],
    },
    {
      title: "Viajar solo", icon: "🌍", description: "Desenvolverse de manera autónoma durante un viaje", order: 3,
      lessons: [
        {
          title: "Gestionar imprevistos", description: "Resolver problemas durante un viaje", order: 1,
          vocabulary: [
            { word: "He perdido mi pasaporte", translation: "J'ai perdu mon passeport", example: "He perdido mi pasaporte, ¿dónde está la embajada?" },
            { word: "Mi vuelo ha sido cancelado", translation: "Mon vol a été annulé", example: "Mi vuelo ha sido cancelado, ¿pueden cambiarme la reserva?" },
            { word: "Necesito poner una reclamación", translation: "Je dois déposer une réclamation", example: "Necesito poner una reclamación sobre mi habitación." },
            { word: "¿Podría ayudarme a encontrar...?", translation: "Pourriez-vous m'aider à trouver... ?", example: "¿Podría ayudarme a encontrar la farmacia más cercana?" },
            { word: "No sé cómo llegar a...", translation: "Je ne sais pas comment aller à...", example: "No sé cómo llegar a la estación de tren." },
            { word: "¿Hay alguna alternativa?", translation: "Y a-t-il une alternative ?", example: "¿Hay alguna alternativa para llegar al aeropuerto?" },
            { word: "Llevo más de una hora esperando", translation: "J'attends depuis plus d'une heure", example: "Llevo más de una hora esperando mi equipaje." },
            { word: "¿Con quién debo hablar sobre esto?", translation: "À qui dois-je m'adresser pour ça ?", example: "¿Con quién debo hablar sobre este problema?" },
          ],
          grammarNote: "Le passé composé espagnol : 'He perdido' (j'ai perdu). 'Llevar + gerundio' pour la durée : 'Llevo esperando una hora'.",
        },
        {
          title: "Descubrir e interactuar", description: "Échanger avec les locaux et découvrir la culture", order: 2,
          vocabulary: [
            { word: "¿Por qué es conocida esta zona?", translation: "Pour quoi cette zone est-elle connue ?", example: "¿Por qué es conocida esta zona? ¿Hay especialidades locales?" },
            { word: "¿Puede recomendarme un buen restaurante?", translation: "Pouvez-vous me recommander un bon restaurant ?", example: "¿Puede recomendarme un buen restaurante por aquí?" },
            { word: "¿Cómo se mueven los locales por la ciudad?", translation: "Comment les locaux se déplacent-ils en ville ?", example: "¿Cómo se mueven los locales por la ciudad?" },
            { word: "Me encantaría probar...", translation: "J'adorerais essayer...", example: "Me encantaría probar la comida típica de la región." },
            { word: "¿Es seguro pasear por aquí de noche?", translation: "Est-ce sûr de se promener ici la nuit ?", example: "¿Es seguro pasear por aquí de noche?" },
            { word: "¿A qué hora abre/cierra?", translation: "À quelle heure ça ouvre/ferme ?", example: "¿A qué hora abre el museo?" },
            { word: "¿Tiene algún consejo para turistas?", translation: "Avez-vous des conseils pour les touristes ?", example: "¿Tiene algún consejo para turistas que visitan la ciudad?" },
            { word: "Viajo solo/sola", translation: "Je voyage seul(e)", example: "Viajo sola por primera vez." },
          ],
          grammarNote: "'Encantar' fonctionne comme 'gustar' : 'Me encantaría' = j'adorerais. 'Conocido/a por' = connu(e) pour.",
        },
      ],
    },
    {
      title: "Contar una historia", icon: "📖", description: "Narrar eventos pasados con detalles y emociones", order: 4,
      lessons: [
        {
          title: "Contar un recuerdo", description: "Hablar de eventos pasados de manera vívida", order: 1,
          vocabulary: [
            { word: "Todo empezó cuando...", translation: "Tout a commencé quand...", example: "Todo empezó cuando me mudé a Barcelona." },
            { word: "En aquella época, yo...", translation: "À cette époque, je...", example: "En aquella época, yo todavía era estudiante." },
            { word: "De repente...", translation: "Soudainement...", example: "De repente, todo cambió." },
            { word: "Nunca había vivido algo así", translation: "Je n'avais jamais vécu quelque chose comme ça", example: "Nunca había vivido algo así antes." },
            { word: "Mirando hacia atrás, me doy cuenta de que...", translation: "Avec le recul, je réalise que...", example: "Mirando hacia atrás, me doy cuenta de que fue la mejor decisión." },
            { word: "Lo más memorable fue...", translation: "Le plus mémorable a été...", example: "Lo más memorable fue conocer a la gente local." },
            { word: "Resultó que...", translation: "Il s'est avéré que...", example: "Resultó que estábamos completamente equivocados." },
            { word: "Nunca olvidaré cuando...", translation: "Je n'oublierai jamais quand...", example: "Nunca olvidaré cuando me perdí en Tokio." },
          ],
          grammarNote: "Le pretérito indefinido ('empezó', 'cambió') pour les actions ponctuelles. L'imparfait ('era', 'estaba') pour le contexte. Le plus-que-parfait ('había vivido') pour l'antériorité.",
        },
        {
          title: "Describir emociones y reacciones", description: "Expresar sentimientos en un relato", order: 2,
          vocabulary: [
            { word: "Estaba absolutamente encantado/a", translation: "J'étais absolument ravi(e)", example: "Estaba absolutamente encantada cuando recibí la noticia." },
            { word: "No podía creer lo que veía", translation: "Je n'en croyais pas mes yeux", example: "No podía creer lo que veía cuando descubrí el paisaje." },
            { word: "Me hizo sentir...", translation: "Ça m'a fait ressentir...", example: "Me hizo sentir agradecido por todo." },
            { word: "Me sentí tan aliviado/a de que...", translation: "Je me suis senti(e) tellement soulagé(e) que...", example: "Me sentí tan aliviada de que todos estuvieran bien." },
            { word: "Al principio tenía miedo, pero luego...", translation: "Au début j'avais peur, mais ensuite...", example: "Al principio tenía miedo, pero luego empecé a disfrutar." },
            { word: "Fue un momento agridulce", translation: "C'était un moment doux-amer", example: "Fue un momento agridulce decir adiós." },
            { word: "Sentí una sensación de logro", translation: "J'ai ressenti un sentiment d'accomplissement", example: "Sentí una sensación de logro al terminar la carrera." },
            { word: "Fue abrumador", translation: "C'était bouleversant", example: "Fue abrumador ver a tanta gente apoyándonos." },
          ],
          grammarNote: "Le subjonctif après les émotions : 'Me alegro de que hayas venido'. Les adverbes d'intensité : 'absolutamente', 'completamente', 'totalmente'.",
        },
      ],
    },
    {
      title: "Comunicación profesional", icon: "📧", description: "Dominar emails y llamadas telefónicas profesionales", order: 5,
      lessons: [
        {
          title: "Escribir un email profesional", description: "Redactar emails claros y educados", order: 1,
          vocabulary: [
            { word: "Estimado/a señor/a", translation: "Cher Monsieur / Chère Madame", example: "Estimada señora López, le escribo para informarle..." },
            { word: "Le escribo para...", translation: "Je vous écris pour...", example: "Le escribo para hacer seguimiento de nuestra reunión." },
            { word: "Adjunto encontrará...", translation: "Vous trouverez ci-joint...", example: "Adjunto encontrará el informe solicitado." },
            { word: "Le agradecería que...", translation: "Je vous serais reconnaissant(e) si...", example: "Le agradecería que pudiera responder antes del viernes." },
            { word: "Quedo a la espera de su respuesta", translation: "J'attends votre réponse", example: "Quedo a la espera de su respuesta." },
            { word: "Un cordial saludo", translation: "Cordialement", example: "Un cordial saludo, María García." },
            { word: "En relación con nuestra conversación...", translation: "Suite à notre conversation...", example: "En relación con nuestra conversación, le envío los detalles." },
            { word: "Disculpe la demora en responder", translation: "Excusez le retard de réponse", example: "Disculpe la demora en responder a su email." },
          ],
          grammarNote: "L'email formel espagnol utilise 'usted'. Le subjonctif est courant : 'Le agradecería que pudiera...' (pourriez-vous). 'Quedo a la espera' est la formule standard de clôture.",
        },
        {
          title: "Al teléfono", description: "Gestionar llamadas profesionales en español", order: 2,
          vocabulary: [
            { word: "Buenos días, le habla...", translation: "Bonjour, c'est ... à l'appareil", example: "Buenos días, le habla María García. ¿En qué puedo ayudarle?" },
            { word: "¿Podría hablar con...?", translation: "Pourrais-je parler à... ?", example: "¿Podría hablar con el director de ventas, por favor?" },
            { word: "Llamo en relación con...", translation: "J'appelle au sujet de...", example: "Llamo en relación con la factura que recibimos." },
            { word: "¿Podría esperar un momento?", translation: "Pourriez-vous patienter un instant ?", example: "¿Podría esperar un momento? Le paso la llamada." },
            { word: "Le confirmo la información", translation: "Je vous confirme l'information", example: "Le confirmo la información por email." },
            { word: "¿Podría repetir, por favor?", translation: "Pourriez-vous répéter, s'il vous plaît ?", example: "¿Podría repetir, por favor? No le he escuchado bien." },
            { word: "¿Puedo dejarle un mensaje?", translation: "Puis-je lui laisser un message ?", example: "No está disponible. ¿Puedo dejarle un mensaje?" },
            { word: "Gracias por su tiempo", translation: "Merci pour votre temps", example: "Gracias por su tiempo. Que tenga un buen día." },
          ],
          grammarNote: "Au téléphone, on vouvoie presque toujours : '¿Podría...?', 'Le habla...'. 'Pasar la llamada' = transférer l'appel.",
        },
      ],
    },
  ]);

  // ---------- JAPONAIS ----------
  console.log("📚 Japonais...");
  const jaA1 = await upsertCourse(langMap["ja"], "A1", "日本語 — 初級 (A1)", "Les bases du japonais pour te débrouiller au quotidien.", 1, false);
  const jaA2 = await upsertCourse(langMap["ja"], "A2", "日本語 — 初中級 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  const jaB1 = await upsertCourse(langMap["ja"], "B1", "日本語 — 中級 (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

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

  // JA B1 Chapitres
  await seedChaptersWithContent(jaB1, [
    {
      title: "面接 (めんせつ) — L'entretien d'embauche", icon: "💼", description: "Préparer et réussir un entretien d'embauche en japonais", order: 1,
      lessons: [
        {
          title: "自己紹介 — Se présenter professionnellement", description: "Parler de son parcours et de ses compétences", order: 1,
          vocabulary: [
            { word: "～の分野で経験があります (～のぶんやでけいけんがあります)", translation: "J'ai de l'expérience dans le domaine de...", example: "IT の分野で経験があります。" },
            { word: "現在、～として働いています (げんざい、～としてはたらいています)", translation: "Je travaille actuellement en tant que...", example: "現在、プロジェクトマネージャーとして働いています。" },
            { word: "私の強みは～です (わたしのつよみは～です)", translation: "Mon point fort est...", example: "私の強みはコミュニケーション能力です。" },
            { word: "新しいチャレンジを探しています (あたらしいチャレンジをさがしています)", translation: "Je cherche de nouveaux défis", example: "新しいチャレンジを探しています。" },
            { word: "私は～な人間だと思います (わたしは～なにんげんだとおもいます)", translation: "Je pense être une personne...", example: "私は責任感のある人間だと思います。" },
            { word: "この業界で5年間働いてきました (このぎょうかいで5ねんかんはたらいてきました)", translation: "J'ai travaillé dans cette industrie pendant 5 ans", example: "この業界で5年間働いてきました。" },
            { word: "前職では～を担当していました (ぜんしょくでは～をたんとうしていました)", translation: "Dans mon poste précédent, j'étais en charge de...", example: "前職ではマーケティングを担当していました。" },
            { word: "～の学位を持っています (～のがくいをもっています)", translation: "J'ai un diplôme en...", example: "経営学の学位を持っています。" },
          ],
          grammarNote: "En japonais formel (敬語 keigo), utilisez ます/です. '～てきました' exprime une expérience accumulée jusqu'au présent.",
        },
        {
          title: "質問と交渉 — Questions et négociation", description: "Répondre aux questions et négocier", order: 2,
          vocabulary: [
            { word: "希望年収はおいくらですか (きぼうねんしゅうはおいくらですか)", translation: "Quel est votre salaire souhaité ?", example: "希望年収はおいくらですか？" },
            { word: "相談させていただければ幸いです (そうだんさせていただければさいわいです)", translation: "Je serais heureux d'en discuter", example: "条件について相談させていただければ幸いです。" },
            { word: "5年後の目標は何ですか (5ねんごのもくひょうはなんですか)", translation: "Quels sont vos objectifs dans 5 ans ?", example: "5年後の目標は何ですか？" },
            { word: "改善すべき点は～です (かいぜんすべきてんは～です)", translation: "Le point que je dois améliorer est...", example: "改善すべき点は、もっと柔軟になることです。" },
            { word: "チームについて教えていただけますか", translation: "Pourriez-vous me parler de l'équipe ?", example: "チームの雰囲気について教えていただけますか？" },
            { word: "一日の流れを教えていただけますか (いちにちのながれを)", translation: "Pourriez-vous me décrire une journée type ?", example: "一日の流れを教えていただけますか？" },
            { word: "～に特に興味があります (～にとくにきょうみがあります)", translation: "Je suis particulièrement intéressé par...", example: "御社のグローバル展開に特に興味があります。" },
            { word: "結果はいつ頃わかりますか (けっかはいつごろわかりますか)", translation: "Quand connaîtrai-je les résultats ?", example: "選考の結果はいつ頃わかりますか？" },
          ],
          grammarNote: "Le keigo (langage poli) est obligatoire en entretien : '～ていただけますか' (pourriez-vous). '御社' (onsha) = votre entreprise (humble).",
        },
      ],
    },
    {
      title: "意見を述べる (いけんをのべる) — Débattre et donner son avis", icon: "💬", description: "Exprimer et défendre son point de vue en japonais", order: 2,
      lessons: [
        {
          title: "意見を言う — Donner son opinion", description: "Exprimer son avis et réagir", order: 1,
          vocabulary: [
            { word: "私の意見では (わたしのいけんでは)", translation: "À mon avis...", example: "私の意見では、リモートワークの方が効率的です。" },
            { word: "～だと確信しています (～だとかくしんしています)", translation: "Je suis convaincu(e) que...", example: "教育は無料であるべきだと確信しています。" },
            { word: "おっしゃることはわかりますが", translation: "Je comprends ce que vous dites, mais...", example: "おっしゃることはわかりますが、賛成できません。" },
            { word: "それは良い指摘ですね (それはよいしてきですね)", translation: "C'est une bonne remarque", example: "それは良い指摘ですね。考えていませんでした。" },
            { word: "一方で (いっぽうで)", translation: "D'un autre côté...", example: "一方で、リスクも大きいです。" },
            { word: "～と考える傾向があります (～とかんがえるけいこうがあります)", translation: "J'ai tendance à penser que...", example: "テクノロジーは生活を改善すると考える傾向があります。" },
            { word: "全く同感です (まったくどうかんです)", translation: "Je suis tout à fait d'accord", example: "全く同感です。その通りだと思います。" },
            { word: "必ずしもそうとは限りません (かならずしもそうとはかぎりません)", translation: "Ce n'est pas forcément le cas", example: "必ずしもそうとは限りません。" },
          ],
          grammarNote: "'～と思います' (je pense que) est la base. Pour nuancer : '～傾向がある' (avoir tendance à), '～とは限らない' (pas forcément).",
        },
        {
          title: "論理的に話す — Argumenter de manière logique", description: "Structurer un argument", order: 2,
          vocabulary: [
            { word: "まず (mazu)", translation: "Tout d'abord...", example: "まず、私の考えを説明させてください。" },
            { word: "さらに (sarani)", translation: "De plus...", example: "さらに、データがこの結論を裏付けています。" },
            { word: "しかし (shikashi)", translation: "Cependant...", example: "しかし、コストも考慮する必要があります。" },
            { word: "要するに (ようするに)", translation: "En résumé...", example: "要するに、メリットの方がデメリットより大きいです。" },
            { word: "最大の問題は～です (さいだいのもんだいは～です)", translation: "Le plus grand problème est...", example: "最大の問題は資金不足です。" },
            { word: "例を挙げると (れいをあげると)", translation: "Par exemple...", example: "例を挙げると、去年の売上データがあります。" },
            { word: "～によると (～によると)", translation: "Selon...", example: "最近の調査によると、これは効果的です。" },
            { word: "結論として (けつろんとして)", translation: "En conclusion...", example: "結論として、このプロジェクトを進めるべきです。" },
          ],
          grammarNote: "Les connecteurs formels : 'まず' (d'abord), 'さらに' (de plus), 'しかし' (cependant), '結論として' (en conclusion). Essentiels pour un discours structuré.",
        },
      ],
    },
    {
      title: "一人旅 (ひとりたび) — Voyager seul", icon: "🌍", description: "Se débrouiller en voyage de manière autonome", order: 3,
      lessons: [
        {
          title: "トラブル対応 — Gérer les imprévus", description: "Résoudre des problèmes en voyage", order: 1,
          vocabulary: [
            { word: "パスポートをなくしてしまいました", translation: "J'ai perdu mon passeport", example: "パスポートをなくしてしまいました。大使館はどこですか？" },
            { word: "フライトがキャンセルになりました", translation: "Mon vol a été annulé", example: "フライトがキャンセルになりました。振り替えはできますか？" },
            { word: "苦情を言いたいのですが (くじょうをいいたいのですが)", translation: "Je voudrais faire une réclamation", example: "ホテルの部屋について苦情を言いたいのですが。" },
            { word: "～を探すのを手伝っていただけますか", translation: "Pourriez-vous m'aider à trouver... ?", example: "一番近い薬局を探すのを手伝っていただけますか？" },
            { word: "～への行き方がわかりません (～へのいきかたがわかりません)", translation: "Je ne sais pas comment aller à...", example: "駅への行き方がわかりません。" },
            { word: "他の方法はありますか (ほかのほうほうはありますか)", translation: "Y a-t-il une autre méthode ?", example: "空港に行く他の方法はありますか？" },
            { word: "1時間以上待っています (いちじかんいじょうまっています)", translation: "J'attends depuis plus d'une heure", example: "荷物を1時間以上待っています。" },
            { word: "この件について誰に相談すればいいですか", translation: "À qui dois-je m'adresser à ce sujet ?", example: "この件について誰に相談すればいいですか？" },
          ],
          grammarNote: "'～てしまいました' exprime un résultat regrettable. '～ていただけますか' est une demande très polie. '～すればいいですか' = que dois-je faire ?",
        },
        {
          title: "交流する — Découvrir et interagir", description: "Échanger avec les locaux", order: 2,
          vocabulary: [
            { word: "この辺りは何で有名ですか (このあたりはなにでゆうめいですか)", translation: "Pour quoi ce quartier est-il célèbre ?", example: "この辺りは何で有名ですか？" },
            { word: "おすすめのレストランはありますか", translation: "Avez-vous un restaurant à recommander ?", example: "この近くにおすすめのレストランはありますか？" },
            { word: "地元の人はどうやって移動しますか (じもとのひとは)", translation: "Comment les locaux se déplacent-ils ?", example: "地元の人はどうやって移動しますか？" },
            { word: "ぜひ～を試してみたいです", translation: "J'aimerais vraiment essayer...", example: "ぜひ郷土料理を試してみたいです。" },
            { word: "夜ここを歩いても安全ですか (よるここをあるいてもあんぜんですか)", translation: "Est-ce sûr de marcher ici la nuit ?", example: "夜ここを歩いても安全ですか？" },
            { word: "何時に開きますか/閉まりますか (なんじにあきますか/しまりますか)", translation: "À quelle heure ça ouvre/ferme ?", example: "この美術館は何時に開きますか？" },
            { word: "観光客へのアドバイスはありますか (かんこうきゃくへの)", translation: "Avez-vous des conseils pour les touristes ?", example: "観光客へのアドバイスはありますか？" },
            { word: "一人で旅行しています (ひとりでりょこうしています)", translation: "Je voyage seul(e)", example: "初めて一人で旅行しています。" },
          ],
          grammarNote: "'ぜひ' ajoute de l'enthousiasme : 'ぜひ試してみたい' = j'aimerais vraiment essayer. '～ても' = même si : '歩いても安全' = même si on marche, c'est sûr.",
        },
      ],
    },
    {
      title: "物語を語る (ものがたりをかたる) — Raconter une histoire", icon: "📖", description: "Narrer des événements passés avec détails et émotions", order: 4,
      lessons: [
        {
          title: "思い出を語る — Raconter un souvenir", description: "Parler d'événements passés", order: 1,
          vocabulary: [
            { word: "すべては～から始まりました (すべては～からはじまりました)", translation: "Tout a commencé par...", example: "すべては東京に引っ越したことから始まりました。" },
            { word: "当時、私は～でした (とうじ、わたしは～でした)", translation: "À l'époque, j'étais...", example: "当時、私はまだ学生でした。" },
            { word: "突然 (とつぜん)", translation: "Soudainement...", example: "突然、すべてが変わりました。" },
            { word: "そんな経験は初めてでした (そんなけいけんははじめてでした)", translation: "C'était la première fois que je vivais ça", example: "そんな経験は初めてでした。" },
            { word: "振り返ってみると (ふりかえってみると)", translation: "Avec le recul...", example: "振り返ってみると、最良の決断でした。" },
            { word: "一番印象に残ったのは (いちばんいんしょうにのこったのは)", translation: "Ce qui m'a le plus marqué, c'est...", example: "一番印象に残ったのは、地元の人との出会いです。" },
            { word: "実は～だったのです (じつは～だったのです)", translation: "En fait, il s'est avéré que...", example: "実は、私たちは完全に間違っていたのです。" },
            { word: "～のことは一生忘れません (～のことはいっしょうわすれません)", translation: "Je n'oublierai jamais...", example: "京都で迷子になったことは一生忘れません。" },
          ],
          grammarNote: "'～てみると' = quand on essaie de... / avec le recul. '～のです' ajoute une explication ou une émotion. '一生' = toute la vie.",
        },
        {
          title: "感情を表現する — Décrire des émotions", description: "Exprimer des sentiments dans un récit", order: 2,
          vocabulary: [
            { word: "本当にうれしかったです (ほんとうにうれしかったです)", translation: "J'étais vraiment content(e)", example: "その知らせを聞いて、本当にうれしかったです。" },
            { word: "目を疑いました (めをうたがいました)", translation: "Je n'en croyais pas mes yeux", example: "その景色を見て、目を疑いました。" },
            { word: "～という気持ちになりました", translation: "J'ai ressenti le sentiment de...", example: "感謝の気持ちになりました。" },
            { word: "ほっとしました", translation: "J'ai été soulagé(e)", example: "みんなが無事だと聞いて、ほっとしました。" },
            { word: "最初は怖かったですが、だんだん (さいしょはこわかったですが)", translation: "Au début j'avais peur, mais petit à petit...", example: "最初は怖かったですが、だんだん楽しくなりました。" },
            { word: "複雑な気持ちでした (ふくざつなきもちでした)", translation: "C'était un sentiment mitigé", example: "さよならを言うのは複雑な気持ちでした。" },
            { word: "達成感を感じました (たっせいかんをかんじました)", translation: "J'ai ressenti un sentiment d'accomplissement", example: "マラソンを完走して達成感を感じました。" },
            { word: "圧倒されました (あっとうされました)", translation: "J'ai été submergé(e)", example: "大勢の人の応援に圧倒されました。" },
          ],
          grammarNote: "'～て' + émotion : '聞いてうれしかった' = j'étais content d'entendre. 'だんだん' = petit à petit. '～されました' = voix passive pour les émotions subies.",
        },
      ],
    },
    {
      title: "ビジネスコミュニケーション — Communication professionnelle", icon: "📧", description: "Maîtriser les emails et appels téléphoniques professionnels", order: 5,
      lessons: [
        {
          title: "ビジネスメール — Écrire un email professionnel", description: "Rédiger des emails professionnels en japonais", order: 1,
          vocabulary: [
            { word: "お世話になっております (おせわになっております)", translation: "Formule d'ouverture (merci pour votre bienveillance)", example: "いつもお世話になっております。" },
            { word: "～の件でご連絡いたしました (～のけんでごれんらくいたしました)", translation: "Je vous contacte au sujet de...", example: "会議の件でご連絡いたしました。" },
            { word: "添付ファイルをご確認ください (てんぷファイルをごかくにんください)", translation: "Veuillez vérifier le fichier joint", example: "添付ファイルをご確認ください。" },
            { word: "ご返信いただければ幸いです (ごへんしんいただければさいわいです)", translation: "Je serais reconnaissant d'une réponse", example: "金曜日までにご返信いただければ幸いです。" },
            { word: "ご確認のほど、よろしくお願いいたします", translation: "Je vous prie de bien vouloir vérifier", example: "ご確認のほど、よろしくお願いいたします。" },
            { word: "何卒よろしくお願いいたします (なにとぞ)", translation: "Cordialement (très formel)", example: "何卒よろしくお願いいたします。" },
            { word: "先日のお打ち合わせの件ですが (せんじつのおうちあわせのけんですが)", translation: "Concernant notre réunion de l'autre jour...", example: "先日のお打ち合わせの件ですが、詳細をお送りします。" },
            { word: "ご返信が遅くなり、申し訳ございません (ごへんしんがおそくなり)", translation: "Je m'excuse du retard de réponse", example: "ご返信が遅くなり、申し訳ございません。" },
          ],
          grammarNote: "Le keigo (langage de politesse) est obligatoire dans les emails professionnels japonais. 'お/ご + nom' = honorifique. '～いたします' = forme humble.",
        },
        {
          title: "電話対応 — Au téléphone", description: "Gérer des appels professionnels en japonais", order: 2,
          vocabulary: [
            { word: "お電話ありがとうございます。～でございます (おでんわ)", translation: "Merci d'appeler. C'est ... à l'appareil", example: "お電話ありがとうございます。田中でございます。" },
            { word: "～様はいらっしゃいますか (～さまはいらっしゃいますか)", translation: "Est-ce que M./Mme ... est disponible ?", example: "山田様はいらっしゃいますか？" },
            { word: "～の件でお電話しております", translation: "J'appelle au sujet de...", example: "請求書の件でお電話しております。" },
            { word: "少々お待ちいただけますか (しょうしょうおまちいただけますか)", translation: "Pourriez-vous patienter un instant ?", example: "少々お待ちいただけますか？おつなぎいたします。" },
            { word: "折り返しご連絡いたします (おりかえしごれんらくいたします)", translation: "Je vous rappellerai", example: "明日までに折り返しご連絡いたします。" },
            { word: "もう一度おっしゃっていただけますか", translation: "Pourriez-vous répéter, s'il vous plaît ?", example: "すみません、もう一度おっしゃっていただけますか？" },
            { word: "伝言をお願いできますか (でんごんをおねがいできますか)", translation: "Puis-je laisser un message ?", example: "伝言をお願いできますか？" },
            { word: "お時間いただき、ありがとうございました (おじかんいただき)", translation: "Merci pour votre temps", example: "お時間いただき、ありがとうございました。" },
          ],
          grammarNote: "'～でございます' est la forme la plus polie de 'です'. 'いらっしゃいますか' = honorifique de 'いますか'. Au Japon, le téléphone professionnel suit un protocole très précis.",
        },
      ],
    },
  ]);

  // ---------- CHINOIS ----------
  console.log("📚 Chinois...");
  const zhA1 = await upsertCourse(langMap["zh"], "A1", "中文 — 入门 (A1)", "Les bases du chinois mandarin pour te débrouiller au quotidien.", 1, false);
  const zhA2 = await upsertCourse(langMap["zh"], "A2", "中文 — 基础 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  const zhB1 = await upsertCourse(langMap["zh"], "B1", "中文 — 中级 (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

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

  // ZH B1 Chapitres
  await seedChaptersWithContent(zhB1, [
    {
      title: "求职面试 (qiúzhí miànshì) — L'entretien d'embauche", icon: "💼", description: "Préparer et réussir un entretien d'embauche en chinois", order: 1,
      lessons: [
        {
          title: "自我介绍 — Se présenter professionnellement", description: "Parler de son parcours professionnel", order: 1,
          vocabulary: [
            { word: "我在...领域有经验 (wǒ zài...lǐngyù yǒu jīngyàn)", translation: "J'ai de l'expérience dans le domaine de...", example: "我在信息技术领域有经验。" },
            { word: "我目前担任...职位 (wǒ mùqián dānrèn...zhíwèi)", translation: "J'occupe actuellement le poste de...", example: "我目前担任项目经理职位。" },
            { word: "我的优势是... (wǒ de yōushì shì)", translation: "Mon avantage est...", example: "我的优势是团队合作能力。" },
            { word: "我在寻找新的挑战 (wǒ zài xúnzhǎo xīn de tiǎozhàn)", translation: "Je cherche de nouveaux défis", example: "我在寻找新的挑战和发展机会。" },
            { word: "我认为自己是一个...的人 (wǒ rènwéi zìjǐ shì yī gè...de rén)", translation: "Je me considère comme une personne...", example: "我认为自己是一个负责任的人。" },
            { word: "我在这个行业工作了五年 (wǒ zài zhège hángyè gōngzuòle wǔ nián)", translation: "J'ai travaillé dans cette industrie pendant 5 ans", example: "我在这个行业工作了五年了。" },
            { word: "我之前的工作是... (wǒ zhīqián de gōngzuò shì)", translation: "Mon travail précédent était...", example: "我之前的工作是负责市场营销。" },
            { word: "我拥有...学位 (wǒ yōngyǒu...xuéwèi)", translation: "J'ai un diplôme en...", example: "我拥有工商管理学位。" },
          ],
          grammarNote: "'了' après le verbe indique une action accomplie. '在...领域' = dans le domaine de. '担任' est formel pour 'occuper un poste'.",
        },
        {
          title: "提问与谈判 — Questions et négociation", description: "Répondre aux questions et négocier", order: 2,
          vocabulary: [
            { word: "您的期望薪资是多少？ (nín de qīwàng xīnzī shì duōshao)", translation: "Quel est votre salaire souhaité ?", example: "请问您的期望薪资是多少？" },
            { word: "我愿意协商 (wǒ yuànyì xiéshāng)", translation: "Je suis disposé(e) à négocier", example: "关于薪资，我愿意协商。" },
            { word: "您五年后的目标是什么？ (nín wǔ nián hòu de mùbiāo shì shénme)", translation: "Quels sont vos objectifs dans 5 ans ?", example: "您五年后的职业目标是什么？" },
            { word: "我需要改进的地方是... (wǒ xūyào gǎijìn de dìfang shì)", translation: "Le point que je dois améliorer est...", example: "我需要改进的地方是时间管理。" },
            { word: "能介绍一下团队吗？ (néng jièshào yīxià tuánduì ma)", translation: "Pourriez-vous présenter l'équipe ?", example: "能介绍一下我将加入的团队吗？" },
            { word: "这个职位的日常工作是什么？ (zhège zhíwèi de rìcháng gōngzuò shì shénme)", translation: "Quel est le travail quotidien de ce poste ?", example: "这个职位的日常工作是什么？" },
            { word: "我对...特别感兴趣 (wǒ duì...tèbié gǎn xìngqù)", translation: "Je suis particulièrement intéressé(e) par...", example: "我对贵公司的国际发展特别感兴趣。" },
            { word: "什么时候能知道结果？ (shénme shíhou néng zhīdào jiéguǒ)", translation: "Quand pourrai-je connaître les résultats ?", example: "请问什么时候能知道面试结果？" },
          ],
          grammarNote: "'贵公司' (guì gōngsī) = votre entreprise (respectueux). '能...吗？' = pourriez-vous. '关于' = concernant, au sujet de.",
        },
      ],
    },
    {
      title: "表达观点 (biǎodá guāndiǎn) — Débattre et donner son avis", icon: "💬", description: "Exprimer et défendre son point de vue en chinois", order: 2,
      lessons: [
        {
          title: "发表意见 — Donner son opinion", description: "Exprimer son avis et réagir", order: 1,
          vocabulary: [
            { word: "我认为... (wǒ rènwéi)", translation: "Je pense que...", example: "我认为远程工作更有效率。" },
            { word: "我坚信... (wǒ jiānxìn)", translation: "Je suis convaincu(e) que...", example: "我坚信教育应该是免费的。" },
            { word: "我理解你的意思，但是... (wǒ lǐjiě nǐ de yìsi, dànshì)", translation: "Je comprends ce que tu veux dire, mais...", example: "我理解你的意思，但是我不同意。" },
            { word: "你说得有道理 (nǐ shuō de yǒu dàolǐ)", translation: "Tu as raison / C'est un bon point", example: "你说得有道理，我没有考虑到这一点。" },
            { word: "另一方面... (lìng yī fāngmiàn)", translation: "D'un autre côté...", example: "另一方面，风险也很大。" },
            { word: "我倾向于认为... (wǒ qīngxiàng yú rènwéi)", translation: "J'ai tendance à penser que...", example: "我倾向于认为科技改善了我们的生活。" },
            { word: "我完全同意 (wǒ wánquán tóngyì)", translation: "Je suis tout à fait d'accord", example: "我完全同意你的分析。" },
            { word: "不一定是这样 (bù yīdìng shì zhèyàng)", translation: "Ce n'est pas forcément le cas", example: "不一定是这样，要看具体情况。" },
          ],
          grammarNote: "'认为' est plus formel que '觉得'. '不一定' = pas forcément. '倾向于' = avoir tendance à (registre soutenu).",
        },
        {
          title: "论证和说服 — Argumenter et convaincre", description: "Structurer un argument", order: 2,
          vocabulary: [
            { word: "首先... (shǒuxiān)", translation: "Tout d'abord...", example: "首先，让我解释一下我的想法。" },
            { word: "而且... (érqiě)", translation: "De plus...", example: "而且，数据支持这个结论。" },
            { word: "然而... (rán'ér)", translation: "Cependant...", example: "然而，我们需要考虑成本。" },
            { word: "总之... (zǒngzhī)", translation: "En résumé...", example: "总之，优点大于缺点。" },
            { word: "最主要的问题是... (zuì zhǔyào de wèntí shì)", translation: "Le problème principal est...", example: "最主要的问题是缺乏资金。" },
            { word: "举个例子 (jǔ gè lìzi)", translation: "Par exemple...", example: "举个例子，去年的销售数据就证明了这一点。" },
            { word: "根据... (gēnjù)", translation: "Selon...", example: "根据最近的研究，这是有效的。" },
            { word: "总而言之... (zǒng ér yán zhī)", translation: "En conclusion...", example: "总而言之，我们应该继续推进这个项目。" },
          ],
          grammarNote: "Les connecteurs logiques en chinois : '首先...其次...最后' (premièrement, deuxièmement, enfin). '然而' est plus formel que '但是'.",
        },
      ],
    },
    {
      title: "独自旅行 (dúzì lǚxíng) — Voyager seul", icon: "🌍", description: "Se débrouiller en voyage de manière autonome", order: 3,
      lessons: [
        {
          title: "处理意外 — Gérer les imprévus", description: "Résoudre des problèmes en voyage", order: 1,
          vocabulary: [
            { word: "我的护照丢了 (wǒ de hùzhào diū le)", translation: "J'ai perdu mon passeport", example: "我的护照丢了，大使馆在哪里？" },
            { word: "我的航班被取消了 (wǒ de hángbān bèi qǔxiāo le)", translation: "Mon vol a été annulé", example: "我的航班被取消了，能帮我改签吗？" },
            { word: "我要投诉 (wǒ yào tóusù)", translation: "Je veux déposer une plainte", example: "关于酒店房间，我要投诉。" },
            { word: "你能帮我找到...吗？ (nǐ néng bāng wǒ zhǎodào...ma)", translation: "Pouvez-vous m'aider à trouver... ?", example: "你能帮我找到最近的药店吗？" },
            { word: "我不知道怎么去... (wǒ bù zhīdào zěnme qù)", translation: "Je ne sais pas comment aller à...", example: "我不知道怎么去火车站。" },
            { word: "有没有其他办法？ (yǒu méiyǒu qítā bànfǎ)", translation: "Y a-t-il une autre solution ?", example: "去机场有没有其他办法？" },
            { word: "我已经等了一个多小时了 (wǒ yǐjīng děngle yī gè duō xiǎoshí le)", translation: "J'attends depuis plus d'une heure", example: "我已经等了一个多小时了，行李还没到。" },
            { word: "这件事我应该找谁？ (zhè jiàn shì wǒ yīnggāi zhǎo shéi)", translation: "À qui dois-je m'adresser pour ça ?", example: "这件事我应该找谁解决？" },
          ],
          grammarNote: "'被' (bèi) = voix passive : '被取消了' = a été annulé. '已经...了' = déjà. '怎么去' = comment aller à.",
        },
        {
          title: "探索与交流 — Découvrir et interagir", description: "Échanger avec les locaux", order: 2,
          vocabulary: [
            { word: "这个地方有什么出名的？ (zhège dìfang yǒu shénme chūmíng de)", translation: "Pour quoi cet endroit est-il connu ?", example: "这个地方有什么出名的特产？" },
            { word: "能推荐一家好的餐厅吗？ (néng tuījiàn yī jiā hǎo de cāntīng ma)", translation: "Pouvez-vous recommander un bon restaurant ?", example: "附近能推荐一家好的餐厅吗？" },
            { word: "当地人一般怎么出行？ (dāngdì rén yībān zěnme chūxíng)", translation: "Comment les locaux se déplacent-ils ?", example: "当地人一般怎么出行？" },
            { word: "我很想尝尝... (wǒ hěn xiǎng chángchang)", translation: "J'aimerais beaucoup goûter...", example: "我很想尝尝当地的特色美食。" },
            { word: "晚上在这里走安全吗？ (wǎnshang zài zhèlǐ zǒu ānquán ma)", translation: "Est-ce sûr de se promener ici le soir ?", example: "晚上在这里走路安全吗？" },
            { word: "几点开门/关门？ (jǐ diǎn kāimén / guānmén)", translation: "À quelle heure ça ouvre/ferme ?", example: "博物馆几点开门？" },
            { word: "对游客有什么建议吗？ (duì yóukè yǒu shénme jiànyì ma)", translation: "Avez-vous des conseils pour les touristes ?", example: "对来这里的游客有什么建议吗？" },
            { word: "我是一个人旅行的 (wǒ shì yī gè rén lǚxíng de)", translation: "Je voyage seul(e)", example: "我是第一次一个人旅行的。" },
          ],
          grammarNote: "'一般' = en général, habituellement. '很想' = avoir très envie de. '当地人' = les locaux. '特色' = spécialité, caractéristique.",
        },
      ],
    },
    {
      title: "讲故事 (jiǎng gùshi) — Raconter une histoire", icon: "📖", description: "Narrer des événements passés avec détails et émotions", order: 4,
      lessons: [
        {
          title: "回忆往事 — Raconter un souvenir", description: "Parler d'événements passés", order: 1,
          vocabulary: [
            { word: "一切都是从...开始的 (yīqiè dōu shì cóng...kāishǐ de)", translation: "Tout a commencé par...", example: "一切都是从我搬到上海开始的。" },
            { word: "那时候，我还... (nà shíhou, wǒ hái)", translation: "À cette époque, j'étais encore...", example: "那时候，我还是一个学生。" },
            { word: "突然... (tūrán)", translation: "Soudainement...", example: "突然，一切都变了。" },
            { word: "我从来没有经历过这样的事 (wǒ cónglái méiyǒu jīnglìguo zhèyàng de shì)", translation: "Je n'avais jamais vécu une telle chose", example: "我从来没有经历过这样的事。" },
            { word: "回想起来 (huíxiǎng qǐlái)", translation: "Avec le recul...", example: "回想起来，那是最好的决定。" },
            { word: "最令人难忘的是... (zuì lìng rén nánwàng de shì)", translation: "Le plus mémorable, c'est...", example: "最令人难忘的是和当地人的交流。" },
            { word: "结果发现... (jiéguǒ fāxiàn)", translation: "Il s'est avéré que...", example: "结果发现，我们完全搞错了。" },
            { word: "我永远不会忘记... (wǒ yǒngyuǎn bù huì wàngjì)", translation: "Je n'oublierai jamais...", example: "我永远不会忘记在东京迷路的那次。" },
          ],
          grammarNote: "'从来没有...过' = n'avoir jamais. '回想起来' = en y repensant. '令人' + adjectif = qui fait ressentir (令人难忘 = inoubliable).",
        },
        {
          title: "表达情感 — Décrire des émotions", description: "Exprimer des sentiments dans un récit", order: 2,
          vocabulary: [
            { word: "我非常高兴 (wǒ fēicháng gāoxìng)", translation: "J'étais extrêmement content(e)", example: "听到这个消息，我非常高兴。" },
            { word: "我简直不敢相信 (wǒ jiǎnzhí bù gǎn xiāngxìn)", translation: "Je n'arrivais pas à y croire", example: "看到那个风景，我简直不敢相信。" },
            { word: "让我感到... (ràng wǒ gǎndào)", translation: "Ça m'a fait ressentir...", example: "这让我感到非常感激。" },
            { word: "我松了一口气 (wǒ sōngle yī kǒu qì)", translation: "J'ai poussé un soupir de soulagement", example: "听到大家都平安，我松了一口气。" },
            { word: "一开始我很害怕，但后来... (yī kāishǐ wǒ hěn hàipà, dàn hòulái)", translation: "Au début j'avais peur, mais ensuite...", example: "一开始我很害怕，但后来慢慢地开始享受了。" },
            { word: "那是一个既甜蜜又苦涩的时刻 (nà shì yī gè jì tiánmì yòu kǔsè de shíkè)", translation: "C'était un moment doux-amer", example: "告别时，那是一个既甜蜜又苦涩的时刻。" },
            { word: "我感到了成就感 (wǒ gǎndàole chéngjiù gǎn)", translation: "J'ai ressenti un sentiment d'accomplissement", example: "跑完马拉松后，我感到了成就感。" },
            { word: "我被深深地感动了 (wǒ bèi shēnshēn de gǎndòng le)", translation: "J'ai été profondément touché(e)", example: "看到这么多人的支持，我被深深地感动了。" },
          ],
          grammarNote: "'简直' = littéralement, tout simplement (emphase). '既...又...' = à la fois... et... '被...感动' = être touché/ému (passif).",
        },
      ],
    },
    {
      title: "商务沟通 (shāngwù gōutōng) — Communication professionnelle", icon: "📧", description: "Maîtriser les emails et appels téléphoniques professionnels", order: 5,
      lessons: [
        {
          title: "商务邮件 — Écrire un email professionnel", description: "Rédiger des emails professionnels en chinois", order: 1,
          vocabulary: [
            { word: "尊敬的...先生/女士 (zūnjìng de...xiānsheng/nǚshì)", translation: "Cher Monsieur / Chère Madame", example: "尊敬的王先生，您好！" },
            { word: "我写信是为了... (wǒ xiě xìn shì wèile)", translation: "Je vous écris pour...", example: "我写信是为了跟进我们的会议。" },
            { word: "请查收附件 (qǐng cháshōu fùjiàn)", translation: "Veuillez vérifier la pièce jointe", example: "请查收附件中的报告。" },
            { word: "如果您能...我将非常感激 (rúguǒ nín néng...wǒ jiāng fēicháng gǎnjī)", translation: "Si vous pouviez... je vous serais très reconnaissant", example: "如果您能在周五前回复，我将非常感激。" },
            { word: "期待您的回复 (qīdài nín de huífù)", translation: "J'attends votre réponse avec impatience", example: "期待您的回复。" },
            { word: "此致，敬礼 (cǐzhì, jìnglǐ)", translation: "Cordialement", example: "此致，敬礼。张伟" },
            { word: "关于我们上次的谈话... (guānyú wǒmen shàng cì de tánhuà)", translation: "Concernant notre dernière conversation...", example: "关于我们上次的谈话，我发送相关详情。" },
            { word: "对于回复延迟，我深表歉意 (duìyú huífù yánchí, wǒ shēn biǎo qiànyì)", translation: "Je m'excuse profondément du retard de réponse", example: "对于回复延迟，我深表歉意。" },
          ],
          grammarNote: "'尊敬的' = respecté (ouverture formelle). '此致，敬礼' = formule de clôture standard. '将' = futur formel. '深表' = exprimer profondément.",
        },
        {
          title: "电话沟通 — Au téléphone", description: "Gérer des appels professionnels en chinois", order: 2,
          vocabulary: [
            { word: "您好，我是... (nín hǎo, wǒ shì)", translation: "Bonjour, je suis...", example: "您好，我是张伟。请问有什么可以帮您的？" },
            { word: "请问...在吗？ (qǐngwèn...zài ma)", translation: "Est-ce que ... est disponible ?", example: "请问王经理在吗？" },
            { word: "我打电话是关于... (wǒ dǎ diànhuà shì guānyú)", translation: "J'appelle au sujet de...", example: "我打电话是关于我们收到的发票。" },
            { word: "请稍等 (qǐng shāo děng)", translation: "Veuillez patienter un instant", example: "请稍等，我帮您转接。" },
            { word: "我会尽快回复您 (wǒ huì jìnkuài huífù nín)", translation: "Je vous répondrai le plus vite possible", example: "我会尽快回复您。" },
            { word: "能再说一遍吗？ (néng zài shuō yī biàn ma)", translation: "Pourriez-vous répéter ?", example: "不好意思，能再说一遍吗？信号不太好。" },
            { word: "我可以留言吗？ (wǒ kěyǐ liúyán ma)", translation: "Puis-je laisser un message ?", example: "他不在，我可以留言吗？" },
            { word: "谢谢您的时间 (xièxie nín de shíjiān)", translation: "Merci pour votre temps", example: "谢谢您的时间。祝您今天愉快！" },
          ],
          grammarNote: "'请问' = formule polie pour poser une question. '帮您转接' = vous transférer. '尽快' = le plus vite possible. '不好意思' = excusez-moi.",
        },
      ],
    },
  ]);

  // ---------- RUSSE ----------
  console.log("📚 Russe...");
  const ruA1 = await upsertCourse(langMap["ru"], "A1", "Русский — Начальный (A1)", "Les bases du russe pour te débrouiller au quotidien.", 1, false);
  const ruA2 = await upsertCourse(langMap["ru"], "A2", "Русский — Элементарный (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  const ruB1 = await upsertCourse(langMap["ru"], "B1", "Русский — Средний (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

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

  // RU B1 Chapitres
  await seedChaptersWithContent(ruB1, [
    {
      title: "Собеседование — L'entretien d'embauche", icon: "💼", description: "Préparer et réussir un entretien d'embauche en russe", order: 1,
      lessons: [
        {
          title: "Представиться профессионально", description: "Parler de son parcours professionnel", order: 1,
          vocabulary: [
            { word: "У меня есть опыт в области... (u menya yest' opyt v oblasti)", translation: "J'ai de l'expérience dans le domaine de...", example: "У меня есть опыт в области информационных технологий." },
            { word: "В настоящее время я работаю... (v nastoyashcheye vremya ya rabotayu)", translation: "Je travaille actuellement en tant que...", example: "В настоящее время я работаю менеджером проектов." },
            { word: "Мое главное преимущество — это... (moyo glavnoye preimushchestvo)", translation: "Mon principal avantage est...", example: "Мое главное преимущество — это коммуникабельность." },
            { word: "Я ищу новые вызовы (ya ishchu novyye vyzovy)", translation: "Je cherche de nouveaux défis", example: "Я ищу новые вызовы в динамичной компании." },
            { word: "Я считаю себя... человеком (ya schitayu sebya...chelovekom)", translation: "Je me considère comme une personne...", example: "Я считаю себя ответственным человеком." },
            { word: "Я работаю в этой сфере уже пять лет (ya rabotayu v etoy sfere uzhe pyat' let)", translation: "Je travaille dans ce domaine depuis 5 ans", example: "Я работаю в этой сфере уже пять лет." },
            { word: "На предыдущей должности я занимался... (na predydushchey dolzhnosti)", translation: "Dans mon poste précédent, je m'occupais de...", example: "На предыдущей должности я занимался маркетингом." },
            { word: "У меня диплом по... (u menya diplom po)", translation: "J'ai un diplôme en...", example: "У меня диплом по управлению бизнесом." },
          ],
          grammarNote: "'Уже + durée' = depuis (уже пять лет = depuis cinq ans). L'instrumental est utilisé pour les professions : 'работаю менеджером'.",
        },
        {
          title: "Вопросы и переговоры", description: "Répondre aux questions et négocier", order: 2,
          vocabulary: [
            { word: "Какие у вас зарплатные ожидания? (kakiye u vas zarplatnyye ozhidaniya)", translation: "Quelles sont vos prétentions salariales ?", example: "Какие у вас зарплатные ожидания на эту должность?" },
            { word: "Я готов к обсуждению (ya gotov k obsuzhdeniyu)", translation: "Je suis prêt(e) à en discuter", example: "Я готов к обсуждению условий." },
            { word: "Кем вы видите себя через пять лет? (kem vy vidite sebya cherez pyat' let)", translation: "Où vous voyez-vous dans 5 ans ?", example: "Кем вы видите себя через пять лет?" },
            { word: "Мой главный недостаток — это... (moy glavnyy nedostatok)", translation: "Mon principal défaut est...", example: "Мой главный недостаток — это перфекционизм." },
            { word: "Не могли бы вы рассказать о команде? (ne mogli by vy rasskazat')", translation: "Pourriez-vous me parler de l'équipe ?", example: "Не могли бы вы рассказать о команде?" },
            { word: "Как выглядит типичный рабочий день? (kak vyglyadit tipichnyy rabochiy den')", translation: "À quoi ressemble une journée type ?", example: "Как выглядит типичный рабочий день на этой позиции?" },
            { word: "Меня особенно интересует... (menya osobenno interesuyet)", translation: "Je suis particulièrement intéressé(e) par...", example: "Меня особенно интересует ваш международный проект." },
            { word: "Когда можно ожидать ответа? (kogda mozhno ozhidat' otveta)", translation: "Quand peut-on attendre une réponse ?", example: "Когда можно ожидать ответа по результатам?" },
          ],
          grammarNote: "'Не могли бы вы...?' = conditionnel de politesse. 'Через + accusatif' = dans (temps futur). 'Кем' = instrumental de 'кто' (en tant que qui).",
        },
      ],
    },
    {
      title: "Дебаты и мнения — Débattre et donner son avis", icon: "💬", description: "Exprimer et défendre son point de vue en russe", order: 2,
      lessons: [
        {
          title: "Выразить своё мнение", description: "Donner son opinion et réagir", order: 1,
          vocabulary: [
            { word: "По моему мнению... (po moyemu mneniyu)", translation: "À mon avis...", example: "По моему мнению, удалённая работа эффективнее." },
            { word: "Я убеждён, что... (ya ubezhdon, chto)", translation: "Je suis convaincu(e) que...", example: "Я убеждён, что образование должно быть бесплатным." },
            { word: "Я понимаю вашу точку зрения, но... (ya ponimayu vashu tochku zreniya)", translation: "Je comprends votre point de vue, mais...", example: "Я понимаю вашу точку зрения, но не согласен." },
            { word: "Это хороший аргумент (eto khoroshiy argument)", translation: "C'est un bon argument", example: "Это хороший аргумент, я об этом не подумал." },
            { word: "С другой стороны... (s drugoy storony)", translation: "D'un autre côté...", example: "С другой стороны, риски значительны." },
            { word: "Я склонен думать, что... (ya sklonen dumat', chto)", translation: "J'ai tendance à penser que...", example: "Я склонен думать, что технологии улучшают жизнь." },
            { word: "Я полностью согласен (ya polnost'yu soglasen)", translation: "Je suis tout à fait d'accord", example: "Я полностью согласен с вашим анализом." },
            { word: "Это не обязательно так (eto ne obyazatel'no tak)", translation: "Ce n'est pas forcément le cas", example: "Это не обязательно так в каждой ситуации." },
          ],
          grammarNote: "'По моему мнению' ou 'на мой взгляд' = à mon avis. Les adjectifs courts : 'согласен/согласна' (d'accord), 'убеждён/убеждена' (convaincu).",
        },
        {
          title: "Аргументировать и убеждать", description: "Structurer un argument et convaincre", order: 2,
          vocabulary: [
            { word: "Во-первых... (vo-pervykh)", translation: "Premièrement...", example: "Во-первых, позвольте объяснить мою позицию." },
            { word: "Кроме того... (krome togo)", translation: "De plus...", example: "Кроме того, данные подтверждают этот вывод." },
            { word: "Однако... (odnako)", translation: "Cependant...", example: "Однако необходимо учитывать расходы." },
            { word: "Подводя итог... (podvodya itog)", translation: "En résumé...", example: "Подводя итог, преимущества перевешивают недостатки." },
            { word: "Главная проблема — это... (glavnaya problema — eto)", translation: "Le problème principal est...", example: "Главная проблема — это нехватка финансирования." },
            { word: "Приведу пример (privedu primer)", translation: "Je vais donner un exemple", example: "Приведу пример, чтобы проиллюстрировать мою мысль." },
            { word: "Согласно исследованиям... (soglasno issledovaniyam)", translation: "Selon les recherches...", example: "Согласно последним исследованиям, это эффективно." },
            { word: "В заключение... (v zaklyucheniye)", translation: "En conclusion...", example: "В заключение, я считаю, что нужно продолжать." },
          ],
          grammarNote: "Les connecteurs : 'во-первых, во-вторых, в-третьих' (premièrement, deuxièmement, troisièmement). 'Согласно' + datif = selon.",
        },
      ],
    },
    {
      title: "Путешествие в одиночку — Voyager seul", icon: "🌍", description: "Se débrouiller en voyage de manière autonome", order: 3,
      lessons: [
        {
          title: "Справляться с непредвиденными ситуациями", description: "Gérer les imprévus en voyage", order: 1,
          vocabulary: [
            { word: "Я потерял паспорт (ya poteryal pasport)", translation: "J'ai perdu mon passeport", example: "Я потерял паспорт, где посольство?" },
            { word: "Мой рейс отменён (moy reys otmenyon)", translation: "Mon vol a été annulé", example: "Мой рейс отменён, можете перебронировать?" },
            { word: "Мне нужно подать жалобу (mne nuzhno podat' zhalobu)", translation: "Je dois déposer une réclamation", example: "Мне нужно подать жалобу на номер в отеле." },
            { word: "Вы не могли бы помочь мне найти...? (vy ne mogli by pomoch' mne nayti)", translation: "Pourriez-vous m'aider à trouver... ?", example: "Вы не могли бы помочь мне найти ближайшую аптеку?" },
            { word: "Я не знаю, как добраться до... (ya ne znayu, kak dobrat'sya do)", translation: "Je ne sais pas comment aller à...", example: "Я не знаю, как добраться до вокзала." },
            { word: "Есть ли другой вариант? (yest' li drugoy variant)", translation: "Y a-t-il une autre option ?", example: "Есть ли другой вариант, чтобы добраться до аэропорта?" },
            { word: "Я жду уже больше часа (ya zhdu uzhe bol'she chasa)", translation: "J'attends depuis plus d'une heure", example: "Я жду свой багаж уже больше часа." },
            { word: "К кому мне обратиться? (k komu mne obratit'sya)", translation: "À qui dois-je m'adresser ?", example: "К кому мне обратиться по этому вопросу?" },
          ],
          grammarNote: "'Добраться до' + génitif = arriver à. 'Больше часа' = plus d'une heure (génitif). 'К кому' = vers qui (datif).",
        },
        {
          title: "Знакомиться и общаться", description: "Découvrir et interagir avec les locaux", order: 2,
          vocabulary: [
            { word: "Чем известен этот район? (chem izvesten etot rayon)", translation: "Pour quoi ce quartier est-il connu ?", example: "Чем известен этот район? Есть ли местные специальности?" },
            { word: "Можете порекомендовать хороший ресторан? (mozhete porekomendovat')", translation: "Pouvez-vous recommander un bon restaurant ?", example: "Можете порекомендовать хороший ресторан поблизости?" },
            { word: "Как местные обычно передвигаются? (kak mestnyye obychno peredvigayutsya)", translation: "Comment les locaux se déplacent-ils ?", example: "Как местные обычно передвигаются по городу?" },
            { word: "Я бы очень хотел попробовать... (ya by ochen' khotel poprobovat')", translation: "J'aimerais beaucoup essayer...", example: "Я бы очень хотел попробовать местную кухню." },
            { word: "Безопасно ли гулять здесь ночью? (bezopasno li gulyat' zdes' noch'yu)", translation: "Est-ce sûr de se promener ici la nuit ?", example: "Безопасно ли гулять здесь ночью?" },
            { word: "Во сколько открывается/закрывается? (vo skol'ko otkryvayetsya/zakryvayetsya)", translation: "À quelle heure ça ouvre/ferme ?", example: "Во сколько открывается музей?" },
            { word: "Есть ли советы для туристов? (yest' li sovety dlya turistov)", translation: "Avez-vous des conseils pour les touristes ?", example: "Есть ли советы для туристов, которые посещают город?" },
            { word: "Я путешествую один/одна (ya puteshestvuyu odin/odna)", translation: "Je voyage seul(e)", example: "Я путешествую одна впервые." },
          ],
          grammarNote: "'Чем известен' = instrumental de 'что' (par quoi est connu). 'Бы' + passé = conditionnel. 'Ли' = particule interrogative (dans les questions indirectes).",
        },
      ],
    },
    {
      title: "Рассказать историю — Raconter une histoire", icon: "📖", description: "Narrer des événements passés avec détails et émotions", order: 4,
      lessons: [
        {
          title: "Рассказать воспоминание", description: "Raconter un souvenir", order: 1,
          vocabulary: [
            { word: "Всё началось, когда... (vsyo nachalos', kogda)", translation: "Tout a commencé quand...", example: "Всё началось, когда я переехал в Москву." },
            { word: "В то время я... (v to vremya ya)", translation: "À cette époque, je...", example: "В то время я ещё был студентом." },
            { word: "Вдруг... (vdrug)", translation: "Soudainement...", example: "Вдруг всё изменилось." },
            { word: "Я никогда раньше не переживал ничего подобного (ya nikogda ran'she ne perezhival)", translation: "Je n'avais jamais vécu quelque chose de semblable", example: "Я никогда раньше не переживал ничего подобного." },
            { word: "Оглядываясь назад, я понимаю... (oglyadyvayas' nazad, ya ponimayu)", translation: "Avec le recul, je comprends...", example: "Оглядываясь назад, я понимаю, что это было лучшее решение." },
            { word: "Самым запоминающимся было... (samym zapominayushchimsya bylo)", translation: "Le plus mémorable a été...", example: "Самым запоминающимся было знакомство с местными." },
            { word: "Оказалось, что... (okazalos', chto)", translation: "Il s'est avéré que...", example: "Оказалось, что мы совершенно ошибались." },
            { word: "Я никогда не забуду... (ya nikogda ne zabudu)", translation: "Je n'oublierai jamais...", example: "Я никогда не забуду, как заблудился в Токио." },
          ],
          grammarNote: "'Никогда не' = jamais (double négation obligatoire en russe). Le passé en russe s'accorde en genre : 'переехал' (m) / 'переехала' (f).",
        },
        {
          title: "Описать эмоции и реакции", description: "Décrire des émotions dans un récit", order: 2,
          vocabulary: [
            { word: "Я был безумно рад (ya byl bezumno rad)", translation: "J'étais follement content(e)", example: "Я был безумно рад, когда узнал эту новость." },
            { word: "Я не мог поверить своим глазам (ya ne mog poverit' svoim glazam)", translation: "Je n'en croyais pas mes yeux", example: "Я не мог поверить своим глазам, увидев этот вид." },
            { word: "Это заставило меня почувствовать... (eto zastavilo menya pochuvstvovat')", translation: "Ça m'a fait ressentir...", example: "Это заставило меня почувствовать благодарность." },
            { word: "Какое облегчение! (kakoye oblegcheniye)", translation: "Quel soulagement !", example: "Какое облегчение, что все в безопасности!" },
            { word: "Сначала мне было страшно, но потом... (snachala mne bylo strashno, no potom)", translation: "Au début j'avais peur, mais ensuite...", example: "Сначала мне было страшно, но потом мне начало нравиться." },
            { word: "Это был горько-сладкий момент (eto byl gor'ko-sladkiy moment)", translation: "C'était un moment doux-amer", example: "Прощание — это был горько-сладкий момент." },
            { word: "Я почувствовал чувство достижения (ya pochuvstvoval chuvstvo dostizheniya)", translation: "J'ai ressenti un sentiment d'accomplissement", example: "Я почувствовал чувство достижения, закончив марафон." },
            { word: "Это было потрясающе (eto bylo potryasayushche)", translation: "C'était bouleversant", example: "Видеть столько людей, поддерживающих нас — это было потрясающе." },
          ],
          grammarNote: "'Безумно' = follement (adverbe d'intensité). 'Своим глазам' = datif de 'свои глаза'. Le gérondif ('увидев') = en voyant.",
        },
      ],
    },
    {
      title: "Деловое общение — Communication professionnelle", icon: "📧", description: "Maîtriser les emails et appels téléphoniques professionnels", order: 5,
      lessons: [
        {
          title: "Деловое письмо — Écrire un email professionnel", description: "Rédiger des emails professionnels en russe", order: 1,
          vocabulary: [
            { word: "Уважаемый/ая... (uvazhaemyy/aya)", translation: "Cher/Chère...", example: "Уважаемый Иван Петрович, пишу Вам по поводу..." },
            { word: "Я пишу Вам по поводу... (ya pishu Vam po povodu)", translation: "Je vous écris au sujet de...", example: "Я пишу Вам по поводу нашей встречи." },
            { word: "В приложении Вы найдёте... (v prilozhenii Vy naydyote)", translation: "Vous trouverez en pièce jointe...", example: "В приложении Вы найдёте запрошенный отчёт." },
            { word: "Был бы благодарен, если бы Вы... (byl by blagodaren, yesli by Vy)", translation: "Je vous serais reconnaissant si vous...", example: "Был бы благодарен, если бы Вы ответили до пятницы." },
            { word: "С нетерпением жду Вашего ответа (s neterpeniyem zhdu Vashego otveta)", translation: "J'attends votre réponse avec impatience", example: "С нетерпением жду Вашего ответа." },
            { word: "С уважением (s uvazheniyem)", translation: "Cordialement", example: "С уважением, Мария Иванова." },
            { word: "В продолжение нашего разговора... (v prodolzheniye nashego razgovora)", translation: "Suite à notre conversation...", example: "В продолжение нашего разговора, отправляю детали." },
            { word: "Прошу прощения за задержку с ответом (proshu proshcheniya za zaderzhku s otvetom)", translation: "Je m'excuse du retard de réponse", example: "Прошу прощения за задержку с ответом." },
          ],
          grammarNote: "'Вы' avec majuscule = vous de politesse dans les lettres. Le conditionnel : 'был бы благодарен, если бы'. 'По поводу' + génitif = au sujet de.",
        },
        {
          title: "По телефону — Au téléphone", description: "Gérer des appels professionnels en russe", order: 2,
          vocabulary: [
            { word: "Здравствуйте, это... (zdravstvuyte, eto)", translation: "Bonjour, c'est ... à l'appareil", example: "Здравствуйте, это Мария из отдела маркетинга." },
            { word: "Можно поговорить с...? (mozhno pogovorit' s)", translation: "Puis-je parler à... ?", example: "Можно поговорить с менеджером по продажам?" },
            { word: "Я звоню по поводу... (ya zvonyu po povodu)", translation: "J'appelle au sujet de...", example: "Я звоню по поводу полученного счёта." },
            { word: "Подождите, пожалуйста, минутку (podozhdite, pozhaluysta, minutku)", translation: "Veuillez patienter un instant", example: "Подождите, пожалуйста, минутку. Я вас переключу." },
            { word: "Я перезвоню (ya perezvonyu)", translation: "Je rappellerai", example: "Я перезвоню завтра с ответом." },
            { word: "Не могли бы вы повторить? (ne mogli by vy povtorit')", translation: "Pourriez-vous répéter ?", example: "Не могли бы вы повторить? Плохо слышно." },
            { word: "Можно оставить сообщение? (mozhno ostavit' soobshcheniye)", translation: "Puis-je laisser un message ?", example: "Его нет. Можно оставить сообщение?" },
            { word: "Спасибо за ваше время (spasibo za vashe vremya)", translation: "Merci pour votre temps", example: "Спасибо за ваше время. Хорошего дня!" },
          ],
          grammarNote: "'Можно' + infinitif = formule de permission/demande polie. 'Переключить' = transférer (un appel). 'По поводу' + génitif = au sujet de.",
        },
      ],
    },
  ]);

  // ---------- CORÉEN ----------
  console.log("📚 Coréen...");
  const koA1 = await upsertCourse(langMap["ko"], "A1", "한국어 — 초급 (A1)", "Les bases du coréen pour te débrouiller au quotidien.", 1, false);
  const koA2 = await upsertCourse(langMap["ko"], "A2", "한국어 — 초중급 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  const koB1 = await upsertCourse(langMap["ko"], "B1", "한국어 — 중급 (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

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

  // KO B1 Chapitres
  await seedChaptersWithContent(koB1, [
    {
      title: "취업 면접 — L'entretien d'embauche", icon: "💼", description: "Préparer et réussir un entretien d'embauche en coréen", order: 1,
      lessons: [
        {
          title: "전문적으로 자기소개하기", description: "Parler de son parcours professionnel", order: 1,
          vocabulary: [
            { word: "저는 ...분야에서 경험이 있습니다 (jeoneun ...bunyaeseo gyeongheomi issseumnida)", translation: "J'ai de l'expérience dans le domaine de...", example: "저는 IT 분야에서 경험이 있습니다." },
            { word: "현재 ...로 일하고 있습니다 (hyeonjae ...ro ilhago issseumnida)", translation: "Je travaille actuellement en tant que...", example: "현재 프로젝트 매니저로 일하고 있습니다." },
            { word: "제 강점은 ...입니다 (je gangjeomeun ...imnida)", translation: "Mon point fort est...", example: "제 강점은 커뮤니케이션 능력입니다." },
            { word: "새로운 도전을 찾고 있습니다 (saeroun dojeoneul chatgo issseumnida)", translation: "Je cherche de nouveaux défis", example: "새로운 도전을 찾고 있습니다." },
            { word: "저는 ...한 사람이라고 생각합니다 (jeoneun ...han saramirage saenggakamnida)", translation: "Je pense être une personne...", example: "저는 책임감 있는 사람이라고 생각합니다." },
            { word: "이 업계에서 5년간 일해왔습니다 (i eopgyeeseo 5nyeongan ilhaewassseumnida)", translation: "J'ai travaillé dans cette industrie pendant 5 ans", example: "이 업계에서 5년간 일해왔습니다." },
            { word: "이전 직장에서는 ...를 담당했습니다 (ijeon jikjangeseo ...reul damdanghaessseumnida)", translation: "Dans mon poste précédent, j'étais en charge de...", example: "이전 직장에서는 마케팅을 담당했습니다." },
            { word: "저는 ...학위를 가지고 있습니다 (jeoneun ...hakwireul gajigo issseumnida)", translation: "J'ai un diplôme en...", example: "저는 경영학 학위를 가지고 있습니다." },
          ],
          grammarNote: "Le style formel (합니다체) est obligatoire en entretien. '~해왔습니다' exprime une action continue depuis le passé. '~로' indique le rôle/titre.",
        },
        {
          title: "질문과 협상", description: "Répondre aux questions et négocier", order: 2,
          vocabulary: [
            { word: "희망 연봉이 어떻게 되시나요? (huimang yeonbongi eotteoke doesinayo)", translation: "Quel est votre salaire souhaité ?", example: "희망 연봉이 어떻게 되시나요?" },
            { word: "협의할 의향이 있습니다 (hyeopuihal uihyangi issseumnida)", translation: "Je suis disposé(e) à négocier", example: "조건에 따라 협의할 의향이 있습니다." },
            { word: "5년 후 어떤 모습을 그리고 계신가요? (5nyeon hu eotteon moseubeul geurigo gyesingayo)", translation: "Comment vous imaginez-vous dans 5 ans ?", example: "5년 후 어떤 모습을 그리고 계신가요?" },
            { word: "제 단점은 ...입니다 (je danjeomeun ...imnida)", translation: "Mon défaut est...", example: "제 단점은 완벽주의적인 성격입니다." },
            { word: "팀에 대해 알려주실 수 있나요? (time daehae allyeojusil su innayo)", translation: "Pourriez-vous me parler de l'équipe ?", example: "팀에 대해 알려주실 수 있나요?" },
            { word: "일상적인 업무는 어떤가요? (ilsangjeogin eopmoneun eotteongayo)", translation: "Quel est le travail quotidien ?", example: "이 포지션의 일상적인 업무는 어떤가요?" },
            { word: "...에 특히 관심이 있습니다 (...e teukhi gwansimi issseumnida)", translation: "Je suis particulièrement intéressé(e) par...", example: "귀사의 글로벌 확장에 특히 관심이 있습니다." },
            { word: "결과는 언제쯤 알 수 있을까요? (gyeolgwaneun eonjesjjeum al su isseulkkayo)", translation: "Quand pourrai-je connaître les résultats ?", example: "면접 결과는 언제쯤 알 수 있을까요?" },
          ],
          grammarNote: "'~실 수 있나요?' = formule de politesse élevée. '귀사' (貴社) = votre entreprise (très respectueux). '~에 따라' = selon, en fonction de.",
        },
      ],
    },
    {
      title: "토론하고 의견 말하기 — Débattre et donner son avis", icon: "💬", description: "Exprimer et défendre son point de vue en coréen", order: 2,
      lessons: [
        {
          title: "의견 표현하기", description: "Donner son opinion et réagir", order: 1,
          vocabulary: [
            { word: "제 생각에는... (je saenggageneun)", translation: "À mon avis...", example: "제 생각에는 재택근무가 더 효율적입니다." },
            { word: "저는 ...라고 확신합니다 (jeoneun ...rago hwaksinhamnida)", translation: "Je suis convaincu(e) que...", example: "저는 교육이 무료여야 한다고 확신합니다." },
            { word: "말씀하시는 것은 이해하지만... (malsseumhasineun geoseun ihaehaijiman)", translation: "Je comprends ce que vous dites, mais...", example: "말씀하시는 것은 이해하지만, 동의하지 않습니다." },
            { word: "좋은 지적이십니다 (joeun jijeogisimnida)", translation: "C'est une bonne remarque", example: "좋은 지적이십니다. 그건 생각하지 못했습니다." },
            { word: "반면에... (banmyeone)", translation: "D'un autre côté...", example: "반면에, 위험도 상당합니다." },
            { word: "저는 ...라고 생각하는 편입니다 (jeoneun ...rago saenggakhaneun pyeonimnida)", translation: "J'ai tendance à penser que...", example: "저는 기술이 삶을 개선한다고 생각하는 편입니다." },
            { word: "전적으로 동의합니다 (jeonjeogeuro donguihamnida)", translation: "Je suis tout à fait d'accord", example: "전적으로 동의합니다." },
            { word: "반드시 그렇다고 할 수 없습니다 (bandeusi geureotago hal su eopsseumnida)", translation: "Ce n'est pas forcément le cas", example: "반드시 그렇다고 할 수 없습니다." },
          ],
          grammarNote: "'~는 편이다' = avoir tendance à. '~라고 생각하다' = penser que (citation indirecte). Le style formel est de rigueur dans les débats.",
        },
        {
          title: "논리적으로 말하기", description: "Structurer un argument", order: 2,
          vocabulary: [
            { word: "우선... (useon)", translation: "Tout d'abord...", example: "우선, 제 생각을 설명하겠습니다." },
            { word: "게다가... (gedaga)", translation: "De plus...", example: "게다가, 데이터가 이 결론을 뒷받침합니다." },
            { word: "하지만... (hajiman)", translation: "Cependant...", example: "하지만, 비용도 고려해야 합니다." },
            { word: "요약하자면... (yoyakhajamyeon)", translation: "En résumé...", example: "요약하자면, 장점이 단점보다 많습니다." },
            { word: "가장 큰 문제는 ...입니다 (gajang keun munjeneun ...imnida)", translation: "Le plus grand problème est...", example: "가장 큰 문제는 자금 부족입니다." },
            { word: "예를 들면 (yereul deulmyeon)", translation: "Par exemple...", example: "예를 들면, 작년 매출 데이터를 보면 알 수 있습니다." },
            { word: "연구에 따르면... (yeongue ttareumyeon)", translation: "Selon les recherches...", example: "최근 연구에 따르면, 이것은 효과적입니다." },
            { word: "결론적으로... (gyeollonjeogeuro)", translation: "En conclusion...", example: "결론적으로, 이 프로젝트를 추진해야 합니다." },
          ],
          grammarNote: "Les connecteurs : '우선' (d'abord), '게다가' (de plus), '하지만' (cependant), '따라서' (par conséquent). '~에 따르면' = selon.",
        },
      ],
    },
    {
      title: "혼자 여행하기 — Voyager seul", icon: "🌍", description: "Se débrouiller en voyage de manière autonome", order: 3,
      lessons: [
        {
          title: "예상치 못한 상황 대처", description: "Gérer les imprévus en voyage", order: 1,
          vocabulary: [
            { word: "여권을 잃어버렸습니다 (yeogwoneul ireobeoryeossseumnida)", translation: "J'ai perdu mon passeport", example: "여권을 잃어버렸습니다. 대사관이 어디에 있나요?" },
            { word: "비행기가 취소되었습니다 (bihaenggiga chwisodoeossseumnida)", translation: "Mon vol a été annulé", example: "비행기가 취소되었습니다. 다시 예약할 수 있나요?" },
            { word: "불만을 접수하고 싶습니다 (bulmaneul jeopsuhago sipsseumnida)", translation: "Je voudrais déposer une réclamation", example: "호텔 방에 대해 불만을 접수하고 싶습니다." },
            { word: "...를 찾는 것을 도와주실 수 있나요? (...reul chatneun geoseul dowajusil su innayo)", translation: "Pourriez-vous m'aider à trouver... ?", example: "가장 가까운 약국을 찾는 것을 도와주실 수 있나요?" },
            { word: "...에 어떻게 가는지 모르겠습니다 (...e eotteoke ganeunji moreugessseubnida)", translation: "Je ne sais pas comment aller à...", example: "기차역에 어떻게 가는지 모르겠습니다." },
            { word: "다른 방법이 있나요? (dareun bangbeobi innayo)", translation: "Y a-t-il une autre méthode ?", example: "공항에 가는 다른 방법이 있나요?" },
            { word: "1시간 넘게 기다리고 있습니다 (1sigan neomge gidarigo issseumnida)", translation: "J'attends depuis plus d'une heure", example: "짐을 1시간 넘게 기다리고 있습니다." },
            { word: "이 건에 대해 누구에게 연락해야 하나요? (i geone daehae nuguege yeollakhaeya hanayo)", translation: "À qui dois-je m'adresser pour ça ?", example: "이 건에 대해 누구에게 연락해야 하나요?" },
          ],
          grammarNote: "'~어버리다' = faire quelque chose de manière irréversible/regrettable (잃어버리다). '~고 있다' = être en train de. '~실 수 있나요?' = pouvez-vous (poli).",
        },
        {
          title: "탐험하고 교류하기", description: "Découvrir et interagir avec les locaux", order: 2,
          vocabulary: [
            { word: "이 지역은 무엇으로 유명한가요? (i jiyeogeun mueoseuro yumyeonghangayo)", translation: "Pour quoi cette région est-elle connue ?", example: "이 지역은 무엇으로 유명한가요?" },
            { word: "좋은 식당을 추천해 주실 수 있나요? (joeun sikdangeul chucheonhae jusil su innayo)", translation: "Pouvez-vous recommander un bon restaurant ?", example: "근처에 좋은 식당을 추천해 주실 수 있나요?" },
            { word: "현지인들은 보통 어떻게 이동하나요? (hyeonjiin deuleun botong eotteoke idonganayo)", translation: "Comment les locaux se déplacent-ils ?", example: "현지인들은 보통 어떻게 이동하나요?" },
            { word: "꼭 ...를 먹어보고 싶습니다 (kkok ...reul meogeobbogo sipsseumnida)", translation: "J'aimerais absolument goûter...", example: "꼭 전통 음식을 먹어보고 싶습니다." },
            { word: "밤에 여기 걸어다녀도 안전한가요? (bame yeogi georeo-danyeodo anjeonhangayo)", translation: "Est-ce sûr de se promener ici la nuit ?", example: "밤에 여기 걸어다녀도 안전한가요?" },
            { word: "몇 시에 열어요/닫아요? (myeot sie yeoreoyo/dadayo)", translation: "À quelle heure ça ouvre/ferme ?", example: "박물관은 몇 시에 열어요?" },
            { word: "관광객에게 조언이 있으신가요? (gwangwanggaekege joeoeni isseusingayo)", translation: "Avez-vous des conseils pour les touristes ?", example: "이 도시를 방문하는 관광객에게 조언이 있으신가요?" },
            { word: "혼자 여행하고 있습니다 (honja yeohaenghago issseumnida)", translation: "Je voyage seul(e)", example: "처음으로 혼자 여행하고 있습니다." },
          ],
          grammarNote: "'꼭' = absolument. '~어보다' = essayer de faire. '~어도' = même si. '현지인' = les locaux (habitants du lieu).",
        },
      ],
    },
    {
      title: "이야기 들려주기 — Raconter une histoire", icon: "📖", description: "Narrer des événements passés avec détails et émotions", order: 4,
      lessons: [
        {
          title: "추억 이야기하기", description: "Raconter un souvenir", order: 1,
          vocabulary: [
            { word: "모든 것은 ...에서 시작되었습니다 (modeun geoseun ...eseo sijakdoeossseumnida)", translation: "Tout a commencé à...", example: "모든 것은 서울로 이사하면서 시작되었습니다." },
            { word: "그때 저는 아직 ...이었습니다 (geuttae jeoneun ajik ...ieossseumnida)", translation: "À cette époque, j'étais encore...", example: "그때 저는 아직 학생이었습니다." },
            { word: "갑자기... (gapjagi)", translation: "Soudainement...", example: "갑자기 모든 것이 변했습니다." },
            { word: "그런 경험은 처음이었습니다 (geureon gyeongheomeun cheoeumieossseumnida)", translation: "C'était la première fois que je vivais ça", example: "그런 경험은 처음이었습니다." },
            { word: "돌이켜보면... (dorityeoboMyeon)", translation: "Avec le recul...", example: "돌이켜보면, 그것이 최선의 결정이었습니다." },
            { word: "가장 기억에 남는 것은... (gajang gieoge namneun geoseun)", translation: "Ce dont je me souviens le plus...", example: "가장 기억에 남는 것은 현지인들과의 만남입니다." },
            { word: "알고 보니... (algo boni)", translation: "Il s'est avéré que...", example: "알고 보니 우리가 완전히 틀렸습니다." },
            { word: "...를 절대 잊지 못할 것입니다 (...reul jeoldae itji mothal geosimnida)", translation: "Je n'oublierai jamais...", example: "도쿄에서 길을 잃었던 것을 절대 잊지 못할 것입니다." },
          ],
          grammarNote: "'~면서' = en même temps que. '알고 보니' = quand on y regarde de plus près. '~지 못하다' = ne pas pouvoir. '절대' = jamais/absolument.",
        },
        {
          title: "감정과 반응 표현하기", description: "Décrire des émotions dans un récit", order: 2,
          vocabulary: [
            { word: "정말 기뻤습니다 (jeongmal gippeossseumnida)", translation: "J'étais vraiment content(e)", example: "그 소식을 들었을 때 정말 기뻤습니다." },
            { word: "눈을 의심했습니다 (nuneul uisimhaessseumnida)", translation: "Je n'en croyais pas mes yeux", example: "그 풍경을 보고 눈을 의심했습니다." },
            { word: "...한 기분이 들었습니다 (...han gibuni deureossseumnida)", translation: "J'ai ressenti un sentiment de...", example: "감사한 기분이 들었습니다." },
            { word: "안도감을 느꼈습니다 (andogameul neukkyeossseumnida)", translation: "J'ai ressenti du soulagement", example: "모두 무사하다는 것을 알고 안도감을 느꼈습니다." },
            { word: "처음에는 무서웠지만, 나중에는... (cheoeumeNeun museoweojiman, najungeneun)", translation: "Au début j'avais peur, mais après...", example: "처음에는 무서웠지만, 나중에는 즐기기 시작했습니다." },
            { word: "씁쓸한 순간이었습니다 (sseupsseulhan sunganieossseumnida)", translation: "C'était un moment amer", example: "작별 인사를 하는 것은 씁쓸한 순간이었습니다." },
            { word: "성취감을 느꼈습니다 (seongchwigameul neukkyeossseumnida)", translation: "J'ai ressenti un sentiment d'accomplissement", example: "마라톤을 완주한 후 성취감을 느꼈습니다." },
            { word: "압도당했습니다 (apdodanghaessseumnida)", translation: "J'ai été submergé(e)", example: "그렇게 많은 사람들의 응원에 압도당했습니다." },
          ],
          grammarNote: "'~을/를 느끼다' = ressentir. '~었/았지만' = mais (contraste avec le passé). '~당하다' = subir (voix passive). '기분이 들다' = ressentir (un sentiment).",
        },
      ],
    },
    {
      title: "비즈니스 커뮤니케이션 — Communication professionnelle", icon: "📧", description: "Maîtriser les emails et appels téléphoniques professionnels", order: 5,
      lessons: [
        {
          title: "비즈니스 이메일 작성", description: "Rédiger des emails professionnels en coréen", order: 1,
          vocabulary: [
            { word: "...님께 (...nimkke)", translation: "À l'attention de M./Mme...", example: "김 부장님께, 안녕하십니까." },
            { word: "...건으로 메일 드립니다 (...geoNeuro meil deurimnida)", translation: "Je vous écris au sujet de...", example: "회의 건으로 메일 드립니다." },
            { word: "첨부 파일을 확인해 주시기 바랍니다 (cheombu paireul hwaginhae jusigi baramnida)", translation: "Veuillez vérifier le fichier joint", example: "첨부 파일을 확인해 주시기 바랍니다." },
            { word: "...해 주시면 감사하겠습니다 (...hae jusimyeon gamsahagessseubnida)", translation: "Je vous serais reconnaissant si vous...", example: "금요일까지 답변해 주시면 감사하겠습니다." },
            { word: "답변 기다리겠습니다 (dapbyeon gidarigessseumnida)", translation: "J'attends votre réponse", example: "답변 기다리겠습니다." },
            { word: "감사합니다 (gamsahamnida)", translation: "Cordialement", example: "감사합니다. 김민수 드림." },
            { word: "지난 대화에 이어서... (jinan daehwae ieoseo)", translation: "Suite à notre conversation...", example: "지난 대화에 이어서 세부 사항을 보내드립니다." },
            { word: "답변이 늦어 죄송합니다 (dapbyeoni neujeeo joessonghamnida)", translation: "Je m'excuse du retard de réponse", example: "답변이 늦어 죄송합니다." },
          ],
          grammarNote: "'~드리다' = forme humble de '주다' (donner). '~시기 바랍니다' = veuillez (très formel). '드림' = signature d'email (humble).",
        },
        {
          title: "전화 통화", description: "Gérer des appels professionnels en coréen", order: 2,
          vocabulary: [
            { word: "안녕하십니까, ...입니다 (annyeonghasimnikka, ...imnida)", translation: "Bonjour, je suis...", example: "안녕하십니까, 마케팅부 김민수입니다." },
            { word: "...님 계신가요? (...nim gyesingayo)", translation: "Est-ce que M./Mme ... est disponible ?", example: "영업부 이 과장님 계신가요?" },
            { word: "...건으로 전화 드렸습니다 (...geoNeuro jeonhwa deuryeossseumnida)", translation: "J'appelle au sujet de...", example: "청구서 건으로 전화 드렸습니다." },
            { word: "잠시만 기다려 주시겠습니까? (jamsiman gidaryeo jusigessseumnikka)", translation: "Pourriez-vous patienter un instant ?", example: "잠시만 기다려 주시겠습니까? 연결해 드리겠습니다." },
            { word: "다시 연락드리겠습니다 (dasi yeollakdeurigessseumnida)", translation: "Je vous recontacterai", example: "내일까지 다시 연락드리겠습니다." },
            { word: "다시 한번 말씀해 주시겠습니까? (dasi hanbeon malsseumhae jusigessseumnikka)", translation: "Pourriez-vous répéter ?", example: "죄송합니다, 다시 한번 말씀해 주시겠습니까?" },
            { word: "메시지를 남겨도 될까요? (mesijireul namgyeodo doelkkayo)", translation: "Puis-je laisser un message ?", example: "자리에 안 계시네요. 메시지를 남겨도 될까요?" },
            { word: "시간 내주셔서 감사합니다 (sigan naejusyeoseo gamsahamnida)", translation: "Merci pour votre temps", example: "시간 내주셔서 감사합니다. 좋은 하루 되세요." },
          ],
          grammarNote: "'~시겠습니까?' = formule de demande la plus polie. '~드리다' = forme humble de '주다'. '계시다' = honorifique de '있다' (être/exister).",
        },
      ],
    },
  ]);

  // ---------- FRANÇAIS ----------
  console.log("📚 Français...");
  const frA1 = await upsertCourse(langMap["fr"], "A1", "Français — Débutant (A1)", "Les bases du français pour te débrouiller au quotidien.", 1, false);
  const frA2 = await upsertCourse(langMap["fr"], "A2", "Français — Élémentaire (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
  const frB1 = await upsertCourse(langMap["fr"], "B1", "Français — Intermédiaire (B1)", "Développe ta fluidité et aborde des sujets plus complexes.", 3, true);

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

  // FR B1 Chapitres
  await seedChaptersWithContent(frB1, [
    {
      title: "L'entretien d'embauche", icon: "💼", description: "Prepare and succeed in a job interview in French", order: 1,
      lessons: [
        {
          title: "Se présenter professionnellement", description: "Talk about your career and skills", order: 1,
          vocabulary: [
            { word: "J'ai une formation en...", translation: "I have a background in...", example: "J'ai une formation en ingénierie informatique." },
            { word: "Je travaille actuellement comme...", translation: "I currently work as...", example: "Je travaille actuellement comme chef de projet." },
            { word: "Ma principale responsabilité est...", translation: "My main responsibility is...", example: "Ma principale responsabilité est la gestion de l'équipe." },
            { word: "Je suis à la recherche d'un nouveau défi", translation: "I'm looking for a new challenge", example: "Je suis à la recherche d'un nouveau défi professionnel." },
            { word: "Je me décrirais comme...", translation: "I would describe myself as...", example: "Je me décrirais comme rigoureux et motivé." },
            { word: "Cela fait cinq ans que je travaille dans...", translation: "I've been working in ... for five years", example: "Cela fait cinq ans que je travaille dans le marketing digital." },
            { word: "Mon poste précédent consistait à...", translation: "My previous role involved...", example: "Mon poste précédent consistait à gérer les relations clients." },
            { word: "Je suis diplômé(e) de...", translation: "I graduated from...", example: "Je suis diplômé de l'université de Lyon en gestion." },
          ],
          grammarNote: "'Cela fait + durée + que' expresses duration: 'Cela fait trois ans que j'habite ici' = I've been living here for three years.",
        },
        {
          title: "Questions et négociation", description: "Answer tough questions and negotiate", order: 2,
          vocabulary: [
            { word: "Quelles sont vos prétentions salariales ?", translation: "What are your salary expectations?", example: "Quelles sont vos prétentions salariales pour ce poste ?" },
            { word: "Je suis ouvert(e) à la discussion", translation: "I'm open to discussion", example: "Je suis ouverte à la discussion sur les conditions." },
            { word: "Où vous voyez-vous dans cinq ans ?", translation: "Where do you see yourself in five years?", example: "Où vous voyez-vous dans cinq ans ?" },
            { word: "Mon principal défaut est...", translation: "My main weakness is...", example: "Mon principal défaut est le perfectionnisme." },
            { word: "Pourriez-vous me parler de l'équipe ?", translation: "Could you tell me about the team?", example: "Pourriez-vous me parler de l'équipe que je rejoindrais ?" },
            { word: "À quoi ressemble une journée type ?", translation: "What does a typical day look like?", example: "À quoi ressemble une journée type à ce poste ?" },
            { word: "Ce qui m'intéresse particulièrement, c'est...", translation: "What particularly interests me is...", example: "Ce qui m'intéresse particulièrement, c'est votre projet d'expansion." },
            { word: "Quand puis-je espérer avoir des nouvelles ?", translation: "When can I expect to hear back?", example: "Quand puis-je espérer avoir des nouvelles ?" },
          ],
          grammarNote: "The conditional 'pourriez-vous' is essential for polite requests. 'Ce qui... c'est...' is an emphatic structure: 'What... is...'.",
        },
      ],
    },
    {
      title: "Débattre et donner son avis", icon: "💬", description: "Express and defend your point of view in French", order: 2,
      lessons: [
        {
          title: "Exprimer son opinion", description: "Give your opinion and react to others", order: 1,
          vocabulary: [
            { word: "À mon avis...", translation: "In my opinion...", example: "À mon avis, le télétravail est plus productif." },
            { word: "Je suis convaincu(e) que...", translation: "I'm convinced that...", example: "Je suis convaincue que l'éducation devrait être gratuite." },
            { word: "Je comprends votre point de vue, mais...", translation: "I understand your point of view, but...", example: "Je comprends votre point de vue, mais je ne suis pas d'accord." },
            { word: "C'est un argument valable", translation: "That's a valid point", example: "C'est un argument valable, je n'y avais pas pensé." },
            { word: "En revanche...", translation: "On the other hand...", example: "En revanche, les risques sont importants." },
            { word: "J'ai tendance à penser que...", translation: "I tend to think that...", example: "J'ai tendance à penser que la technologie améliore nos vies." },
            { word: "Je suis tout à fait d'accord", translation: "I completely agree", example: "Je suis tout à fait d'accord avec votre analyse." },
            { word: "Ce n'est pas forcément le cas", translation: "That's not necessarily the case", example: "Ce n'est pas forcément le cas dans toutes les situations." },
          ],
          grammarNote: "The subjunctive is used after expressions of doubt: 'Je ne crois pas que ce soit vrai'. After 'je crois que' (affirmative) → indicative.",
        },
        {
          title: "Argumenter et convaincre", description: "Structure an argument and convince", order: 2,
          vocabulary: [
            { word: "Tout d'abord...", translation: "First of all...", example: "Tout d'abord, laissez-moi expliquer mon raisonnement." },
            { word: "De plus...", translation: "Furthermore...", example: "De plus, les données soutiennent cette conclusion." },
            { word: "Cependant...", translation: "However...", example: "Cependant, il faut prendre en compte les coûts." },
            { word: "En résumé...", translation: "To sum up...", example: "En résumé, les avantages l'emportent sur les inconvénients." },
            { word: "Le problème principal est...", translation: "The main problem is...", example: "Le problème principal est le manque de financement." },
            { word: "Prenons un exemple", translation: "Let's take an example", example: "Prenons un exemple pour illustrer mon propos." },
            { word: "D'après les études...", translation: "According to studies...", example: "D'après les études récentes, c'est efficace." },
            { word: "En conclusion...", translation: "In conclusion...", example: "En conclusion, je pense que nous devrions continuer." },
          ],
          grammarNote: "Logical connectors: 'tout d'abord' (first), 'de plus' (moreover), 'cependant' (however), 'en conclusion' (in conclusion). Use the subjunctive after 'bien que' and 'pour que'.",
        },
      ],
    },
    {
      title: "Voyager seul", icon: "🌍", description: "Handle solo travel situations autonomously", order: 3,
      lessons: [
        {
          title: "Gérer les imprévus", description: "Solve problems while traveling", order: 1,
          vocabulary: [
            { word: "J'ai perdu mon passeport", translation: "I've lost my passport", example: "J'ai perdu mon passeport, où se trouve l'ambassade ?" },
            { word: "Mon vol a été annulé", translation: "My flight has been cancelled", example: "Mon vol a été annulé, pouvez-vous me réserver un autre vol ?" },
            { word: "Je souhaite déposer une réclamation", translation: "I would like to file a complaint", example: "Je souhaite déposer une réclamation concernant ma chambre d'hôtel." },
            { word: "Pourriez-vous m'aider à trouver... ?", translation: "Could you help me find...?", example: "Pourriez-vous m'aider à trouver la pharmacie la plus proche ?" },
            { word: "Je ne sais pas comment me rendre à...", translation: "I don't know how to get to...", example: "Je ne sais pas comment me rendre à la gare." },
            { word: "Y a-t-il une alternative ?", translation: "Is there an alternative?", example: "Y a-t-il une alternative pour rejoindre l'aéroport ?" },
            { word: "J'attends depuis plus d'une heure", translation: "I've been waiting for over an hour", example: "J'attends mes bagages depuis plus d'une heure." },
            { word: "À qui dois-je m'adresser ?", translation: "Who should I contact?", example: "À qui dois-je m'adresser concernant ce problème ?" },
          ],
          grammarNote: "The passive voice in French: 'Mon vol a été annulé' (passé composé passif). 'Depuis' + duration for ongoing situations: 'J'attends depuis une heure'.",
        },
        {
          title: "Découvrir et échanger", description: "Interact with locals and explore culture", order: 2,
          vocabulary: [
            { word: "Pour quoi ce quartier est-il connu ?", translation: "What is this neighborhood known for?", example: "Pour quoi ce quartier est-il connu ? Des spécialités locales ?" },
            { word: "Pouvez-vous me recommander un bon restaurant ?", translation: "Can you recommend a good restaurant?", example: "Pouvez-vous me recommander un bon restaurant dans le coin ?" },
            { word: "Comment les habitants se déplacent-ils ?", translation: "How do locals get around?", example: "Comment les habitants se déplacent-ils en ville ?" },
            { word: "J'adorerais goûter...", translation: "I'd love to try...", example: "J'adorerais goûter la cuisine traditionnelle de la région." },
            { word: "Est-ce sûr de se promener ici le soir ?", translation: "Is it safe to walk around here at night?", example: "Est-ce sûr de se promener ici le soir ?" },
            { word: "À quelle heure ça ouvre / ça ferme ?", translation: "What time does it open/close?", example: "À quelle heure ouvre le musée ?" },
            { word: "Avez-vous des conseils pour les visiteurs ?", translation: "Do you have any tips for visitors?", example: "Avez-vous des conseils pour les visiteurs de cette ville ?" },
            { word: "Je voyage seul(e)", translation: "I'm traveling alone", example: "Je voyage seule pour la première fois." },
          ],
          grammarNote: "'Connu pour' = known for. The conditional 'j'adorerais' adds politeness. 'Dans le coin' = around here (informal but common).",
        },
      ],
    },
    {
      title: "Raconter une histoire", icon: "📖", description: "Narrate past events with details and emotions", order: 4,
      lessons: [
        {
          title: "Raconter un souvenir", description: "Talk about past events vividly", order: 1,
          vocabulary: [
            { word: "Tout a commencé quand...", translation: "It all started when...", example: "Tout a commencé quand j'ai déménagé à Lyon." },
            { word: "À cette époque, j'étais...", translation: "At that time, I was...", example: "À cette époque, j'étais encore étudiant." },
            { word: "Tout à coup...", translation: "Suddenly...", example: "Tout à coup, tout a changé." },
            { word: "Je n'avais jamais vécu une telle chose", translation: "I had never experienced such a thing", example: "Je n'avais jamais vécu une telle chose auparavant." },
            { word: "Avec le recul, je me rends compte que...", translation: "Looking back, I realize that...", example: "Avec le recul, je me rends compte que c'était la meilleure décision." },
            { word: "Le moment le plus marquant a été...", translation: "The most striking moment was...", example: "Le moment le plus marquant a été la rencontre avec les habitants." },
            { word: "Il s'est avéré que...", translation: "It turned out that...", example: "Il s'est avéré que nous avions complètement tort." },
            { word: "Je n'oublierai jamais le jour où...", translation: "I'll never forget the day when...", example: "Je n'oublierai jamais le jour où je me suis perdu à Tokyo." },
          ],
          grammarNote: "Passé composé for main actions ('j'ai déménagé'). Imparfait for background/context ('j'étais'). Plus-que-parfait for earlier events ('je n'avais jamais vécu').",
        },
        {
          title: "Exprimer des émotions", description: "Express feelings in a narrative", order: 2,
          vocabulary: [
            { word: "J'étais fou/folle de joie", translation: "I was overjoyed", example: "J'étais folle de joie quand j'ai appris la nouvelle." },
            { word: "Je n'en croyais pas mes yeux", translation: "I couldn't believe my eyes", example: "Je n'en croyais pas mes yeux en voyant ce paysage." },
            { word: "Ça m'a fait ressentir...", translation: "It made me feel...", example: "Ça m'a fait ressentir une immense gratitude." },
            { word: "J'ai été tellement soulagé(e) que...", translation: "I was so relieved that...", example: "J'ai été tellement soulagée que tout le monde aille bien." },
            { word: "Au début j'avais peur, mais ensuite...", translation: "At first I was scared, but then...", example: "Au début j'avais peur, mais ensuite j'ai commencé à apprécier." },
            { word: "C'était un moment doux-amer", translation: "It was a bittersweet moment", example: "C'était un moment doux-amer de dire au revoir." },
            { word: "J'ai ressenti un sentiment d'accomplissement", translation: "I felt a sense of accomplishment", example: "J'ai ressenti un sentiment d'accomplissement en terminant le marathon." },
            { word: "C'était bouleversant", translation: "It was overwhelming", example: "C'était bouleversant de voir autant de soutien." },
          ],
          grammarNote: "Subjunctive after emotions: 'Je suis soulagé que tout le monde aille bien' (aille = subjunctive of aller). 'En + gerund' for simultaneous actions: 'en voyant'.",
        },
      ],
    },
    {
      title: "Communication professionnelle", icon: "📧", description: "Master professional emails and phone calls in French", order: 5,
      lessons: [
        {
          title: "Écrire un email professionnel", description: "Write clear and polite professional emails", order: 1,
          vocabulary: [
            { word: "Madame, Monsieur", translation: "Dear Sir/Madam", example: "Madame, Monsieur, je me permets de vous écrire pour..." },
            { word: "Je me permets de vous contacter au sujet de...", translation: "I am writing to you regarding...", example: "Je me permets de vous contacter au sujet de notre réunion." },
            { word: "Veuillez trouver ci-joint...", translation: "Please find attached...", example: "Veuillez trouver ci-joint le rapport demandé." },
            { word: "Je vous serais reconnaissant(e) si...", translation: "I would be grateful if...", example: "Je vous serais reconnaissante si vous pouviez répondre avant vendredi." },
            { word: "Dans l'attente de votre réponse", translation: "Looking forward to your reply", example: "Dans l'attente de votre réponse, je vous prie d'agréer..." },
            { word: "Cordialement", translation: "Kind regards", example: "Cordialement, Marie Dupont." },
            { word: "Suite à notre conversation...", translation: "Following our conversation...", example: "Suite à notre conversation, je vous envoie les détails." },
            { word: "Veuillez m'excuser pour le retard de ma réponse", translation: "Please forgive me for the delay in my response", example: "Veuillez m'excuser pour le retard de ma réponse." },
          ],
          grammarNote: "French formal emails use fixed formulas. 'Je me permets de' = I take the liberty of. 'Veuillez' = please (imperative of 'vouloir'). The closing formula can be very long and formal.",
        },
        {
          title: "Au téléphone", description: "Handle professional phone calls in French", order: 2,
          vocabulary: [
            { word: "Bonjour, c'est ... à l'appareil", translation: "Hello, this is ... speaking", example: "Bonjour, c'est Marie Dupont à l'appareil." },
            { word: "Pourrais-je parler à... ?", translation: "Could I speak to...?", example: "Pourrais-je parler au directeur commercial, s'il vous plaît ?" },
            { word: "J'appelle au sujet de...", translation: "I'm calling regarding...", example: "J'appelle au sujet de la facture que nous avons reçue." },
            { word: "Pourriez-vous patienter un instant ?", translation: "Could you hold for a moment?", example: "Pourriez-vous patienter un instant ? Je vous transfère." },
            { word: "Je reviendrai vers vous à ce sujet", translation: "I'll get back to you on this", example: "Je reviendrai vers vous à ce sujet demain." },
            { word: "Pourriez-vous répéter, s'il vous plaît ?", translation: "Could you repeat that, please?", example: "Pourriez-vous répéter ? La ligne est mauvaise." },
            { word: "Puis-je laisser un message ?", translation: "May I leave a message?", example: "Il n'est pas disponible. Puis-je laisser un message ?" },
            { word: "Je vous remercie pour votre temps", translation: "Thank you for your time", example: "Je vous remercie pour votre temps. Bonne journée." },
          ],
          grammarNote: "On the phone, 'pourriez-vous' (conditional) is essential for politeness. 'À l'appareil' = on the phone/speaking. 'Transférer' = to transfer a call.",
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
    // ═══════ B1 CERTIFICATION EXAMS ═══════
    { languageCode: "en", level: "B1" as const, title: "Certification Anglais — B1 Intermédiaire", description: "Évalue ta capacité à débattre, raconter des histoires, et communiquer professionnellement en anglais.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "Complete: 'I ___ in this company for three years now.'", options: ["work", "have been working", "am working", "worked"], correctAnswer: 1 },
      { type: "mcq", question: "What does 'On the other hand' mean?", options: ["D'un autre côté", "À la main", "De l'autre main", "En revanche de la main"], correctAnswer: 0 },
      { type: "mcq", question: "Choose the most professional email closing:", options: ["See ya!", "Kind regards", "Bye bye", "XOXO"], correctAnswer: 1 },
      { type: "mcq", question: "'I couldn't agree more' means:", options: ["Je ne suis pas du tout d'accord", "Je suis tout à fait d'accord", "Je ne pourrais pas être d'accord", "Je suis partiellement d'accord"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'If I ___ you, I would accept the offer.'", options: ["am", "was", "were", "be"], correctAnswer: 2 },
      { type: "mcq", question: "'I've lost my passport' uses which tense?", options: ["Past simple", "Present perfect", "Past perfect", "Present continuous"], correctAnswer: 1 },
      { type: "mcq", question: "What does 'Furthermore' mean in an argument?", options: ["Finalement", "Cependant", "De plus", "En premier lieu"], correctAnswer: 2 },
      { type: "mcq", question: "'Could you hold for a moment?' is used:", options: ["At a restaurant", "On the phone", "At the gym", "In an exam"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'It all started ___ I moved to London.'", options: ["since", "when", "while", "during"], correctAnswer: 1 },
      { type: "mcq", question: "'I would appreciate it if you could reply by Friday' is:", options: ["A demand", "A polite request", "A complaint", "An apology"], correctAnswer: 1 },
      { type: "mcq", question: "What is the correct structure for giving an opinion?", options: ["In my opinion, I think...", "According to me, I opine...", "I tend to think that...", "For me personally, I..."], correctAnswer: 2 },
      { type: "mcq", question: "'Looking back, I realize it was the best decision' — 'Looking back' means:", options: ["En regardant en arrière", "Avec le recul", "En se retournant", "En regardant derrière soi"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'I ___ never experienced anything like it before.'", options: ["have", "had", "was", "did"], correctAnswer: 1 },
      { type: "writing", question: "Write a short professional email (3-4 sentences) to follow up on a meeting. Use formal language.", expectedKeywords: ["Dear", "writing", "meeting", "forward", "regards", "attached", "appreciate"], maxScore: 15 },
      { type: "writing", question: "Tell a short story about a memorable travel experience (3-4 sentences). Use past tenses.", expectedKeywords: ["started", "was", "had never", "suddenly", "remember", "forget", "realized"], maxScore: 15 },
    ] },
    { languageCode: "es", level: "B1" as const, title: "Certification Espagnol — B1 Intermedio", description: "Évalue ta capacité à débattre, raconter des histoires, et communiquer professionnellement en espagnol.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "Completa: 'Llevo tres años ___ en esta empresa.'", options: ["trabajo", "trabajando", "trabajar", "trabajé"], correctAnswer: 1 },
      { type: "mcq", question: "¿Qué significa 'Por otro lado'?", options: ["Par l'autre côté", "D'un autre côté", "Par la main", "De l'autre part"], correctAnswer: 1 },
      { type: "mcq", question: "¿Cuál es la fórmula más profesional para cerrar un email?", options: ["¡Chao!", "Un cordial saludo", "Besos", "Nos vemos"], correctAnswer: 1 },
      { type: "mcq", question: "'Estoy totalmente de acuerdo' significa:", options: ["Je ne suis pas d'accord du tout", "Je suis tout à fait d'accord", "Je suis partiellement d'accord", "Je suis contre"], correctAnswer: 1 },
      { type: "mcq", question: "Completa: 'Si yo ___ tú, aceptaría la oferta.'", options: ["soy", "era", "fuera", "sea"], correctAnswer: 2 },
      { type: "mcq", question: "'He perdido mi pasaporte' utilise quel temps ?", options: ["Pretérito indefinido", "Pretérito perfecto", "Pretérito pluscuamperfecto", "Presente continuo"], correctAnswer: 1 },
      { type: "mcq", question: "¿Qué significa 'Además' en un argumento?", options: ["Finalement", "Cependant", "De plus", "En premier lieu"], correctAnswer: 2 },
      { type: "mcq", question: "'¿Podría esperar un momento?' se usa:", options: ["En un restaurante", "Al teléfono", "En el gimnasio", "En un examen"], correctAnswer: 1 },
      { type: "mcq", question: "Completa: 'Todo empezó ___ me mudé a Barcelona.'", options: ["desde", "cuando", "mientras", "durante"], correctAnswer: 1 },
      { type: "mcq", question: "'Le agradecería que pudiera responder antes del viernes' es:", options: ["Una exigencia", "Una petición formal", "Una queja", "Una disculpa"], correctAnswer: 1 },
      { type: "mcq", question: "¿Cuál es la estructura correcta para expresar una opinión en español?", options: ["Según mi opinión...", "En mi opinión...", "A mi opinión...", "Por mi opinión..."], correctAnswer: 1 },
      { type: "mcq", question: "'Mirando hacia atrás, me doy cuenta de que fue la mejor decisión' — 'Mirando hacia atrás' significa:", options: ["En regardant en arrière", "Avec le recul", "En se retournant", "En arrière"], correctAnswer: 1 },
      { type: "mcq", question: "Completa: 'Nunca ___ vivido algo así.'", options: ["he", "había", "fui", "estuve"], correctAnswer: 1 },
      { type: "writing", question: "Escribe un email profesional corto (3-4 frases) para hacer seguimiento de una reunión.", expectedKeywords: ["Estimado", "escribo", "reunión", "espera", "saludo", "adjunto", "agradecería"], maxScore: 15 },
      { type: "writing", question: "Cuenta una experiencia de viaje memorable en 3-4 frases. Usa tiempos pasados.", expectedKeywords: ["empezó", "era", "nunca había", "de repente", "recuerdo", "olvidaré", "resultó"], maxScore: 15 },
    ] },
    { languageCode: "ja", level: "B1" as const, title: "Certification Japonais — B1 中級", description: "Évalue ta capacité à débattre, raconter des histoires, et communiquer professionnellement en japonais.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "Complétez : 「この業界で5年間＿＿＿。」", options: ["働きます", "働いてきました", "働くでしょう", "働いた"], correctAnswer: 1 },
      { type: "mcq", question: "「一方で」signifie :", options: ["D'un côté", "D'un autre côté", "En premier lieu", "En conclusion"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la formule standard d'ouverture d'un email professionnel japonais ?", options: ["こんにちは", "お世話になっております", "やあ", "元気ですか"], correctAnswer: 1 },
      { type: "mcq", question: "「全く同感です」signifie :", options: ["Je ne suis pas d'accord", "Je suis tout à fait d'accord", "Je suis partiellement d'accord", "Je suis contre"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle forme est la plus polie pour demander quelque chose ?", options: ["～してください", "～していただけますか", "～して", "～しろ"], correctAnswer: 1 },
      { type: "mcq", question: "「パスポートをなくしてしまいました」— Quel est le rôle de「～てしまいました」?", options: ["Action accomplie", "Action future", "Résultat regrettable", "Action habituelle"], correctAnswer: 2 },
      { type: "mcq", question: "「さらに」dans un argument signifie :", options: ["Finalement", "Cependant", "De plus", "En premier lieu"], correctAnswer: 2 },
      { type: "mcq", question: "「少々お待ちいただけますか」s'utilise :", options: ["Au restaurant", "Au téléphone", "Au gymnase", "En examen"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「すべては東京に引っ越した＿＿＿始まりました。」", options: ["から", "ことから", "ので", "のに"], correctAnswer: 1 },
      { type: "mcq", question: "「ご返信いただければ幸いです」est :", options: ["Une exigence", "Une demande polie", "Une plainte", "Des excuses"], correctAnswer: 1 },
      { type: "mcq", question: "Comment dit-on「votre entreprise」en keigo ?", options: ["あなたの会社", "御社 (おんしゃ)", "その会社", "この会社"], correctAnswer: 1 },
      { type: "mcq", question: "「振り返ってみると」signifie :", options: ["En se retournant", "Avec le recul", "En regardant devant", "En oubliant"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「そんな経験は＿＿＿でした。」", options: ["最後", "初めて", "二度目", "何度も"], correctAnswer: 1 },
      { type: "writing", question: "日本語でビジネスメールを3～4文で書いてください。会議のフォローアップについて。", expectedKeywords: ["お世話", "ご連絡", "会議", "よろしくお願い", "添付", "確認"], maxScore: 15 },
      { type: "writing", question: "思い出に残る旅行の経験を3～4文で書いてください。過去形を使いましょう。", expectedKeywords: ["始まりました", "でした", "初めて", "突然", "忘れません", "思います"], maxScore: 15 },
    ] },
    { languageCode: "zh", level: "B1" as const, title: "Certification Chinois — B1 中级", description: "Évalue ta capacité à débattre, raconter des histoires, et communiquer professionnellement en chinois.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "Complétez : 「我在这个行业工作___五年了。」", options: ["着", "了", "过", "在"], correctAnswer: 1 },
      { type: "mcq", question: "「另一方面」signifie :", options: ["D'un côté", "D'un autre côté", "En premier lieu", "En conclusion"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la formule de clôture standard d'un email professionnel chinois ?", options: ["拜拜", "此致，敬礼", "再见", "回头见"], correctAnswer: 1 },
      { type: "mcq", question: "「我完全同意」signifie :", options: ["Je ne suis pas d'accord", "Je suis tout à fait d'accord", "Je suis partiellement d'accord", "Je suis contre"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la forme polie pour demander à quelqu'un de faire quelque chose ?", options: ["你做！", "能...吗？", "做！", "你要做"], correctAnswer: 1 },
      { type: "mcq", question: "「我的航班被取消了」— Quel est le rôle de「被」?", options: ["Action accomplie", "Voix passive", "Action future", "Négation"], correctAnswer: 1 },
      { type: "mcq", question: "「而且」dans un argument signifie :", options: ["Finalement", "Cependant", "De plus", "En premier lieu"], correctAnswer: 2 },
      { type: "mcq", question: "「请稍等」s'utilise :", options: ["Au restaurant", "Au téléphone", "Au gymnase", "En examen"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「一切都是从我搬到上海___的。」", options: ["开始", "结束", "来", "去"], correctAnswer: 0 },
      { type: "mcq", question: "「如果您能在周五前回复，我将非常感激」est :", options: ["Une exigence", "Une demande polie", "Une plainte", "Des excuses"], correctAnswer: 1 },
      { type: "mcq", question: "Comment dit-on「votre entreprise」en chinois formel ?", options: ["你的公司", "贵公司", "那个公司", "这个公司"], correctAnswer: 1 },
      { type: "mcq", question: "「回想起来」signifie :", options: ["En se souvenant", "Avec le recul", "En oubliant", "En avançant"], correctAnswer: 1 },
      { type: "mcq", question: "Complétez : 「我从来没有经历___这样的事。」", options: ["了", "过", "着", "的"], correctAnswer: 1 },
      { type: "writing", question: "用中文写一封简短的商务邮件（3-4句话），关于跟进一次会议。", expectedKeywords: ["尊敬", "写信", "会议", "期待", "敬礼", "附件", "感激"], maxScore: 15 },
      { type: "writing", question: "用中文讲述一次难忘的旅行经历（3-4句话）。使用过去时态。", expectedKeywords: ["开始", "是", "从来没有", "突然", "忘记", "发现"], maxScore: 15 },
    ] },
    { languageCode: "ru", level: "B1" as const, title: "Certification Russe — B1 Средний", description: "Évalue ta capacité à débattre, raconter des histoires, et communiquer professionnellement en russe.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "Дополните: «Я работаю в этой сфере ___ пять лет.»", options: ["за", "уже", "через", "около"], correctAnswer: 1 },
      { type: "mcq", question: "«С другой стороны» signifie :", options: ["D'un côté", "D'un autre côté", "En premier lieu", "En conclusion"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la formule de clôture standard d'un email professionnel russe ?", options: ["Пока!", "С уважением", "До свидания", "Целую"], correctAnswer: 1 },
      { type: "mcq", question: "«Я полностью согласен» signifie :", options: ["Je ne suis pas d'accord", "Je suis tout à fait d'accord", "Je suis partiellement d'accord", "Je suis contre"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle est la forme la plus polie pour demander quelque chose en russe ?", options: ["Дай!", "Не могли бы вы...?", "Давай!", "Ты должен..."], correctAnswer: 1 },
      { type: "mcq", question: "«Мой рейс отменён» — Quel type de phrase est-ce ?", options: ["Active", "Passive", "Future", "Conditionnelle"], correctAnswer: 1 },
      { type: "mcq", question: "«Кроме того» dans un argument signifie :", options: ["Finalement", "Cependant", "De plus", "En premier lieu"], correctAnswer: 2 },
      { type: "mcq", question: "«Подождите, пожалуйста, минутку» s'utilise :", options: ["Au restaurant", "Au téléphone", "Au gymnase", "En examen"], correctAnswer: 1 },
      { type: "mcq", question: "Дополните: «Всё началось, ___ я переехал в Москву.»", options: ["потому что", "когда", "пока", "хотя"], correctAnswer: 1 },
      { type: "mcq", question: "«Был бы благодарен, если бы Вы ответили до пятницы» est :", options: ["Une exigence", "Une demande polie", "Une plainte", "Des excuses"], correctAnswer: 1 },
      { type: "mcq", question: "Comment écrit-on «vous» de politesse dans un email russe ?", options: ["вы", "Вы", "ВЫ", "ты"], correctAnswer: 1 },
      { type: "mcq", question: "«Оглядываясь назад» signifie :", options: ["En se retournant", "Avec le recul", "En regardant devant", "En oubliant"], correctAnswer: 1 },
      { type: "mcq", question: "Дополните: «Я никогда раньше не ___ ничего подобного.»", options: ["переживаю", "переживал", "буду переживать", "переживаешь"], correctAnswer: 1 },
      { type: "writing", question: "Напишите короткое деловое письмо (3-4 предложения) для follow-up после встречи.", expectedKeywords: ["Уважаемый", "пишу", "встреч", "нетерпением", "уважением", "приложени", "благодар"], maxScore: 15 },
      { type: "writing", question: "Расскажите о запоминающемся путешествии (3-4 предложения). Используйте прошедшее время.", expectedKeywords: ["начал", "был", "никогда", "вдруг", "забуду", "оказалось"], maxScore: 15 },
    ] },
    { languageCode: "ko", level: "B1" as const, title: "Certification Coréen — B1 중급", description: "Évalue ta capacité à débattre, raconter des histoires, et communiquer professionnellement en coréen.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "빈칸을 채우세요: '이 업계에서 5년간 ___.'", options: ["일합니다", "일해왔습니다", "일할 것입니다", "일했다"], correctAnswer: 1 },
      { type: "mcq", question: "'반면에' signifie :", options: ["D'un côté", "D'un autre côté", "En premier lieu", "En conclusion"], correctAnswer: 1 },
      { type: "mcq", question: "Quel honorifique utilise-t-on pour 'votre entreprise' en coréen formel ?", options: ["너의 회사", "귀사", "그 회사", "이 회사"], correctAnswer: 1 },
      { type: "mcq", question: "'전적으로 동의합니다' signifie :", options: ["Je ne suis pas d'accord", "Je suis tout à fait d'accord", "Je suis partiellement d'accord", "Je suis contre"], correctAnswer: 1 },
      { type: "mcq", question: "Quelle forme est la plus polie pour demander ?", options: ["해줘", "해 주실 수 있나요?", "해!", "해라"], correctAnswer: 1 },
      { type: "mcq", question: "'여권을 잃어버렸습니다' — Quel est le rôle de '~어버리다' ?", options: ["Action habituelle", "Action regrettable/irréversible", "Action future", "Action en cours"], correctAnswer: 1 },
      { type: "mcq", question: "'게다가' dans un argument signifie :", options: ["Finalement", "Cependant", "De plus", "En premier lieu"], correctAnswer: 2 },
      { type: "mcq", question: "'잠시만 기다려 주시겠습니까?' s'utilise :", options: ["Au restaurant", "Au téléphone", "Au gymnase", "En examen"], correctAnswer: 1 },
      { type: "mcq", question: "빈칸을 채우세요: '모든 것은 서울로 이사하면서 ___.'", options: ["시작되었습니다", "끝났습니다", "계속됩니다", "변합니다"], correctAnswer: 0 },
      { type: "mcq", question: "'금요일까지 답변해 주시면 감사하겠습니다' est :", options: ["Une exigence", "Une demande polie", "Une plainte", "Des excuses"], correctAnswer: 1 },
      { type: "mcq", question: "'~드리다' est la forme humble de quel verbe ?", options: ["하다", "주다", "가다", "보다"], correctAnswer: 1 },
      { type: "mcq", question: "'돌이켜보면' signifie :", options: ["En se retournant", "Avec le recul", "En regardant devant", "En oubliant"], correctAnswer: 1 },
      { type: "mcq", question: "빈칸을 채우세요: '그런 경험은 ___이었습니다.'", options: ["마지막", "처음", "두 번째", "여러 번"], correctAnswer: 1 },
      { type: "writing", question: "한국어로 짧은 비즈니스 이메일(3~4문장)을 쓰세요. 회의 후속 조치에 대해 작성하세요.", expectedKeywords: ["님께", "드립니다", "회의", "기다리", "감사", "첨부", "확인"], maxScore: 15 },
      { type: "writing", question: "기억에 남는 여행 경험을 3~4문장으로 쓰세요. 과거 시제를 사용하세요.", expectedKeywords: ["시작", "이었습니다", "처음", "갑자기", "잊지", "알고 보니"], maxScore: 15 },
    ] },
    { languageCode: "fr", level: "B1" as const, title: "Certification Français — B1 Intermédiaire", description: "Assess your ability to debate, tell stories, and communicate professionally in French.", durationMin: 30, passScore: 70, questions: [
      { type: "mcq", question: "Complete: 'Cela fait trois ans que je ___ dans cette entreprise.'", options: ["travaille", "travaillais", "ai travaillé", "travaillerai"], correctAnswer: 0 },
      { type: "mcq", question: "'En revanche' means:", options: ["Instead", "On the other hand", "In front", "Behind"], correctAnswer: 1 },
      { type: "mcq", question: "Which is the standard professional email closing in French?", options: ["Bisous!", "Cordialement", "À plus!", "Salut"], correctAnswer: 1 },
      { type: "mcq", question: "'Je suis tout à fait d'accord' means:", options: ["I totally disagree", "I completely agree", "I partially agree", "I'm against it"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'Si j'___ toi, j'accepterais l'offre.'", options: ["suis", "étais", "serai", "sois"], correctAnswer: 1 },
      { type: "mcq", question: "'J'ai perdu mon passeport' uses which tense?", options: ["Imparfait", "Passé composé", "Plus-que-parfait", "Conditionnel"], correctAnswer: 1 },
      { type: "mcq", question: "'De plus' in an argument means:", options: ["Finally", "However", "Furthermore", "First of all"], correctAnswer: 2 },
      { type: "mcq", question: "'Pourriez-vous patienter un instant ?' is used:", options: ["At a restaurant", "On the phone", "At the gym", "In an exam"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'Tout a commencé ___ j'ai déménagé à Lyon.'", options: ["depuis", "quand", "pendant", "durant"], correctAnswer: 1 },
      { type: "mcq", question: "'Je vous serais reconnaissant si vous pouviez répondre avant vendredi' is:", options: ["A demand", "A polite request", "A complaint", "An apology"], correctAnswer: 1 },
      { type: "mcq", question: "What does 'Veuillez trouver ci-joint' mean?", options: ["Please sit down", "Please find attached", "Please wait", "Please come in"], correctAnswer: 1 },
      { type: "mcq", question: "'Avec le recul' means:", options: ["Going backwards", "Looking back / In hindsight", "With a step back", "Moving forward"], correctAnswer: 1 },
      { type: "mcq", question: "Complete: 'Je n'avais jamais ___ une telle chose.'", options: ["vécu", "vivais", "vis", "vivrai"], correctAnswer: 0 },
      { type: "writing", question: "Write a short professional email in French (3-4 sentences) to follow up on a meeting.", expectedKeywords: ["Madame", "écrire", "réunion", "attente", "cordialement", "ci-joint", "reconnaissant"], maxScore: 15 },
      { type: "writing", question: "Tell a memorable travel story in French (3-4 sentences). Use past tenses.", expectedKeywords: ["commencé", "était", "jamais", "tout à coup", "oublierai", "avéré"], maxScore: 15 },
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

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDistractors(
  vocabulary: { word: string; translation: string; example: string }[],
  currentWord: { word: string; translation: string; example: string },
  count: number = 3,
  field: "word" | "translation" = "word"
): string[] {
  const others = vocabulary.filter((v) => v.word !== currentWord.word);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count).map((v) => v[field]);
}

function buildOptions(correct: string, distractors: string[]): { options: string[]; correctAnswer: number } {
  const options = shuffleArray([correct, ...distractors]);
  return { options, correctAnswer: options.indexOf(correct) };
}

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
  {
    const distractors = getDistractors(vocab, vocab[0], 3, "word");
    const { options, correctAnswer } = buildOptions(vocab[0].word, distractors);
    exercises.push({
      lessonId,
      type: "MULTIPLE_CHOICE",
      order: 1,
      question: {
        text: `Comment dit-on « ${vocab[0].translation} » ?`,
        options,
        correctAnswer,
        hint: vocab[0].example,
      },
    });
  }

  // 2. Traduction
  {
    const distractors = getDistractors(vocab, vocab[1], 3, "translation");
    const { options, correctAnswer } = buildOptions(vocab[1].translation, distractors);
    exercises.push({
      lessonId,
      type: "TRANSLATION",
      order: 2,
      question: {
        text: vocab[1].word,
        correctAnswer,
        options,
        direction: "target_to_native",
        hint: vocab[1].example,
      },
    });
  }

  // 3. Fill in the blank
  {
    const fillWord = vocab[2];
    const blankText = fillWord.example.replace(fillWord.word, "___");
    const distractors = getDistractors(vocab, fillWord, 3, "word");
    const { options, correctAnswer } = buildOptions(fillWord.word, distractors);
    exercises.push({
      lessonId,
      type: "FILL_IN_BLANK",
      order: 3,
      question: {
        text: blankText,
        correctAnswer,
        options,
        hint: fillWord.translation,
      },
    });
  }

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
    const distractors = getDistractors(vocab, vocab[3], 3, "translation");
    const { options, correctAnswer } = buildOptions(vocab[3].translation, distractors);
    exercises.push({
      lessonId,
      type: "MULTIPLE_CHOICE",
      order: 5,
      question: {
        text: `Que signifie « ${vocab[3].word} » ?`,
        options,
        correctAnswer,
        hint: vocab[3].example,
      },
    });
  }

  // ===== NOUVEAUX TYPES (profils d'apprentissage variés) =====

  // 6. CONTEXT_GUESS — Deviner le sens d'un mot par le contexte (profil immersif)
  // On affiche la phrase d'exemple et on demande ce que le mot signifie
  if (vocab.length >= 4) {
    const guessWord = vocab[Math.min(4, vocab.length - 1)];
    const distractors = getDistractors(vocab, guessWord, 3, "translation");
    const { options, correctAnswer } = buildOptions(guessWord.translation, distractors);
    exercises.push({
      lessonId,
      type: "CONTEXT_GUESS",
      order: 6,
      question: {
        context: guessWord.example,
        targetWord: guessWord.word,
        options,
        correctAnswer,
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
    const distractors = getDistractors(vocab, dialogueWord, 3, "word");
    const { options, correctAnswer } = buildOptions(dialogueWord.word, distractors);
    exercises.push({
      lessonId,
      type: "DIALOGUE_COMPLETE",
      order: 8,
      question: {
        dialogue: [
          { speaker: "A", text: dialogueWord.example.split(".")[0] + "?" },
          { speaker: "B", text: "___" },
        ],
        options,
        correctAnswer,
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
