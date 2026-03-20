"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/locales";

/* ——— Conversation data per language ——— */
interface DemoMessage {
  role: "ai" | "user";
  text: string;
}

interface DemoConversation {
  flag: string;
  language: string;
  level: string;
  scenario: Partial<Record<Locale, string>>;
  messages: DemoMessage[];
  correction: Partial<Record<Locale, string>>;
}

interface LanguageGroup {
  flag: string;
  code: string;
  language: string;
  conversations: Omit<DemoConversation, "flag" | "language">[];
}

const languageGroups: LanguageGroup[] = [
  // ===== FRANÇAIS =====
  {
    flag: "🇫🇷",
    code: "fr",
    language: "Français",
    conversations: [
      {
        level: "A2",
        scenario: {
          fr: "🥖 À la boulangerie — Paris",
          en: "🥖 At the bakery — Paris",
          zh: "🥖 在面包店 — 巴黎",
          ja: "🥖 パン屋にて — パリ",
          ru: "🥖 В булочной — Париж",
        },
        messages: [
          { role: "ai", text: "Bonjour ! Qu'est-ce que je vous sers ?" },
          { role: "user", text: "Bonjour, une baguette tradition s'il vous plaît." },
          { role: "ai", text: "Bien cuite ou pas trop cuite ?" },
          { role: "user", text: "Bien cuite, merci." },
        ],
        correction: {
          fr: "Parfait ! « Bien cuite » est très naturel. Tu pourrais aussi dire « pas trop blanche » pour le même résultat.",
          en: "Perfect! \"Bien cuite\" is very natural. You could also say \"pas trop blanche\" for the same result.",
          zh: "完美！「Bien cuite」非常自然。你也可以说「pas trop blanche」来表达同样的意思。",
          ja: "完璧！「Bien cuite」はとても自然です。同じ意味で「pas trop blanche」とも言えます。",
          ru: "Отлично! «Bien cuite» звучит очень естественно. Можно также сказать «pas trop blanche» для того же результата.",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "🚇 Dans le métro — Paris",
          en: "🚇 In the metro — Paris",
          zh: "🚇 在地铁 — 巴黎",
          ja: "🚇 地下鉄にて — パリ",
          ru: "🚇 В метро — Париж",
        },
        messages: [
          { role: "ai", text: "Excusez-moi, vous savez quelle ligne va à Montmartre ?" },
          { role: "user", text: "Oui, c'est la ligne 2, direction Nation." },
          { role: "ai", text: "Merci beaucoup ! Il faut changer quelque part ?" },
          { role: "user", text: "Non, c'est direct. Descendez à Anvers." },
        ],
        correction: {
          fr: "Super ! « Descendez à Anvers » est parfait. Tu peux aussi ajouter « c'est à 5 stations » pour être encore plus utile.",
          en: "Great! \"Descendez à Anvers\" is perfect. You could also add \"c'est à 5 stations\" to be even more helpful.",
          zh: "太棒了！「Descendez à Anvers」非常完美。你还可以加上「c'est à 5 stations」更加实用。",
          ja: "素晴らしい！「Descendez à Anvers」は完璧です。「c'est à 5 stations」を加えるともっと親切です。",
          ru: "Отлично! «Descendez à Anvers» — идеально. Можно добавить «c'est à 5 stations», чтобы быть ещё полезнее.",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "💊 À la pharmacie — Lyon",
          en: "💊 At the pharmacy — Lyon",
          zh: "💊 在药店 — 里昂",
          ja: "💊 薬局にて — リヨン",
          ru: "💊 В аптеке — Лион",
        },
        messages: [
          { role: "ai", text: "Bonjour, je peux vous aider ?" },
          { role: "user", text: "J'ai mal à la gorge depuis deux jours." },
          { role: "ai", text: "Vous avez de la fièvre aussi ?" },
          { role: "user", text: "Un peu, 37,8 ce matin." },
        ],
        correction: {
          fr: "Bien formulé ! En français oral, on dit souvent « j'ai 37,8 » sans préciser « degrés ». Très naturel.",
          en: "Well put! In spoken French, people often say \"j'ai 37,8\" without specifying \"degrés\". Very natural.",
          zh: "表达很好！法语口语中通常说「j'ai 37,8」不加「degrés」。非常自然。",
          ja: "よく言えました！フランス語の口語では「j'ai 37,8」と「degrés」を省略します。とても自然です。",
          ru: "Хорошо сказано! В разговорном французском часто говорят «j'ai 37,8» без «degrés». Очень естественно.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🛒 Au marché — Marseille",
          en: "🛒 At the market — Marseille",
          zh: "🛒 在市场 — 马赛",
          ja: "🛒 市場にて — マルセイユ",
          ru: "🛒 На рынке — Марсель",
        },
        messages: [
          { role: "ai", text: "Elles sont belles mes tomates ! Vous en voulez ?" },
          { role: "user", text: "Oui, un kilo de tomates s'il vous plaît." },
          { role: "ai", text: "Et avec ça ?" },
          { role: "user", text: "Ce sera tout, merci." },
        ],
        correction: {
          fr: "Excellent ! « Ce sera tout » est exactement ce qu'un natif dirait. L'expression « Et avec ça ? » est typique des marchés français.",
          en: "Excellent! \"Ce sera tout\" is exactly what a native would say. \"Et avec ça?\" is typical at French markets.",
          zh: "太棒了！「Ce sera tout」正是法国人会说的。「Et avec ça?」是法国市场的典型表达。",
          ja: "素晴らしい！「Ce sera tout」はネイティブそのもの。「Et avec ça?」はフランスの市場でよく使います。",
          ru: "Отлично! «Ce sera tout» — именно так сказал бы носитель языка. «Et avec ça?» — типичное выражение на французских рынках.",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "🍷 Au bar à vin — Bordeaux",
          en: "🍷 At the wine bar — Bordeaux",
          zh: "🍷 在酒吧 — 波尔多",
          ja: "🍷 ワインバーにて — ボルドー",
          ru: "🍷 В винном баре — Бордо",
        },
        messages: [
          { role: "ai", text: "Bonsoir ! Vous souhaitez un conseil pour le vin ?" },
          { role: "user", text: "Oui, je cherche un rouge pas trop tannique." },
          { role: "ai", text: "Je vous conseille ce Merlot, très fruité et léger." },
          { role: "user", text: "Parfait, je vais prendre un verre alors." },
        ],
        correction: {
          fr: "Très bien ! « Pas trop tannique » montre que tu maîtrises le vocabulaire du vin. Tu pourrais aussi dire « souple en bouche ».",
          en: "Great! \"Pas trop tannique\" shows you master wine vocabulary. You could also say \"souple en bouche\" (smooth on the palate).",
          zh: "很好！「Pas trop tannique」展示了你对红酒词汇的掌握。你还可以说「souple en bouche」（口感柔顺）。",
          ja: "素晴らしい！「Pas trop tannique」はワインの語彙をマスターしています。「souple en bouche」とも言えます。",
          ru: "Отлично! «Pas trop tannique» показывает владение винной лексикой. Можно также сказать «souple en bouche» (мягкое на вкус).",
        },
      },
    ],
  },
  // ===== ESPAÑOL =====
  {
    flag: "🇪🇸",
    code: "es",
    language: "Español",
    conversations: [
      {
        level: "B1",
        scenario: {
          fr: "🍽️ Au restaurant — Madrid",
          en: "🍽️ At the restaurant — Madrid",
          zh: "🍽️ 在餐厅 — 马德里",
          ja: "🍽️ レストランにて — マドリード",
          ru: "🍽️ В ресторане — Мадрид",
        },
        messages: [
          { role: "ai", text: "¡Buenas tardes! ¿Mesa para cuántas personas?" },
          { role: "user", text: "Hola, una mesa para dos por favor." },
          { role: "ai", text: "Perfecto. ¿Prefieren terraza o interior?" },
          { role: "user", text: "Terraza, si es posible." },
        ],
        correction: {
          fr: "Excellent ! Réponse naturelle et polie. Tu pourrais aussi dire « si hay sitio » (s'il y a de la place).",
          en: "Excellent! Natural and polite response. You could also say \"si hay sitio\" (if there's room).",
          zh: "太棒了！回答自然又礼貌。你也可以说「si hay sitio」（如果有位子的话）。",
          ja: "素晴らしい！自然で丁寧な回答です。「si hay sitio」（席があれば）とも言えます。",
          ru: "Отлично! Естественный и вежливый ответ. Можно также сказать «si hay sitio» (если есть место).",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "🏖️ À la plage — Barcelone",
          en: "🏖️ At the beach — Barcelona",
          zh: "🏖️ 在海滩 — 巴塞罗那",
          ja: "🏖️ ビーチにて — バルセロナ",
          ru: "🏖️ На пляже — Барселона",
        },
        messages: [
          { role: "ai", text: "¡Hola! ¿Quieres alquilar una sombrilla?" },
          { role: "user", text: "Sí, una sombrilla y dos tumbonas por favor." },
          { role: "ai", text: "Son 15 euros por todo el día. ¿Está bien?" },
          { role: "user", text: "Sí, perfecto. ¿Puedo pagar con tarjeta?" },
        ],
        correction: {
          fr: "Super ! « ¿Puedo pagar con tarjeta? » est essentiel en voyage. Alternative : « ¿Aceptan tarjeta? » (vous acceptez la carte ?).",
          en: "Great! \"¿Puedo pagar con tarjeta?\" is essential when traveling. Alternative: \"¿Aceptan tarjeta?\" (do you accept cards?).",
          zh: "太好了！「¿Puedo pagar con tarjeta?」旅行时很实用。也可以说「¿Aceptan tarjeta?」（接受刷卡吗？）。",
          ja: "素晴らしい！「¿Puedo pagar con tarjeta?」は旅行で必須。「¿Aceptan tarjeta?」とも言えます。",
          ru: "Отлично! «¿Puedo pagar con tarjeta?» — незаменимая фраза в путешествии. Альтернатива: «¿Aceptan tarjeta?» (вы принимаете карты?).",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🚕 Dans le taxi — Mexico",
          en: "🚕 In the taxi — Mexico City",
          zh: "🚕 在出租车里 — 墨西哥城",
          ja: "🚕 タクシーにて — メキシコシティ",
          ru: "🚕 В такси — Мехико",
        },
        messages: [
          { role: "ai", text: "¿A dónde lo llevo?" },
          { role: "user", text: "Al centro histórico, por favor." },
          { role: "ai", text: "¿Por cuál ruta prefiere? Hay mucho tráfico por Reforma." },
          { role: "user", text: "La ruta más rápida, por favor." },
        ],
        correction: {
          fr: "Bon choix ! Au Mexique on utilise « lo llevo » (tutoiement implicite). Tu peux aussi dire « la que usted prefiera » (celle que vous préférez).",
          en: "Good choice! In Mexico they use \"lo llevo\" (implied politeness). You could also say \"la que usted prefiera\" (whichever you prefer).",
          zh: "好选择！在墨西哥用「lo llevo」表示礼貌。你也可以说「la que usted prefiera」（您觉得哪条好就走哪条）。",
          ja: "いい選択！メキシコでは「lo llevo」が丁寧な表現。「la que usted prefiera」とも言えます。",
          ru: "Хороший выбор! В Мексике используют «lo llevo» (подразумеваемая вежливость). Можно также сказать «la que usted prefiera» (какой вы предпочитаете).",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "🏪 Au supermarché — Buenos Aires",
          en: "🏪 At the supermarket — Buenos Aires",
          zh: "🏪 在超市 — 布宜诺斯艾利斯",
          ja: "🏪 スーパーにて — ブエノスアイレス",
          ru: "🏪 В супермаркете — Буэнос-Айрес",
        },
        messages: [
          { role: "ai", text: "¡Buen día! ¿Necesitás bolsa?" },
          { role: "user", text: "Sí, una bolsa grande por favor." },
          { role: "ai", text: "¿Pagás en efectivo o con tarjeta?" },
          { role: "user", text: "Con tarjeta, en un pago." },
        ],
        correction: {
          fr: "Bien joué ! Note le « voseo » argentin : « necesitás » au lieu de « necesitas ». « En un pago » (en une fois) est une expression très utile.",
          en: "Well done! Note the Argentine \"voseo\": \"necesitás\" instead of \"necesitas\". \"En un pago\" (in one payment) is very useful.",
          zh: "做得好！注意阿根廷的voseo用法：「necesitás」而非「necesitas」。「En un pago」（一次付清）非常实用。",
          ja: "よくできました！アルゼンチンのvoseo：「necesitás」は「necesitas」の代わり。「En un pago」は便利な表現です。",
          ru: "Молодец! Обратите внимание на аргентинское «voseo»: «necesitás» вместо «necesitas». «En un pago» (одним платежом) — очень полезное выражение.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🏥 Chez le médecin — Séville",
          en: "🏥 At the doctor — Seville",
          zh: "🏥 在医生那里 — 塞维利亚",
          ja: "🏥 病院にて — セビリア",
          ru: "🏥 У врача — Севилья",
        },
        messages: [
          { role: "ai", text: "Buenos días. ¿Qué le pasa?" },
          { role: "user", text: "Me duele mucho la cabeza desde ayer." },
          { role: "ai", text: "¿Tiene otros síntomas? ¿Fiebre, náuseas?" },
          { role: "user", text: "Un poco de fiebre, pero no náuseas." },
        ],
        correction: {
          fr: "Très bien ! « Me duele la cabeza » est la construction correcte (verbe doler + partie du corps). Alternative : « Tengo dolor de cabeza ».",
          en: "Very good! \"Me duele la cabeza\" is the correct construction (verb doler + body part). Alternative: \"Tengo dolor de cabeza\".",
          zh: "很好！「Me duele la cabeza」是正确的结构（动词doler + 身体部位）。也可以说「Tengo dolor de cabeza」。",
          ja: "よくできました！「Me duele la cabeza」は正しい構文（動詞doler＋体の部位）。「Tengo dolor de cabeza」とも言えます。",
          ru: "Очень хорошо! «Me duele la cabeza» — правильная конструкция (глагол doler + часть тела). Альтернатива: «Tengo dolor de cabeza».",
        },
      },
    ],
  },
  // ===== ENGLISH =====
  {
    flag: "🇬🇧",
    code: "gb",
    language: "English",
    conversations: [
      {
        level: "A2",
        scenario: {
          fr: "🏨 Check-in à l'hôtel — Londres",
          en: "🏨 Checking in — London",
          zh: "🏨 酒店入住 — 伦敦",
          ja: "🏨 チェックイン — ロンドン",
          ru: "🏨 Регистрация в отеле — Лондон",
        },
        messages: [
          { role: "ai", text: "Good evening! Do you have a reservation?" },
          { role: "user", text: "Yes, under the name Martin." },
          { role: "ai", text: "Lovely. A single room for two nights, is that correct?" },
          { role: "user", text: "That's right, with breakfast please." },
        ],
        correction: {
          fr: "Parfait ! Tu peux aussi dire « Could I get breakfast included? » pour un ton plus naturel.",
          en: "Perfect! You could also say \"Could I get breakfast included?\" for a more natural tone.",
          zh: "完美！你也可以说「Could I get breakfast included?」，语气更自然。",
          ja: "完璧！「Could I get breakfast included?」と言うとより自然です。",
          ru: "Отлично! Можно также сказать «Could I get breakfast included?» для более естественного тона.",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "🍺 Au pub — Dublin",
          en: "🍺 At the pub — Dublin",
          zh: "🍺 在酒吧 — 都柏林",
          ja: "🍺 パブにて — ダブリン",
          ru: "🍺 В пабе — Дублин",
        },
        messages: [
          { role: "ai", text: "What can I get ya?" },
          { role: "user", text: "A pint of Guinness, please." },
          { role: "ai", text: "Good choice! Want to start a tab?" },
          { role: "user", text: "No thanks, I'll pay as I go." },
        ],
        correction: {
          fr: "Bien ! « Pay as I go » est une expression naturelle. « Start a tab » = ouvrir un compte au bar. Vocabulaire de pub essentiel !",
          en: "Nice! \"Pay as I go\" is very natural. \"Start a tab\" = open a running bill at the bar. Essential pub vocabulary!",
          zh: "不错！「Pay as I go」很自然。「Start a tab」= 在吧台开账单。酒吧必备词汇！",
          ja: "いいね！「Pay as I go」は自然な表現。「Start a tab」=バーでツケを開くこと。パブの必須語彙です！",
          ru: "Хорошо! «Pay as I go» — очень естественно. «Start a tab» = открыть счёт в баре. Важная лексика для паба!",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "💼 Entretien d'embauche — New York",
          en: "💼 Job interview — New York",
          zh: "💼 求职面试 — 纽约",
          ja: "💼 就職面接 — ニューヨーク",
          ru: "💼 Собеседование — Нью-Йорк",
        },
        messages: [
          { role: "ai", text: "Tell me about yourself and your experience." },
          { role: "user", text: "I've been working in marketing for three years." },
          { role: "ai", text: "What would you say is your greatest strength?" },
          { role: "user", text: "I'm very organized and I work well under pressure." },
        ],
        correction: {
          fr: "Bon début ! Essaie d'ajouter un exemple concret : « For instance, I managed a campaign that increased sales by 20% ». Ça renforce ta réponse.",
          en: "Good start! Try adding a concrete example: \"For instance, I managed a campaign that increased sales by 20%\". It strengthens your answer.",
          zh: "好的开始！试着加一个具体例子：「For instance, I managed a campaign that increased sales by 20%」，会让回答更有力。",
          ja: "いいスタート！具体例を加えてみて：「For instance, I managed a campaign that increased sales by 20%」。回答がより強くなります。",
          ru: "Хорошее начало! Попробуйте добавить конкретный пример: «For instance, I managed a campaign that increased sales by 20%». Это усилит ваш ответ.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🛍️ Shopping — Los Angeles",
          en: "🛍️ Shopping — Los Angeles",
          zh: "🛍️ 购物 — 洛杉矶",
          ja: "🛍️ ショッピング — ロサンゼルス",
          ru: "🛍️ Шоппинг — Лос-Анджелес",
        },
        messages: [
          { role: "ai", text: "Hi! Can I help you find anything?" },
          { role: "user", text: "I'm looking for a jacket, size medium." },
          { role: "ai", text: "We have these on sale. Would you like to try one on?" },
          { role: "user", text: "Yes please. Where's the fitting room?" },
        ],
        correction: {
          fr: "Très bien ! « Where's the fitting room? » est correct. Aux US on dit aussi « dressing room ». « Try one on » = essayer un vêtement.",
          en: "Very good! \"Where's the fitting room?\" is correct. In the US, \"dressing room\" also works. \"Try one on\" = try a piece of clothing.",
          zh: "很好！「Where's the fitting room?」是正确的。在美国也说「dressing room」。「Try one on」= 试穿。",
          ja: "よくできました！「Where's the fitting room?」は正しい。アメリカでは「dressing room」とも言います。",
          ru: "Очень хорошо! «Where's the fitting room?» — правильно. В США также говорят «dressing room». «Try one on» = примерить одежду.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🏛️ Au musée — Londres",
          en: "🏛️ At the museum — London",
          zh: "🏛️ 在博物馆 — 伦敦",
          ja: "🏛️ 美術館にて — ロンドン",
          ru: "🏛️ В музее — Лондон",
        },
        messages: [
          { role: "ai", text: "Welcome! Would you like an audio guide?" },
          { role: "user", text: "Yes please. How much is it?" },
          { role: "ai", text: "It's free with your ticket. Which language?" },
          { role: "user", text: "French, please. And where does the tour start?" },
        ],
        correction: {
          fr: "Parfait ! « Where does the tour start? » est très utile. Tu pourrais aussi demander « How long does the tour take? » (combien de temps dure la visite ?).",
          en: "Perfect! \"Where does the tour start?\" is very useful. You could also ask \"How long does the tour take?\".",
          zh: "完美！「Where does the tour start?」非常实用。你也可以问「How long does the tour take?」（参观需要多长时间？）。",
          ja: "完璧！「Where does the tour start?」はとても便利。「How long does the tour take?」とも聞けます。",
          ru: "Отлично! «Where does the tour start?» — очень полезный вопрос. Можно также спросить «How long does the tour take?» (сколько длится экскурсия?).",
        },
      },
    ],
  },
  // ===== 日本語 =====
  {
    flag: "🇯🇵",
    code: "jp",
    language: "日本語",
    conversations: [
      {
        level: "A2",
        scenario: {
          fr: "🏪 Au konbini — Tokyo",
          en: "🏪 At the konbini — Tokyo",
          zh: "🏪 在便利店 — 东京",
          ja: "🏪 コンビニにて — 東京",
          ru: "🏪 В комбини — Токио",
        },
        messages: [
          { role: "ai", text: "いらっしゃいませ！温めますか？" },
          { role: "user", text: "はい、お願いします。" },
          { role: "ai", text: "お箸はいりますか？" },
          { role: "user", text: "はい、一つお願いします。" },
        ],
        correction: {
          fr: "Très bien ! « 一つ » (hitotsu) est correct. En contexte plus poli, tu peux dire « 一膳 » (ichizen) pour les baguettes.",
          en: "Great job! \"一つ\" (hitotsu) is correct. In a more polite context, you could say \"一膳\" (ichizen) for chopsticks.",
          zh: "很好！「一つ」（hitotsu）是正确的。更礼貌的说法可以用「一膳」（ichizen）来指筷子。",
          ja: "よくできました！「一つ」は正解です。より丁寧な場面では、お箸には「一膳」を使うこともできます。",
          ru: "Отлично! «一つ» (hitotsu) — правильно. В более вежливом контексте для палочек можно сказать «一膳» (ichizen).",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "🚅 Dans le train — Osaka",
          en: "🚅 On the train — Osaka",
          zh: "🚅 在火车上 — 大阪",
          ja: "🚅 電車にて — 大阪",
          ru: "🚅 В поезде — Осака",
        },
        messages: [
          { role: "ai", text: "すみません、この電車は梅田に行きますか？" },
          { role: "user", text: "はい、行きます。次の駅です。" },
          { role: "ai", text: "ありがとうございます！何分くらいかかりますか？" },
          { role: "user", text: "5分くらいです。" },
        ],
        correction: {
          fr: "Très bien ! « 〜くらい » (kurai) pour donner une estimation est parfait. Tu peux aussi dire « だいたい5分です » (environ 5 minutes).",
          en: "Great! \"〜くらい\" (kurai) for estimates is perfect. You could also say \"だいたい5分です\" (about 5 minutes).",
          zh: "很好！用「〜くらい」（kurai）表示估计非常好。你也可以说「だいたい5分です」（大约5分钟）。",
          ja: "よくできました！「〜くらい」で概算を伝えるのは完璧です。「だいたい5分です」とも言えます。",
          ru: "Отлично! «〜くらい» (kurai) для приблизительных оценок — идеально. Можно также сказать «だいたい5分です» (примерно 5 минут).",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🍣 Au restaurant de sushi — Tokyo",
          en: "🍣 At the sushi bar — Tokyo",
          zh: "🍣 在寿司店 — 东京",
          ja: "🍣 寿司屋にて — 東京",
          ru: "🍣 В суши-баре — Токио",
        },
        messages: [
          { role: "ai", text: "いらっしゃい！カウンターでいいですか？" },
          { role: "user", text: "はい、カウンターでお願いします。" },
          { role: "ai", text: "おすすめは今日のマグロです。いかがですか？" },
          { role: "user", text: "じゃあ、マグロを二貫ください。" },
        ],
        correction: {
          fr: "Excellent ! « 二貫 » (nikan) est le compteur correct pour les sushis. Beaucoup d'apprenants utilisent « 二つ » par erreur. Bravo !",
          en: "Excellent! \"二貫\" (nikan) is the correct counter for sushi. Many learners mistakenly use \"二つ\". Well done!",
          zh: "太棒了！「二貫」（nikan）是寿司的正确量词。很多学习者会错误使用「二つ」。做得好！",
          ja: "素晴らしい！寿司には「二貫」が正しい数え方です。「二つ」と間違える学習者が多いですが、完璧です！",
          ru: "Отлично! «二貫» (nikan) — правильный счётный суффикс для суши. Многие ученики ошибочно используют «二つ». Молодец!",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "🏯 Au temple — Kyoto",
          en: "🏯 At the temple — Kyoto",
          zh: "🏯 在寺庙 — 京都",
          ja: "🏯 お寺にて — 京都",
          ru: "🏯 В храме — Киото",
        },
        messages: [
          { role: "ai", text: "ここは金閣寺です。写真を撮りましょうか？" },
          { role: "user", text: "はい、お願いします！きれいですね。" },
          { role: "ai", text: "本当にきれいですね。御朱印はもらいましたか？" },
          { role: "user", text: "まだです。どこでもらえますか？" },
        ],
        correction: {
          fr: "Super ! « まだです » (mada desu) = pas encore. « 御朱印 » (goshuin) = tampon/calligraphie souvenir des temples. Vocabulaire culturel important !",
          en: "Great! \"まだです\" (mada desu) = not yet. \"御朱印\" (goshuin) = temple stamp/calligraphy souvenir. Important cultural vocabulary!",
          zh: "太好了！「まだです」（mada desu）= 还没有。「御朱印」（goshuin）= 寺庙印章纪念。重要的文化词汇！",
          ja: "よくできました！「まだです」は自然な返答。御朱印は日本文化の大切な体験ですね。「いただけますか」を使うとさらに丁寧です。",
          ru: "Отлично! «まだです» (mada desu) = ещё нет. «御朱印» (goshuin) = храмовая печать/каллиграфический сувенир. Важная культурная лексика!",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🏥 Chez le médecin — Tokyo",
          en: "🏥 At the doctor — Tokyo",
          zh: "🏥 在医院 — 东京",
          ja: "🏥 病院にて — 東京",
          ru: "🏥 У врача — Токио",
        },
        messages: [
          { role: "ai", text: "今日はどうされましたか？" },
          { role: "user", text: "昨日からお腹が痛いです。" },
          { role: "ai", text: "熱はありますか？" },
          { role: "user", text: "少し熱があります。37度5分です。" },
        ],
        correction: {
          fr: "Bien ! « お腹が痛い » (onaka ga itai) est la bonne formule. En japonais, la température se dit « 37度5分 » (37,5°C). Très naturel !",
          en: "Good! \"お腹が痛い\" (onaka ga itai) is the right expression. In Japanese, temperature is \"37度5分\" (37.5°C). Very natural!",
          zh: "很好！「お腹が痛い」（onaka ga itai）是正确的表达。日语中温度说「37度5分」（37.5°C）。非常自然！",
          ja: "よくできました！「お腹が痛い」は正しい表現です。体温の言い方も完璧。「37度5分あります」とも言えます。",
          ru: "Хорошо! «お腹が痛い» (onaka ga itai) — правильное выражение. В японском температуру говорят «37度5分» (37,5°C). Очень естественно!",
        },
      },
    ],
  },
  // ===== РУССКИЙ =====
  {
    flag: "🇷🇺",
    code: "ru",
    language: "Русский",
    conversations: [
      {
        level: "A2",
        scenario: {
          fr: "☕ Au café — Moscou",
          en: "☕ At the café — Moscow",
          zh: "☕ 在咖啡厅 — 莫斯科",
          ja: "☕ カフェにて — モスクワ",
          ru: "☕ В кафе — Москва",
        },
        messages: [
          { role: "ai", text: "Добрый день! Что будете заказывать?" },
          { role: "user", text: "Здравствуйте, один капучино, пожалуйста." },
          { role: "ai", text: "С сахаром или без?" },
          { role: "user", text: "Без сахара, спасибо." },
        ],
        correction: {
          fr: "Très bien ! « Пожалуйста » est la formule de politesse parfaite. Tu peux aussi dire « Можно мне… » (puis-je avoir…).",
          en: "Great! \"Пожалуйста\" is the perfect polite word. You could also say \"Можно мне…\" (could I have…).",
          zh: "很好！「Пожалуйста」是完美的礼貌用语。你也可以说「Можно мне…」（我可以要…吗）。",
          ja: "素晴らしい！「Пожалуйста」は完璧な丁寧表現です。「Можно мне…」（〜をいただけますか）も使えます。",
          ru: "Отлично! «Пожалуйста» — идеальная вежливая форма. Можно также сказать «Можно мне…» (могу ли я получить…).",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "🚇 Dans le métro — Saint-Pétersbourg",
          en: "🚇 In the metro — Saint Petersburg",
          zh: "🚇 在地铁 — 圣彼得堡",
          ja: "🚇 地下鉄にて — サンクトペテルブルク",
          ru: "🚇 В метро — Санкт-Петербург",
        },
        messages: [
          { role: "ai", text: "Извините, как доехать до Эрмитажа?" },
          { role: "user", text: "Вам нужна синяя линия, станция Адмиралтейская." },
          { role: "ai", text: "Спасибо! А сколько стоит билет?" },
          { role: "user", text: "70 рублей. Можно купить жетон в автомате." },
        ],
        correction: {
          fr: "Super ! « Жетон » (jeton) est le mot spécifique pour le ticket de métro russe. « В автомате » (au distributeur) est très pratique.",
          en: "Great! \"Жетон\" (zheton) is the specific word for a Russian metro token. \"В автомате\" (at the machine) is very practical.",
          zh: "太好了！「Жетон」是俄罗斯地铁代币的专用词。「В автомате」（在自动售票机）非常实用。",
          ja: "素晴らしい！「Жетон」はロシアの地下鉄トークンの専門用語。「В автомате」（自販機で）は実用的です。",
          ru: "Отлично! «Жетон» — специальное слово для билета в метро. «В автомате» — очень практичное выражение.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🏪 Au supermarché — Moscou",
          en: "🏪 At the supermarket — Moscow",
          zh: "🏪 在超市 — 莫斯科",
          ja: "🏪 スーパーにて — モスクワ",
          ru: "🏪 В супермаркете — Москва",
        },
        messages: [
          { role: "ai", text: "Вам пакет нужен?" },
          { role: "user", text: "Да, один большой, пожалуйста." },
          { role: "ai", text: "Карта магазина есть?" },
          { role: "user", text: "Нет, у меня нет карты." },
        ],
        correction: {
          fr: "Bien ! « У меня нет карты » utilise le génitif après « нет », c'est correct ! Alternative : « К сожалению, нет » (malheureusement non).",
          en: "Good! \"У меня нет карты\" uses the genitive after \"нет\", that's correct! Alternative: \"К сожалению, нет\" (unfortunately no).",
          zh: "很好！「У меня нет карты」在「нет」后使用了属格，正确！也可以说「К сожалению, нет」（很遗憾没有）。",
          ja: "よくできました！「У меня нет карты」は「нет」の後の生格が正しい！「К сожалению, нет」とも言えます。",
          ru: "Хорошо! «У меня нет карты» — правильное использование родительного падежа после «нет»! Альтернатива: «К сожалению, нет».",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "🏛️ Au musée — Moscou",
          en: "🏛️ At the museum — Moscow",
          zh: "🏛️ 在博物馆 — 莫斯科",
          ja: "🏛️ 美術館にて — モスクワ",
          ru: "🏛️ В музее — Москва",
        },
        messages: [
          { role: "ai", text: "Добро пожаловать в Третьяковскую галерею! Вам нужен аудиогид?" },
          { role: "user", text: "Да, на французском, пожалуйста." },
          { role: "ai", text: "К сожалению, только на русском и английском." },
          { role: "user", text: "Тогда на английском, пожалуйста." },
        ],
        correction: {
          fr: "Bien ! « Тогда » (alors/dans ce cas) est très naturel pour rebondir. « К сожалению » = malheureusement, expression utile à retenir.",
          en: "Good! \"Тогда\" (then/in that case) is very natural for pivoting. \"К сожалению\" = unfortunately, a useful expression to remember.",
          zh: "很好！「Тогда」（那么/那就）转折得很自然。「К сожалению」= 遗憾地，很有用的表达。",
          ja: "よくできました！「Тогда」（では/その場合）は自然な切り替え。「К сожалению」は覚えておくと便利です。",
          ru: "Хорошо! «Тогда» — очень естественный переход. «К сожалению» — полезное выражение, стоит запомнить.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🏥 À la pharmacie — Moscou",
          en: "🏥 At the pharmacy — Moscow",
          zh: "🏥 在药店 — 莫斯科",
          ja: "🏥 薬局にて — モスクワ",
          ru: "🏥 В аптеке — Москва",
        },
        messages: [
          { role: "ai", text: "Здравствуйте, что вас беспокоит?" },
          { role: "user", text: "У меня болит голова." },
          { role: "ai", text: "Давно болит?" },
          { role: "user", text: "С утра. Есть что-нибудь от головной боли?" },
        ],
        correction: {
          fr: "Très bien ! « У меня болит голова » est la construction correcte. « Что-нибудь от… » (quelque chose contre…) est parfait pour la pharmacie.",
          en: "Very good! \"У меня болит голова\" is the correct construction. \"Что-нибудь от…\" (something for/against…) is perfect for the pharmacy.",
          zh: "很好！「У меня болит голова」是正确的结构。「Что-нибудь от…」（有什么治…的药）在药店非常好用。",
          ja: "よくできました！「У меня болит голова」は正しい構文。「Что-нибудь от…」は薬局で完璧な表現です。",
          ru: "Очень хорошо! «У меня болит голова» — правильная конструкция. «Что-нибудь от…» — идеальная фраза для аптеки.",
        },
      },
    ],
  },
  // ===== 中文 =====
  {
    flag: "🇨🇳",
    code: "cn",
    language: "中文",
    conversations: [
      {
        level: "A2",
        scenario: {
          fr: "☕ Au café — Shanghai",
          en: "☕ At the café — Shanghai",
          zh: "☕ 在咖啡厅 — 上海",
          ja: "☕ カフェにて — 上海",
          ru: "☕ В кафе — Шанхай",
        },
        messages: [
          { role: "ai", text: "你好！请问要喝点什么？" },
          { role: "user", text: "我要一杯冰美式咖啡。" },
          { role: "ai", text: "好的，大杯还是小杯？" },
          { role: "user", text: "大杯，谢谢。" },
        ],
        correction: {
          fr: "Très naturel ! Tu pourrais aussi dire « 来一杯 » (lái yī bēi) — plus courant à l'oral.",
          en: "Very natural! You could also say \"来一杯\" (lái yī bēi) — more common in spoken Chinese.",
          zh: "非常自然！你也可以说「来一杯」——口语中更常用。",
          ja: "とても自然です！「来一杯」（lái yī bēi）とも言えます——口語でよく使います。",
          ru: "Очень естественно! Можно также сказать «来一杯» (lái yī bēi) — более распространённое выражение в разговорном китайском.",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "🚕 Dans le taxi — Pékin",
          en: "🚕 In the taxi — Beijing",
          zh: "🚕 在出租车里 — 北京",
          ja: "🚕 タクシーにて — 北京",
          ru: "🚕 В такси — Пекин",
        },
        messages: [
          { role: "ai", text: "你好，去哪儿？" },
          { role: "user", text: "请去天安门广场。" },
          { role: "ai", text: "好的。大概二十分钟。堵车的话要久一点。" },
          { role: "user", text: "没关系，谢谢师傅。" },
        ],
        correction: {
          fr: "Super ! « 师傅 » (shīfu) est l'appellation polie pour les chauffeurs en Chine. « 没关系 » (ce n'est rien) est très naturel ici.",
          en: "Great! \"师傅\" (shīfu) is the polite way to address drivers in China. \"没关系\" (no problem) is very natural here.",
          zh: "太棒了！称呼司机为「师傅」非常礼貌。「没关系」用在这里很自然。",
          ja: "素晴らしい！「师傅」は中国でドライバーへの丁寧な呼び方。「没关系」はここで自然な表現です。",
          ru: "Отлично! «师傅» (shīfu) — вежливое обращение к водителям в Китае. «没关系» (ничего страшного) — очень естественно здесь.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🛒 Au marché — Chengdu",
          en: "🛒 At the market — Chengdu",
          zh: "🛒 在市场 — 成都",
          ja: "🛒 市場にて — 成都",
          ru: "🛒 На рынке — Чэнду",
        },
        messages: [
          { role: "ai", text: "这个苹果很甜！要不要尝一个？" },
          { role: "user", text: "好的，我尝一个。多少钱一斤？" },
          { role: "ai", text: "五块钱一斤。买三斤送一斤！" },
          { role: "user", text: "那来三斤吧。" },
        ],
        correction: {
          fr: "Bien ! « 一斤 » (yī jīn) = 500g, l'unité de poids classique au marché chinois. « 买三送一 » = achetez 3, 1 offert. Expression très courante !",
          en: "Good! \"一斤\" (yī jīn) = 500g, the classic weight unit at Chinese markets. \"买三送一\" = buy 3 get 1 free. Very common expression!",
          zh: "很好！「一斤」是中国市场的经典计量单位。「买三送一」是常见的促销说法。「那来三斤吧」非常地道！",
          ja: "よくできました！「一斤」= 500g、中国の市場の定番単位。「买三送一」= 3つ買うと1つ無料。よく使う表現です！",
          ru: "Хорошо! «一斤» (yī jīn) = 500 г, классическая единица веса на китайских рынках. «买三送一» = купи 3, получи 1 бесплатно. Очень распространённое выражение!",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "🏥 Chez le médecin — Shanghai",
          en: "🏥 At the doctor — Shanghai",
          zh: "🏥 在医院 — 上海",
          ja: "🏥 病院にて — 上海",
          ru: "🏥 У врача — Шанхай",
        },
        messages: [
          { role: "ai", text: "请问哪里不舒服？" },
          { role: "user", text: "我肚子疼，从昨天晚上开始的。" },
          { role: "ai", text: "有没有发烧？" },
          { role: "user", text: "有一点，三十七度五。" },
        ],
        correction: {
          fr: "Bien dit ! « 从…开始 » (depuis…) pour situer dans le temps est parfait. « 三十七度五 » est la façon naturelle de dire la température en chinois.",
          en: "Well said! \"从…开始\" (since…) to place in time is perfect. \"三十七度五\" is the natural way to say temperature in Chinese.",
          zh: "说得好！「从…开始」表示时间起点很到位。「三十七度五」是中文说体温的自然方式。",
          ja: "よく言えました！「从…开始」で時間を示すのは完璧。「三十七度五」は中国語での体温の自然な言い方です。",
          ru: "Хорошо сказано! «从…开始» (с тех пор как…) для указания времени — идеально. «三十七度五» — естественный способ назвать температуру по-китайски.",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🏯 Au temple — Xi'an",
          en: "🏯 At the temple — Xi'an",
          zh: "🏯 在寺庙 — 西安",
          ja: "🏯 寺院にて — 西安",
          ru: "🏯 В храме — Сиань",
        },
        messages: [
          { role: "ai", text: "欢迎参观大雁塔！需要导游吗？" },
          { role: "user", text: "请问有中文讲解吗？" },
          { role: "ai", text: "有的，还有英文的。您要哪个？" },
          { role: "user", text: "中文的吧，我想练习听力。" },
        ],
        correction: {
          fr: "Excellent ! « 我想练习听力 » (je veux pratiquer la compréhension orale) montre ta motivation. « 讲解 » = visite guidée/explication.",
          en: "Excellent! \"我想练习听力\" (I want to practice listening) shows your motivation. \"讲解\" = guided tour/explanation.",
          zh: "太棒了！主动选择中文讲解来练听力，学习态度很好！「讲解」指的是解说服务。",
          ja: "素晴らしい！「我想练习听力」は学ぶ意欲を示しています。「讲解」=ガイド付き解説のことです。",
          ru: "Отлично! «我想练习听力» (я хочу практиковать аудирование) показывает вашу мотивацию. «讲解» = экскурсия с гидом/пояснение.",
        },
      },
    ],
  },
  // ===== 한국어 =====
  {
    flag: "🇰🇷",
    code: "kr",
    language: "한국어",
    conversations: [
      {
        level: "A2",
        scenario: {
          fr: "🍜 Au restaurant — Séoul",
          en: "🍜 At the restaurant — Seoul",
          zh: "🍜 在餐厅 — 首尔",
          ja: "🍜 レストランにて — ソウル",
          ru: "🍜 В ресторане — Сеул",
        },
        messages: [
          { role: "ai", text: "어서오세요! 몇 분이세요?" },
          { role: "user", text: "두 명이요." },
          { role: "ai", text: "네, 이쪽으로 앉으세요. 메뉴 여기 있어요." },
          { role: "user", text: "감사합니다. 비빔밥 하나 주세요." },
        ],
        correction: {
          fr: "Très bien ! « 주세요 » (juseyo) est la formule polie parfaite. Pour être encore plus poli : « 비빔밥 하나 부탁드립니다 ».",
          en: "Great! \"주세요\" (juseyo) is the perfect polite form. For extra politeness: \"비빔밥 하나 부탁드립니다\".",
          zh: "很好！「주세요」（juseyo）是完美的礼貌表达。更礼貌的说法：「비빔밥 하나 부탁드립니다」。",
          ja: "素晴らしい！「주세요」（juseyo）は完璧な丁寧表現です。さらに丁寧に：「비빔밥 하나 부탁드립니다」。",
          ru: "Отлично! «주세요» (juseyo) — идеальная вежливая форма. Для ещё большей вежливости: «비빔밥 하나 부탁드립니다».",
        },
      },
      {
        level: "A1",
        scenario: {
          fr: "☕ Au café — Séoul",
          en: "☕ At the café — Seoul",
          zh: "☕ 在咖啡厅 — 首尔",
          ja: "☕ カフェにて — ソウル",
          ru: "☕ В кафе — Сеул",
        },
        messages: [
          { role: "ai", text: "안녕하세요! 주문하시겠어요?" },
          { role: "user", text: "아이스 아메리카노 하나요." },
          { role: "ai", text: "사이즈는요? 레귤러, 라지 있어요." },
          { role: "user", text: "라지로 주세요." },
        ],
        correction: {
          fr: "Super ! Les Coréens adorent leur « 아이스 아메리카노 ». « ~로 주세요 » (avec la particule ~로) = donnez-moi en [taille]. Très naturel !",
          en: "Great! Koreans love their \"아이스 아메리카노\". \"~로 주세요\" (with particle ~로) = give me in [size]. Very natural!",
          zh: "太好了！韩国人超爱「아이스 아메리카노」。「~로 주세요」（用助词~로）= 请给我[某尺寸]的。非常自然！",
          ja: "素晴らしい！韓国人は「아이스 아메리카노」が大好き。「~로 주세요」（助詞~로）はサイズ指定に完璧です！",
          ru: "Отлично! Корейцы обожают свой «아이스 아메리카노». «~로 주세요» (с частицей ~로) = дайте мне [размер]. Очень естественно!",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🛍️ Shopping — Séoul",
          en: "🛍️ Shopping — Seoul",
          zh: "🛍️ 购物 — 首尔",
          ja: "🛍️ ショッピング — ソウル",
          ru: "🛍️ Шоппинг — Сеул",
        },
        messages: [
          { role: "ai", text: "어서오세요! 뭐 찾으시는 거 있으세요?" },
          { role: "user", text: "이 티셔츠 다른 색깔 있어요?" },
          { role: "ai", text: "네, 검정이랑 흰색 있어요." },
          { role: "user", text: "검정으로 주세요. 입어봐도 돼요?" },
        ],
        correction: {
          fr: "Excellent ! « 입어봐도 돼요? » (puis-je l'essayer ?) est parfait. C'est la forme polie de demander la permission (~아/어도 돼요?).",
          en: "Excellent! \"입어봐도 돼요?\" (can I try it on?) is perfect. It's the polite way to ask permission (~아/어도 돼요?).",
          zh: "太棒了！「입어봐도 돼요?」（可以试穿吗？）是完美的。这是请求许可的礼貌形式（~아/어도 돼요?）。",
          ja: "素晴らしい！「입어봐도 돼요?」（試着していいですか？）は完璧。許可を求める丁寧形（~아/어도 돼요?）です。",
          ru: "Отлично! «입어봐도 돼요?» (можно примерить?) — идеально. Это вежливый способ попросить разрешение (~아/어도 돼요?).",
        },
      },
      {
        level: "B1",
        scenario: {
          fr: "🎤 Au noraebang — Séoul",
          en: "🎤 At the karaoke — Seoul",
          zh: "🎤 在KTV — 首尔",
          ja: "🎤 カラオケにて — ソウル",
          ru: "🎤 В караоке — Сеул",
        },
        messages: [
          { role: "ai", text: "안녕하세요! 몇 시간 하실 거예요?" },
          { role: "user", text: "두 시간이요. 얼마예요?" },
          { role: "ai", text: "두 시간에 만 오천 원이에요. 음료 포함이에요." },
          { role: "user", text: "좋아요! 음료는 콜라로 할게요." },
        ],
        correction: {
          fr: "Super ! « ~(으)로 할게요 » = je vais prendre (choix). « 만 오천 원 » = 15 000 won. Savoir compter en coréen est essentiel !",
          en: "Great! \"~(으)로 할게요\" = I'll go with (choice). \"만 오천 원\" = 15,000 won. Knowing how to count in Korean is essential!",
          zh: "太好了！「~(으)로 할게요」= 我选择…。「만 오천 원」= 15,000韩元。学会韩语数字很重要！",
          ja: "素晴らしい！「~(으)로 할게요」= 〜にします。「만 오천 원」= 15,000ウォン。韓国語の数え方は重要です！",
          ru: "Отлично! «~(으)로 할게요» = я выберу (выбор). «만 오천 원» = 15 000 вон. Умение считать по-корейски — это must!",
        },
      },
      {
        level: "A2",
        scenario: {
          fr: "🚇 Dans le métro — Séoul",
          en: "🚇 In the metro — Seoul",
          zh: "🚇 在地铁 — 首尔",
          ja: "🚇 地下鉄にて — ソウル",
          ru: "🚇 В метро — Сеул",
        },
        messages: [
          { role: "ai", text: "실례합니다, 명동역 어떻게 가요?" },
          { role: "user", text: "4호선 타고 세 정거장 가세요." },
          { role: "ai", text: "감사합니다! 환승해야 돼요?" },
          { role: "user", text: "아니요, 환승 없이 바로 가요." },
        ],
        correction: {
          fr: "Très bien ! « 환승 없이 » (sans correspondance) est très utile. « 정거장 » = station/arrêt. « 바로 가요 » = aller directement.",
          en: "Very good! \"환승 없이\" (without transfer) is very useful. \"정거장\" = station/stop. \"바로 가요\" = go directly.",
          zh: "很好！「환승 없이」（不用换乘）非常实用。「정거장」= 站。「바로 가요」= 直达。",
          ja: "よくできました！「환승 없이」（乗り換えなし）は便利。「정거장」= 駅。「바로 가요」= 直接行けます。",
          ru: "Очень хорошо! «환승 없이» (без пересадки) — очень полезно. «정거장» = станция/остановка. «바로 가요» = ехать напрямую.",
        },
      },
    ],
  },
];

