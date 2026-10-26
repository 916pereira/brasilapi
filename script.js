
const campoAno = document.getElementById("ano");
const botaoConsultar = document.getElementById("consultar");
const listaFeriados = document.getElementById("lista-feriados");
const total = document.getElementById("total");
const mensagem = document.getElementById("mensagem");
const proximoFeriado = document.getElementById("proximo-feriado");

const hoje = new Date();
campoAno.value = hoje.getFullYear();

botaoConsultar.addEventListener("click", consultarFeriados);

campoAno.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        consultarFeriados();
    }
});

async function consultarFeriados() {
    const ano = Number(campoAno.value);

    listaFeriados.innerHTML = "";
    mensagem.textContent = "";
    total.textContent = "Total de feriados: 0";
    proximoFeriado.hidden = true;

    if (
        !Number.isInteger(ano) ||
        ano < 1 ||
        ano > 9999
    ) {
        mensagem.textContent = "Digite um ano válido.";
        return;
    }

    botaoConsultar.disabled = true;
    botaoConsultar.textContent = "Consultando...";

    try {
        const resposta = await fetch(
            `https://brasilapi.com.br/api/feriados/v1/${ano}`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar esse ano.");
        }

        const feriados = await resposta.json();

        total.textContent = `Total de feriados: ${feriados.length}`;

        feriados.forEach(function (feriado) {
            
            const data = new Date(feriado.date + "T12:00:00");

            const dataBrasileira = data.toLocaleDateString("pt-BR");

            const diaSemana = data.toLocaleDateString("pt-BR", {
                weekday: "long"
            });

            const linha = document.createElement("tr");

            
            if (
                data.getDay() === 0 ||
                data.getDay() === 6
            ) {
                linha.classList.add("fim-de-semana");
            }

            linha.innerHTML = `
                <td>${dataBrasileira}</td>
                <td>${diaSemana}</td>
                <td>${feriado.name}</td>
            `;

            listaFeriados.appendChild(linha);
        });

        
        mostrarProximoFeriado(feriados);

    } catch (erro) {
        mensagem.textContent =
            "Erro: ano inválido ou falha ao consultar a API. Tente novamente.";
        console.error(erro);
    } finally {
        botaoConsultar.disabled = false;
        botaoConsultar.textContent = "Consultar";
    }
}

function mostrarProximoFeriado(feriados) {
    
    const hojeSemHora = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    const proximos = feriados
        .map(function (feriado) {
            return {
                ...feriado,
                dataConvertida: new Date(feriado.date + "T12:00:00")
            };
        })
        .filter(function (feriado) {
            return feriado.dataConvertida >= hojeSemHora;
        })
        .sort(function (a, b) {
            return a.dataConvertida - b.dataConvertida;
        });

    if (proximos.length === 0) {
        proximoFeriado.hidden = false;
        proximoFeriado.textContent =
            "Não há mais feriados nacionais neste ano.";
        return;
    }

    const proximo = proximos[0];

    const dataProximo = new Date(
        proximo.dataConvertida.getFullYear(),
        proximo.dataConvertida.getMonth(),
        proximo.dataConvertida.getDate()
    );

    const dataHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    const diasFaltando = Math.round(
        (dataProximo - dataHoje) / (1000 * 60 * 60 * 24)
    );

    const dataFormatada =
        dataProximo.toLocaleDateString("pt-BR");

    proximoFeriado.hidden = false;
    proximoFeriado.innerHTML = `
        <strong>Próximo feriado: ${proximo.name}</strong><br>
        Data: ${dataFormatada}<br>
        ${
            diasFaltando === 0
                ? "O feriado é hoje!"
                : `Faltam ${diasFaltando} dias para o feriado.`
        }
    `;
}

consultarFeriados();
