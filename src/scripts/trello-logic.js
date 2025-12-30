const apiService = {
    // A URL base do teu backend Java
    baseUrl: "http://localhost:8080/api/cartoes",

    /**
     * 1. Mover Cartão (Drag & Drop)
     */
    async moverCartao(id, novaColuna) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/mover`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coluna: novaColuna })
            });

            if (!response.ok) throw new Error('Falha ao mover no servidor');
            console.log("✅ Movimento salvo no banco!");
        } catch (erro) {
            console.error("❌ Erro ao salvar movimento:", erro);
            alert("Erro de conexão: O cartão pode não ter sido salvo.");
        }
    },

    /**
     * 2. Atualizar Detalhes (Data, Título, Responsável)
     */
    async atualizarCartao(id, dados) {
        // dados é um objeto tipo: { dataEntrega: '2023-12-30', titulo: '...' }
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (!response.ok) throw new Error('Falha ao atualizar');
            console.log("✅ Dados atualizados!");
        } catch (erro) {
            console.error("❌ Erro:", erro);
        }
    },

    /**
     * 3. Criar Novo Cartão
     */
    async criarCartao(titulo, coluna) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: titulo, coluna: coluna })
            });

            if (!response.ok) throw new Error('Falha ao criar');

            // O Java deve devolver o objeto criado com o ID novo
            const novoCartao = await response.json();
            return novoCartao; // Retorna para usarmos no HTML
        } catch (erro) {
            console.error("❌ Erro ao criar:", erro);
            return null;
        }
    },

    /**
     * 4. Listar Todos (NOVO)
     */
    async listarCartoes() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('Erro ao buscar cartões');
            return await response.json(); // Retorna o array de cartões do Java
        } catch (erro) {
            console.error("❌ Erro de conexão:", erro);
            return []; // Retorna lista vazia para não quebrar o layout
        }
    }
};

/**
 * 1. Função Simulada para Abrir o Modal
 * Quando clicas no cartão, passamos o ID e preenchemos o hidden input.
 */
function abrirModal(cardId) {
    // 1. Guarda o ID do cartão no input escondido do modal
    document.getElementById('modal-card-id-hidden').value = cardId;

    // 2. Simulação: Pega o texto atual do cartão para por no modal (se quiseres)
    // Na prática, farias uma chamada ao servidor aqui para buscar os dados reais.

    // 3. Abre o modal (código do teu sistema atual para mostrar a div)
    console.log("Editando o cartão: " + cardId);
}

/**
 * 2. Função auxiliar para formatar a data estilo Trello (ex: "29 Dez")
 */
function formatarDataCurta(dataString) {
    if (!dataString) return "";

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const data = new Date(dataString);

    // Ajuste de fuso horário simples (para evitar que o dia volte 1 dia atrás)
    const dia = data.getUTCDate();
    const mes = meses[data.getUTCMonth()];

    return `${dia} ${mes}`;
}

/**
 * 3. Função Principal: Salvar Alterações
 */
function salvarAlteracoesCard() {
    // A. Recuperar os dados do Modal
    const cardId = document.getElementById('modal-card-id-hidden').value;
    const novaData = document.getElementById('modal-data-entrega').value;

    if (!cardId) {
        alert("Erro: Nenhum cartão selecionado.");
        return;
    }

    // B. Atualizar o Visual do Cartão na Esteira (DOM)
    const cardElement = document.getElementById(cardId);

    if (cardElement) {
        // Encontra (ou cria) o elemento da data dentro do cartão
        let badgeDate = cardElement.querySelector('.badge-date');
        let dateText = cardElement.querySelector('.date-text');

        if (novaData) {
            // Se o utilizador escolheu uma data:
            badgeDate.style.display = 'inline-flex'; // Mostra a etiqueta
            dateText.innerText = formatarDataCurta(novaData); // Muda o texto para "30 Dez"

            // NOVIDADE: Salva a data "crua" no HTML para facilitar as contas
            cardElement.setAttribute('data-prazo', novaData);

            // Chama a verificação
            verificarCorData(cardElement);

        } else {
            // Se o utilizador limpou a data:
            badgeDate.style.display = 'none';
        }
    }

    // C. (Importante) Salvar no Backend
    // Aqui tu farias o fetch/ajax para o teu Java Spring Boot
    console.log(`Salvando no banco: Cartão ${cardId} -> Data ${novaData}`);

    // salvarNoBanco(cardId, novaData); 

    // D. Fechar o Modal
    // fecharModal(); // Chama a tua função de fechar
    alert("Data atualizada no quadro!");
}

/**
 * Verifica o estado do cartão e pinta a data
 * @param {HTMLElement} cardElement - O elemento HTML do cartão inteiro
 */
function verificarCorData(cardElement) {
    // 1. Pega os elementos necessários
    const badgeDate = cardElement.querySelector('.badge-date');
    const dateText = cardElement.querySelector('.date-text').innerText; // Ex: "30 Dez"

    // Se não tiver data visível ou configurada, sai da função
    if (badgeDate.style.display === 'none' || !dateText) return;

    // 2. Descobre em qual coluna o cartão está
    // O .closest procura o pai mais próximo que seja uma coluna
    const colunaPai = cardElement.closest('.column');
    const idColuna = colunaPai ? colunaPai.id : '';

    // 3. Recupera a data real (precisamos ter guardado isso em algum lugar)
    // DICA: O ideal é guardar a data formato ISO num atributo data- do HTML
    // Exemplo no HTML: <div class="card" data-prazo="2023-12-30">
    const dataPrazoString = cardElement.getAttribute('data-prazo');

    if (!dataPrazoString) return; // Segurança

    const dataPrazo = new Date(dataPrazoString);
    // Zerar horas para comparar apenas dias
    dataPrazo.setHours(0, 0, 0, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 4. Limpa as classes antigas para recalcular
    badgeDate.classList.remove('status-concluido', 'status-atrasado', 'status-atencao');

    // --- LÓGICA DE DECISÃO ---

    // CASO A: Está na coluna de concluídos? (Ex: id="done" ou "concluido")
    // Adapta "done" para o ID real da tua coluna de concluídos
    if (idColuna === 'done' || idColuna === 'concluido' || idColuna === 'arquivado' || idColuna === 'aprovado') {
        badgeDate.classList.add('status-concluido');
        badgeDate.title = "Tarefa Concluída";
        return;
    }

    // CASO B: A data já passou? (Atrasado)
    if (dataPrazo < hoje) {
        badgeDate.classList.add('status-atrasado');
        badgeDate.title = "Esta tarefa está atrasada!";
    }
    // CASO C: É para hoje? (Atenção)
    else if (dataPrazo.getTime() === hoje.getTime()) {
        badgeDate.classList.add('status-atencao');
        badgeDate.title = "Entrega hoje!";
    }
}

/**
 * 4. (Exemplo) Função Drop para Drag-and-Drop
 */
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var card = document.getElementById(data);

    // ... código anterior de mover o cartão ...

    // Simula a descoberta da coluna alvo (no código real isso varia)
    var targetColumn = ev.target.closest('.column');

    if (targetColumn && targetColumn.classList.contains('column')) {
        targetColumn.appendChild(card);

        // Atualiza a cor (visual)
        verificarCorData(card);

        // --- INTEGRAÇÃO BACKEND AQUI ---
        // Pega o ID do cartão (ex: "card-123") e remove o prefixo se necessário
        // Pega o ID da nova coluna
        const cardId = card.id ? card.id.replace('card-', '') : '';
        const novaColunaId = targetColumn.id;

        // Chama o serviço para salvar
        if (typeof apiService !== 'undefined') {
            apiService.moverCartao(cardId, novaColunaId);
        }
    }
}

/**
 * 5. Função de Pesquisa (Filtro)
 */
function pesquisarCartoes(textoDigitado) {
    // 1. Converte o que foi digitado para minúsculas
    const termo = textoDigitado.toLowerCase();
    const cartoes = document.querySelectorAll('.card');

    cartoes.forEach(cartao => {
        // 2. Pega TODO o texto dentro do cartão (título, data, etiquetas)
        const conteudoCartao = cartao.innerText.toLowerCase();

        // 3. Verifica se o termo existe dentro do conteúdo
        // Se o termo for vazio (""), mostra tudo
        if (conteudoCartao.includes(termo)) {
            cartao.style.display = 'block';
        } else {
            cartao.style.display = 'none';
        }
    });

    // 4. Se tivermos filtros de botões ativos (ex: "Meus Cartões"), 
    // idealmente deveríamos respeitá-los, mas para simplificar, 
    // a pesquisa sobrepõe os filtros visuais.

    // 5. IMPORTANTE: Recalcular os números no topo das colunas
    // (Reutilizamos a função que criámos no passo anterior)
    if (typeof atualizarContadoresColunas === "function") {
        atualizarContadoresColunas();
    }
}

/**
 * Recebe os dados do cartão (do Java) e cria o elemento HTML visual
 */
function criarElementoVisualCartao(cartaoDados) {
    const novoDiv = document.createElement('div');
    novoDiv.className = 'card';
    novoDiv.id = 'card-' + cartaoDados.id; // Ex: card-15
    novoDiv.draggable = true;

    // Configura os eventos
    novoDiv.ondragstart = drag;
    novoDiv.onclick = function () { abrirModal(this.id); };

    // Guarda dados importantes no HTML para os filtros e cores funcionarem
    novoDiv.setAttribute('data-responsavel', cartaoDados.responsavel || '');
    if (cartaoDados.dataEntrega) {
        novoDiv.setAttribute('data-prazo', cartaoDados.dataEntrega);
    }

    // HTML interno do cartão
    novoDiv.innerHTML = `
        <div class="card-title">${cartaoDados.titulo}</div>
        <div class="card-meta">
            <span class="badge-date" style="display: ${cartaoDados.dataEntrega ? 'inline-flex' : 'none'}">
                🕒 <span class="date-text">${formatarDataCurta(cartaoDados.dataEntrega)}</span>
            </span>
        </div>
    `;

    // Aplica a cor correta da data imediatamente
    verificarCorData(novoDiv);

    return novoDiv;
}

/**
 * 6. Função para Adicionar Cartão com Integração Backend
 */
async function adicionarCartao(btn) {
    let textarea = btn.parentElement.parentElement.querySelector('textarea');
    let titulo = textarea.value;
    let colunaId = btn.closest('.column').id;

    if (titulo.trim()) {
        // Salva no banco
        if (typeof apiService !== 'undefined') {
            const novoCartaoDados = await apiService.criarCartao(titulo, colunaId);

            if (novoCartaoDados) {
                // CRIA O VISUAL USANDO A FÁBRICA (Reutilização de código!)
                const novoElemento = criarElementoVisualCartao(novoCartaoDados);

                // Adiciona na tela
                const cardsContainer = btn.closest('.column').querySelector('.cards-container');
                if (cardsContainer) {
                    cardsContainer.appendChild(novoElemento);
                }

                // Atualiza contadores
                if (typeof atualizarContadoresColunas === "function") {
                    atualizarContadoresColunas();
                }

                // Limpa o input
                textarea.value = '';
                textarea.focus();
            } else {
                alert("Erro ao criar cartão. Tente novamente.");
            }
        } else {
            console.error("apiService ausente.");
        }
    }
}

/**
 * 7. Carregamento Inicial (O Grande Final)
 */
async function carregarQuadroDoBanco() {
    console.log("🔄 Carregando dados do sistema...");

    // 1. Busca os dados no Java
    if (typeof apiService === 'undefined') {
        console.warn("apiService não encontrado. Ignorando carga do backend.");
        return;
    }

    const listaCartoes = await apiService.listarCartoes();

    // 2. Limpa as colunas atuais (para evitar duplicatas se recarregares)
    // Supondo que tens uma lista de IDs das tuas colunas
    const colunasIds = ["nao-iniciado", "em-preenchimento", "enviado", "em-analise", "ajuste-solicitado", "aprovado"];

    colunasIds.forEach(colId => {
        const colunaElement = document.getElementById(colId);
        if (colunaElement) {
            const container = colunaElement.querySelector('.cards-container');
            if (container) container.innerHTML = '';
        }
    });

    // 3. Distribui os cartões nas colunas certas
    listaCartoes.forEach(cartao => {
        // O Java manda: { titulo: "X", coluna: "nao-iniciado", ... }

        // Verifica se a coluna existe no HTML
        const colunaDestino = document.getElementById(cartao.coluna);

        if (colunaDestino) {
            const container = colunaDestino.querySelector('.cards-container') || colunaDestino;

            // Usa a nossa "Fábrica" para criar o visual
            const elementoCartao = criarElementoVisualCartao(cartao);

            container.appendChild(elementoCartao);
        } else {
            console.warn(`⚠️ Cartão ID ${cartao.id} tem coluna desconhecida: "${cartao.coluna}"`);
        }
    });

    // 4. Atualiza os contadores (Total de cartões por coluna)
    if (typeof atualizarContadoresColunas === "function") {
        atualizarContadoresColunas();
    }

    console.log(`✅ ${listaCartoes.length} cartões carregados.`);
}


// --- GATILHO ---
// Isto faz a função rodar automaticamente quando a página termina de carregar
window.addEventListener('DOMContentLoaded', () => {
    carregarQuadroDoBanco();
});
