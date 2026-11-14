// Peças da bancada agenda-acoes. Usa as peças reais (Block, Day, Button, Field, FilterChip, Preview,
// AssessmentDayCard) e o desenho do Window.module.css, sem o React Aria (a janela fica fixa ao lado).
import type { ReactNode } from 'react';
import { Block } from '../../../src/ui/components/Block';
import { Button } from '../../../src/ui/components/Button';
import { AssessmentDayCard } from '../../../src/ui/components/Cards';
import { Day, Field } from '../../../src/ui/components/Controls';
import { FilterChip, FilterGrid } from '../../../src/ui/components/Filter';
import { DayPill, SubjectMark, SubjectPill } from '../../../src/ui/components/Pill';
import { Preview } from '../../../src/ui/components/Preview';
import win from '../../../src/ui/components/Window.module.css';
import hub from '../../../src/ui/screens/hub/Hub.module.css';
import { AGENDA_ACOES, MATERIAS } from '../../_dados';

export type Aula = (typeof AGENDA_ACOES.aulasDoDia)[number];

export function Secao({
  n,
  titulo,
  nota,
  children,
}: {
  n: number;
  titulo: string;
  nota: string;
  children: ReactNode;
}) {
  return (
    <section className="aa-secao">
      <header className="aa-secao-topo">
        <span className="aa-num">{n}</span>
        <div>
          <h2>{titulo}</h2>
          <p>{nota}</p>
        </div>
      </header>
      <div className="aa-par">{children}</div>
    </section>
  );
}

/** Janela padrão (D144): contexto, título, X de 44 px e rodapé de metades iguais. */
export function Janela(props: {
  contexto: string;
  titulo: string;
  onFechar?: () => void;
  pe: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="aa-veu">
      <div className={`${win.janela} aa-janela`} role="dialog" aria-label={props.titulo}>
        <div className={win.topo}>
          <div className={win.titulos}>
            <small className={win.contexto}>{props.contexto}</small>
            <h2 className={win.titulo}>{props.titulo}</h2>
          </div>
          <button type="button" className={win.fechar} aria-label="Fechar" onClick={props.onFechar}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {props.children}
        <div className={win.pe}>{props.pe}</div>
      </div>
    </div>
  );
}

export function Rotulo({ children }: { children: string }) {
  return <h3 className="aa-rotulo">{children}</h3>;
}

/** Opção de escolha única dentro da janela: pílula com fundo de escolhido; cursor em anel. */
export function Opcao(p: {
  sel?: boolean;
  cursor?: boolean;
  onPress?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="aa-opcao"
      data-sel={p.sel || undefined}
      data-cursor={p.cursor || undefined}
      onClick={p.onPress}
    >
      {p.children}
    </button>
  );
}

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
// Novembro de 2026 começa num domingo: a grade abre em 01/11 e vai até 05/12.
const DIAS = Array.from({ length: 35 }, (_, i) => i + 1);
const COM_PROVA: Record<number, number> = { 17: 2, 19: 3, 24: 1, 27: 4 };

export function Calendario({
  escolhido,
  onEscolher,
  tools,
  rodape,
}: {
  escolhido: number;
  onEscolher: (d: number) => void;
  tools?: ReactNode;
  rodape?: ReactNode;
}) {
  const hoje = 13;
  return (
    <Block
      id="aa-cal"
      title="Novembro"
      label="Calendário"
      count="2026"
      menu
      fixed="inside"
      tools={tools}
      className="aa-bloco-cal"
    >
      <div className={hub.calendario}>
        {SEMANA.map((d, i) => (
          <span key={i} className={hub.semana}>
            {d}
          </span>
        ))}
        {DIAS.map((d) => {
          const dia = d > 30 ? d - 30 : d;
          const cor = d <= 30 ? COM_PROVA[d] : undefined;
          return (
            <Day
              key={d}
              day={dia}
              today={d === hoje}
              dim={d > 30}
              selected={d === escolhido}
              cursor={d === escolhido}
              onOpen={() => onEscolher(d)}
              label={`${dia} de novembro`}
              {...(cor !== undefined && { subject: cor })}
            />
          );
        })}
      </div>
      <p className={hub.doDia}>
        <b>{escolhido === hoje ? 'Sexta, 13 de novembro' : `${escolhido} de novembro`}</b>
        {escolhido === hoje ? ' · hoje' : escolhido > hoje ? ` · em ${escolhido - hoje} dias` : ''}
      </p>
      <div className={hub.eventos}>
        {escolhido === hoje ? (
          AGENDA_ACOES.aulasDoDia.map((a) => (
            <div key={a.id} className={hub.evento}>
              <time>{a.inicio}</time>
              <span className={hub.eventoTitulo}>{a.titulo}</span>
              <SubjectMark code={a.sigla} color={a.cor} />
            </div>
          ))
        ) : (
          <p className={hub.vazio}>Nada neste dia.</p>
        )}
      </div>
      {rodape}
    </Block>
  );
}

