# Banco de Componentes - Mars Sound AI

Este documento descreve todos os componentes reutilizáveis criados para o Mars Sound AI. **SEMPRE consulte este banco antes de criar novos componentes.**

## 📦 Componentes UI Básicos

### Button
**Localização:** `/src/app/components/ui/Button.tsx`

Componente de botão com múltiplas variantes e tamanhos.

**Props:**
- `variant`: "primary" | "outline" | "ghost" | "icon" (padrão: "primary")
- `size`: "sm" | "md" | "lg" (padrão: "md")
- `onClick`: função callback
- `children`: conteúdo do botão
- `className`: classes adicionais
- `disabled`: boolean
- `icon`: ReactNode (ícone opcional)

**Exemplo de uso:**
```tsx
import { Button } from "./ui/Button";

<Button variant="primary" size="md" onClick={() => {}}>
  Carregar música
</Button>

<Button variant="outline" icon={<UploadIcon />}>
  Carregar músic AI
</Button>
```

---

### SearchInput
**Localização:** `/src/app/components/ui/SearchInput.tsx`

Campo de busca com ícone integrado.

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `placeholder`: string (opcional)
- `className`: classes adicionais (opcional)

**Exemplo de uso:**
```tsx
import { SearchInput } from "./ui/SearchInput";

const [search, setSearch] = useState("");

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Buscar músicas ou artistas"
/>
```

---

### FavoriteButton
**Localização:** `/src/app/components/ui/FavoriteButton.tsx`

Botão de favorito com estados preenchido/outline.

**Props:**
- `isFavorite`: boolean
- `onToggle`: () => void
- `size`: "sm" | "md" | "lg" (padrão: "md")
- `className`: classes adicionais (opcional)

**Características:**
- Ícone de coração outline quando não favoritado
- Ícone de coração preenchido quando favoritado
- Cor: #ff164c
- Animação de hover com scale
- stopPropagation automático

**Exemplo de uso:**
```tsx
import { FavoriteButton } from "./ui/FavoriteButton";

const [isFav, setIsFav] = useState(false);

<FavoriteButton
  isFavorite={isFav}
  onToggle={() => setIsFav(!isFav)}
  size="md"
/>
```

---

### MusicCard
**Localização:** `/src/app/components/ui/MusicCard.tsx`

Card de música com duas variantes: grid e lista.

**Props:**
- `track`: Track (objeto com id, title, artist, image, audioUrl)
- `variant`: "grid" | "list" (padrão: "grid")
- `showFavorite`: boolean (padrão: true)
- `className`: classes adicionais (opcional)

**Características:**
- Integrado com MusicContext
- Indicador visual quando música está tocando
- Botão de favorito integrado
- Hover effects
- Grid variant: thumbnail quadrado, info abaixo
- List variant: thumbnail pequeno, info ao lado

**Exemplo de uso:**
```tsx
import { MusicCard } from "./ui/MusicCard";

// Grid
<MusicCard track={track} variant="grid" />

// Lista
<MusicCard track={track} variant="list" showFavorite={true} />
```

---

### CategoryChip
**Localização:** `/src/app/components/ui/CategoryChip.tsx`

Chip de categoria com estado ativo/inativo.

**Props:**
- `label`: string
- `active`: boolean (padrão: false)
- `onClick`: () => void (opcional)
- `className`: classes adicionais (opcional)

**Características:**
- Estado ativo: fundo vermelho (#ff164c)
- Estado inativo: outline com hover
- Texto branco quando ativo
- Texto cinza (#a19a9b) quando inativo

**Exemplo de uso:**
```tsx
import { CategoryChip } from "./ui/CategoryChip";

<CategoryChip
  label="Rock"
  active={selectedCategory === "Rock"}
  onClick={() => setSelectedCategory("Rock")}
/>
```

---

## 🎵 Componentes de Música

### MusicPlayer
**Localização:** `/src/app/components/MusicPlayer.tsx`

Player de música fixo no rodapé com controles completos.

**Características:**
- Fixado no bottom com z-index 100
- Integrado com MusicContext
- Usa FavoriteButton reutilizável
- Controles: play/pause, próximo, anterior, shuffle, repeat
- Barra de progresso interativa com hover
- Controle de volume com mute/unmute
- Informações da música atual

---

### MusicCarousel
**Localização:** `/src/app/components/MusicCarousel.tsx`

Carrossel horizontal de músicas.

**Características:**
- Scroll horizontal suave
- Oculta scrollbar
- Usa MusicCard internamente
- Responsivo

---

## 📄 Componentes de Página

### HomePage
**Localização:** `/src/app/components/HomePage.tsx`

Página inicial com seções de músicas em alta, recentes e destaques.

**Características:**
- 3 carrosséis de músicas
- Scroll vertical (sem scrollbar visível)
- Padding para o player fixo

---

### DiscoverPage
**Localização:** `/src/app/components/DiscoverPage.tsx`

Página de descoberta com busca e filtros por categoria.

**Características:**
- Duas variantes automáticas:
  - **Default**: Grid de músicas com filtros por categoria
  - **Search Active**: Lista de resultados de busca
- Sistema de busca em tempo real
- Filtros por categoria
- Integrado com MusicContext
- Usa componentes reutilizáveis: SearchInput, CategoryChip, MusicCard

---

## 🧭 Componentes de Navegação

### Sidebar
**Localização:** `/src/app/components/Sidebar.tsx`

Barra lateral de navegação (desktop e mobile).

---

### BottomNav
**Localização:** `/src/app/components/BottomNav.tsx`

Navegação inferior para mobile.

---

### Navbar
**Localização:** `/src/app/components/Navbar.tsx`

Barra superior com busca e perfil.

---

## 🎨 Diretrizes de Design

### Cores
- Brand (vermelho): `#ff164c`
- Background base: `#0a0608`
- Background sidebar: `#1c1315`
- Border: `#30292b`
- Texto primário: `#f8f8f8` / `#bababa`
- Texto muted: `#a19a9b`
- Texto subtil: `#5b4f51`

### Espaçamentos
- Gap pequeno: `gap-2` (8px)
- Gap médio: `gap-4` (16px)
- Gap grande: `gap-6` (24px)
- Padding padrão: `px-[37px]`

### Transições
- Duração padrão: `duration-150`
- Hover effects: scale, opacity, colors

### Bordas
- Border padrão: `border-[#30292b]`
- Border ativa: `border-[#ff164c]`
- Radius pequeno: `rounded-md`
- Radius médio: `rounded-lg`
- Radius completo: `rounded-full`

---

## ✅ Checklist Antes de Criar Novo Componente

1. [ ] Verificar se já existe um componente similar
2. [ ] Verificar se pode ser uma variante de um existente
3. [ ] Verificar se pode ser composto de componentes existentes
4. [ ] Usar cores e tokens do design system
5. [ ] Adicionar props de className para extensibilidade
6. [ ] Documentar o novo componente neste arquivo
7. [ ] Usar componentes reutilizáveis sempre que possível

---

## 🔄 Componentes em Uso

### FavoriteButton
- Usado em: `MusicPlayer`, `MusicCard`, `DiscoverPage`
- Comportamento consistente em todos os contextos

### MusicCard
- Usado em: `DiscoverPage`, `HomePage` (via MusicCarousel)
- Variantes: grid e list

### SearchInput
- Usado em: `Navbar`, `DiscoverPage`
- Comportamento de busca consistente

---

**Última atualização:** 2024
**Responsável:** Mars Sound AI Team
