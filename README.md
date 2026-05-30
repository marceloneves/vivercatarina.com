# Viver Catarina

Site em [Astro](https://astro.build) para imóveis na planta em Santa Catarina, baseado no template Piller (pasta `modelo/`).

## Estrutura

```text
/
├── public/assets/              # CSS, JS, imagens do template
├── src/
│   ├── content/template-pages/ # HTML bruto importado do modelo
│   ├── layouts/
│   │   └── PillerLayout.astro  # Layout principal do template
│   └── pages/                  # Páginas Astro geradas
├── modelo/download-version/    # Template HTML original
└── scripts/import-template-pages.mjs
```

## Homes do template

| Rota | Variante |
| :--- | :------- |
| `/` | Home Real Estate |
| `/home-2` | Home Property |
| `/home-3` | Home Map |
| `/home-4` | Home Luxury |
| `/home-5` | Home Single Property |
| `/home-6` | Real Estate Company |
| `/home-7` | Real Estate Agency |
| `/home-8` | Real Estate Local Agency |
| `/home-9` | Home Single Property (v2) |
| `/home-10` | Modern House Agency |

## Páginas importadas

- `/` — Home Real Estate
- `/about`, `/contact`, `/property`, `/property-details`
- `/agency`, `/agency-details`, `/team`, `/team-details`
- `/blog`, `/blog-details`, `/blog-grid-left-sidebar`, `/blog-grid-right-sidebar`
- `/service`, `/service-details`, `/service-right-sidebar`
- `/shop`, `/shop-details`, `/cart`, `/checkout`, `/wishlist`
- `/gallery`, `/pricing`, `/faq`, `/neighborhood-guide`, `/typography`
- `/404` e `/error` — Página de erro

## Comandos

| Comando | Ação |
| :------ | :--- |
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor local em `localhost:4321` |
| `npm run build` | Build de produção em `./dist/` |
| `npm run preview` | Pré-visualiza o build |
| `npm run import:template` | Reimporta páginas de `modelo/download-version/` |

## Reimportar o template

Se alterar arquivos em `modelo/download-version/`, execute:

```bash
npm run import:template
```

Isso regenera `src/content/template-pages/` e `src/pages/*.astro`.
