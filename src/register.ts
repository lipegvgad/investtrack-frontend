// Tela de cadastro de novo usuário.
import { api } from "./api";
import { redirecionarSeLogado } from "./auth";
import { el, limparMensagem, mostrarMensagem } from "./ui";

redirecionarSeLogado();

const form = el<HTMLFormElement>("form-cadastro");
const msg = el<HTMLElement>("mensagem");

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparMensagem(msg);

  const password = el<HTMLInputElement>("password").value;
  const password2 = el<HTMLInputElement>("password2").value;
  if (password !== password2) {
    mostrarMensagem(msg, "As senhas não conferem.", "erro");
    return;
  }

  try {
    await api.registrar({
      username: el<HTMLInputElement>("username").value.trim(),
      email: el<HTMLInputElement>("email").value.trim(),
      first_name: el<HTMLInputElement>("first_name").value.trim(),
      password,
      password2,
    });
    mostrarMensagem(
      msg,
      "Conta criada com sucesso! Redirecionando para o login...",
      "sucesso",
    );
    setTimeout(() => (window.location.href = "index.html"), 1500);
  } catch (erro) {
    mostrarMensagem(msg, (erro as Error).message, "erro");
  }
});
