# Viver Catarina

Site em [Astro](https://astro.build) para imóveis na planta em Florianópolis, Santa Catarina.

## Estrutura

```text
/
├── public/assets/              # CSS, JS e imagens do tema
├── src/
│   ├── components/             # Componentes Astro do site
│   ├── content/template-pages/ # Shells HTML usados por algumas páginas
│   ├── data/                   # Imóveis, bairros e lançamentos
│   ├── layouts/PillerLayout.astro
│   └── pages/
└── scripts/                    # Importação de dados e geração de sitemaps
```

## Comandos

| Comando | Ação |
| :------ | :--- |
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor local em `localhost:4321` |
| `npm run build` | Build de produção em `./dist/` |
| `npm run preview` | Pré-visualiza o build |
| `npm run import:properties` | Importa imóveis para `src/data/imoveis/` |
| `npm run generate:lancamentos` | Regenera listagens por tipo |
| `npm run generate:bairros` | Regenera listagens por bairro |
