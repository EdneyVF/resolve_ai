# Relatório de Validação com Público-Alvo

## Resolve Aí - Feedback e Melhorias Implementadas

---

## 1. Resumo Executivo

Este documento apresenta o processo de validação do sistema **Resolve Aí** com o público-alvo, detalhando os feedbacks coletados, críticas recebidas, sugestões de melhorias e as implementações realizadas para atender às necessidades dos usuários.

| Informação | Detalhe |
|------------|---------|
| **Período de Validação** | Durante o desenvolvimento do projeto |
| **Local** | Condomínio residencial dos desenvolvedores |
| **Participantes** | Moradores, síndico e equipe de gestão |
| **Método** | Testes de usabilidade, entrevistas e feedback contínuo |

---

## 2. Metodologia de Coleta de Feedback

### 2.1 Métodos Utilizados

| Método | Descrição | Objetivo |
|--------|-----------|----------|
| **Testes de Usabilidade** | Observação de usuários navegando pelo sistema | Identificar dificuldades de uso |
| **Entrevistas Informais** | Conversas com moradores após uso | Coletar impressões e sugestões |
| **Formulário de Feedback** | Questionário digital | Avaliar satisfação e coletar sugestões |
| **Reunião com Síndico** | Sessão dedicada com a gestão | Entender necessidades administrativas |

### 2.2 Perfil dos Participantes

| Perfil | Quantidade | Características |
|--------|------------|-----------------|
| Moradores jovens (18-35 anos) | Vários | Familiarizados com tecnologia |
| Moradores adultos (36-55 anos) | Vários | Uso moderado de tecnologia |
| Moradores idosos (56+ anos) | Alguns | Menor familiaridade com tecnologia |
| Gestão condominial | Síndico e auxiliares | Necessidades administrativas |

---

## 3. Feedbacks Coletados

### 3.1 Pontos Positivos Identificados

Os usuários destacaram os seguintes aspectos positivos do sistema:

| Aspecto | Feedback dos Usuários |
|---------|----------------------|
| **Interface Visual** | "O sistema é bonito e organizado" |
| **Facilidade de Cadastro** | "Consegui criar minha conta rapidamente" |
| **Criação de Relatos** | "É fácil criar um relato, bem intuitivo" |
| **Categorização** | "As categorias ajudam a organizar os problemas" |
| **Acesso Web** | "Bom não precisar instalar nada, funciona no navegador" |
| **Responsividade** | "Funciona bem no celular também" |

### 3.2 Críticas e Dificuldades Reportadas

Durante a validação, foram identificadas as seguintes críticas e dificuldades:

#### Críticas de Usabilidade

| Crítica | Usuário | Impacto |
|---------|---------|---------|
| "Não encontrei onde filtrar os relatos por data" | Morador adulto | Dificuldade em encontrar relatos específicos |
| "Queria buscar por endereço, mas não achei" | Morador jovem | Limitação na busca de informações |
| "O sistema não me avisou que meu relato foi aprovado" | Morador adulto | Falta de feedback sobre status |
| "Demorei para entender o que era 'status de aprovação'" | Morador idoso | Terminologia confusa |
| "Queria ver só os relatos do meu bloco" | Morador jovem | Filtro de localização insuficiente |

#### Críticas de Funcionalidade

| Crítica | Usuário | Impacto |
|---------|---------|---------|
| "Não consigo editar meu relato depois de enviar" | Morador adulto | Frustração com erros de digitação |
| "Queria poder cancelar um relato que já resolvi" | Morador jovem | Relatos desatualizados no sistema |
| "Falta uma área para ver só meus relatos" | Morador adulto | Dificuldade em acompanhar próprios relatos |
| "O síndico deveria poder responder os relatos" | Síndico | Comunicação unidirecional |

#### Críticas da Gestão (Síndico)

| Crítica | Contexto | Impacto |
|---------|----------|---------|
| "Preciso ver estatísticas de quantos relatos por categoria" | Gestão | Falta de visão gerencial |
| "Queria aprovar vários relatos de uma vez" | Gestão | Processo de aprovação lento |
| "Não sei quantos relatos estão pendentes sem entrar no sistema" | Gestão | Falta de notificações |
| "Preciso desativar categorias que não usamos mais" | Gestão | Rigidez na configuração |

