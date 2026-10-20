import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";
import imgRectangle3 from "figma:asset/97e074a98bd267b7e793590cf7916ed3199aac5e.png";

const AUTH_BACKGROUND_URL =
  "https://kacqyrjkkdyznercqhwh.supabase.co/storage/v1/object/public/img-site/magnific__ultrawide-cinematic-cyberpunk-wallpaper-for-a-prem__44938.jpg";

type AuthView = "login" | "register" | "forgot-request" | "forgot-success" | "forgot-reset";

function usernameFrom(name: string, email: string) {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return base || email.trim().split("@")[0] || "usuario";
}

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "Este e-mail já está cadastrado.";
  }
  return message;
}

interface AuthPageProps {
  onAuthenticated: () => void;
}

// Google "G" SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9581H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4522 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.344C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9581L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
    </svg>
  );
}

// Mars Sound AI Logo
function MarsLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex-shrink-0"
        style={{
          width: "34px",
          height: "34px",
          background: "#ff164c",
          borderRadius: "50%",
          padding: "1.36px",
        }}
      >
        <img
          src={imgRectangle3}
          alt="Mars logo"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            mixBlendMode: "plus-lighter",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: "-1.4px",
          lineHeight: 1.7,
          background: "linear-gradient(to bottom, #ffffff, #999999)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          whiteSpace: "nowrap",
        }}
      >
        Mars sound ai
      </span>
    </div>
  );
}

// Input field component
function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  rightLabel,
  onRightLabelClick,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rightLabel?: string;
  onRightLabelClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "1.25",
            color: "#bababa",
          }}
        >
          {label}
        </label>
        {rightLabel && (
          <button
            type="button"
            onClick={onRightLabelClick}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "1.25",
              color: "#ff164c",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {rightLabel}
          </button>
        )}
      </div>
      <div
        style={{
          position: "relative",
          border: "1px solid #30292b",
          background: "transparent",
        }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "10px 24px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "1.5",
            color: "#f8f8f8",
            boxSizing: "border-box",
          }}
          className="placeholder:text-[#f8f8f8]/25"
        />
      </div>
    </div>
  );
}

// Divider "Ou continue com"
function OrDivider() {
  return (
    <div className="flex items-center gap-6 w-full">
      <div style={{ flex: 1, height: "1px", background: "#766C6E" }} />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "1.25",
          color: "#bababa",
          whiteSpace: "nowrap",
        }}
      >
        Ou continue com
      </span>
      <div style={{ flex: 1, height: "1px", background: "#766C6E" }} />
    </div>
  );
}

// Primary gradient button
function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        width: "100%",
        height: "56px",
        background: "linear-gradient(to right, #ff164c 57.214%, #ea5858)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: "16px",
        lineHeight: "1.5",
        color: "#f8f8f8",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

// Google button
function GoogleButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: "56px",
        background: "#24191b",
        border: "1px solid #5e5e5e",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: "16px",
        lineHeight: "1.5",
        color: "#f8f8f8",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2c1e20")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#24191b")}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

// Footer link row
function FooterLink({
  text,
  linkText,
  onClick,
}: {
  text: string;
  linkText: string;
  onClick: () => void;
}) {
  return (
    <div
      className="flex gap-1 items-center justify-center"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "1.25",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "#bababa" }}>{text}</span>
      <button
        type="button"
        onClick={onClick}
        style={{
          color: "#ff164c",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "1.25",
        }}
      >
        {linkText}
      </button>
    </div>
  );
}

function AuthMessage({ children }: { children: string }) {
  return (
    <p
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: 1.5,
        color: "#ff164c",
        textAlign: "center",
      }}
    >
      {children}
    </p>
  );
}

// ── LOGIN VIEW ───────────────────────────────────────────
function LoginForm({
  onGoRegister,
  onGoForgot,
  onLogin,
}: {
  onGoRegister: () => void;
  onGoForgot: () => void;
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="flex flex-col gap-6 w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim() || !passwordValue) {
          setMessage("Preencha e-mail e senha.");
          return;
        }
        setSubmitting(true);
        setMessage("");
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: passwordValue,
        });
        setSubmitting(false);
        if (error) {
          setMessage(authErrorMessage(error.message));
          return;
        }
        onLogin();
      }}
    >
      <AuthInput
        label="Endereço de e-mail"
        type="email"
        placeholder="email@seuemail.com"
        value={email}
        onChange={setEmail}
      />
      <AuthInput
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        value={passwordValue}
        onChange={setPasswordValue}
        rightLabel="Esqueceu a senha?"
        onRightLabelClick={onGoForgot}
      />
      {message && <AuthMessage>{message}</AuthMessage>}
      <PrimaryButton type="submit">{submitting ? "Entrando..." : "Entrar"}</PrimaryButton>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#bababa",
          textAlign: "center",
        }}
      >
        Conta de demonstração: demo@marssound.ai
      </p>
      <OrDivider />
      <GoogleButton
        label="Google"
        onClick={() => setMessage("O login com Google entra quando a autenticação do backend estiver pronta.")}
      />
      <FooterLink
        text="Não tem uma conta?"
        linkText="Cadastre-se"
        onClick={onGoRegister}
      />
    </form>
  );
}