/** Rodapé do calendário (V1): duas metades iguais, que agem no dia escolhido. */
export function RodapeCal({
  cursor,
  onFalta,
  onEvento,
}: {
  cursor?: 0 | 1;
  onFalta: () => void;
  onEvento: () => void;
}) {
  return (
    <div className="aa-cal-pe">
      <Button cursor={cursor === 0} onPress={onFalta}>
        Registrar falta
      </Button>
      <Button variant="primary" cursor={cursor === 1} onPress={onEvento}>
        Novo evento
      </Button>
    </div>
  );
}

export type Marca = 'presente' | 'falta' | 'cancelada';

/** Registrar falta do dia: cada aula que já terminou ganha Presente, Falta ou Cancelada (D100). */
export function JanelaFalta(p: {
  marcas: Record<string, Marca>;
  cursor: number;
  onMarcar: (id: string, m: Marca) => void;
  onFechar: () => void;
}) {
  const opcoes: [Marca, string][] = [
    ['presente', 'Presente'],
    ['falta', 'Falta'],
    ['cancelada', 'Cancelada'],
  ];
  return (
    <Janela
      contexto="Calendário · sexta, 13"
      titulo="Registrar falta"
      onFechar={p.onFechar}
      pe={
        <>
          <Button onPress={p.onFechar}>Cancelar</Button>
          <Button variant="primary" onPress={p.onFechar}>
            Registrar
          </Button>
        </>
      }
    >
      <div className="aa-aulas">
        {AGENDA_ACOES.aulasDoDia.map((a, i) => (
          <div key={a.id} className="aa-aula">
            <SubjectPill code={a.sigla} color={a.cor} />
            <div className="aa-aula-texto">
              <b>{a.titulo}</b>
              <span>
                {a.inicio} – {a.fim}
              </span>
            </div>
            <div className="aa-opcoes" role="radiogroup" aria-label={`Presença em ${a.sigla}`}>
              {opcoes.map(([m, nome], j) => (
                <Opcao
                  key={m}
                  sel={(p.marcas[a.id] ?? 'presente') === m}
                  cursor={p.cursor === i * 3 + j}
                  onPress={() => p.onMarcar(a.id, m)}
                >
                  {nome}
                </Opcao>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="aa-apoio">
        Falta conta a aula inteira. Cancelada (feriado, professor ausente) sai da conta.
      </p>
    </Janela>
  );
}

export const TIPOS = [
  { id: 'prova', nome: 'Prova' },
  { id: 'trabalho', nome: 'Trabalho' },
  { id: 'apresentacao', nome: 'Apresentação' },
  { id: 'compromisso', nome: 'Compromisso' },
  { id: 'avulsa', nome: 'Aula avulsa' },
] as const;
export type Tipo = (typeof TIPOS)[number]['id'];

const TITULO_PADRAO: Record<Tipo, string> = {
  prova: 'P2',
  trabalho: 'Relatório de caso',
  apresentacao: 'Seminário de território',
  compromisso: 'Reunião da liga',
  avulsa: 'Reposição',
};

/** Novo evento: um item por vez, formulário vazio (C1). O tipo decide os campos. */
export function JanelaEvento(p: {
  tipo: Tipo;
  materia: string;
  cursor: number;
  contexto: string;
  onTipo: (t: Tipo) => void;
  onMateria: (s: string) => void;
  onFechar: () => void;
}) {
  const comFim = p.tipo === 'avulsa' || p.tipo === 'compromisso' || p.tipo === 'apresentacao';
  const semMateria = p.tipo === 'compromisso';
  return (
    <Janela
      contexto={p.contexto}
      titulo="Novo evento"
      onFechar={p.onFechar}
      pe={
        <>
          <Button onPress={p.onFechar}>Cancelar</Button>
          <Button variant="primary" onPress={p.onFechar}>
            {p.tipo === 'avulsa' ? 'Criar aula' : 'Criar'}
          </Button>
        </>
      }
    >
      <Rotulo>Tipo</Rotulo>
      <div className="aa-opcoes aa-quebra" role="radiogroup" aria-label="Tipo">
        {TIPOS.map((t, i) => (
          <Opcao
            key={t.id}
            sel={p.tipo === t.id}
            cursor={p.cursor === i}
            onPress={() => p.onTipo(t.id)}
          >
            {t.nome}
          </Opcao>
        ))}
      </div>
      <Rotulo>{semMateria ? 'Matéria (opcional)' : 'Matéria'}</Rotulo>
      <FilterGrid label="Matéria">
        {MATERIAS.map((m) => (
          <FilterChip
            key={m.sigla}
            subject={m.cor}
            selected={p.materia === m.sigla}
            onOpen={() => p.onMateria(m.sigla)}
          >
            {m.sigla}
          </FilterChip>
        ))}
      </FilterGrid>
      <Rotulo>Quando</Rotulo>
        <div className="aa-campos">
        <Field label="Dia" defaultValue="13/11/2026" />
        <Field
          label={comFim ? 'Início' : 'Hora'}
          defaultValue={p.tipo === 'prova' ? '' : '14:00'}
          placeholder="opcional"
        />
        {comFim && <Field label="Fim" defaultValue="16:00" />}
      </div>
      <Rotulo>Título e local</Rotulo>
        <div className="aa-campos">
        <Field
          key={p.tipo}
          label={p.tipo === 'avulsa' ? 'Rótulo (T, P, Tutoria)' : 'Título'}
          defaultValue={TITULO_PADRAO[p.tipo]}
        />
        <Field label="Local ou sala" placeholder="opcional" />
      </div>
      {p.tipo === 'apresentacao' && (
        <p className="aa-apoio">Aparece no bloco de avaliações do Hub, com a marca A.</p>
      )}
      {p.tipo === 'avulsa' && (
        <p className="aa-apoio">
          Só neste dia: a Grade não muda. Cai na pasta com estrela da matéria.
        </p>
      )}
    </Janela>
  );
}

const INICIAL: Record<string, string> = { trabalho: 'T', apresentacao: 'A' };

/** Bloco de avaliações do Hub com apresentações: marca única com as iniciais do que não é prova (D103). */
export function Avaliacoes() {
  return (
    <Block
      id="aa-aval"
      title="Avaliações"
      label="Avaliações"
      fixed="none"
      className="aa-bloco-aval"
    >
      <div className={hub.provas}>
        {AGENDA_ACOES.avaliacoes.map((d, i) => {
          const n = Number(d.dia.slice(8));
          const sem = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][n % 7] ?? '';
          const marca = [...new Set(d.itens.map((x) => INICIAL[x.tipo]).filter(Boolean))].join(' ');
          return (
            <div key={d.dia} className="aa-cartao">
              <AssessmentDayCard
                when={`${sem} ${String(n).padStart(2, '0')}`}
                month="nov"
                due={`em ${n - 13} d`}
                next={i === 0}
                bricks={d.itens.map((x) => ({
                  code: x.sigla,
                  color: x.cor,
                  kind: x.tipo === 'apresentacao' ? 'apres.' : x.tipo,
                }))}
              />
              {marca && (
                <span
                  className="aa-tipo"
                  aria-label={marca === 'A' ? 'apresentação' : 'trabalho e apresentação'}
                >
                  {marca}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Block>
  );
}

/** Prévia de uma aula na Agenda, com Mover e Sem aula. */
export function PreviaAula({
  aula,
  cursor,
  sem,
  onMover,
  onSem,
  onDesfazer,
}: {
  aula: Aula;
  cursor: number;
  sem: boolean;
  onMover: () => void;
  onSem: () => void;
  onDesfazer: () => void;
}) {
  return (
    <Block id="aa-previa" title="Prévia" label="Prévia" fixed="inside" className="aa-bloco-previa">
      <div className="aa-previa">
        <Preview
          title={
            aula.sigla === 'IMU'
              ? 'Imunologia'
              : aula.sigla === 'FAR'
                ? 'Farmacologia'
                : 'Atenção primária'
          }
          detail={`Aula · Sexta, 13 de novembro · ${aula.inicio} – ${aula.fim}`}
          actions={
            sem
              ? [
                  <Button
                    key="d"
                    variant="primary"
                    cursor={cursor === 0}
                    onPress={onDesfazer}
                    shortcut="Alt Z"
                  >
                    Desfazer
                  </Button>,
                ]
              : [
                  <Button key="a" variant="primary" cursor={cursor === 0}>
                    Abrir na Mesa
                  </Button>,
                  <Button key="m" cursor={cursor === 1} onPress={onMover}>
                    Mover
                  </Button>,
                  <Button key="s" cursor={cursor === 2} onPress={onSem}>
                    Sem aula
                  </Button>,
                ]
          }
        >
          <SubjectPill code={aula.sigla} color={aula.cor} />
          <p>{aula.titulo}</p>
          {sem && <p className="aa-sem">Sem aula neste dia. Sai da conta das Faltas.</p>}
          {!sem && aula.conteudo && (
            <p className="aa-apoio">Já tem anotações: Sem aula fica bloqueado (G6).</p>
          )}
        </Preview>
      </div>
    </Block>
  );
}

const DIAS_SEMANA = [
  ['SEG', '09'],
  ['TER', '10'],
  ['QUA', '11'],
  ['QUI', '12'],
  ['SEX', '13'],
  ['SÁB', '14'],
] as const;

/** Mover uma aula (G4): só esta aula; a Grade não muda. */
export function JanelaMover({
  aula,
  dia,
  cursor,
  onDia,
  onFechar,
}: {
  aula: Aula;
  dia: string;
  cursor: number;
  onDia: (d: string) => void;
  onFechar: () => void;
}) {
  return (
    <Janela
      contexto={`Agenda · aula de ${aula.sigla}`}
      titulo="Mover aula"
      onFechar={onFechar}
      pe={
        <>
          <Button onPress={onFechar}>Cancelar</Button>
          <Button variant="primary" onPress={onFechar}>
            Mover
          </Button>
        </>
      }
    >
      <Rotulo>Para o dia</Rotulo>
      <div className="aa-opcoes" role="radiogroup" aria-label="Dia">
        {DIAS_SEMANA.map(([s, n], i) => (
          <button
            key={n}
            type="button"
            className="aa-dia"
            data-cursor={cursor === i || undefined}
            aria-pressed={dia === n}
            onClick={() => onDia(n)}
          >
            <DayPill weekday={s} number={n} today={dia === n} />
          </button>
        ))}
      </div>
      <Rotulo>Horário</Rotulo>
        <div className="aa-campos">
        <Field label="Início" defaultValue={aula.inicio} />
        <Field label="Fim" defaultValue={aula.fim} />
        <Field label="Sala" placeholder="a mesma" />
      </div>
      <p className="aa-apoio">
        Vale só para esta aula; a Grade continua igual. As anotações vão junto.
      </p>
    </Janela>
  );
}

export function Aviso({ texto, onDesfazer }: { texto: string; onDesfazer?: () => void }) {
  return (
    <div className="aa-aviso" role="status">
      <span>{texto}</span>
      {onDesfazer && (
        <Button variant="quiet" onPress={onDesfazer} shortcut="Alt Z">
          Desfazer
        </Button>
      )}
    </div>
  );
}

export function Teclas({ itens }: { itens: [string, string][] }) {
  return (
    <p className="aa-teclas">
      {itens.map(([k, o]) => (
        <span key={k}>
          <kbd>{k}</kbd> {o}
        </span>
      ))}
    </p>
  );
}
