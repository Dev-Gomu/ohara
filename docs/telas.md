# Ohara: telas

**Status:** versão 1, escrita na Etapa 3 a partir do legado e de `diretrizes-visuais.md`. Data: 07/11/2026.
**Papel:** o que cada tela mostra e faz. O mapa de foco (blocos, chegada, Enter) está na seção 5 das diretrizes e não se repete aqui.

## Comum a todas
- Barra do topo: números 1 a 6, título da tela e ajuda (?). A página nunca rola.
- Alt P abre a Paleta em qualquer tela. Alt I abre o lembrete rápido.
- Os dados ficam no banco do aparelho. Só o modo exemplo (`?exemplo` na URL, para testes e dev) usa dados fictícios e mostra o aviso "Dados de exemplo".

## 1. Hub (Alt 1)
Visão do dia. Título: data de hoje.
- **Próximas provas:** cartões com dias restantes, matéria, data e hora.
- **Calendário do mês:** hoje em destaque, dias de prova marcados.
- **Agenda de hoje:** aulas na cor da matéria, a de agora em destaque. Enter abre a aula na Mesa.
- **Lembretes de hoje:** marcar como feito e criar.

## 2. Mesa (Alt 2)
Trabalho em uma aula. Título: nome da aula, data e sigla.
- **Slides:** páginas do PDF. Alt [ e Alt ] passam a página de qualquer bloco.
- **Anotações:** texto com títulos, listas, marca-texto e histórico de versões.
- **Cartões:** abas **Novo** e **Salvos**. Novo é o editor do app antigo: `@ frente` abre um cartão e as linhas de baixo são o verso (`#` seção, `-` item, `1.` número, `+` a favor, `--` contra, `?` dúvida, `**negrito**`, `==destaque==`), com prévia ao lado. Alt N abre um cartão novo de qualquer bloco da Mesa; Ctrl Enter salva os completos e deixa os incompletos no editor. Salvos lista os da aula (editar e excluir ficam para depois).
- Arranjo lembrado por aula e por aparelho. Sem aula atual, abre a última aula usada.

## 3. Acervo (Alt 3)
Biblioteca. **Início:** régua de anos e grade de matérias (cor, sigla, nome, aulas, último acesso); ano arquivado é só consulta. **Matéria aberta:** régua de pastas (Todas, bimestres, Sem bimestre, Nova pasta), lista de aulas por data e prévia da aula. Abas Aulas e Cartões dentro da matéria. Busca por matéria, aula ou cartão com Alt F.

## 4. Treino (Alt 4)
Revisão com repetição espaçada. **Escolha:** régua de matérias (Todas ou uma), lista do que treinar (tudo, bimestres e, na matéria, cada aula, com marcar várias) e resumo com Iniciar; a escolha fica lembrada e o foco nasce em Iniciar. Sem cartão vencido, Iniciar vira "Adiantar". Em sessão: cartão ampliado, Espaço vira, 1 a 4 respondem (Errei, Difícil, Bom, Fácil), progresso à vista. Fim de sessão com resumo.

## 5. Agenda (Alt 5)
Régua de visão (Semana, Mês, Lista), grade de horários, provas, trabalhos, compromissos e lembretes. Porta de entrada das Notas, que chegam na Etapa 13.

## 6. Configs (Alt 6)
Lista de seções e detalhe: Aparência (tema), Atalhos, Sincronização, Backup, Segurança, Sobre (versão).

## Janelas de consulta (Paleta)
Lembretes, Agenda do dia, Calendário e Próximas provas. Abrem sobre qualquer tela, sem perder o lugar.