// ── REGISTER VIEW ────────────────────────────────────────
function RegisterForm({
  onGoLogin,
  onRegister,
}: {
  onGoLogin: () => void;
  onRegister: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="flex flex-col gap-6 w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) {
          setMessage("Informe seu nome.");
          return;
        }
        if (!email.trim().includes("@")) {
          setMessage("Informe um e-mail válido.");
          return;
        }
        if (password.length < 6) {
          setMessage("A senha deve ter pelo menos 6 caracteres.");
          return;
        }
        setSubmitting(true);
        setMessage("");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: usernameFrom(name, email),
              name: name.trim(),
            },
          },
        });
        setSubmitting(false);
        if (error) {
          setMessage(authErrorMessage(error.message));
          return;
        }
        if (!data.session) {
          setMessage("Conta criada. Confirme o e-mail para entrar.");
          return;
        }
        onRegister();
      }}
    >
      <AuthInput
        label="Nome"
        placeholder="Como deseja ser chamado?"
        value={name}
        onChange={setName}
      />
      <AuthInput
        label="Email"
        type="email"
        placeholder="Seu melhor e-mail"
        value={email}
        onChange={setEmail}
      />
      <AuthInput
        label="Senha"
        type="password"
        placeholder="Crie uma senha forte"
        value={password}
        onChange={setPassword}
      />
      <PrimaryButton type="submit">{submitting ? "Cadastrando..." : "Cadastrar"}</PrimaryButton>
      {message && <AuthMessage>{message}</AuthMessage>}
      <OrDivider />
      <GoogleButton
        label="Cadastrar com Google"
        onClick={() => setMessage("O cadastro com Google entra quando a autenticação do backend estiver pronta.")}
      />
      <FooterLink
        text="Já tem uma conta?"
        linkText="Fazer Login"
        onClick={onGoLogin}
      />
    </form>
  );
}

// ── FORGOT PASSWORD — STEP 1: REQUEST ────────────────────
function ForgotRequestForm({
  onBack,
  onSend,
}: {
  onBack: () => void;
  onSend: () => void;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="flex flex-col gap-6 w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim().includes("@")) {
          setMessage("Informe um e-mail válido.");
          return;
        }
        setSubmitting(true);
        setMessage("");
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        setSubmitting(false);
        if (error) {
          setMessage(authErrorMessage(error.message));
          return;
        }
        onSend();
      }}
    >
      <div className="flex flex-col gap-2">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#bababa",
            textAlign: "center",
          }}
        >
          Digite o e-mail da sua conta e enviaremos um link para redefinir sua
          senha.
        </p>
      </div>
      <AuthInput
        label="Endereço de e-mail"
        type="email"
        placeholder="email@seuemail.com"
        value={email}
        onChange={setEmail}
      />
      {message && <AuthMessage>{message}</AuthMessage>}
      <PrimaryButton type="submit">{submitting ? "Enviando..." : "Enviar link de recuperação"}</PrimaryButton>
      <FooterLink text="Lembrou a senha?" linkText="Voltar ao Login" onClick={onBack} />
    </form>
  );
}

