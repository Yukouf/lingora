# Comment j'ai construit Lingyou

> L'histoire derriere la creation d'une plateforme d'apprentissage des langues complete, de l'idee au deploiement.

---

## Apercu

| Page d'accueil | Pratique IA | Progression |
|:---:|:---:|:---:|
| ![Landing](screenshots/landing.png) | ![Practice](screenshots/practice.png) | ![Progress](screenshots/progress.png) |

---

## Le probleme

J'utilisais des apps comme Duolingo et je me suis rendu compte d'un truc : apres des mois d'utilisation, j'etais toujours incapable de tenir une conversation. Je traduisais "le chat est sur la table" en boucle, je collectais des XP, mais je n'apprenais pas vraiment.

Le probleme c'est que ces apps misent tout sur la gamification (streaks, classements, mascottes) au lieu de se concentrer sur ce qui fait vraiment progresser : **pratiquer dans des situations reelles**.

---

## La solution : Lingyou

J'ai decide de creer ma propre plateforme d'apprentissage qui se concentre sur ce qui marche vraiment :

- **Apprendre par des situations reelles** — Commander au resto, passer un entretien, voyager... pas des phrases decontextualisees
- **Parler des le premier jour** — Des exercices de production orale et ecrite, pas juste du QCM passif
- **Un assistant IA pour s'entrainer** — Discuter avec une IA dans des mises en situation realistes (au restaurant, a l'aeroport, en reunion...)
- **La repetition espacee** — Un algorithme scientifique qui calcule le meilleur moment pour reviser chaque mot (le meme principe qu'Anki)
- **Un vrai systeme de progression** — Niveaux A1 a C2 (standard europeen), avec des certifications a la cle

---

## Ce que j'ai construit

### Une plateforme complete

- **7 langues** : Anglais, Espagnol, Allemand, Japonais, Chinois, Russe, Coreen
- **Des parcours structures** avec des chapitres thematiques (Au restaurant, En voyage, Au travail...)
- **9 types d'exercices differents** par lecon : comprehension orale, ecrite, production ecrite, textes a trous, association, remise en ordre, traduction, QCM contextuel, ecriture libre
- **Un chat IA** pour pratiquer la conversation dans des scenarios realistes
- **Des flashcards intelligentes** qui s'adaptent a ton niveau de memorisation
- **Des clubs** pour apprendre en groupe avec des defis et des classements
- **Un espace communautaire** ou les utilisateurs peuvent proposer du contenu
- **Des examens de certification** chronomentres avec generation de certificat
- **Un mode immersion** qui bascule toute l'interface dans la langue cible

### Un modele economique reflechi

L'idee c'est de ne pas mettre de mur artificiel. Les niveaux debutant (A1) et elementaire (A2) sont **100% gratuits et complets**. L'utilisateur progresse, voit que ca marche, et quand il veut passer au niveau superieur (B1+), il passe en premium a 10€/mois. Conversion naturelle, pas de demo bridee.

### Une interface soignee

Design epure et moderne inspire de Notion/Linear. Pas de couleurs flashy ni de mascotte. Des animations subtiles, du glassmorphism, un dark mode. L'app doit plaire autant a un etudiant de 18 ans qu'a une professionnelle de 35 ans.

### Multilingue

L'interface elle-meme est disponible en 5 langues (francais, anglais, chinois, japonais, russe) + 4 langues supplementaires en mode immersion. Plus de 500 cles de traduction par langue.

---

## Les defis techniques

### Securite de l'API IA
L'API OpenAI coute de l'argent a chaque appel. J'ai mis en place un systeme de rate limiting (15 messages/jour en gratuit, illimite en premium) avec Redis, et toutes les cles API sont strictement cote serveur — le client n'a jamais acces aux cles.

### L'algorithme de repetition espacee
J'ai implemente l'algorithme SM-2+ (le meme que celui d'Anki) cote serveur. Il calcule le meilleur moment pour re-montrer chaque flashcard en fonction de la qualite de rappel de l'utilisateur.

### La generation d'exercices
Chaque lecon contient du vocabulaire, et le systeme genere automatiquement 9 types d'exercices a partir de ce vocabulaire. Le contenu est pre-seed dans la base de donnees pour les 7 langues.

### Gestion des paiements
Integration complete de Stripe avec webhooks, idempotence des evenements, codes promo, et gestion des abonnements.

---

## Les chiffres

| | |
|---|---|
| Fichiers source | 170 |
| Routes API | 36 |
| Modeles en base de donnees | 27 |
| Langues supportees | 7 |
| Langues d'interface | 9 |
| Types d'exercices | 9 |
| Examens de certification | 14 |

---

## Stack technique (simplifie)

- **Le site** : Next.js (React) — le framework web le plus utilise en 2025
- **Le design** : Tailwind CSS — du style directement dans le code, rapide et flexible
- **La base de donnees** : PostgreSQL (heberge sur Neon) — pour stocker les utilisateurs, cours, progression...
- **L'IA** : OpenAI GPT-4o-mini — pour les conversations interactives et la correction
- **Les paiements** : Stripe — gestion des abonnements et webhooks
- **L'authentification** : NextAuth.js — connexion par email et Google
- **L'hebergement** : Vercel — deploiement automatique depuis GitHub

---

## Ce que ce projet demontre

- Conception et developpement d'une application full-stack complete
- Architecture logicielle propre (separation des responsabilites, API RESTful, validation des entrees)
- Integration de services externes (IA, paiements, base de donnees, authentification, cache)
- Sens du produit (UX/UI, modele economique, internationalisation)
- Securite (rate limiting, protection des cles API, middleware d'authentification, validation Zod)
- Capacite a mener un projet de A a Z, de l'idee au deploiement en production

---

**Lien vers le projet** : [linguamaster-beta.vercel.app](https://linguamaster-beta.vercel.app)
**Code source** : [github.com/Yukouf/lingora](https://github.com/Yukouf/lingora)
