# Ohara: visão do produto

**Status:** versão 2, rascunho para aprovação. Data: 05/11/2026.
**Papel deste documento:** referência estável (muda raramente) sobre para quem é o app, o que resolve, o que importa mais e o que não faremos. Detalhes ficam em outros documentos: decisões técnicas em `decisoes.md`, telas em `telas.md`, teclas em `teclado.md`, regras de negócio em `regras.md`.

**Papéis no projeto:**
- **Usuário:** dono do produto (Product Owner). Decide o que o app faz e a prioridade.
- **Claude (chat):** arquiteto e analista. Propõe decisões técnicas e escreve a documentação.
- **Claude Code:** desenvolvedor. Implementa uma etapa por vez.

## 1. O que é

Ohara é o app pessoal de estudo de um estudante de medicina. Reúne **slides das aulas, anotações, cartões de revisão, agenda, lembretes e notas do boletim**, e funciona bem em sala de aula, com teclado ou com toque.

É uma **reescrita do zero** de um app anterior (o "legado"). O legado serve só como **especificação de comportamento**; nenhum código nem dado é migrado.

## 2. Para quem

Uma única pessoa. Não será comercializado, publicado em loja nem compartilhado.

- **Quem usa:** estudante de medicina, **não programa**.
- **Onde usa:** Galaxy Tab S7 FE (principal, **sempre na horizontal, modo paisagem**, em sala, com teclado físico ABNT2), PC com Linux Mint (tela 1920x1200) e celular Android (consulta e uso leve).
- **Como usa:** principalmente por **teclado, no estilo de gerenciador de janelas** (i3, Hyprland). Mouse e toque também funcionam, e o **toque é cidadão de primeira classe** (pinça, deslizar, alvos grandes).
- **Endereço público:** o app fica aberto na internet. A privacidade vem de os dados ficarem no aparelho e de as Notas serem cifradas, não de esconder o endereço.

## 3. Problema que resolve

Em aula, o estudante precisa ver o slide, anotar e criar cartões **ao mesmo tempo**, sem perder a atenção. Fora dela, precisa saber o que estudar e o que vence, e revisar no momento certo. Ferramentas separadas obrigam a alternar janelas e refazer o contexto.

Incômodos do app anterior que o novo deve eliminar:
- Atalhos de teclado que conflitavam entre si.
- O login ocasional na nuvem, que interrompia o uso.

## 4. Critérios que decidem tudo

**Critério principal: zero trabalho para usar.** Abrir o endereço, instalar pelo navegador, usar. Sem programas para instalar, sem servidor, sem passos técnicos recorrentes.

**Critérios secundários (mesmo nível; no conflito, decide o usuário):**
- **Pouca manutenção.** Atualiza sozinho, avisa quando há versão nova e não exige atenção semanal.
- **Qualidade máxima.** Sem perda de dados, sem travar em sala, sem conflito de teclas, com testes automáticos protegendo o que já funciona.
- **Privacidade real.** Notas e boletim só o dono vê, inclusive na nuvem.

**Atritos aceitos conscientemente:** o login ocasional na nuvem (reduzido ao mínimo possível) e a **frase de acesso** das Notas. Esta é uma exceção ao critério principal, escolhida em nome da privacidade, e tem um custo: perdendo a frase e o código de recuperação, os dados das Notas são irrecuperáveis.

**Princípio de interação: teclado primeiro, toque de igual para igual.** Toda ação importante tem atalho e também funciona com o dedo.

## 5. O que o app tem

**Seis telas** (Alt+1 a 6). Cada uma é detalhada em `telas.md`.

- **Hub:** visão do dia (agenda, próximas provas, calendário, lembretes).
- **Mesa:** espaço de trabalho de **uma aula**, com Slides, Anotações e Cartões lado a lado. O arranjo é lembrado por aula e por aparelho.
- **Acervo:** biblioteca de matérias, aulas e cartões, com busca.
- **Treino:** revisão dos cartões com repetição espaçada.
- **Agenda:** provas, tarefas, estudos, grade horária e lembretes; porta de entrada das Notas.
- **Configs:** tema, sincronização, backup, segurança e ajuda de atalhos.

**Organização do conteúdo:** ano do curso → matéria → bimestre → aula.

**Consulta rápida:** janelas flutuantes (Lembretes, Agenda do dia, Calendário, Próximas provas), abertas pela Paleta (Alt+P) em qualquer tela.

**Funciona sem internet.** As mudanças feitas offline sincronizam sozinhas ao reconectar.

**Aproveitado do app antigo:** a lista completa de funções mantidas está em `telas.md`, e as regras de comportamento em `regras.md`.

## 6. O que não faremos

