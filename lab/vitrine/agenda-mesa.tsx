// Peças da Agenda e da Mesa (10/11): filtro, pílula do dia, evento, alternadores, abas e modo.
import { ModeIndicator } from '../../src/ui/components/Island';
import { FilterChip, FilterGrid } from '../../src/ui/components/Filter';
import { DayPill, SubjectMark } from '../../src/ui/components/Pill';
import { BlockTab, BlockTabs, BlockToggle, ToggleGroup } from '../../src/ui/components/Toggles';
import { Amostra, Ficha, Linha, Secao } from './moldura';

const MATERIAS = [
  ['GEN', 0],
  ['IMU', 2],
  ['PRO', 1],
  ['APS', 3],
  ['FAR', 4],
] as const;

const nada = () => undefined;

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
