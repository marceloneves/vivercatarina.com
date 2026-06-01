/** @typedef {{ term: string, slug: string, definition: string }} BlogLancamentosTerm */

/** @typedef {{ id: string, title: string, terms: BlogLancamentosTerm[] }} BlogLancamentosTermGroup */

/** @type {BlogLancamentosTermGroup[]} */
const BLOG_LANCAMENTOS_SC_GROUPS = [
	{
		id: 'mercado-catarinense',
		title: 'Mercado de lançamentos em Santa Catarina',
		terms: [
			{
				term: 'Lançamento imobiliário em SC',
				slug: 'lancamento-imobiliario-em-sc',
				definition:
					'Empreendimento novo comercializado por incorporadora com registro de incorporação no Cartório de Registro de Imóveis. Em Santa Catarina, o mercado se concentra nas 25 maiores cidades — do litoral (Florianópolis, Balneário Camboriú, Itajaí) ao interior produtivo (Joinville, Chapecó, Criciúma) — com perfis distintos de demanda, preço do m² e ritmo de obra.',
			},
			{
				term: 'Portal por cidade (subdomínio)',
				slug: 'portal-por-cidade',
				definition:
					'Modelo de cobertura em que cada município catarinense tem vitrine própria de lançamentos (ex.: joinville.vivercatarina.com, blumenau.vivercatarina.com). Ajuda o comprador a comparar empreendimentos no contexto local — infraestrutura, bairros, construtoras e faixa de preço daquela cidade.',
			},
			{
				term: 'Curva de lançamentos no litoral catarinense',
				slug: 'curva-lancamentos-litoral',
				definition:
					'O litoral de SC combina moradia permanente, segunda residência e investimento turístico. Cidades como Florianópolis, Balneário Camboriú e Itapema têm forte verticalização e sazonalidade de locação; o comprador deve avaliar vacância, condomínio e restrições de altura antes de fechar na planta.',
			},
			{
				term: 'Interior industrial e de serviços',
				slug: 'interior-industrial-sc',
				definition:
					'Joinville, Jaraguá do Sul e Blumenau puxam lançamentos compactos e médio padrão ligados a emprego e qualidade de vida. O custo por m² costuma ser menor que no litoral, com entregas mais previsíveis e menor dependência de turismo.',
			},
		],
	},
	{
		id: 'regioes',
		title: 'Regiões e especificidades locais',
		terms: [
			{
				term: 'Grande Florianópolis',
				slug: 'grande-florianopolis',
				definition:
					'Região metropolitana que inclui Florianópolis, São José, Palhoça e Biguaçu. A Ilha de Santa Catarina tem restrições de ocupação, trânsito nas pontes e Imposto de Marinha em faixas costeiras; o Continente oferece melhor custo-benefício e acesso rodoviário para quem trabalha na região.',
			},
			{
				term: 'Vale do Itajaí',
				slug: 'vale-do-itajai',
				definition:
					'Eixo Blumenau–Itajaí–Balneário Camboriú concentra um dos mercados mais dinâmicos do país, com torres de alto padrão, forte fluxo de investidores e regras municipais rígidas de gabarito. Termos de entrega e memorial descritivo merecem leitura atenta por cidade.',
			},
			{
				term: 'Norte Catarinense',
				slug: 'norte-catarinense',
				definition:
					'Joinville e Jaraguá do Sul lideram volume de lançamentos voltados a famílias e profissionais. Navegantes e São Bento do Sul completam a oferta com empreendimentos próximos a indústria e porto, com preços geralmente abaixo do litoral sul catarinense.',
			},
			{
				term: 'Sul Catarinense',
				slug: 'sul-catarinense',
				definition:
					'Criciúma, Tubarão, Araranguá e Içara têm mercado sustentado por indústria, universidades e comércio regional. Lançamentos costumam ter boa relação metragem/preço e menor especulação turística que o litoral norte do estado.',
			},
			{
				term: 'Oeste e Serra catarinenses',
				slug: 'oeste-e-serra',
				definition:
					'Chapecó e Concórdia respondem ao agronegócio e comércio fronteiriço; Lages e Caçador atendem o planalto serrano. O perfil é predominantemente residencial de médio padrão, com obras menos pressionadas por temporada e maior foco em moradia efetiva.',
			},
		],
	},
	{
		id: 'fases-empreendimento',
		title: 'Fases e tipos de empreendimento',
		terms: [
			{
				term: 'Pré-lançamento em SC',
				slug: 'pre-lancamento-sc',
				definition:
					'Fase em que a incorporadora reserva unidades antes da publicidade ampla, muitas vezes com tabela inicial e condições de pagamento durante a obra. Exige checagem de registro de incorporação e reputação da construtora — prática comum em cidades em expansão do litoral e do Vale do Itajaí.',
			},
			{
				term: 'Apartamento na planta',
				slug: 'apartamento-na-planta-sc',
				definition:
					'Unidade vendida com base em projeto, perspectivas e memorial descritivo, antes ou durante a construção. No estado, é a forma dominante em condomínios verticais nas capitais regionais e no litoral; o comprador acompanha cronograma e book digital do empreendimento.',
			},
			{
				term: 'Loteamento e condomínio horizontal',
				slug: 'loteamento-sc',
				definition:
					'Empreendimento de lotes urbanizados ou casas em condomínio fechado, frequente no Continente de Florianópolis, no sul do estado e em cidades médias. Avalie infraestrutura prometida (asfalto, água, esgoto), prazo de entrega e registro do loteamento na prefeitura.',
			},
			{
				term: 'Pronto para morar',
				slug: 'pronto-para-morar-sc',
				definition:
					'Unidade com obra concluída ou em estágio avançado com habite-se emitido. Atende quem precisa de entrega rápida em SC — por mudança de emprego, fim de locação ou investimento com locação imediata — com preço geralmente acima da planta.',
			},
		],
	},
	{
		id: 'legal-registro',
		title: 'Marco legal e registro em Santa Catarina',
		terms: [
			{
				term: 'Incorporação imobiliária',
				slug: 'incorporacao-imobiliaria-sc',
				definition:
					'Instituto da Lei nº 4.591/64 que permite vender unidades em construção mediante registro do empreendimento, memorial de incorporação e contrato padrão. Em SC, o comprador deve confirmar matrícula do terreno, patrimônio de afetação e publicidade alinhada ao registro no cartório da comarca.',
			},
			{
				term: 'Patrimônio de afetação',
				slug: 'patrimonio-de-afetacao-sc',
				definition:
					'Separação jurídica do terreno e das unidades em incorporação do restante do patrimônio da construtora, protegendo o comprador em caso de falência. É requisito central para segurança em lançamentos de médio e grande porte nas capitais catarinenses.',
			},
			{
				term: 'Book digital do empreendimento',
				slug: 'book-digital-sc',
				definition:
					'Repositório online obrigatório com documentos do empreendimento: memorial, plantas, cronograma, alterações e evolução da obra. Incorporadoras catarinenses devem mantê-lo atualizado durante toda a comercialização — ferramenta essencial para auditoria antes da assinatura.',
			},
			{
				term: 'CRECI-SC e corretor credenciado',
				slug: 'creci-sc',
				definition:
					'Conselho Regional de Corretores de Imóveis de Santa Catarina fiscaliza o exercício da profissão no estado. Em lançamentos, o atendimento deve ser feito por corretor com registro ativo no CRECI-SC, conforme divulgação do portal e das incorporadoras parceiras.',
			},
			{
				term: 'Habite-se municipal',
				slug: 'habite-se-sc',
				definition:
					'Certificado da prefeitura que atesta condições de habitabilidade após conclusão da obra. Sem habite-se, não há registro definitivo da unidade nem financiamento habitacional pleno. Prazos variam entre municípios — Florianópolis, Joinville e Balneário Camboriú têm fluxos próprios de vistoria.',
			},
		],
	},
	{
		id: 'custos-tributos',
		title: 'Custos, impostos e particularidades catarinenses',
		terms: [
			{
				term: 'Outorga onerosa (Florianópolis e Ilha)',
				slug: 'outorga-onerosa',
				definition:
					'Contrapartida paga ao município pelo direito de construir acima do coeficiente básico ou em zonas específicas. É custo relevante em empreendimentos na Ilha de Santa Catarina e impacta preço final e viabilidade do projeto — deve constar ou estar refletida no memorial e no contrato.',
			},
			{
				term: 'Imposto de Marinha',
				slug: 'imposto-de-marinha',
				definition:
					'Tributo federal sobre imóveis em faixa de marinha (até 33 m da linha de preamar média, conforme enquadramento). Comum em condomínios litorâneos de Florianópolis, Balneário Camboriú, Itajaí e outras cidades costeiras de SC; exige certidão e pode afetar financiamento e custo mensal.',
			},
			{
				term: 'IPTU e condomínio no litoral',
				slug: 'iptu-condominio-litoral',
				definition:
					'Além do IPTU municipal, condomínios de alto padrão no litoral catarinense podem ter taxas elevadas (piscina, portaria 24h, spa). Na planta, o memorial indica previsão de condomínio; compare com renda de locação sazonal se o objetivo for investimento.',
			},
			{
				term: 'Correção monetária (INCC e índices contratuais)',
				slug: 'correcao-monetaria-sc',
				definition:
					'Parcelas da obra costumam ser corrigidas por índice da construção civil (INCC é referência frequente). Em mercados aquecidos do Vale do Itajaí e da Grande Florianópolis, entender o índice contratual evita surpresa no saldo durante a obra.',
			},
		],
	},
	{
		id: 'financiamento-contrato',
		title: 'Financiamento e contrato na compra na planta',
		terms: [
			{
				term: 'Contrato de promessa de compra e venda',
				slug: 'promessa-compra-venda-sc',
				definition:
					'Documento que formaliza a reserva da unidade, preço, cronograma de pagamento, multas e prazo de entrega. Em SC, deve estar alinhado ao memorial de incorporação registrado; leia cláusulas de tolerância de atraso, distrato e atualização de valores.',
			},
			{
				term: 'Entrada e parcelas durante a obra',
				slug: 'entrada-parcelas-obra',
				definition:
					'Modelo típico em lançamentos catarinenses: ato + parcelas mensais até as chaves, com possível saldo financiado após habite-se. Avalie fluxo de caixa e impacto da correção monetária no total pago.',
			},
			{
				term: 'FGTS e financiamento habitacional',
				slug: 'fgts-financiamento-sc',
				definition:
					'Uso do FGTS e enquadramento no SFH dependem de documentação do empreendimento, habite-se e renda. Bancos avaliam obras em SC com critérios próprios por região; após estágio avançado da obra, simule condições com corretor e instituição financeira.',
			},
			{
				term: 'Vistoria e entrega das chaves',
				slug: 'vistoria-entrega-chaves',
				definition:
					'Inspeção da unidade ao receber: acabamentos, hidráulica, elétrica e itens do memorial. Em SC, a lista de pendências (snags) deve ser formalizada; só após regularização e registro é que a unidade passa a condomínio definitivo do comprador.',
			},
		],
	},
];

export function getBlogLancamentosScTermGroups() {
	return BLOG_LANCAMENTOS_SC_GROUPS;
}

export function getBlogLancamentosScTermsFlat() {
	return BLOG_LANCAMENTOS_SC_GROUPS.flatMap((group) =>
		group.terms.map((term) => ({ ...term, groupId: group.id, groupTitle: group.title })),
	);
}

export function buildBlogLancamentosScDefinedTermSet(siteUrl, description) {
	return {
		'@context': 'https://schema.org',
		'@type': 'DefinedTermSet',
		name: 'Termos de lançamentos imobiliários em Santa Catarina',
		description,
		url: `${siteUrl}/blog`,
		hasDefinedTerm: getBlogLancamentosScTermsFlat().map(({ term, slug, definition }) => ({
			'@type': 'DefinedTerm',
			name: term,
			description: definition,
			url: `${siteUrl}/blog#${slug}`,
		})),
	};
}
