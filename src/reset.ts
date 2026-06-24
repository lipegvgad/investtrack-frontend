// Tela de redefinição de senha (acessada pelo link do e-mail com uid e token).
import { api } from "./api";
import { el, limparMensagem, mostrarMensagem } from "./ui";

const params = new URLSearchParams(window.location.search);
const uid = params.get("uid") ?? "";
const token = params.get("token") ?? "";

const form = el<HTMLFormElement>("form-reset");
const msg = el<HTMLElement>("mensagem");

if (!uid || !token) {
  mostrarMensagem(
    msg,
    "Link inválido. Solicite uma nova redefinição de senha.",
    "erro",
  );
  form.hidden = true;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparMensagem(msg);

  const nova = el<HTMLInputElement>("nova_senha").value;
  const confirma = el<HTMLInputElement>("confirma_senha").value;
  if (nova !== confirma) {
    mostrarMensagem(msg, "As senhas não conferem.", "erro");
    return;
  }

  try {
    await api.confirmarResetSenha(uid, token, nova);
    mostrarMensagem(
      msg,
      "Senha redefinida com sucesso! Redirecionando para o login...",
      "sucesso",
    );
    form.hidden = true;
    setTimeout(() => (window.location.href = "index.html"), 1800);
  } catch (erro) {
    mostrarMensagem(msg, (erro as Error).message, "erro");
  }
});
