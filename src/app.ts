// Tela principal (dashboard) do InvestTrack.
//
// Reúne o CRUD de ativos e aportes, o resumo do portfólio do usuário
// autenticado e a área de conta (editar perfil e trocar senha).
import { api } from "./api";
import { exigirAutenticacao, logout } from "./auth";
import type { Ativo, Categoria } from "./types";
import {
  el,
  escapar,
  formatarData,
  formatarMoeda,
  limparMensagem,
  mostrarMensagem,
} from "./ui";

exigirAutenticacao();

let categorias: Categoria[] = [];
let ativos: Ativo[] = [];

// ---------------------------------------------------------------------------
// Navegação por abas
// ---------------------------------------------------------------------------
function configurarAbas(): void {
  const botoes = document.querySelectorAll<HTMLButtonElement>("[data-aba]");
  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const alvo = botao.dataset.aba!;
      document
        .querySelectorAll<HTMLElement>(".view")
        .forEach((v) => (v.hidden = v.id !== `view-${alvo}`));
      botoes.forEach((b) => b.classList.toggle("ativo", b === botao));
    });
  });
}

// ---------------------------------------------------------------------------
// Cabeçalho / sessão
// ---------------------------------------------------------------------------
async function carregarPerfil(): Promise<void> {
  const usuario = await api.perfil();
  el("saudacao").textContent = `Olá, ${usuario.first_name || usuario.username}`;
  el<HTMLInputElement>("perfil-nome").value = usuario.first_name;
  el<HTMLInputElement>("perfil-email").value = usuario.email;
}

el<HTMLButtonElement>("btn-logout").addEventListener("click", () => {
  logout();
  window.location.href = "index.html";
});

// ---------------------------------------------------------------------------
// Resumo do portfólio
// ---------------------------------------------------------------------------
async function carregarResumo(): Promise<void> {
  const resumo = await api.resumo();
  el("resumo-total").textContent = formatarMoeda(resumo.total_investido);
  el("resumo-aportes").textContent = String(resumo.quantidade_aportes);
  el("resumo-ativos").textContent = String(ativos.length);

  const lista = el("resumo-distribuicao");
  if (resumo.distribuicao_por_tipo.length === 0) {
    lista.innerHTML = "<li class='vazio'>Sem aportes ainda.</li>";
    return;
  }
  lista.innerHTML = resumo.distribuicao_por_tipo
    .map(
      (d) =>
        `<li><span>${escapar(d.tipo_display)}</span><strong>${formatarMoeda(
          d.total,
        )}</strong></li>`,
    )
    .join("");
}

// ---------------------------------------------------------------------------
// Categorias / selects
// ---------------------------------------------------------------------------
async function carregarCategorias(): Promise<void> {
  categorias = await api.listarCategorias();
  const select = el<HTMLSelectElement>("ativo-categoria");
  select.innerHTML = categorias
    .map((c) => `<option value="${c.id}">${escapar(c.nome)}</option>`)
    .join("");
}

function atualizarSelectAtivos(): void {
  const select = el<HTMLSelectElement>("aporte-ativo");
  select.innerHTML = ativos
    .map(
      (a) =>
        `<option value="${a.id}">${escapar(
          a.ticker ? `${a.ticker} - ${a.nome}` : a.nome,
        )}</option>`,
    )
    .join("");
}

// ---------------------------------------------------------------------------
// CRUD de Ativos
// ---------------------------------------------------------------------------
const msgAtivo = () => el<HTMLElement>("ativo-msg");

async function carregarAtivos(): Promise<void> {
  const busca = el<HTMLInputElement>("ativo-busca").value.trim();
  ativos = await api.listarAtivos(busca);
  const tbody = el<HTMLTableSectionElement>("tabela-ativos");

  if (ativos.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='6' class='vazio'>Nenhum ativo cadastrado.</td></tr>";
  } else {
    tbody.innerHTML = ativos
      .map(
        (a) => `
        <tr>
          <td>${escapar(a.ticker || "—")}</td>
          <td>${escapar(a.nome)}</td>
          <td><span class="tag">${escapar(a.tipo_display)}</span></td>
          <td>${escapar(a.categoria_nome)}</td>
          <td>${formatarMoeda(a.total_investido)}</td>
          <td class="acoes">
            <button class="btn-mini" data-editar-ativo="${a.id}">Editar</button>
            <button class="btn-mini btn-perigo" data-excluir-ativo="${a.id}">Excluir</button>
          </td>
        </tr>`,
      )
      .join("");
  }
  atualizarSelectAtivos();
}