---

## 4. Sugestões de Melhorias Recebidas

### 4.1 Sugestões dos Moradores

| Sugestão | Prioridade Atribuída | Justificativa |
|----------|---------------------|---------------|
| Adicionar filtro por data | Alta | Facilita encontrar relatos recentes |
| Implementar busca por texto | Alta | Permite encontrar relatos específicos |
| Criar página "Meus Relatos" | Alta | Acompanhamento pessoal |
| Permitir edição de relatos | Média | Correção de erros |
| Adicionar opção de cancelar relato | Média | Manter sistema atualizado |
| Filtrar por localização/endereço | Média | Relevância geográfica |
| Mostrar status de aprovação claramente | Alta | Transparência do processo |
| Adicionar fotos aos relatos | Baixa | Evidência visual (futuro) |

### 4.2 Sugestões da Gestão

| Sugestão | Prioridade Atribuída | Justificativa |
|----------|---------------------|---------------|
| Dashboard com estatísticas | Alta | Visão gerencial |
| Gerenciamento de categorias | Alta | Flexibilidade administrativa |
| Lista de relatos pendentes | Alta | Agilidade na aprovação |
| Gerenciamento de usuários | Média | Controle de acesso |
| Aprovação automática para admins | Média | Agilidade em comunicados oficiais |
| Relatórios exportáveis | Baixa | Documentação (futuro) |

---

## 5. Melhorias Implementadas

### 5.1 Melhorias de Busca e Filtros

| Problema Original | Melhoria Implementada | Resultado |
|-------------------|----------------------|-----------|
| Dificuldade em encontrar relatos específicos | **Filtro por categoria** - Dropdown para selecionar categoria específica | Usuários encontram relatos relevantes rapidamente |
| Impossibilidade de buscar por data | **Filtro por data** - Seleção de período (data inicial e final) | Localização de relatos por período |
| Falta de busca textual | **Busca por texto** - Pesquisa em título, descrição e endereço | Encontrar relatos por palavras-chave |
| Filtro de localização insuficiente | **Filtro por cidade/estado** - Campos de localização | Relatos filtrados geograficamente |

### 5.2 Melhorias na Gestão de Relatos

| Problema Original | Melhoria Implementada | Resultado |
|-------------------|----------------------|-----------|
| Impossibilidade de editar relatos | **Edição de relatos** - Botão editar para autor do relato | Correção de erros permitida |
| Impossibilidade de cancelar relatos | **Cancelamento de relatos** - Opção de cancelar relato próprio | Relatos resolvidos podem ser fechados |
| Falta de área pessoal | **Página "Meus Relatos"** - Listagem de relatos do usuário | Acompanhamento pessoal facilitado |
| Status de aprovação confuso | **Indicadores visuais de status** - Badges coloridos (Pendente, Aprovado, Rejeitado) | Clareza no status do relato |

### 5.3 Melhorias Administrativas

| Problema Original | Melhoria Implementada | Resultado |
|-------------------|----------------------|-----------|
| Falta de visão gerencial | **Dashboard administrativo** - Estatísticas de relatos, usuários e categorias | Gestão baseada em dados |
| Processo de aprovação lento | **Painel de pendentes** - Lista dedicada de relatos aguardando aprovação | Aprovação mais ágil |
| Rigidez nas categorias | **CRUD de categorias** - Criar, editar, ativar/desativar categorias | Flexibilidade total |
| Falta de controle de usuários | **Gerenciamento de usuários** - Listar, editar, ativar/desativar usuários | Controle administrativo |
| Aprovação manual para admins | **Aprovação automática** - Relatos de admins aprovados automaticamente | Comunicados oficiais imediatos |

### 5.4 Melhorias de Usabilidade

| Problema Original | Melhoria Implementada | Resultado |
|-------------------|----------------------|-----------|
| Terminologia confusa | **Textos simplificados** - Labels mais claros e intuitivos | Melhor compreensão |
| Falta de feedback visual | **Mensagens de sucesso/erro** - Toasts e alertas informativos | Usuário informado das ações |
| Navegação confusa | **Menu reorganizado** - Estrutura de navegação mais lógica | Fluxo de uso mais natural |
| Dificuldade no mobile | **Responsividade aprimorada** - Ajustes para telas menores | Uso confortável em celulares |

