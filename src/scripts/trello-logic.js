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

        // NOVIDADE: Chama a verificação de cor logo após soltar!
        verificarCorData(card);
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
