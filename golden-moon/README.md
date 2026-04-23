# Golden Moon

Site full-stack pour la boutique **Golden Moon** — bijoux, bougies, cristaux et rituels lunaires.

## Stack

- **Backend** : Node.js + Express
- **Base de données** : SQLite (better-sqlite3) — fichier `data.db` auto-créé
- **Frontend** : HTML / CSS / JavaScript vanilla (aucun build, aucune dépendance front)

## Installation

```bash
cd golden-moon
npm install
npm run seed    # insère le catalogue de démo (8 produits)
npm start       # http://localhost:3000
```

Variables d’environnement :

- `PORT` (défaut `3000`)
- `ADMIN_TOKEN` (défaut `goldenmoon-dev`) — jeton d’accès à la page `/admin.html`

## Pages

| URL              | Description                                         |
|------------------|-----------------------------------------------------|
| `/`              | Accueil avec hero, coups de cœur, newsletter         |
| `/shop.html`     | Catalogue filtrable par catégorie + recherche        |
| `/product.html`  | Fiche produit (slug en query string)                 |
| `/cart.html`     | Panier + tunnel de commande                          |
| `/contact.html`  | Formulaire de contact                                |
| `/admin.html`    | Tableau de bord (jeton requis)                       |

## API

```
GET  /api/products?category=&featured=1&q=
GET  /api/products/:slug
GET  /api/categories
POST /api/contact           { name, email, subject, message }
POST /api/newsletter        { email }
POST /api/orders            { customer, email, address, items:[{product_id,quantity}] }
GET  /api/admin/overview    header: x-admin-token
GET  /api/health
```

Les commandes décrémentent automatiquement le stock dans une transaction SQLite.

## Structure

```
golden-moon/
├─ server.js            # Express + routes API
├─ database.js          # schéma SQLite
├─ seed.js              # données de démo
├─ package.json
└─ public/              # front statique servi par Express
   ├─ index.html  shop.html  product.html  cart.html  contact.html  admin.html
   ├─ css/style.css
   ├─ js/common.js
   └─ img/*.svg
```
