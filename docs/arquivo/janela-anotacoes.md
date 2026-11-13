# Tarefa: janela do bloco Anotações (bancada, 4 versões)

**Para o Fable (ou Opus), em sessão nova.** Só bancada, nada aplicado no app. Pasta: `lab/livre/<ideia>/v1..v4` (lab livre, D133); pode usar a pasta `lab/livre/notas-janela/` (apague as versões antigas ao começar) ou criar outra.

## O que pedir
Dê **4 versões** da janela do bloco Anotações da Mesa (cabeçalho/barra + campo de texto) do jeito que você achar melhor. Não há restrição de caminho: proponha o que achar mais bonito e usável. (Valem as regras gerais do `CLAUDE.md`: vitrine, tokens, os dois temas, tablet e PC.)

## Contexto
- A referência do usuário é `lab/referencias/barra-referencia.png`: uma barra de formatação que se mescla ao menu do topo da janela: ☰, H1 H2, B I U, marca-texto, listas, link; à direita marcador, Aa, ⋮, expandir, fechar; campo de texto embaixo.
- O usuário quer: barra de formatação no topo da janela do bloco (não embaixo), pouca altura gasta, e **diferença clara entre a barra e o campo de texto** (hoje não há linha, cor ou algo que diferencie).
- Decidido: o "Salvar" do bloco Cartões fica no cabeçalho (D140); barra de formatação "igual ao print" (D141); janela de bloco V2 do `mesa-blocos` era a preferida.
- Perguntas em aberto que as versões devem resolver: **quais botões** ficam na barra de formatação; **quais utilidades** (ampliar, fechar, menu ⋮) ficam visíveis e quais vão no menu; marcador e Aa existem no print mas **não têm função definida**; bloco estreito (320 px) hoje corta o lado direito da barra.
- Já tentado e **não aprovado**: campo com contorno fino; campo com fundo próprio; barra em pílula recuada; sombra ao rolar o texto (sozinha ou com campo de fundo), em várias combinações de botões visíveis. A que mais agradou foi a "sombra ao rolar", mas ainda assim nenhuma serviu. Veja `lab/livre/notas-janela/LEIA-ME.md` e `lab/livre/barra-formatacao/`, `lab/livre/mesa-blocos/` (`_fusao.tsx`) se quiser reaproveitar código.

## Entrega
`LEIA-ME.md` na pasta com as 4 versões e sua recomendação; prints (`npm run tela`) claro e escuro; link local completo. Ao fim, atualize só `docs/estado.md`.
