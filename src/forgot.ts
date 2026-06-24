// Tela "esqueci minha senha": solicita o e-mail de redefinição.
import { api } from "./api";
import { el, limparMensagem, mostrarMensagem } from "./ui";

const form = el<HTMLFormElement>("form-esqueci");
const msg = el<HTMLElement>("mensagem");

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparMensagem(msg);

  const email = el<HTMLInputElement>("email").value.trim();
  try {
    const resp = await api.solicitarResetSenha(email);
    mostrarMensagem(msg, resp.detail, "sucesso");
  } catch (erro) {
    mostrarMensagem(msg, (erro as Error).message, "erro");
  }
});
