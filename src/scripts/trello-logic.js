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

            // Lógica Extra: Pintar de vermelho se a data já passou (Atrasado)
            const hoje = new Date().toISOString().split('T')[0];
            if (novaData < hoje) {
                badgeDate.classList.add('atrasado');
            } else {
                badgeDate.classList.remove('atrasado');
            }

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