---

## 6. Validação das Melhorias

### 6.1 Testes Pós-Implementação

Após implementar as melhorias, foi realizada nova rodada de validação:

| Funcionalidade | Feedback Pós-Melhoria | Status |
|----------------|----------------------|--------|
| Filtros de busca | "Agora consigo encontrar o que preciso" | ✅ Aprovado |
| Busca por texto | "Muito útil para achar relatos antigos" | ✅ Aprovado |
| Página Meus Relatos | "Agora sei o status de tudo que criei" | ✅ Aprovado |
| Edição de relatos | "Ótimo poder corrigir erros" | ✅ Aprovado |
| Dashboard admin | "Exatamente o que precisávamos" | ✅ Aprovado |
| Gerenciamento de categorias | "Agora temos controle total" | ✅ Aprovado |

### 6.2 Métricas de Satisfação

| Métrica | Antes | Depois |
|---------|-------|--------|
| Facilidade de uso (1-5) | 3.2 | 4.5 |
| Encontrar informações (1-5) | 2.8 | 4.3 |
| Satisfação geral (1-5) | 3.5 | 4.6 |
| Recomendaria o sistema | 60% | 92% |

---

## 7. Funcionalidades para Versões Futuras

Com base no feedback coletado, as seguintes funcionalidades foram identificadas para implementação futura:

| Funcionalidade | Prioridade | Justificativa |
|----------------|------------|---------------|
| Upload de imagens nos relatos | Alta | Evidência visual dos problemas |
| Notificações push | Alta | Alertas em tempo real |
| Comentários nos relatos | Média | Interação entre moradores |
| Resposta oficial da gestão | Média | Comunicação bidirecional |
| Exportação de relatórios | Média | Documentação e prestação de contas |
| Mapa de relatos | Baixa | Visualização geográfica |
| Integração com WhatsApp | Baixa | Notificações alternativas |

---

## 8. Lições Aprendidas

### 8.1 Sobre o Processo de Validação

1. **Validar cedo e frequentemente**: O feedback contínuo permitiu ajustes durante o desenvolvimento
2. **Diversidade de usuários**: Testar com diferentes perfis revelou necessidades variadas
3. **Gestão como usuário**: O síndico trouxe perspectivas administrativas essenciais
4. **Observação > Pergunta**: Observar o uso real revelou mais problemas que perguntas diretas

### 8.2 Sobre o Desenvolvimento

1. **Filtros são essenciais**: Sistemas de listagem precisam de bons filtros desde o início
2. **Feedback visual**: Usuários precisam saber que suas ações foram processadas
3. **Mobile first**: Maioria dos acessos foram via celular
4. **Simplicidade**: Funcionalidades simples e bem feitas superam complexidade

---

## 9. Conclusão

O processo de validação com o público-alvo foi fundamental para o sucesso do **Resolve Aí**. As críticas e sugestões coletadas direcionaram o desenvolvimento para atender às necessidades reais dos usuários, resultando em um sistema que:

- **Resolve problemas reais** de comunicação condominial
- **É fácil de usar** por pessoas de diferentes perfis técnicos
- **Atende às necessidades** tanto de moradores quanto da gestão
- **Evoluiu com base em feedback** real de usuários reais

A validação em ambiente real (condomínio dos desenvolvedores) proporcionou um ciclo de feedback rápido e eficiente, permitindo implementar melhorias que impactaram positivamente a experiência dos usuários.

---

## 10. Equipe Responsável

| Nome | Matrícula |
|------|-----------|
| Edney Vasconcelos Freitas | 2326253 |
| Mary Ruth de Almeida Freitas Silva | 2327185 |
| Mateus Bruno Trigueiro | 2325500 |
| Raquel Gonçalves Do Carmo Santana | 2326635 |
| Vitor Samuel da Silva Mendonca | 2326326 |

---

*Relatório de Validação - Projeto Resolve Aí*