function resetarFormAtivo(): void {
  el<HTMLFormElement>("form-ativo").reset();
  el<HTMLInputElement>("ativo-id").value = "";
  el("form-ativo-titulo").textContent = "Novo ativo";
  el<HTMLButtonElement>("ativo-cancelar").hidden = true;
}

el<HTMLFormElement>("form-ativo").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparMensagem(msgAtivo());
  const id = el<HTMLInputElement>("ativo-id").value;
  const payload = {
    nome: el<HTMLInputElement>("ativo-nome").value.trim(),
    ticker: el<HTMLInputElement>("ativo-ticker").value.trim(),
    tipo: el<HTMLSelectElement>("ativo-tipo").value,
    categoria: Number(el<HTMLSelectElement>("ativo-categoria").value),
  };
  try {
    if (id) {
      await api.atualizarAtivo(Number(id), payload);
      mostrarMensagem(msgAtivo(), "Ativo atualizado.", "sucesso");
    } else {
      await api.criarAtivo(payload);
      mostrarMensagem(msgAtivo(), "Ativo criado.", "sucesso");
    }
    resetarFormAtivo();
    await carregarAtivos();
    await carregarResumo();
  } catch (erro) {
    mostrarMensagem(msgAtivo(), (erro as Error).message, "erro");
  }
});

el<HTMLButtonElement>("ativo-cancelar").addEventListener("click", resetarFormAtivo);
el<HTMLInputElement>("ativo-busca").addEventListener("input", () => {
  void carregarAtivos();
});

el<HTMLTableSectionElement>("tabela-ativos").addEventListener("click", async (evento) => {
  const alvo = evento.target as HTMLElement;

  const idEditar = alvo.dataset.editarAtivo;
  if (idEditar) {
    const ativo = ativos.find((a) => a.id === Number(idEditar));
    if (!ativo) return;
    el<HTMLInputElement>("ativo-id").value = String(ativo.id);
    el<HTMLInputElement>("ativo-nome").value = ativo.nome;
    el<HTMLInputElement>("ativo-ticker").value = ativo.ticker;
    el<HTMLSelectElement>("ativo-tipo").value = ativo.tipo;
    el<HTMLSelectElement>("ativo-categoria").value = String(ativo.categoria);
    el("form-ativo-titulo").textContent = `Editando: ${ativo.nome}`;
    el<HTMLButtonElement>("ativo-cancelar").hidden = false;
    el("form-ativo").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const idExcluir = alvo.dataset.excluirAtivo;
  if (idExcluir) {
    if (!confirm("Excluir este ativo? Os aportes dele impedem a exclusão.")) return;
    try {
      await api.excluirAtivo(Number(idExcluir));
      await carregarAtivos();
      await carregarResumo();
    } catch (erro) {
      mostrarMensagem(msgAtivo(), (erro as Error).message, "erro");
    }
  }
});

// ---------------------------------------------------------------------------
// CRUD de Aportes
// ---------------------------------------------------------------------------
const msgAporte = () => el<HTMLElement>("aporte-msg");

async function carregarAportes(): Promise<void> {
  const aportes = await api.listarAportes();
  const tbody = el<HTMLTableSectionElement>("tabela-aportes");

  if (aportes.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='6' class='vazio'>Nenhum aporte registrado.</td></tr>";
    return;
  }
  tbody.innerHTML = aportes
    .map(
      (ap) => `
      <tr>
        <td>${formatarData(ap.data)}</td>
        <td>${escapar(ap.ativo_nome)}</td>
        <td>${ap.quantidade}</td>
        <td>${formatarMoeda(ap.preco_unitario)}</td>
        <td>${formatarMoeda(ap.valor_total)}</td>
        <td class="acoes">
          <button class="btn-mini" data-editar-aporte="${ap.id}"
            data-ativo="${ap.ativo}" data-data="${ap.data}"
            data-quantidade="${ap.quantidade}" data-preco="${ap.preco_unitario}">Editar</button>
          <button class="btn-mini btn-perigo" data-excluir-aporte="${ap.id}">Excluir</button>
        </td>
      </tr>`,
    )
    .join("");
}

function resetarFormAporte(): void {
  el<HTMLFormElement>("form-aporte").reset();
  el<HTMLInputElement>("aporte-id").value = "";
  el("form-aporte-titulo").textContent = "Novo aporte";
  el<HTMLButtonElement>("aporte-cancelar").hidden = true;
}

el<HTMLFormElement>("form-aporte").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparMensagem(msgAporte());
  if (ativos.length === 0) {
    mostrarMensagem(msgAporte(), "Cadastre um ativo antes de registrar aportes.", "erro");
    return;
  }
  const id = el<HTMLInputElement>("aporte-id").value;
  const payload = {
    ativo: Number(el<HTMLSelectElement>("aporte-ativo").value),
    data: el<HTMLInputElement>("aporte-data").value,
    quantidade: el<HTMLInputElement>("aporte-quantidade").value,
    preco_unitario: el<HTMLInputElement>("aporte-preco").value,
  };
  try {
    if (id) {
      await api.atualizarAporte(Number(id), payload);
      mostrarMensagem(msgAporte(), "Aporte atualizado.", "sucesso");
    } else {
      await api.criarAporte(payload);
      mostrarMensagem(msgAporte(), "Aporte registrado.", "sucesso");
    }
    resetarFormAporte();
    await carregarAportes();
    await carregarAtivos();
    await carregarResumo();
  } catch (erro) {
    mostrarMensagem(msgAporte(), (erro as Error).message, "erro");
  }
});

