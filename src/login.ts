// Tela de login.
import { api, ApiError } from "./api";
import { redirecionarSeLogado, salvarTokens } from "./auth";
import { el, limparMensagem, mostrarMensagem } from "./ui";

redirecionarSeLogado();

const form = el<HTMLFormElement>("form-login");
const msg = el<HTMLElement>("mensagem");

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparMensagem(msg);

  const username = el<HTMLInputElement>("username").value.trim();
  const password = el<HTMLInputElement>("password").value;

  try {
    const tokens = await api.login(username, password);
    salvarTokens(tokens);
    window.location.href = "app.html";
  } catch (erro) {
    const texto =
      erro instanceof ApiError && erro.status === 401
        ? "Usuário ou senha inválidos."
        : (erro as Error).message;
    mostrarMensagem(msg, texto, "erro");
  }
});