- **Comercializar, abrir para outros usuários ou publicar em loja.**
- **Migrar código ou dados do legado.** Só as regras de comportamento são aproveitadas.
- **Painel de estudo, metas e sequência de dias.** Cortados por decisão.
- **Novos blocos de mosaico além de Slides, Anotações e Cartões**, e **mais de um bloco do mesmo tipo** na Mesa. A consulta rápida é por janela, não por bloco.
- **Servidor próprio, contas de usuário ou backend.** Tudo roda no aparelho; a nuvem é só cópia.
- **Edição simultânea e colaboração.** Editando nos dois aparelhos, vale a última edição; o histórico de versões das anotações é a rede de segurança.
- **App nativo ou de loja.** Só instalação pelo navegador.

### Entra no fim do projeto

O **boletim com Notas cifradas e o PIN** chegam na última fase de desenvolvimento, depois do essencial. Depois deles, nesta ordem: **Sala de Foco, integração com Anki e gerador automático de revisões** (1, 7 e 30 dias).

## 7. Como saberemos que está bom

Critérios observáveis, verificados pelo próprio usuário. Os números são **propostas** para o usuário confirmar ou ajustar.

- **Instalação:** em cada aparelho, abrir o endereço, instalar e usar em menos de 2 minutos, sem ajuda.
- **Sala de aula:** havendo aula na Grade, abrir a Mesa da aula atual e chegar ao cursor no campo de Anotações em **no máximo 3 ações de teclado**, a partir de qualquer tela.
- **Teclado:** em cada contexto, cada tecla faz uma só coisa; Esc sempre faz o que o contexto promete; todo atalho aparece na ajuda.
- **Toque:** todas as ações da Mesa e do Treino são possíveis só com o dedo.
- **Dados:** nenhuma anotação nem cartão é perdido. Falhas de armazenamento são **sempre mostradas**, nunca silenciosas.
- **Offline:** o dia de aula inteiro (slides de hoje, anotações, cartões) funciona sem internet.
- **Manutenção:** o app avisa de versão nova e atualiza com um toque.
- **Regressão:** o comando único de verificação (`npm run check`) passa antes de toda publicação.

## 8. Limites conhecidos

O app instala em navegadores Chromium (o Firefox não instala PWAs no Linux). Demais limites técnicos estão registrados em `decisoes.md`.

## 9. Glossário

Cada termo tem **um único sentido** nos documentos e no código. Atenção: **Anotações** e **Notas** são coisas diferentes.

| Termo | Significado |
|---|---|
| **Ano do curso** | Nível mais alto da hierarquia |
| **Matéria** | Disciplina, com sigla de 1 a 4 letras (ex.: IMU) |
| **Bimestre** | Pasta dentro da matéria. "Sem bimestre" = aulas sem pasta |
| **Aula** | Unidade de estudo, com slides, anotações e cartões. Pertence a uma matéria e, opcionalmente, a um bimestre |
| **Aula atual** | A aula que a Grade ou a Agenda indica para o momento presente. Sem ela, "Mesa da aula atual" fica desativado |
| **Slides** | O PDF ou as imagens da aula, exibidos no bloco Slides |
| **Livro** | PDF de material de estudo (ex.: livro-texto), do mesmo tipo que os Slides. Pode ser anexado a uma **matéria** (livro inteiro) ou a uma **aula** (só o capítulo correspondente) |
| **Mesa** | Tela de trabalho de uma aula, em mosaico |
| **Hub** | Tela de visão do dia, também em mosaico |
| **Acervo** | Biblioteca de matérias, aulas e cartões |
| **Treino** | Tela de revisão dos cartões |
| **Agenda** | Tela de provas, tarefas, estudos, grade e lembretes |
| **Grade** | Horário semanal de aulas |
| **Bloco** | Painel do mosaico. Na Mesa, só Slides, Anotações ou Cartões |
| **Mosaico** | Organização automática de blocos sem sobreposição, estilo dwindle: o novo bloco divide o bloco em foco pelo lado mais longo |
| **Anotações** | Texto que o estudante escreve sobre uma aula (com histórico de versões) |
| **Notas** | Resultados de provas e do boletim (média, pesos, bônus). **Não confundir com Anotações** |
| **Cartão** | Pergunta e resposta para revisão espaçada. **Baralho** = conjunto de cartões |
| **Lembrete** | Item da lista de tarefas. Lembrete e tarefa simples são a mesma coisa |
| **Lixeira** | Onde ficam itens apagados, recuperáveis por um tempo |
| **Paleta** | Caixa de comandos aberta por Alt+P |
| **Janela de consulta** | Janela flutuante modal aberta pela Paleta |
| **Níveis de foco** | Menu, bloco e campo. Enter desce um nível, Esc sobe |
| **Sincronização** | Cópia dos dados entre aparelhos pela nuvem, com a última edição valendo |
| **Frase de acesso** | Frase própria que protege as Notas |
| **Código de recuperação** | Mostrado uma única vez; reabre as Notas se a frase for esquecida |
| **Legado** | O app antigo, usado só como especificação |
