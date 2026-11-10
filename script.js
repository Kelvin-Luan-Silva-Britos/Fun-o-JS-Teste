// 1. Referências dos elementos do HTML
const campoTexto = document.getElementById('elementos');
const botaoSortear = document.getElementById('btn-sortear');
const campoResultado = document.getElementById('resultado');
const qtdGanhadoresInput = document.getElementById('qtd-ganhadores');
const chkAnimacao = document.getElementById('chk-animacao');
const somSorteio = document.getElementById('som-sorteio');
const btnLimpar = document.getElementById('btn-limpar');
const contadorParticipantes = document.getElementById('contador-participantes').querySelector('strong');

const modal = document.getElementById('modal-resultado');
const nomeGanhadorModal = document.getElementById('nome-ganhador');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const overlayContagem = document.getElementById('overlay-contagem');
const numeroContagem = document.getElementById('numero-contagem');
// Adicione junto com as outras referências do topo do script.js
const textoCodigoSorteio = modal.querySelector('.codigo-sorteio');


// 2. Função para contar participantes em tempo real
function atualizarContador() {
    const texto = campoTexto.value.trim();
    if (texto === "") {
        contadorParticipantes.textContent = "0";
        return;
    }
    // Aqui criamos 'linhas':
    const linhas = texto.split('\n').map(nome => nome.trim()).filter(nome => nome !== "");
    
    // CORREÇÃO AQUI: Mudado de 'lines.length' para 'linhas.length'
    contadorParticipantes.textContent = linhas.length; 
}

campoTexto.addEventListener('input', atualizarContador);

// 3. Ação do Botão Limpar
btnLimpar.addEventListener('click', () => {
    campoTexto.value = "";
    campoResultado.textContent = "";
    contadorParticipantes.textContent = "0";
    campoTexto.focus();
});

// 4. Lógica do Botão Sortear com Contagem Regressiva e Som

// Atualize o evento do botão de sortear:
botaoSortear.addEventListener('click', () => {
    const texto = campoTexto.value.trim();
    
    if (texto === "") {
        campoResultado.style.color = "#ef4444";
        campoResultado.style.fontSize = "20px";
        campoResultado.textContent = "Por favor, insira pelo menos um nome!";
        return;
    }

    const participantes = texto.split('\n').map(nome => nome.trim()).filter(nome => nome !== "");

    if (participantes.length === 0) {
        campoResultado.style.color = "#ef4444";
        campoResultado.style.fontSize = "20px";
        campoResultado.textContent = "Por favor, insira pelo menos um nome válido!";
        return;
    }

    // Se o usuário desativou a animação, sorteia direto
    if (!chkAnimacao.checked) {
        realizarSorteio(participantes);
        return;
    }

    // Liga o som de suspense
    if (somSorteio) {
        somSorteio.currentTime = 0;
        somSorteio.play().catch(err => console.log("Áudio bloqueado pelo navegador."));
    }

    // Configura e mostra a tela de contagem no meio da tela
    let contador = 5;
    numeroContagem.textContent = contador;
    overlayContagem.classList.add('ativo');
    campoResultado.textContent = ""; // Limpa a div antiga embaixo

    const cronometro = setInterval(() => {
        contador--;
        
        if (contador > 0) {
            numeroContagem.textContent = contador;
        } else {
            clearInterval(cronometro); 
            overlayContagem.classList.remove('ativo'); // Esconde a tela de contagem
            realizarSorteio(participantes);           // Abre o modal de vencedor
        }
    }, 1000);
});

// Função auxiliar para gerar um código aleatório (Ex: #A3B9-42F7)
function gerarCodigoUnico() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres.charAt(indiceAleatorio);
    }
    // Retorna o código com as 4 primeiras letras, um hífen e as 4 últimas
    return `#${codigo.substring(0, 4)}-${codigo.substring(4, 8)}`;
}

// 5. Função que escolhe os ganhadores aleatórios e abre o Modal com Confetes e Código
function realizarSorteio(lista) {
    let totalGanhadores = parseInt(qtdGanhadoresInput.value) || 1;
    
    if (totalGanhadores > lista.length) {
        totalGanhadores = lista.length;
    }

    const participantesDisponiveis = [...lista];
    const ganhadoresSorteados = [];

    for (let i = 0; i < totalGanhadores; i++) {
        const indiceAleatorio = Math.floor(Math.random() * participantesDisponiveis.length);
        const nomeGanhador = participantesDisponiveis.splice(indiceAleatorio, 1)[0];
        ganhadoresSorteados.push(nomeGanhador);
    }

    const modalCorpo = modal.querySelector('.modal-corpo');
    modalCorpo.innerHTML = "";

    ganhadoresSorteados.forEach((ganhador, index) => {
        const linha = document.createElement('div');
        linha.className = 'ganhador-linha';
        if (index < ganhadoresSorteados.length - 1) {
            linha.style.marginBottom = '12px';
        }

        const posicaoText = `${index + 1}º Lugar`;

        linha.innerHTML = `
            <span class="tag-posicao">${posicaoText}</span>
            <span class="nome-ganhador">${ganhador}</span>
        `;
        
        modalCorpo.appendChild(linha);
    });

    // MÁGICA DO CÓDIGO: Gera o código único e injeta no cabeçalho do pop-up
    if (textoCodigoSorteio) {
        textoCodigoSorteio.textContent = gerarCodigoUnico();
    }

    modal.classList.add('ativo');

    // MÁGICA DOS CONFETES CONTÍNUOS (Duração: 3 segundos)
    let duracao = 3 * 1000;
    let fim = Date.now() + duracao;

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 }
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 }
        });

        if (Date.now() < fim) {
            requestAnimationFrame(frame);
        }
    }());
}


// 6. Botão para fechar o Pop-up
btnFecharModal.addEventListener('click', () => {
    modal.classList.remove('ativo');
});