// ── FORGOT PASSWORD — STEP 2: SUCCESS ────────────────────
function ForgotSuccessView({
  onGoLogin,
  onGoReset,
}: {
  onGoLogin: () => void;
  onGoReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full items-center">
      {/* Success icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(255, 22, 76, 0.12)",
          border: "2px solid #ff164c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#ff164c"/>
        </svg>
      </div>

      <div className="flex flex-col gap-3 text-center">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "1.4",
            color: "#f8f8f8",
          }}
        >
          Link Mágico Enviado! ✨
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#bababa",
          }}
        >
          Verifique sua caixa de entrada e clique no link enviado para redefinir
          sua senha. O link expira em 15 minutos.
        </p>
      </div>

      <div
        style={{
          width: "100%",
          padding: "16px",
          background: "rgba(255, 22, 76, 0.08)",
          border: "1px solid rgba(255, 22, 76, 0.3)",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff164c" style={{ flexShrink: 0, marginTop: "2px" }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "1.6",
            color: "#bababa",
          }}
        >
          Não encontrou o e-mail? Verifique a pasta de spam ou{" "}
          <button
            type="button"
            onClick={onGoReset}
            style={{
              color: "#ff164c",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              textDecoration: "underline",
            }}
          >
            clique aqui para redefinir diretamente
          </button>
          .
        </p>
      </div>

      <PrimaryButton onClick={onGoLogin}>Voltar ao Login</PrimaryButton>
    </div>
  );
}

// ── FORGOT PASSWORD — STEP 3: RESET ──────────────────────
function ForgotResetForm({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setError("Abra o link enviado por e-mail para definir a nova senha.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(authErrorMessage(updateError.message));
      return;
    }
    setError("");
    onSave();
  };

  return (
    <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#bababa",
          textAlign: "center",
        }}
      >
        Crie uma nova senha para acessar sua conta.
      </p>
      <AuthInput
        label="Nova Senha"
        type="password"
        placeholder="Digite sua nova senha"
        value={newPassword}
        onChange={(v) => {
          setNewPassword(v);
          setError("");
        }}
      />
      <AuthInput
        label="Confirmar Nova Senha"
        type="password"
        placeholder="Confirme sua nova senha"
        value={confirmPassword}
        onChange={(v) => {
          setConfirmPassword(v);
          setError("");
        }}
      />
      {error && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            color: "#ff164c",
            marginTop: "-8px",
          }}
        >
          {error}
        </p>
      )}
      <PrimaryButton type="submit">Salvar e Entrar</PrimaryButton>
      <FooterLink text="Lembrou a senha?" linkText="Voltar ao Login" onClick={onBack} />
    </form>
  );
}

// ── MAIN AUTH PAGE ────────────────────────────────────────
export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("login");

  const titles: Record<AuthView, string> = {
    login: "Bem-vindo de volta",
    register: "Crie sua conta",
    "forgot-request": "Recuperar senha",
    "forgot-success": "Verifique seu e-mail",
    "forgot-reset": "Nova senha",
  };

  const subtitles: Record<AuthView, string> = {
    login: "Escute músicas geradas com IA\ne compartilhe suas criações",
    register: "Crie sua conta",
    "forgot-request": "Recuperar senha",
    "forgot-success": "Verifique seu e-mail",
    "forgot-reset": "Nova senha",
  };

  const formVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  return (
    <div
      className="flex min-h-screen w-full overflow-hidden"
      style={{ background: "#1c1315" }}
    >
      {/* ── LEFT PANEL: Banner (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[60%] relative flex-col items-center justify-center"
        style={{ minHeight: "100vh" }}
      >
        {/* Background image */}
        <img
          src={AUTH_BACKGROUND_URL}
          alt="Cyberpunk background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(28,19,21,0.3) 0%, rgba(28,19,21,0.6) 100%)",
          }}
        />
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div
        className="w-full lg:w-[40%] flex flex-col items-center justify-center min-h-screen px-6 py-12"
        style={{ background: "#1c1315" }}
      >
        {/* Mobile logo header */}
        <div className="lg:hidden flex flex-col items-center gap-4 mb-10">
          <MarsLogo />
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#a19a9b",
              textAlign: "center",
            }}
          >
            Escute músicas geradas com IA e compartilhe suas criações
          </p>
        </div>

        {/* Form container */}
        <div className="w-full max-w-[399px] flex flex-col items-center gap-10">
          {/* Title (desktop) */}
          <div className="hidden lg:flex flex-col items-center gap-6 w-full">
            <MarsLogo />
            {(view === "login") && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "1.5",
                  color: "#a19a9b",
                  textAlign: "center",
                }}
              >
                Escute músicas geradas com IA
                <br />e compartilhe suas criações
              </p>
            )}
            {(view === "register") && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "1.5",
                  color: "#a19a9b",
                  textAlign: "center",
                }}
              >
                Crie sua conta
              </p>
            )}
            {(view === "forgot-request" || view === "forgot-reset") && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "1.5",
                  color: "#a19a9b",
                  textAlign: "center",
                }}
              >
                {titles[view]}
              </p>
            )}
            {view === "forgot-success" && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "1.5",
                  color: "#a19a9b",
                  textAlign: "center",
                }}
              >
                {titles[view]}
              </p>
            )}
          </div>

          {/* Animated form */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {view === "login" && (
                <motion.div
                  key="login"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <LoginForm
                    onGoRegister={() => setView("register")}
                    onGoForgot={() => setView("forgot-request")}
                    onLogin={onAuthenticated}
                  />
                </motion.div>
              )}

              {view === "register" && (
                <motion.div
                  key="register"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <RegisterForm
                    onGoLogin={() => setView("login")}
                    onRegister={onAuthenticated}
                  />
                </motion.div>
              )}

              {view === "forgot-request" && (
                <motion.div
                  key="forgot-request"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <ForgotRequestForm
                    onBack={() => setView("login")}
                    onSend={() => setView("forgot-success")}
                  />
                </motion.div>
              )}

              {view === "forgot-success" && (
                <motion.div
                  key="forgot-success"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <ForgotSuccessView
                    onGoLogin={() => setView("login")}
                    onGoReset={() => setView("forgot-reset")}
                  />
                </motion.div>
              )}

              {view === "forgot-reset" && (
                <motion.div
                  key="forgot-reset"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <ForgotResetForm
                    onBack={() => setView("login")}
                    onSave={onAuthenticated}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}