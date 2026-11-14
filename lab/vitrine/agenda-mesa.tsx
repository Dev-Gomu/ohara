// Peças da Agenda e da Mesa (10/11): filtro, pílula do dia, evento, alternadores, abas e modo.
import { ModeIndicator } from '../../src/ui/components/Island';
import { FilterChip, FilterGrid } from '../../src/ui/components/Filter';
import { DayPill, SubjectMark } from '../../src/ui/components/Pill';
import { DayItem } from '../../src/ui/components/DayItem';
import { FormatBar, type FormatTool } from '../../src/ui/components/FormatBar';
import { FaultCell } from '../../src/ui/components/FaultCell';
import { BlockTab, BlockTabs, BlockToggle, ToggleGroup } from '../../src/ui/components/Toggles';
import { CardPicture, ImageAttach } from '../../src/ui/components/CardImages';
import { Amostra, Ficha, Linha, Secao } from './moldura';

const MATERIAS = [
  ['GEN', 0],
  ['IMU', 2],
  ['PRO', 1],
  ['APS', 3],
  ['FAR', 4],
] as const;

const nada = () => undefined;
// Imagem de mentira (sem arquivo): retângulo chapado em SVG.
const AMOSTRA_IMAGEM =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140"><rect width="240" height="140" fill="#8fb3d9"/><path d="M20 120 90 60l40 40 30-30 60 50" stroke="#0f1a24" stroke-width="6" fill="none"/></svg>');
const ferr = (id: string, label: string, glyph: string, priority: FormatTool['priority'], sel = false): FormatTool => ({
  id, label, glyph, priority, sel, run: nada,
});
const FORMATOS = [
  [ferr('h1', 'Título 1', 'H1', 1), ferr('h2', 'Título 2', 'H2', 1)],
  [ferr('b', 'Negrito', 'B', 1, true), ferr('i', 'Itálico', 'I', 2), ferr('u', 'Sublinhado', 'U', 2)],
  [ferr('l', 'Lista', '•', 3), ferr('k', 'Link', '↗', 4)],
];

export function AgendaMesa() {
  return (
    <>
      <Secao>Agenda e Mesa</Secao>
      <Ficha
        nome="Filtro de matérias"
        arquivo="Filter"
        largura={4}
        uso="Uma escolha. A marca mostra a cor de cada matéria; a escolhida ganha o fundo de escolhido."
      >
        <Amostra estado="IMU escolhida · cursor em FAR">
          <FilterGrid label="Matérias">
            <FilterChip>Todas</FilterChip>
            {MATERIAS.map(([code, color]) => (
              <FilterChip
                key={code}
                subject={color}
                selected={code === 'IMU'}
                cursor={code === 'FAR'}
              >
                {code}
              </FilterChip>
            ))}
          </FilterGrid>
        </Amostra>
      </Ficha>
      <Ficha
        nome="Pílula do dia e evento"
        arquivo="Pill"
        largura={4}
        uso="Cabeça da célula de dia (semana, mês, lista). Hoje fica cheia. Evento: marca, sigla e hora."
      >
        <Linha>
          <Amostra estado="comum">
            <DayPill weekday="SEG" number="9" />
          </Amostra>
          <Amostra estado="hoje">
            <DayPill weekday="TER" number="10" today />
          </Amostra>
        </Linha>
        <Amostra estado="eventos">
          <SubjectMark code="GEN" color={0}>
            08:00
          </SubjectMark>
          <SubjectMark code="PRO" color={1}>
            Prova 15:15
          </SubjectMark>
        </Amostra>
      </Ficha>
      <Ficha
        nome="Alternadores e abas"
        arquivo="Toggles"
        largura={4}
        uso="Mostrar ou esconder blocos (barra do topo) e abas no cabeçalho do bloco."
      >
        <Amostra estado="Cartões fechado, com cursor">
          <ToggleGroup label="Blocos">
            <BlockToggle name="Slides" letter="S" open onToggle={nada} />
            <BlockToggle name="Cartões" letter="C" open={false} cursor onToggle={nada} />
          </ToggleGroup>
        </Amostra>
        <Amostra estado="abas">
          <BlockTabs label="Cartões">
            <BlockTab selected onPress={nada}>
              Novo
            </BlockTab>
            <BlockTab selected={false} count={12} onPress={nada}>
              Salvos
            </BlockTab>
          </BlockTabs>
        </Amostra>
      </Ficha>
      <Ficha
        nome="Item do dia"
        arquivo="DayItem"
        largura={6}
        uso="Agenda de hoje: hora em duas linhas, título e sigla em texto; a matéria é um tom no fundo. Aula passada fica apagada."
      >
        <Amostra estado="normal">
          <DayItem start="08:00" end="10:00" title="Genética médica" code="GEN" color={0} />
        </Amostra>
        <Amostra estado="passada">
          <DayItem start="06:00" end="08:00" title="Imunologia" code="IMU" color={2} past />
        </Amostra>
      </Ficha>
      <Ficha
        nome="Célula de faltas"
        arquivo="FaultCell"
        largura={4}
        uso="Só texto: sigla e horas faltadas sobre o limite. A bolinha no canto da sigla marca atenção (exceção em D130)."
      >
        <Amostra estado="normal">
          <FaultCell code="GEN" missed={4} limit={12} attention={false} />
        </Amostra>
        <Amostra estado="atenção">
          <FaultCell code="IMU" missed={10.5} limit={12} attention />
        </Amostra>
        <Amostra estado="sem aula">
          <FaultCell code="PRO" missed={null} limit={null} attention={false} />
        </Amostra>
      </Ficha>
      <Ficha
        nome="Faixa de formatação"
        arquivo="FormatBar"
        largura={8}
        uso="Faixa aninhada no topo do bloco Anotações: formatação à esquerda, ampliar e ⋮ à direita. No bloco estreito o que não cabe vai para o menu ☰."
      >
        <Amostra estado="bloco largo, Negrito ligado">
          <FormatBar tools={FORMATOS.flat()} styleTools={FORMATOS[0] ?? []} onExpand={nada} onOptions={nada} />
        </Amostra>
      </Ficha>
      <Ficha
        nome="Anexo de imagem"
        arquivo="CardImages"
        largura={8}
        uso="Cartões (D158): sem imagem, ícone discreto de anexar; com imagem, pílula com o número, que abre a gaveta (janela com miniaturas, ✕ e Adicionar). A imagem fica no ponto do texto; a linha acesa recebe Enter (amplia) e Delete (remove)."
      >
        <Linha>
          <Amostra estado="sem imagem (verso)">
            <ImageAttach side="verso" count={0} onAttach={nada} onOpen={nada} />
          </Amostra>
          <Amostra estado="com imagens (verso)">
            <ImageAttach side="verso" count={2} onAttach={nada} onOpen={nada} />
          </Amostra>
        </Linha>
        <Amostra estado="linha de imagem acesa">
          <CardPicture src={AMOSTRA_IMAGEM} side="verso" active onZoom={nada} onRemove={nada} />
        </Amostra>
      </Ficha>
      <Ficha
        nome="Indicador de modo"
        arquivo="Island"
        largura={8}
        uso="Modo passageiro (Redimensionar): toma o lugar dos alternadores na barra até Enter, Esc ou Pronto."
      >
        <Amostra estado="redimensionando">
          <ModeIndicator
            name="Redimensionar"
            keys={['← → ↑ ↓ ajustam', 'Enter termina']}
            onDone={nada}
          />
        </Amostra>
      </Ficha>
    </>
  );
}
