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
