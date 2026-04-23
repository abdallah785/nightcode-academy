const db = require('./database');

const products = [
  {
    slug: 'collier-lune-doree',
    name: 'Collier Lune Dorée',
    category: 'bijoux',
    price: 89.0,
    image: '/img/lune-doree.svg',
    short_desc: 'Pendentif croissant de lune plaqué or 18 carats.',
    long_desc:
      "Notre collier signature sublime votre tenue avec une lune finement gravée à la main. Plaqué or 18 carats, chaîne ajustable 40 à 50 cm, livré dans un écrin velours brodé.",
    stock: 24,
    featured: 1
  },
  {
    slug: 'bougie-pleine-lune',
    name: 'Bougie Pleine Lune',
    category: 'bougies',
    price: 32.0,
    image: '/img/bougie.svg',
    short_desc: 'Cire de soja, ambre gris et bois de santal. 40h de combustion.',
    long_desc:
      "Une bougie coulée à la main dans le sud de la France. Notes d'ambre, de santal et d'encens pour une ambiance enveloppante. Mèche en coton pur, 220 g.",
    stock: 60,
    featured: 1
  },
  {
    slug: 'quartz-selenite',
    name: 'Baguette Sélénite',
    category: 'cristaux',
    price: 24.0,
    image: '/img/selenite.svg',
    short_desc: 'Pierre de lune brute pour purifier vos autres cristaux.',
    long_desc:
      'La sélénite porte le nom de Séléné, déesse de la lune. Chaque baguette mesure environ 15 cm et arrive avec sa fiche d’usage.',
    stock: 42,
    featured: 0
  },
  {
    slug: 'carte-tirage',
    name: 'Oracle des Phases Lunaires',
    category: 'oracles',
    price: 38.0,
    image: '/img/oracle.svg',
    short_desc: 'Jeu de 44 cartes illustrées avec livret d’interprétation.',
    long_desc:
      "Un oracle doux et poétique illustré par l’artiste Nour Halabi. 44 cartes dorées à chaud, livret de 96 pages en français, boîte rigide aimantée.",
    stock: 18,
    featured: 1
  },
  {
    slug: 'huile-nocturne',
    name: 'Huile Sèche Nocturne',
    category: 'soins',
    price: 46.0,
    image: '/img/huile.svg',
    short_desc: 'Corps et cheveux. Jasmin de nuit, monoï, paillettes d’or.',
    long_desc:
      'Formule 98% d’origine naturelle. Texture sèche qui nourrit sans laisser de film gras. Parfum hypnotique de jasmin sambac et vanille bourbon. 100 ml.',
    stock: 35,
    featured: 0
  },
  {
    slug: 'carnet-rituel',
    name: 'Carnet de Rituel Lunaire',
    category: 'papeterie',
    price: 28.0,
    image: '/img/carnet.svg',
    short_desc: 'Journal guidé 13 lunaisons, reliure dorée.',
    long_desc:
      "192 pages de papier ivoire 100g/m². Suivez chaque nouvelle lune et pleine lune avec des pages d’intention, de gratitude et de tirage.",
    stock: 50,
    featured: 1
  },
  {
    slug: 'boucles-etoiles',
    name: 'Boucles Étoiles Filantes',
    category: 'bijoux',
    price: 64.0,
    image: '/img/boucles.svg',
    short_desc: 'Pendantes, argent 925 finition or, zircons.',
    long_desc:
      'Boucles asymétriques en argent 925 plaqué or 18 carats. Hauteur 4,2 cm. Hypoallergéniques.',
    stock: 20,
    featured: 0
  },
  {
    slug: 'encens-nuit',
    name: 'Encens Nuit d’Été',
    category: 'soins',
    price: 16.0,
    image: '/img/encens.svg',
    short_desc: 'Boîte de 40 bâtons, myrrhe, oud, rose noire.',
    long_desc:
      'Encens roulé à la main en Inde selon une méthode traditionnelle. Sans charbon, combustion lente et parfum raffiné.',
    stock: 80,
    featured: 0
  }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO products
    (slug, name, category, price, image, short_desc, long_desc, stock, featured)
  VALUES (@slug, @name, @category, @price, @image, @short_desc, @long_desc, @stock, @featured)
`);

const tx = db.transaction((rows) => {
  for (const p of rows) insert.run(p);
});

tx(products);

const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
console.log(`Seed terminé. ${count} produits en base.`);