el<HTMLButtonElement>("aporte-cancelar").addEventListener("click", resetarFormAporte);

el<HTMLTableSectionElement>("tabela-aportes").addEventListener("click", async (evento) => {
  const alvo = evento.target as HTMLElement;

  if (alvo.dataset.editarAporte) {
    el<HTMLInputElement>("aporte-id").value = alvo.dataset.editarAporte;
    el<HTMLSelectElement>("aporte-ativo").value = alvo.dataset.ativo!;
    el<HTMLInputElement>("aporte-data").value = alvo.dataset.data!;
    el<HTMLInputElement>("aporte-quantidade").value = alvo.dataset.quantidade!;
    el<HTMLInputElement>("aporte-preco").value = alvo.dataset.preco!;
    el("form-aporte-titulo").textContent = "Editando aporte";
    el<HTMLButtonElement>("aporte-cancelar").hidden = false;
    el("form-aporte").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (alvo.dataset.excluirAporte) {
    if (!confirm("Excluir este aporte?")) return;
    try {
      await api.excluirAporte(Number(alvo.dataset.excluirAporte));
      await carregarAportes();
      await carregarAtivos();
      await carregarResumo();
    } catch (erro) {
      mostrarMensagem(msgAporte(), (erro as Error).message, "erro");
    }
  }
});

// ---------------------------------------------------------------------------
// Conta: editar perfil e trocar senha
// ---------------------------------------------------------------------------
el<HTMLFormElement>("form-perfil").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const msg = el<HTMLElement>("perfil-msg");
  limparMensagem(msg);
  try {
    await api.atualizarPerfil({
      first_name: el<HTMLInputElement>("perfil-nome").value.trim(),
      email: el<HTMLInputElement>("perfil-email").value.trim(),
    });
    await carregarPerfil();
    mostrarMensagem(msg, "Perfil atualizado.", "sucesso");
  } catch (erro) {
    mostrarMensagem(msg, (erro as Error).message, "erro");
  }
});

el<HTMLFormElement>("form-senha").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const msg = el<HTMLElement>("senha-msg");
  limparMensagem(msg);
  const nova = el<HTMLInputElement>("senha-nova").value;
  const confirma = el<HTMLInputElement>("senha-confirma").value;
  if (nova !== confirma) {
    mostrarMensagem(msg, "As senhas não conferem.", "erro");
    return;
  }
  try {
    await api.trocarSenha(el<HTMLInputElement>("senha-atual").value, nova);
    el<HTMLFormElement>("form-senha").reset();
    mostrarMensagem(msg, "Senha alterada com sucesso.", "sucesso");
  } catch (erro) {
    mostrarMensagem(msg, (erro as Error).message, "erro");
  }
});

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------
async function iniciar(): Promise<void> {
  configurarAbas();
  try {
    await carregarPerfil();
    await carregarCategorias();
    await carregarAtivos();
    await carregarAportes();
    await carregarResumo();
  } catch (erro) {
    console.error(erro);
  }
}

void iniciar();
