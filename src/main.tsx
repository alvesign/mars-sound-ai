import { createRoot } from "react-dom/client";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento #root não encontrado.");
}

const root = createRoot(rootElement);

function StartupFailure({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#100c0d] px-6 text-center text-[#f7f5f5]">
      <div className="max-w-md">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#ff164c] uppercase">
          AI Music System
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Não foi possível abrir o app</h1>
        <p className="mt-3 text-sm leading-6 text-[#bababa]">{message}</p>
      </div>
    </main>
  );
}

import("./app/App.tsx")
  .then(({ default: App }) => {
    root.render(<App />);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Erro inesperado ao iniciar.";
    root.render(<StartupFailure message={message} />);
  });
