// Pequenos utilitários de interface compartilhados pelas telas.

// Busca um elemento obrigatório pelo id (lança erro se não existir).
export function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento #${id} não encontrado.`);
  return node as T;
}

// Exibe uma mensagem de feedback (sucesso ou erro) num elemento alvo.
export function mostrarMensagem(
  alvo: HTMLElement,
  texto: string,
  tipo: "erro" | "sucesso" = "erro",
): void {
  alvo.textContent = texto;
  alvo.className = `mensagem mensagem--${tipo}`;
  alvo.hidden = false;
}

export function limparMensagem(alvo: HTMLElement): void {
  alvo.textContent = "";
  alvo.hidden = true;
}

// Formata um valor numérico em string como moeda brasileira.
export function formatarMoeda(valor: string | number): string {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Formata uma data ISO (YYYY-MM-DD) em DD/MM/AAAA.
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Escapa texto para inserção segura em HTML.
export function escapar(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Formata uma quantidade removendo zeros decimais inúteis (100.000000 -> 100).
export function formatarQuantidade(valor: string | number): string {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return numero.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
}

// Formata um percentual com sinal (+/-) e duas casas.
export function formatarPercentual(valor: string | number): string {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  const sinal = numero > 0 ? "+" : "";
  return `${sinal}${numero.toFixed(2).replace(".", ",")}%`;
}

// Classe CSS de cor conforme o número seja positivo, negativo ou neutro.
export function classeVariacao(valor: string | number | null): string {
  if (valor === null) return "";
  const numero = typeof valor === "string" ? Number(valor) : valor;
  if (numero > 0) return "positivo";
  if (numero < 0) return "negativo";
  return "";
}
