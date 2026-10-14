## Prompt de Design para Figma Make: Telas de Configurações do Mars Sound AI

Este prompt instrui o Figma Make a criar duas artboards de design de alta fidelidade para a tela de configurações do sistema **Mars Sound AI**, baseada nas imagens de referência fornecidas. O design deve ter um tema escuro e moderno, perfeitamente integrado com o estilo visual existente.

### Elementos de Interface Compartilhados (Em Ambas as Telas)

* **Fundo:** Manter o fundo escuro complexo com padrões de luz abstratos, idêntico às imagens de referência.
* **Barra de Topo:**
    * Caixa de pesquisa ("Buscar músicas ou artistas") à esquerda.
    * Avatar do usuário e ícone de perfil à direita (usar o mesmo avatar da imagem de referência).
* **Menu Lateral (Esquerdo):**
    * Todos os itens de menu (Início, Descobrir, Playlist, Favoritos, Perfil, Configurações) com seus ícones e texto correspondentes.
    * O item de menu "Configurações" deve estar **ativo**, destacado com o fundo vermelho/rosa e texto branco.
    * O botão "Carregar música AI" no final.
* **Player de Música (Rodapé):**
    * Informações da música (Capa, Nome da faixa e artista), barra de progresso, controles de reprodução (Anterior, Play/Pause, Próximo, Loop, Volume, etc.), exatamente como nas imagens de referência.

---

### Tela 1: Artboard "Configurações - Aba Perfil" (Ativa)

*Ref: Baseada em image_3.png*

* **Título Principal:** "Configurações" (Config), Subtítulo "Gerencie sua conta e prederências" (Manage your account and preferences).
* **Barra de Abas (Tabs):** Posicionada abaixo do título.
    * Aba "Perfil": Ativa, com fundo vermelho/rosa e texto branco.
    * Aba "Conta": Inativa, com fundo escuro e texto branco.
* **Painel 1: `Informações do perfil`**
    * **Capa/Avatar:** Uma área quadrada distinta para o avatar do usuário com um ícone de imagem e o texto "Capa". Permitir upload de imagem.
    * **Campos de Texto (Inputs):** Três campos de entrada com texto de espaço reservado: "Nome do usuário", "@username" (e.g., '@lucasmarteux'), e "Uma frase para representar seu perfil" (A phrase to represent your profile). Os campos devem ter bordas e fundos escuros para entrada de texto.
    * **Perfil Público (Switch):** Um switch seletor (on/off, ativo/vermelho), com a descrição ao lado: "Outros usuários poderão ver seu perfil e encontrar nas buscas".
    * **Botão de Ação:** Um botão "Salvar alterações" (red) posicionado ao lado da descrição do switch.
* **Painel 2: `Preferências musicais`**
    * **Gêneros Favoritos:** Rótulo "Gêneros favoritos", seguido por um conjunto de tags interativas: `Ambient`, `Pop`, `Rock`, `Gospel`, `Samba`, `Clássica`, `Jazz`, `Blues`, `Country`, `Reggae`, `Hip-hop`, `Eletronic`, `Metal`, `Opera`.
    * **Estados das Tags de Gênero:** As seguintes tags devem estar **destacadas** (fundo vermelho/rosa e texto branco): `Gospel`, `Jazz`, `Country`, `Eletronic`. As outras devem estar inativas (dark).
    * **Clima:** Rótulo "Clima", seguido por um conjunto de tags: `Calmo`, `Concentrado`, `Relaxante`, `Inspirador`, `Divertido`, `Festivo`, `Sofisticado`, `Romântico`, `Introspectivo`, `Cativante`.
    * **Estados das Tags de Clima:** As seguintes tags devem estar **destacadas**: `Inspirador`, `Romântico`. As outras inativas.
    * **Botão de Ação:** Um segundo botão "Salvar alterações" (red) na parte inferior direita deste painel.

---

### Tela 2: Artboard "Configurações - Aba Conta" (Ativa)

*Ref: Baseada em image_4.png*

* **Layout:** Idêntico à Tela 1 (fundo, menu lateral, barra de topo, player, título).
* **Barra de Abas (Tabs):** Posicionada abaixo do título.
    * Aba "Perfil": Inativa, com fundo escuro.
    * Aba "Conta": Ativa, com fundo vermelho/rosa e texto branco.
* **Painel 1: `Informações da conta`**
    * **Campos de Texto:** Três campos de entrada com texto pré-preenchido e marcadores de posição:
        * Campo de E-mail: Preenchido com `lucas@gmail.com`.
        * Campo de Senha Atual: Preenchido com pontos de máscara de senha.
        * Campo de Nova Senha (Placeholder): "Nova senha".
        * Campo de Confirmar Nova Senha (Placeholder): "Nova senha".
    * **Botão de Ação:** Um botão "Salvar alterações" (red) posicionado ao lado dos campos de senha.
* **Painel 2: `Sair da conta ou excluir`**
    * **Sair da Conta:** Rótulo "Sair da conta" e descrição "Encerrar sua sessão neste dispositivo".
    * **Botão de Sair da Conta (Red):** Um botão vermelho com o texto exato: `Sair da conta`.
    * **Encerrar Conta:** Rótulo "Encerrar conta" e descrição "Excluir permanentemente sua conta e todos os seus dados".
    * **Botão de Excluir Conta (Red):** Um botão vermelho distinto com o texto exato: `Excluir conta`.

---

### Instruções Adicionais para Figma Make

* Garanta que a tipografia e os tamanhos de fonte sejam consistentes e profissionais, com títulos em negrito e metadados menores.
* Os botões devem ter cantos arredondados e cores de fundo vermelhas/rosas para ações ativas.
* Use componentes do Figma para garantir a reutilização e consistência.
* Organize as camadas de forma clara com nomes de seção e componente.
* As artboards devem ser grandes o suficiente para mostrar a tela inteira (incluindo o player) e devem estar localizadas lado a lado para facilitar a conexão entre os designs.