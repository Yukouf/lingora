import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/* ═══════════════════════════════════════════════════════════
   SEED — Lingora
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
      ],
    },
  ]);

  // ---------- JAPONAIS ----------
  console.log("📚 Japonais...");
  const jaA1 = await upsertCourse(langMap["ja"], "A1", "日本語 — 初級 (A1)", "Les bases du japonais pour te débrouiller au quotidien.", 1, false);
  await upsertCourse(langMap["ja"], "A2", "日本語 — 初中級 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
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
  ]);

  // ---------- CHINOIS ----------
  console.log("📚 Chinois...");
  const zhA1 = await upsertCourse(langMap["zh"], "A1", "中文 — 入门 (A1)", "Les bases du chinois mandarin pour te débrouiller au quotidien.", 1, false);
  await upsertCourse(langMap["zh"], "A2", "中文 — 基础 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
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
  ]);

  // ---------- RUSSE ----------
  console.log("📚 Russe...");
  const ruA1 = await upsertCourse(langMap["ru"], "A1", "Русский — Начальный (A1)", "Les bases du russe pour te débrouiller au quotidien.", 1, false);
  await upsertCourse(langMap["ru"], "A2", "Русский — Элементарный (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
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
  ]);

  // ---------- CORÉEN ----------
  console.log("📚 Coréen...");
  const koA1 = await upsertCourse(langMap["ko"], "A1", "한국어 — 초급 (A1)", "Les bases du coréen pour te débrouiller au quotidien.", 1, false);
  await upsertCourse(langMap["ko"], "A2", "한국어 — 초중급 (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
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
  ]);

  // ---------- FRANÇAIS ----------
  console.log("📚 Français...");
  const frA1 = await upsertCourse(langMap["fr"], "A1", "Français — Débutant (A1)", "Les bases du français pour te débrouiller au quotidien.", 1, false);
  await upsertCourse(langMap["fr"], "A2", "Français — Élémentaire (A2)", "Renforce tes bases et commence à avoir des conversations simples.", 2, false);
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
      ],
    },
  ]);

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
