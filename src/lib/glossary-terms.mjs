/** @typedef {{ term: string, slug: string, definition: string, websiteUrl?: string, letter?: string }} GlossaryTermEntry */

import { GLOSSARY_INCORPORADORAS } from './glossary-incorporadoras.mjs';

export function getGlossaryGroupingLetter(term) {
	const first = String(term || '').trim().charAt(0);

	if (!first) {
		return '#';
	}

	return first
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleUpperCase('pt-BR');
}

/** @type {Omit<GlossaryTermEntry, 'letter'>[]} */
const CORE_GLOSSARY_TERMS = [
	{
		term: 'Alienação fiduciária',
		slug: 'alienacao-fiduciaria',
		definition:
			'Modalidade de garantia em que o imóvel fica registrado em nome do banco até a quitação do financiamento. É a forma mais comum em contratos habitacionais na planta e difere da hipoteca tradicional.',
	},
	{
		term: 'Alvará de construção',
		slug: 'alvara-de-construcao',
		definition:
			'Licença emitida pela prefeitura que autoriza o início ou continuidade da obra. Empreendimento sem alvará regular não deve comercializar unidades com segurança jurídica plena.',
	},
	{
		term: 'Alteração de planta',
		slug: 'alteracao-de-planta',
		definition:
			'Mudança solicitada pelo comprador na disposição interna da unidade durante a fase de obras, quando a construtora permite personalizações. Pode envolver paredes, pontos elétricos ou acabamentos, dentro dos limites técnicos do projeto.',
	},
	{
		term: 'Apartamento na planta',
		slug: 'apartamento-na-planta',
		definition:
			'Unidade residencial comercializada antes ou durante a construção, com base em projeto arquitetônico e memorial descritivo. O comprador acompanha a evolução da obra até a entrega das chaves.',
	},
	{
		term: 'Área comum',
		slug: 'area-comum',
		definition:
			'Espaços do empreendimento de uso coletivo, como hall, piscina, academia, salão de festas e circulações. Entram no cálculo da metragem comum e do rateio do condomínio.',
	},
	{
		term: 'Área privativa',
		slug: 'area-privativa',
		definition:
			'Metragem que pertence exclusivamente ao apartamento, incluindo ambientes internos e, conforme o memorial, varanda e vagas atribuídas. É a base usual para precificação do imóvel.',
	},
	{
		term: 'Atraso na entrega',
		slug: 'atraso-na-entrega',
		definition:
			'Quando a construtora não entrega o empreendimento na data prevista no contrato. Pode haver prazo de tolerância, multa, indenização ou resolução do contrato, conforme cláusulas e legislação.',
	},
	{
		term: 'Assinatura do contrato',
		slug: 'assinatura-do-contrato',
		definition:
			'Momento em que comprador e vendedor formalizam a negociação em contrato de promessa ou compra e venda. A partir daí passam a valer prazos, valores, condições de pagamento e penalidades previstas.',
	},
	{
		term: 'Ato de investimento',
		slug: 'ato-de-investimento',
		definition:
			'Parcela inicial paga no ato da compra, também chamada de sinal ou entrada. Confirma a reserva da unidade e costuma ser descontada do valor total do imóvel.',
	},
	{
		term: 'Book digital do empreendimento',
		slug: 'book-digital-do-empreendimento',
		definition:
			'Repositório online obrigatório com documentos do empreendimento em incorporação: memorial, plantas, cronograma, evolução de obra e alterações. Deve ser acessível ao comprador durante toda a comercialização e execução da obra.',
	},
	{
		term: 'Box de depósito',
		slug: 'box-de-deposito',
		definition:
			'Espaço auxiliar vinculado ao apartamento para guardar objetos. Pode ser negociado junto com a unidade e aparece no contrato com metragem e número próprios.',
	},
	{
		term: 'Carta de crédito',
		slug: 'carta-de-credito',
		definition:
			'Documento emitido pelo banco com valor e prazo pré-aprovados para financiamento imobiliário. Ajuda o comprador a saber quanto pode pagar antes de reservar unidade na planta.',
	},
	{
		term: 'Carência de parcelas',
		slug: 'carencia-de-parcelas',
		definition:
			'Período acordado em que o comprador paga apenas parte das parcelas ou fica isento de pagamento até determinada fase da obra ou até a entrega das chaves.',
	},
	{
		term: 'Chaves na mão',
		slug: 'chaves-na-mao',
		definition:
			'Modalidade de pagamento em que o saldo principal só é quitado na entrega do imóvel pronto. É comum em empreendimentos na planta com parcelamento direto com a construtora.',
	},
	{
		term: 'Convenção de condomínio',
		slug: 'convencao-de-condominio',
		definition:
			'Documento que rege a administração, uso das áreas comuns e direitos de cada unidade após a entrega do edifício. Complementa a instituição de condomínio e orienta regras de convivência e assembleias.',
	},
	{
		term: 'Correção monetária',
		slug: 'correcao-monetaria',
		definition:
			'Atualização do valor das parcelas conforme índice contratual, como INCC, IPCA ou IGP-M. Em imóveis na planta, impacta o saldo devedor entre a assinatura e a entrega das chaves.',
	},
	{
		term: 'Comissão de corretagem',
		slug: 'comissao-de-corretagem',
		definition:
			'Remuneração paga ao corretor ou imobiliária pela intermediação da venda. Deve estar informada no contrato ou em documento apartado, conforme regras do CRECI.',
	},
	{
		term: 'Condomínio estimado',
		slug: 'condominio-estimado',
		definition:
			'Valor previsto da taxa mensal de condomínio antes da entrega do prédio. Serve de referência para o comprador calcular o custo total de moradia após as chaves.',
	},
	{
		term: 'Contrato de promessa de compra e venda',
		slug: 'contrato-de-promessa-de-compra-e-venda',
		definition:
			'Documento que formaliza a intenção de compra de um imóvel na planta, com preço, prazos e condições. Antecede, em muitos casos, a escritura ou o contrato definitivo após a conclusão da obra.',
	},
	{
		term: 'Corretor credenciado',
		slug: 'corretor-credenciado',
		definition:
			'Profissional autorizado pela construtora ou incorporadora a comercializar unidades do empreendimento. Deve estar registrado no CRECI e identificado nos materiais de venda.',
	},
	{
		term: 'Cronograma de obras',
		slug: 'cronograma-de-obras',
		definition:
			'Planejamento com etapas e prazos da construção, da fundação até o acabamento. É referência para previsão de entrega e acompanhamento do avanço físico da obra.',
	},
	{
		term: 'Distrato',
		slug: 'distrato',
		definition:
			'Cancelamento do contrato de compra antes da conclusão do negócio. Pode gerar multa, retenção de valores ou devolução parcial, conforme cláusulas contratuais e legislação aplicável.',
	},
	{
		term: 'Entrega das chaves',
		slug: 'entrega-das-chaves',
		definition:
			'Data em que a construtora disponibiliza a unidade ao comprador após conclusão da obra e regularização necessária. Marca o início da posse e, em geral, das responsabilidades de condomínio e IPTU.',
	},
	{
		term: 'Escritura pública',
		slug: 'escritura-publica',
		definition:
			'Documento lavrado em cartório que registra a transferência definitiva de propriedade. Em imóveis na planta, muitas vezes ocorre após o habite-se e quitação das condições contratuais.',
	},
	{
		term: 'Evolução de obra',
		slug: 'evolucao-de-obra',
		definition:
			'Percentual concluído da construção em determinado período. Incorporadoras costumam publicar relatórios periódicos para dar transparência ao comprador sobre o andamento do empreendimento.',
	},
	{
		term: 'FGTS',
		slug: 'fgts',
		definition:
			'Fundo de Garantia do Tempo de Serviço. Pode ser usado na compra de imóvel residencial, inclusive na planta, desde que atendidos os requisitos da Caixa e do programa habitacional aplicável.',
	},
	{
		term: 'Financiamento imobiliário',
		slug: 'financiamento-imobiliario',
		definition:
			'Crédito bancário para pagamento do imóvel, com garantia hipotecária ou alienação fiduciária. Pode ser contratado na planta, muitas vezes com liberação de parcelas conforme evolução da obra.',
	},
	{
		term: 'Fração ideal',
		slug: 'fracao-ideal',
		definition:
			'Percentual do terreno e das áreas comuns que corresponde a cada unidade no condomínio. Define a participação do proprietário em despesas coletivas e em decisões assembleares.',
	},
	{
		term: 'Garden, cobertura e duplex',
		slug: 'garden-cobertura-duplex',
		definition:
			'Tipologias especiais comuns em lançamentos: garden (térreo com área externa), cobertura (último pavimento, muitas vezes com terraço) e duplex (dois pavimentos internos). Costumam ter preço e metragem acima do padrão do andar.',
	},
	{
		term: 'Garantia de conclusão da obra',
		slug: 'garantia-de-conclusao-da-obra',
		definition:
			'Mecanismo legal que protege o comprador caso a incorporadora não conclua o empreendimento. Pode envolver seguro, patrimônio de afetação ou outras garantias previstas na incorporação.',
	},
	{
		term: 'Habite-se',
		slug: 'habite-se',
		definition:
			'Documento emitido pela prefeitura que autoriza a ocupação do edifício após verificação de conformidade com o projeto aprovado. É requisito para moradia, financiamento final e registro em muitos casos.',
	},
	{
		term: 'INCC (Índice Nacional de Custo da Construção)',
		slug: 'incc',
		definition:
			'Índice que mede a variação de custos da construção civil no Brasil. É o reajuste mais usado em parcelas de imóveis na planta pagos diretamente à incorporadora durante a obra.',
	},
	{
		term: 'Incorporação imobiliária',
		slug: 'incorporacao-imobiliaria',
		definition:
			'Processo legal pelo qual a incorporadora transforma um terreno em unidades autônomas para venda. Envolve registro do empreendimento, memorial de incorporação e acompanhamento até a entrega.',
	},
	{
		term: 'Incorporadora',
		slug: 'incorporadora',
		definition:
			'Empresa responsável pelo empreendimento imobiliário, desde o registro da incorporação até a comercialização e entrega. Pode contratar construtoras para executar a obra.',
	},
	{
		term: 'Instituição de condomínio',
		slug: 'instituicao-de-condominio',
		definition:
			'Documento que define a divisão do edifício em unidades autônomas e áreas comuns. Base para a convenção de condomínio e para o registro individual de cada apartamento.',
	},
	{
		term: 'ITBI (Imposto sobre Transmissão de Bens Imóveis)',
		slug: 'itbi',
		definition:
			'Imposto municipal pago na transferência de propriedade do imóvel, calculado sobre o valor venal ou de negociação. Entra no custo total na hora do registro, após habite-se e quitação contratual.',
	},
	{
		term: 'IPTU',
		slug: 'iptu',
		definition:
			'Imposto Predial e Territorial Urbano, administrado pela Prefeitura de Florianópolis (PMF). Durante a obra, a responsabilidade pelo pagamento deve constar no contrato; após a entrega, passa a ser do proprietário da unidade.',
	},
	{
		term: 'Lançamento imobiliário',
		slug: 'lancamento-imobiliario',
		definition:
			'Empreendimento recém-colocado no mercado para venda, geralmente na planta ou em fase inicial de obras. Costuma ter condições comerciais diferenciadas para os primeiros compradores.',
	},
	{
		term: 'Lei do Distrato',
		slug: 'lei-do-distrato',
		definition:
			'Conjunto de regras que disciplina o desfazimento de contratos de compra de imóvel em incorporação. Estabelece prazos, percentuais de retenção e direitos do consumidor em caso de desistência.',
	},
	{
		term: 'Memorial descritivo',
		slug: 'memorial-descritivo',
		definition:
			'Documento que detalha materiais, acabamentos, equipamentos e padrão de entrega de cada unidade e área comum. Deve ser lido junto com a planta baixa antes de assinar o contrato na planta.',
	},
	{
		term: 'Memorial de incorporação',
		slug: 'memorial-de-incorporacao',
		definition:
			'Documento técnico e jurídico registrado no cartório que descreve o empreendimento, prazos, especificações, garantias e condições de venda. Deve ser consultado antes da assinatura do contrato.',
	},
	{
		term: 'Metragem comum',
		slug: 'metragem-comum',
		definition:
			'Parte proporcional das áreas compartilhadas do edifício atribuída a cada unidade. Entra no cálculo da área total contratada e influencia o valor do condomínio.',
	},
	{
		term: 'Minha Casa Minha Vida',
		slug: 'minha-casa-minha-vida',
		definition:
			'Programa habitacional federal que oferece subsídios e condições especiais de financiamento. Alguns empreendimentos na planta são enquadrados em faixas do programa.',
	},
	{
		term: 'Patrimônio de afetação',
		slug: 'patrimonio-de-afetacao',
		definition:
			'Separação legal do empreendimento do patrimônio da incorporadora. Protege compradores, pois receitas e bens da obra ficam vinculados à conclusão do projeto.',
	},
	{
		term: 'Planta baixa',
		slug: 'planta-baixa',
		definition:
			'Desenho técnico que mostra a disposição dos cômodos, medidas e circulação da unidade. Deve ser comparada com o memorial descritivo antes da compra na planta.',
	},
	{
		term: 'Posição solar',
		slug: 'posicao-solar',
		definition:
			'Orientação do apartamento em relação ao sol, influenciando iluminação, ventilação e conforto térmico. Fator relevante na escolha da unidade ainda na fase de vendas.',
	},
	{
		term: 'Pré-lançamento',
		slug: 'pre-lancamento',
		definition:
			'Fase anterior ao lançamento oficial, com divulgação restrita e condições especiais para grupos seleccionados ou lista de interessados. Precede a abertura ampla das vendas.',
	},
	{
		term: 'Price (Tabela Price)',
		slug: 'tabela-price',
		definition:
			'Sistema de amortização de financiamento com parcelas inicialmente mais altas e composição gradual entre juros e principal. Comum em contratos bancários de imóvel na planta.',
	},
	{
		term: 'Repasse bancário',
		slug: 'repasse-bancario',
		definition:
			'Liberação do crédito imobiliário pelo banco conforme o avanço da obra. Cada repasse depende de vistoria do engenheiro e percentual mínimo de conclusão previsto no contrato de financiamento.',
	},
	{
		term: 'Reserva de unidade',
		slug: 'reserva-de-unidade',
		definition:
			'Etapa inicial da compra em que o comprador sinaliza interesse e bloqueia temporariamente a unidade. Antecede a proposta formal e a assinatura do contrato de promessa de compra e venda.',
	},
	{
		term: 'Registro de incorporação',
		slug: 'registro-de-incorporacao',
		definition:
			'Ato de registrar o empreendimento no cartório de registro de imóveis (RI). Confere publicidade e segurança jurídica às informações divulgadas aos compradores.',
	},
	{
		term: 'Registro do imóvel',
		slug: 'registro-do-imovel',
		definition:
			'Averbação da unidade no cartório de registro de imóveis em nome do comprador. Formaliza a propriedade após cumprimento das exigências legais e contratuais.',
	},
	{
		term: 'SAC (Serviço de Atendimento ao Cliente)',
		slug: 'sac-incorporadora',
		definition:
			'Canal oficial da incorporadora para dúvidas, solicitações e reclamações do comprador durante a obra e após a entrega. Deve constar no contrato e no material do empreendimento.',
	},
	{
		term: 'Saldo devedor',
		slug: 'saldo-devedor',
		definition:
			'Valor que ainda falta pagar pelo imóvel, seja para a construtora ou para o banco financiador. Deve ser acompanhado conforme parcelas e reajustes contratuais.',
	},
	{
		term: 'SFH (Sistema Financeiro de Habitação)',
		slug: 'sfh',
		definition:
			'Conjunto de regras e recursos para financiamento de imóveis residenciais. Define limites de taxa, prazo, seguros e uso de FGTS em operações habitacionais.',
	},
	{
		term: 'SPE (Sociedade de Propósito Específico)',
		slug: 'spe',
		definition:
			'Empresa criada exclusivamente para um empreendimento imobiliário, separando legalmente o projeto do patrimônio da incorporadora. Facilita a gestão financeira da obra, a captação de recursos e a proteção dos compradores na planta.',
	},
	{
		term: 'Stand de vendas',
		slug: 'stand-de-vendas',
		definition:
			'Espaço montado pela incorporadora para apresentar maquetes, plantas, acabamentos e condições comerciais do empreendimento na planta ao público comprador.',
	},
	{
		term: 'Taxa de evolução de obra',
		slug: 'taxa-de-evolucao-de-obra',
		definition:
			'Valor cobrado mensalmente durante a construção para acompanhar o avanço físico da obra. Deve estar previsto no contrato, com regras claras de início e fim.',
	},
	{
		term: 'Tipologia',
		slug: 'tipologia',
		definition:
			'Configuração da unidade conforme número de dormitórios, banheiros, vagas e metragem. Exemplos: studio, dois dormitórios, garden e cobertura.',
	},
	{
		term: 'Unidade autônoma',
		slug: 'unidade-autonoma',
		definition:
			'Apartamento ou sala com entrada própria e uso independente dentro do condomínio. É o objeto da compra na planta e recebe matrícula individual após registro.',
	},
	{
		term: 'Vaga de garagem',
		slug: 'vaga-de-garagem',
		definition:
			'Espaço destinado ao estacionamento vinculado ao apartamento. Pode ser determinada, indeterminada, coberta ou descoberta, com regras descritas no memorial e no contrato.',
	},
	{
		term: 'Vícios construtivos',
		slug: 'vicios-construtivos',
		definition:
			'Defeitos ou falhas na unidade entregue, como infiltrações, rachaduras ou acabamento divergente do contrato. A lei prevê prazos de reclamação e garantias distintas para vícios aparentes e de estrutura.',
	},
	{
		term: 'Vistoria de entrega',
		slug: 'vistoria-de-entrega',
		definition:
			'Inspeção feita pelo comprador na unidade antes ou no ato das chaves. Serve para registrar pendências, comparar acabamentos com o memorial descritivo e solicitar correções à construtora.',
	},
	{
		term: 'Valor de tabela',
		slug: 'valor-de-tabela',
		definition:
			'Preço oficial de cada unidade divulgado pela incorporadora em tabela comercial. Serve de base para negociação, comissões e condições de pagamento.',
	},
	{
		term: 'Valorização imobiliária',
		slug: 'valorizacao-imobiliaria',
		definition:
			'Aumento do valor do imóvel ao longo do tempo, influenciado por localização, fase da obra, mercado e entrega da infraestrutura do bairro. Motivo comum de compra na planta.',
	},
	{
		term: 'Continente x Ilha',
		slug: 'continente-x-ilha',
		definition:
			'Divisão geográfica e de mercado de Florianópolis. A Ilha concentra boa parte dos bairros nobres, universitários e litorâneos; o Continente oferece acesso rodoviário, preços distintos e dinâmica própria de bairros como Estreito, Capoeiras e Coqueiros.',
	},
	{
		term: 'Beira-Mar Norte',
		slug: 'beira-mar-norte',
		definition:
			'Corredor urbano à beira da Baía Norte, entre Coqueiros e a região da Agronômica. É referência de valorização, mobilidade e qualidade de vida na Ilha, com forte demanda residencial e comercial.',
	},
	{
		term: 'Região universitária',
		slug: 'regiao-universitaria',
		definition:
			'Entorno da UFSC e do campus da Trindade, incluindo bairros como Trindade, Carvoeira e Córrego Grande. Mercado aquecido por estudantes, professores e investidores de locação.',
	},
	{
		term: 'Zoneamento urbano da Ilha',
		slug: 'zoneamento-urbano-da-ilha',
		definition:
			'Regras da Prefeitura de Florianópolis que limitam altura, densidade e uso do solo em bairros da Ilha. Impactam diretamente quantos pavimentos, unidades e vagas um empreendimento na planta pode ter.',
	},
	{
		term: 'Sazonalidade turística',
		slug: 'sazonalidade-turistica',
		definition:
			'Variação de demanda e preços de locação conforme a estação, comum em bairros litorâneos de Florianópolis. No verão, a procura por imóveis de curta temporada tende a subir.',
	},
	{
		term: 'Bairros em expansão',
		slug: 'bairros-em-expansao',
		definition:
			'Regiões de Florianópolis com obras de infraestrutura, novos acessos e entrada de incorporadoras. Costumam oferecer condições comerciais atrativas na planta e potencial de valorização conforme o bairro amadurece.',
	},
	{
		term: 'Grande Florianópolis',
		slug: 'grande-florianopolis',
		definition:
			'Conurbação formada por Florianópolis e municípios vizinhos, como São José e Palhoça. Compradores comparam opções na Ilha com empreendimentos no entorno metropolitano.',
	},
	{
		term: 'Mobilidade ilha–continente',
		slug: 'mobilidade-ilha-continente',
		definition:
			'Deslocamento entre a Ilha e o Continente pelas pontes (Hercílio Luz, Colombo Salles, Pedro Ivo) e corredores viários. Horários de pico influenciam escolha de bairro na compra na planta.',
	},
	{
		term: 'Padrão compacto (studios e 1 dormitório)',
		slug: 'padrao-compacto-studios',
		definition:
			'Tipologias menores, comuns em Florianópolis em bairros centrais e universitários. Atendem investidores, singles e casal sem filhos, com ticket de entrada mais baixo na planta.',
	},
	{
		term: 'Mercado de locação estudantil',
		slug: 'mercado-locacao-estudantil',
		definition:
			'Segmento de aluguel voltado ao público da UFSC, UDESC e demais instituições. Alta rotatividade e demanda constante em bairros próximos aos campi.',
	},
	{
		term: 'Litoral norte da Ilha',
		slug: 'litoral-norte-da-ilha',
		definition:
			'Faixa costeira que inclui Ingleses, Canasvieiras, Jurerê, Ponta das Canas e Cachoeira do Bom Jesus. Mercado misto de moradia, segunda residência e investimento em locação.',
	},
	{
		term: 'Entorno da Lagoa da Conceição',
		slug: 'entorno-lagoa-da-conceicao',
		definition:
			'Região em torno da Lagoa da Conceição, incluindo Barra da Lagoa, Lagoa da Conceição e Morro das Pedras. Perfil de compradores que valorizam natureza, esporte e vida noturna.',
	},
	{
		term: 'Registro de Imóveis de Florianópolis',
		slug: 'registro-de-imoveis-florianopolis',
		definition:
			'Cartórios responsáveis pela matrícula e registro das unidades na capital (1º e 2º RI de Florianópolis). Após habite-se e quitação, a unidade comprada na planta é registrada em nome do comprador.',
	},
	{
		term: 'Outorga onerosa do direito de construir',
		slug: 'outorga-onerosa-florianopolis',
		definition:
			'Pagamento à Prefeitura quando o empreendimento usa potencial construtivo acima do básico permitido no zoneamento. Pode entrar no custo do projeto e impactar preço final na planta.',
	},
];

/** @type {GlossaryTermEntry[]} */
export const GLOSSARY_TERMS = [...CORE_GLOSSARY_TERMS, ...GLOSSARY_INCORPORADORAS].map((entry) => ({
	...entry,
	letter: getGlossaryGroupingLetter(entry.term),
}));

export function getGlossaryTerms() {
	return GLOSSARY_TERMS;
}

export function getGlossaryLetters() {
	return [...new Set(GLOSSARY_TERMS.map(({ letter }) => letter))].sort((a, b) =>
		a.localeCompare(b, 'pt-BR'),
	);
}

export function groupGlossaryTermsByLetter() {
	return getGlossaryLetters().map((letter) => ({
		letter,
		terms: GLOSSARY_TERMS.filter((term) => term.letter === letter).sort((a, b) =>
			a.term.localeCompare(b.term, 'pt-BR'),
		),
	}));
}