/* ——— Timing constants ——— */
const MSG_DELAY = 0.7; // seconds between messages
const TYPING_DURATION = 1.5; // typing indicator visible time
const CORRECTION_DELAY = 0.8; // after typing disappears
const HOLD_DURATION = 3000; // ms to hold full conversation before switching
const FADE_DURATION = 0.5; // transition between conversations

const ease = [0.22, 1, 0.36, 1] as const;

/** Pick a random conversation index for a language group (different from current if possible) */
function pickRandomConv(group: LanguageGroup, currentIdx?: number): number {
  const len = group.conversations.length;
  if (len <= 1) return 0;
  let next: number;
  do {
    next = Math.floor(Math.random() * len);
  } while (next === currentIdx);
  return next;
}

export function DemoChat() {
  const { locale } = useI18n();
  const [langIndex, setLangIndex] = useState(0);
  const [convIndex, setConvIndex] = useState(0);
  const [phase, setPhase] = useState<"animating" | "holding" | "exiting">("animating");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Unique key to force re-render when same language gets a new conversation
  const [cycleKey, setCycleKey] = useState(0);

  const group = languageGroups[langIndex];
  const activeConv = group.conversations[convIndex];
  const conv: DemoConversation & { code: string } = {
    flag: group.flag,
    code: group.code,
    language: group.language,
    ...activeConv,
  };

  const totalAnimTime =
    (0.6 + conv.messages.length * MSG_DELAY + TYPING_DURATION + CORRECTION_DELAY + 0.6) * 1000;

  const nextConversation = useCallback(() => {
    setPhase("exiting");
    timeoutRef.current = setTimeout(() => {
      setLangIndex((prev) => {
        const nextLang = (prev + 1) % languageGroups.length;
        const nextGroup = languageGroups[nextLang];
        setConvIndex(pickRandomConv(nextGroup));
        return nextLang;
      });
      setCycleKey((k) => k + 1);
      setPhase("animating");
    }, FADE_DURATION * 1000);
  }, []);

  // Auto-advance after animation completes + hold
  useEffect(() => {
    if (phase === "animating") {
      timeoutRef.current = setTimeout(() => {
        setPhase("holding");
      }, totalAnimTime);
    } else if (phase === "holding") {
      timeoutRef.current = setTimeout(() => {
        nextConversation();
      }, HOLD_DURATION);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, totalAnimTime, nextConversation]);

  return (
    <div className="relative">
      {/* Language selector dots */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {languageGroups.map((g, i) => (
          <button
            key={i}
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setPhase("exiting");
              setTimeout(() => {
                const newConvIdx = pickRandomConv(g, i === langIndex ? convIndex : undefined);
                setLangIndex(i);
                setConvIndex(newConvIdx);
                setCycleKey((k) => k + 1);
                setPhase("animating");
              }, FADE_DURATION * 1000);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full overflow-hidden transition-all duration-300 ${
              i === langIndex
                ? "scale-110 ring-1 ring-white/20"
                : "opacity-50 hover:opacity-80"
            }`}
            title={g.language}
          >
            <img
              src={`https://flagcdn.com/w40/${g.code}.png`}
              alt={g.language}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${langIndex}-${convIndex}-${cycleKey}-${locale}`}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: FADE_DURATION, ease }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
        >
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden">
                <img
                  src={`https://flagcdn.com/w40/${conv.code}.png`}
                  alt={conv.language}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/90">
                  {conv.scenario[locale] ?? conv.scenario["en"] ?? conv.scenario["fr"]}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34d399] demo-online-pulse" />
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#34d399]/60">
                    {conv.language} — {conv.level}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages — sequential */}
          <div className="space-y-3 px-5 py-5">
            {conv.messages.map((msg, i) => (
              <motion.div
                key={`${cycleKey}-${i}`}
                initial={{
                  opacity: 0,
                  x: msg.role === "user" ? 30 : -30,
                  y: 10,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.3 + i * MSG_DELAY,
                  duration: 0.5,
                  ease,
                }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-[#60a5fa]/20 text-white/90"
                      : "rounded-bl-md bg-white/[0.06] text-white/75"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <motion.div
              key={`typing-${cycleKey}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: [-20, 0, 0, 0],
              }}
              transition={{
                delay: 0.3 + conv.messages.length * MSG_DELAY,
                duration: TYPING_DURATION,
                times: [0, 0.15, 0.7, 1],
              }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
                <span
                  className="demo-typing-dot h-1.5 w-1.5 rounded-full bg-white/40"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="demo-typing-dot h-1.5 w-1.5 rounded-full bg-white/40"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="demo-typing-dot h-1.5 w-1.5 rounded-full bg-white/40"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Correction feedback */}
          <motion.div
            key={`correction-${cycleKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay:
                0.3 +
                conv.messages.length * MSG_DELAY +
                TYPING_DURATION +
                CORRECTION_DELAY,
              duration: 0.6,
              ease,
            }}
            className="border-t border-white/[0.06] px-5 py-4"
          >
            <motion.div
              key={`correction-inner-${cycleKey}`}
              initial={{ scale: 0.95 }}
              animate={{ scale: [0.95, 1.02, 1] }}
              transition={{
                delay:
                  0.3 +
                  conv.messages.length * MSG_DELAY +
                  TYPING_DURATION +
                  CORRECTION_DELAY +
                  0.2,
                duration: 0.5,
              }}
              className="flex items-start gap-3 rounded-xl bg-[#34d399]/[0.08] p-3.5 demo-correction-glow"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399] demo-sparkle-spin" />
              <p className="text-[12px] leading-relaxed text-[#34d399]/80">
                {conv.correction[locale] ?? conv.correction["en"] ?? conv.correction["fr"]}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Progress bar — shows time until next conversation */}
        <motion.div
          key={`progress-${cycleKey}`}
          className="mx-auto mt-3 h-0.5 rounded-full bg-white/10 overflow-hidden"
          style={{ maxWidth: 200 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#34d399]/60 to-[#60a5fa]/60"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: (totalAnimTime + HOLD_DURATION) / 1000,
              ease: "linear",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Decorative glow — animated */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#34d399]/[0.06] blur-3xl demo-glow-float hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#60a5fa]/[0.05] blur-3xl demo-glow-float-reverse hidden sm:block" />
    </div>
  );
}
