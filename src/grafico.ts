// Gráfico de linha simples em SVG (sem bibliotecas externas).
//
// Gera um <svg> com viewBox fixo que escala via CSS (width: 100%). Desenha a
// área preenchida, a linha e rótulos de valor (mín/máx) e de eixo (início/fim).
import { escapar, formatarMoeda } from "./ui";

export interface PontoGrafico {
  rotulo: string; // texto do eixo X (ex.: "2026-01" ou "2026-06-26")
  valor: number;
}

interface OpcoesGrafico {
  cor?: string;
  moeda?: boolean; // formata os valores como moeda (R$)
}

const L = 600; // largura do viewBox
const A = 200; // altura do viewBox
const PAD_X = 48;
const PAD_Y = 24;

function formatarValor(valor: number, moeda: boolean): string {
  if (moeda) return formatarMoeda(valor);
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export function graficoLinha(
  pontos: PontoGrafico[],
  opts: OpcoesGrafico = {},
): string {
  const cor = opts.cor ?? "#2563eb";
  const moeda = opts.moeda ?? false;

  if (pontos.length === 0) {
    return "<p class='vazio'>Sem dados para exibir.</p>";
  }
  if (pontos.length === 1) {
    return `<p class="grafico-unico">${escapar(pontos[0].rotulo)}: <strong>${formatarValor(
      pontos[0].valor,
      moeda,
    )}</strong></p>`;
  }

  const valores = pontos.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const intervalo = max - min || 1;

  const x = (i: number) =>
    PAD_X + (i / (pontos.length - 1)) * (L - PAD_X - 12);
  const y = (v: number) =>
    A - PAD_Y - ((v - min) / intervalo) * (A - 2 * PAD_Y);

  const coords = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`);
  const linha = `M ${coords.join(" L ")}`;
  const area =
    `M ${x(0).toFixed(1)},${(A - PAD_Y).toFixed(1)} ` +
    `L ${coords.join(" L ")} ` +
    `L ${x(pontos.length - 1).toFixed(1)},${(A - PAD_Y).toFixed(1)} Z`;

  const gid = `grad-${Math.random().toString(36).slice(2, 8)}`;

  return `
    <svg class="svg-linha" viewBox="0 0 ${L} ${A}" preserveAspectRatio="none"
         role="img" aria-label="Gráfico de linha">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${cor}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${cor}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <line x1="${PAD_X}" y1="${PAD_Y}" x2="${PAD_X}" y2="${A - PAD_Y}" class="eixo" />
      <line x1="${PAD_X}" y1="${A - PAD_Y}" x2="${L - 12}" y2="${A - PAD_Y}" class="eixo" />
      <path d="${area}" fill="url(#${gid})" />
      <path d="${linha}" fill="none" stroke="${cor}" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round" />
      <text x="${PAD_X - 6}" y="${PAD_Y + 4}" class="rotulo-eixo fim">${escapar(
        formatarValor(max, moeda),
      )}</text>
      <text x="${PAD_X - 6}" y="${A - PAD_Y}" class="rotulo-eixo fim">${escapar(
        formatarValor(min, moeda),
      )}</text>
      <text x="${PAD_X}" y="${A - 6}" class="rotulo-eixo">${escapar(
        pontos[0].rotulo,
      )}</text>
      <text x="${L - 12}" y="${A - 6}" class="rotulo-eixo inicio">${escapar(
        pontos[pontos.length - 1].rotulo,
      )}</text>
    </svg>`;
}
