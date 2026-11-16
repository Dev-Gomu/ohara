import type { StateCounts } from '../../../core/study/train';
import type { ReactNode } from 'react';
import type { Choice, LessonGroup } from '../../../core/study/scope';
import type { SubjectTile } from '../../../core/study/subjectTiles';
import { Block } from '../../components/Block';
import blocoStyles from '../../components/Block.module.css';
import { Button } from '../../components/Button';
import { Key } from '../../components/Key';
import { NavItem, useNavCursor } from '../../components/NavItem';
import { SubjectPill } from '../../components/Pill';
import styles from './Escolha.module.css';
import lista from './Treino.module.css';

export const MODOS = 'treino.modos';
export const ANO = 'treino.ano';
export const BIMESTRE = 'treino.bimestre';
export const BUSCA = 'treino.busca';
export const DISCIPLINAS = 'treino.materias';
export const AULAS = 'treino.escolha';
export const BARRA = 'treino.resumo';
export const COLUNAS = 5;

function Visto({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? styles.visto}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ModosProps {
  custom: boolean;
  allTotal: number;
  customTotal: number;
  customEmpty: boolean;
}

// Escolha única, marcada só pelo fundo. O teclado troca e já escolhe (D180).
export function Modos({ custom, allTotal, customTotal, customEmpty }: ModosProps) {
  const modes = [
    {
      name: 'Todos os cartões',
      text: 'Tudo o que está no acervo, de todos os anos.',
      foot: countLabel(allTotal),
    },
    {
      name: 'Personalizado',
      text: 'Escolha anos, bimestres, disciplinas ou aulas.',
      foot: customEmpty ? 'Nenhum filtro marcado' : countLabel(customTotal),
    },
  ];
  return (
    <Block id={MODOS} className={`${styles.par} ${styles.semFundo}`}>
      {modes.map((mode, index) => (
        <NavItem
          key={mode.name}
          block={MODOS}
          index={index}
          ring="cursor"
          marked={custom === (index === 1)}
          className={`${blocoStyles.bloco} ${styles.modo}`}
        >
          <b className={styles.modoNome}>{mode.name}</b>
          <span className={styles.apoio}>{mode.text}</span>
          <span className={styles.pe}>{mode.foot}</span>
        </NavItem>
      ))}
    </Block>
  );
}

interface RulerProps {
  id: string;
  label: string;
  choices: readonly Choice[];
  marked: readonly string[];
  onToggle: (id: string) => void;
}

// Régua que aceita vários: o escolhido leva o visto.
export function RulerBlock({ id, label, choices, marked, onToggle }: RulerProps) {
  return (
    <Block id={id} className={styles.faixa}>
      <span className={`${styles.rotulo} ${styles.faixaRotulo}`}>{label}</span>
      {choices.length === 0 ? (
        <span className={styles.vazioRegua}>Nenhum com cartões</span>
      ) : (
        <div className={styles.regua} role="group" aria-label={label}>
          {choices.map((choice, index) => (
            <NavItem
              key={choice.id}
              block={id}
              index={index}
              ring="cursor"
              marked={marked.includes(choice.id)}
              className={styles.item}
              onOpen={() => onToggle(choice.id)}
            >
              {marked.includes(choice.id) && <Visto />}
              {choice.label}
            </NavItem>
          ))}
        </div>
      )}
    </Block>
  );
}

interface SubjectsProps {
  tiles: readonly SubjectTile[];
  hidden: number;
  query: string;
  marked: readonly string[];
  onQuery: (value: string) => void;
  onSubmit: () => void;
  onToggle: (id: string) => void;
}

export function SubjectsPanel(props: SubjectsProps) {
  const { tiles, hidden, query, marked, onQuery, onSubmit, onToggle } = props;
  return (
    <div className={`${blocoStyles.bloco} ${styles.disc}`}>
      <Block id={BUSCA} className={styles.interno}>
        <form
          className={styles.buscaForm}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <span className={styles.rotulo}>Disciplina</span>
          <input
            className={styles.campo}
            data-field
            aria-label="Buscar disciplina"
            placeholder="Digite a sigla ou o nome"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
          <Key>Alt F</Key>
        </form>
      </Block>
      <Block id={DISCIPLINAS} className={styles.interno}>
        <div className={styles.grade}>
          {tiles.map((tile, index) => {
            const on = marked.includes(tile.id);
            return (
              <NavItem
                key={tile.id}
                block={DISCIPLINAS}
                index={index}
                ring="cursor"
                marked={on}
                className={styles.peca}
                label={`${tile.name}, ${tile.due > 0 ? `${tile.due} hoje` : 'em dia'}`}
                onOpen={() => onToggle(tile.id)}
              >
                {on && (
                  <span className={styles.selo}>
                    <Visto />
                  </span>
                )}
                <SubjectPill code={tile.code} color={tile.color} />
                <b className={styles.contagem}>{tile.due > 0 ? tile.due : ''}</b>
                <small className={styles.situacao}>{tile.due > 0 ? 'hoje' : 'em dia'}</small>
              </NavItem>
            );
          })}
        </div>
        {tiles.length === 0 && <p className={styles.mais}>Nenhuma disciplina com “{query}”.</p>}
        {hidden > 0 && (
          <p className={styles.mais}>
            + {hidden} {hidden === 1 ? 'disciplina' : 'disciplinas'} · digite para buscar
          </p>
        )}
      </Block>
    </div>
  );
}

interface LessonsProps {
  groups: readonly LessonGroup[];
  hasSubject: boolean;
  onToggle: (id: string) => void;
}

export function LessonsPanel({ groups, hasSubject, onToggle }: LessonsProps) {
  const rows = groups.flatMap((group) => group.rows);
  if (!hasSubject || rows.length === 0) {
    return (
      <Block id={AULAS} title="Aulas" className={styles.aulas}>
        <p className={styles.vazio}>
          {hasSubject
            ? 'Nenhuma aula com cartões aqui.'
            : 'Marque uma disciplina para escolher aulas.'}
        </p>
      </Block>
    );
  }
  const checked = rows.filter((row) => row.checked).length;
  const items: ReactNode[] = [];
  let at = 0;
  for (const group of groups) {
    items.push(
      <div key={group.id} className={styles.grupo}>
        <SubjectPill code={group.code} color={group.color} />
        <b className={styles.grupoNome}>{group.label}</b>
        <span className={lista.contagem}>{group.due > 0 ? `${group.due} hoje` : 'em dia'}</span>
      </div>,
    );
    for (const row of group.rows) {
      items.push(
        <NavItem
          key={row.id}
          block={AULAS}
          index={at}
          ring="cursor"
          marked={row.checked}
          className={`${lista.linha} ${styles.aulaLinha}`}
          onOpen={() => onToggle(row.id)}
        >
          <span className={lista.marca} data-tipo="lesson" aria-checked={row.checked}>
            {row.checked && <Visto />}
          </span>
          <span className={styles.aula}>{row.label}</span>
          <span className={lista.contagem}>{row.due > 0 ? `${row.due} hoje` : 'em dia'}</span>
        </NavItem>,
      );
      at += 1;
    }
  }
  return (
    <Block id={AULAS} title="Aulas" count={`${checked} de ${rows.length}`} className={styles.aulas}>
      <div className={lista.lista}>{items}</div>
    </Block>
  );
}

interface BarProps {
  custom: boolean;
  due: number;
  counts: StateCounts;
  total: number;
  startLabel: string;
  canStart: boolean;
  onClear: () => void;
  onStart: () => void;
  onExport: () => void;
}

// Itens da barra, na ordem do teclado: Limpar filtros (só no Personalizado), Iniciar, ⋮.
export function barIndexes(custom: boolean): { clear: number; start: number; more: number } {
  return custom ? { clear: 0, start: 1, more: 2 } : { clear: -1, start: 0, more: 1 };
}

export function Bar(props: BarProps) {
  const { custom, due, counts, total, startLabel, canStart, onClear, onStart, onExport } = props;
  const at = barIndexes(custom);
  const onClearCursor = useNavCursor(BARRA, at.clear);
  const onStartCursor = useNavCursor(BARRA, at.start);
  const apoio = total === 0 ? 'Nenhum cartão com estes filtros' : `${countLabel(total)} no recorte`;
  return (
    <Block id={BARRA} className={styles.barra}>
      <div className={styles.barraTopo}>
      <span className={styles.numero}>{due}</span>
      <span className={styles.resumo}>
        <b className={styles.recorte}>{due === 1 ? 'cartão para hoje' : 'cartões para hoje'}</b>
        <span className={styles.apoio}>{apoio}</span>
      </span>
      {custom && (
        <Button variant="quiet" cursor={onClearCursor} onPress={onClear}>
          Limpar filtros
        </Button>
      )}
      <Button
        variant="primary"
        shortcut="Enter"
        cursor={onStartCursor}
        disabled={!canStart}
        onPress={onStart}
      >
        {startLabel}
      </Button>
      <NavItem
        block={BARRA}
        index={at.more}
        ring="cursor"
        className={`${blocoStyles.opcoes} ${styles.opcoesBarra}`}
        label="Exportar para o Anki"
        onOpen={onExport}
      >
        ⋮
      </NavItem>
      </div>
      <div className={styles.trio}>
        {KINDS.map(([key, name, color]) => (
          <div key={key} className={styles.tipo} data-zero={counts[key] === 0}>
            <span className={styles.marcaTipo} data-materia={color} />
            <span className={styles.nomeTipo}>{name}</span>
            <b className={styles.numTipo}>{counts[key]}</b>
          </div>
        ))}
      </div>
    </Block>
  );
}

// D181: as três cores vêm da paleta das matérias (posição, não valor).
const KINDS: readonly (readonly [keyof StateCounts, string, number])[] = [
  ['fresh', 'Novos', 3],
  ['learning', 'Aprendendo', 5],
  ['review', 'Revisar', 0],
];

interface SummaryProps {
  tiles: readonly SubjectTile[];
  hidden: number;
  years: readonly Choice[];
}

// Em "Todos os cartões" o meio só informa: disciplinas com cartões para hoje e totais por ano.
export function SummaryPanels({ tiles, hidden, years }: SummaryProps) {
  return (
    <div className={`${styles.par} ${styles.meio}`}>
      <div className={`${blocoStyles.bloco} ${styles.painel}`}>
        <span className={styles.rotulo}>Disciplinas · para hoje</span>
        <div className={styles.grade}>
          {tiles.map((tile) => (
            <div key={tile.id} className={styles.peca}>
              <SubjectPill code={tile.code} color={tile.color} />
              <b className={styles.contagem}>{tile.due > 0 ? tile.due : ''}</b>
              <small className={styles.situacao}>{tile.due > 0 ? 'hoje' : 'em dia'}</small>
            </div>
          ))}
        </div>
        {hidden > 0 && (
          <p className={styles.mais}>
            + {hidden} {hidden === 1 ? 'disciplina' : 'disciplinas'} no Personalizado
          </p>
        )}
      </div>
      <div className={`${blocoStyles.bloco} ${styles.painel}`}>
        <span className={styles.rotulo}>No acervo · por ano</span>
        <div className={styles.lista}>
          {years.map((year) => (
            <div key={year.id} className={styles.linha}>
              <b>{year.label}</b>
              <span>
                {year.due > 0 ? `${year.due} hoje · ` : ''}
                {countLabel(year.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const countLabel = (n: number): string => `${n} ${n === 1 ? 'cartão' : 'cartões'}`;
