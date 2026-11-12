// Hub inteiro em 1920 x 1080. ?peca=hublayout&v=1 a 13 (sem v: todas, uma sobre a outra). 3 a 5 são a rodada nova.
// 1: como hoje (provas em cima, horizontal), agenda de hoje no estilo B na coluna do meio.
// 2: provas em lista vertical no meio; a agenda de hoje vira a faixa horizontal de cima.
import type { CSSProperties, ReactNode } from 'react';
import { Block } from '../../src/ui/components/Block';
import { Button } from '../../src/ui/components/Button';
import { Day } from '../../src/ui/components/Controls';
import { Island, LevelIndicator, Tab } from '../../src/ui/components/Island';
import { ListItem } from '../../src/ui/components/ListItem';
import { NowPill, SubjectPill } from '../../src/ui/components/Pill';
import { AGORA, AULAS, type Aula as AulaDados } from './ideias-hoje';
import { DIAS, Rolo } from './ideias-provas';
import { AssessmentDayCard } from '../../src/ui/components/Cards';

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const PROVAS_NO_MES: Record<number, number> = { 17: 2, 21: 1, 24: 6, 27: 6, 30: 3 };
const HORAS = [8, 10, 12, 14, 16, 18];

function Calendario({ grande }: { grande?: boolean }) {
  return (
    <Block id="hl.calendario" title="Novembro" count="2026" menu>
      <div className="hl-cal" data-grande={grande ?? false}>
        {SEMANA.map((d, i) => (
          <span key={i} className="v-uso hl-sem">
            {d}
          </span>
        ))}
        {Array.from({ length: 35 }, (_, i) => {
          const n = i < 6 ? 26 + i : i - 5;
          const cor = i < 6 ? undefined : PROVAS_NO_MES[n];
          return (
            <Day
              key={i}
              day={n}
              today={n === 10 && i >= 6}
              dim={i < 6 || n > 30}
              {...(cor !== undefined && { subject: cor })}
            />
          );
        })}
      </div>
    </Block>
  );
}

function Lembretes() {
  return (
    <Block id="hl.lembretes" title="Lembretes" shortcut="Alt I" menu>
      <div className="hl-lembretes">
        <ListItem title="Levar o jaleco para a Propedêutica" quietSelection />
        <ListItem title="Revisar IL-6 e TNF-α antes da prova de Imunologia" quietSelection />
        <ListItem title="Confirmar a sala do laboratório de Genética" quietSelection />
      </div>
      <div className="hl-novo">
        <Button variant="primary">Novo lembrete</Button>
      </div>
    </Block>
  );
}

function Provas({ vertical }: { vertical: boolean }) {
  return (
    <Block id="hl.provas" title={vertical ? 'Provas e trabalhos' : undefined} label="Provas e trabalhos" menu={vertical}>
      {vertical ? (
        <div className="hl-provas-v">
          {DIAS.map((dia, i) => (
            <AssessmentDayCard
              key={dia.when}
              when={dia.when}
              due={dia.due}
              next={i === 0}
              bricks={dia.bricks.map(([code, color, kind]) => ({ code, color, kind }))}
            />
          ))}
        </div>
      ) : (
        <Rolo />
      )}
    </Block>
  );
}

function Aula({ aula, h }: { aula: (typeof AULAS)[number]; h?: boolean }) {
  return (
    <div
      className="hj-lugar"
      style={{ '--ini': aula.ini, '--dur': aula.dur } as CSSProperties}
      data-h={h ?? false}
    >
      <div
        className="hj-aula"
        data-materia={aula.cor}
        data-agora={aula.agora ?? false}
        data-passou={aula.passou ?? false}
        data-sel={aula.agora ?? false}
      >
        <span className="hj-tit">{aula.titulo}</span>
        <span className="hj-fim">
          <span>{aula.hora}</span>
          {aula.agora && <NowPill />}
          <SubjectPill code={aula.code} color={aula.cor} />
        </span>
      </div>
    </div>
  );
}

function AgendaVertical({ topo }: { topo?: ReactNode }) {
  return (
    <Block id="hl.agenda" title="Agenda de hoje" shortcut="Enter abre" menu fixed="inside">
      {topo}
      <div className="hl-agenda-v">
        <div className="hj-moldura hj-b hl-alto">
          {HORAS.filter((h) => Math.abs(h - 8 - AGORA) > 0.6).map((h) => (
            <span key={h} className="hj-eixo" style={{ top: `${((h - 8) / 10) * 100}%` }}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
          {AULAS.map((a) => (
            <Aula key={a.code} aula={a} />
          ))}
          <span className="hj-linha" style={{ '--ini': AGORA } as CSSProperties} />
          <span className="hj-agora" style={{ '--ini': AGORA } as CSSProperties}>
            13:40
          </span>
        </div>
      </div>
    </Block>
  );
}

function AgendaHorizontal() {
  return (
    <Block id="hl.agenda" title="Agenda de hoje" shortcut="Enter abre" menu fixed="inside">
      <div className="hl-agenda-h">
        <div className="hl-h-moldura">
          {HORAS.filter((h) => Math.abs(h - 8 - AGORA) > 0.5).map((h) => (
            <span key={h} className="hl-h-eixo" style={{ '--ini': h - 8 } as CSSProperties}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
          {AULAS.map((a) => (
            <Aula key={a.code} aula={a} h />
          ))}
          <span className="hl-h-linha" style={{ '--ini': AGORA } as CSSProperties} />
          <span className="hl-h-agora" style={{ '--ini': AGORA } as CSSProperties}>
            13:40
          </span>
        </div>
      </div>
    </Block>
  );
}

// 3: três colunas inteiras, tudo na vertical (agenda | provas | calendário sobre lembretes).
function Layout3() {
  return (
    <div className="hl-tela" data-v="3">
      <AgendaVertical />
      <Provas vertical />
      <div className="hl-pilha">
        <div className="hl-quadrado">
          <Calendario grande />
        </div>
        <Lembretes />
      </div>
    </div>
  );
}

// 4: agenda de hoje inteira à esquerda; à direita, provas em faixa justa e, embaixo, calendário | lembretes.
function Layout4() {
  return (
    <div className="hl-tela" data-v="4">
      <AgendaVertical />
      <div className="hl-andares">
        <Provas vertical={false} />
        <div className="hl-par">
          <div className="hl-quadrado">
            <Calendario grande />
          </div>
          <Lembretes />
        </div>
      </div>
    </div>
  );
}

// 5: provas em coluna inteira à direita; à esquerda, agenda horizontal em cima e calendário | lembretes embaixo.
function Layout5() {
  return (
    <div className="hl-tela" data-v="5">
      <div className="hl-andares">
        <AgendaHorizontal />
        <div className="hl-par">
          <div className="hl-quadrado">
            <Calendario grande />
          </div>
          <Lembretes />
        </div>
      </div>
      <Provas vertical />
    </div>
  );
}

// 6: Hub do zero. Três horizontes, da esquerda para a direita: hoje | próximas 6 semanas | avaliações.
// O calendário deixa de ser o mês fechado: começa na semana de hoje e mostra as siglas dentro do dia.
const EVENTOS: Record<number, (typeof DIAS)[number]['bricks']> = {
  9: DIAS[0].bricks,
  13: DIAS[1].bricks,
  16: DIAS[2].bricks,
  19: DIAS[3].bricks,
  22: DIAS[4].bricks,
  27: DIAS[5].bricks,
};

function Horizonte() {
  return (
    <Block id="hl.calendario" title="Próximas 6 semanas" count="nov – dez" menu>
      <div className="hz-grade">
        {SEMANA.map((d, i) => (
          <span key={i} className="hz-sem">
            {d}
          </span>
        ))}
        {Array.from({ length: 42 }, (_, i) => {
          const n = i <= 22 ? 8 + i : i - 22;
          const eventos = EVENTOS[i];
          return (
            <div key={i} className="hz-dia" data-hoje={i === 2} data-passou={i < 2} data-cheio={eventos !== undefined}>
              <span className="hz-num">
                <b>{n}</b>
                {i === 23 && <small>dez</small>}
              </span>
              {eventos !== undefined && (
                <span className="hz-siglas">
                  {eventos.map(([code, color], k) => (
                    <SubjectPill key={k} code={code} color={color} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Block>
  );
}

const TELAS = ['Hub', 'Mesa', 'Acervo', 'Agenda', 'Treino', 'Configs'];

// A barra do topo como no app (mesma ordem e peças de ScreenFrame). A data já é o título da tela.
function BarraDoApp() {
  return (
    <nav className="hz-topo">
      <Island label="Telas">
        {TELAS.map((nome, i) => (
          <Tab key={nome} number={i + 1} name={nome} current={i === 0} />
        ))}
      </Island>
      <h1 className="hz-titulo">Terça, 10 de novembro</h1>
      <div className="hz-fim">
        <LevelIndicator level="block" keys={['Enter entra', 'Esc sobe']} />
        <Button variant="quiet">Faltas</Button>
        <Button variant="quiet">Notas</Button>
        <Button variant="quiet">?</Button>
      </div>
    </nav>
  );
}

function Layout6() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="6">
        <div className="hz-hoje">
          <AgendaVertical
            topo={
              <div className="hz-data">
                <span>4 aulas · IMU até as 15:00 · depois PRO às 15:15</span>
              </div>
            }
          />
          <Lembretes />
        </div>
        <Horizonte />
        <Provas vertical />
      </div>
    </div>
  );
}

// 7: segunda proposta do zero. Cada bloco abre com o que importa agora, em letra grande:
// a aula em andamento (com o quanto já passou) e a contagem para a próxima avaliação.
function Agora() {
  return (
    <div className="hz-agora">
      <span className="hz-agora-linha">
        <NowPill />
        <span>até as 15:00 · faltam 1 h 20</span>
        <SubjectPill code="IMU" color={2} />
      </span>
      <b className="hz-agora-tit">Resposta inflamatória aguda</b>
      <span className="hz-trilho">
        <span className="hz-trilho-cheio" style={{ width: '33%' }} />
      </span>
      <span className="hz-agora-linha hz-horas">
        <span>13:00</span>
        <span>15:00</span>
      </span>
    </div>
  );
}

function ProvasComContagem() {
  const [primeiro, ...resto] = DIAS;
  return (
    <Block id="hl.provas" title="Provas e trabalhos" menu>
      <div className="hz-prox">
        <span className="hz-prox-topo">
          <b className="hz-prox-num">7</b>
          <span className="hz-prox-texto">
            <b>dias para a próxima</b>
            <span>terça, 17 de novembro · 4 avaliações</span>
          </span>
        </span>
        <span className="hz-prox-tijolos">
          {primeiro.bricks.map(([code, color, kind]) => (
            <span key={code} className="hz-tijolo" data-materia={color}>
              <b>{code}</b>
              <span>{kind}</span>
            </span>
          ))}
        </span>
      </div>
      <div className="hz-resto">
        {resto.map((dia) => (
          <AssessmentDayCard
            key={dia.when}
            when={dia.when}
            due={dia.due}
            bricks={dia.bricks.map(([code, color, kind]) => ({ code, color, kind }))}
          />
        ))}
      </div>
    </Block>
  );
}

function Layout7() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="7">
        <AgendaVertical topo={<Agora />} />
        <ProvasComContagem />
        <div className="hl-pilha">
          <div className="hl-quadrado">
            <Calendario grande />
          </div>
          <Lembretes />
        </div>
      </div>
    </div>
  );
}

// 8: tamanho travado. No PC nada cresce: o Hub fica do tamanho do tablet, no centro da tela.
function Layout8() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hz-teto">
        <div className="hl-tela" data-v="8">
          <AgendaVertical />
          <Provas vertical />
          <div className="hl-pilha">
            <div className="hl-quadrado">
              <Calendario grande />
            </div>
            <Lembretes />
          </div>
        </div>
      </div>
    </div>
  );
}

// 9: no PC as peças ficam do tamanho do tablet e a tela extra mostra mais: a agenda ganha
// amanhã e depois de amanhã, o calendário ganha o mês seguinte. No tablet volta a um dia e um mês.
const PROXIMOS: readonly { nome: string; data: string; aulas: readonly AulaDados[] }[] = [
  { nome: 'Hoje', data: 'ter 10', aulas: AULAS },
  {
    nome: 'Amanhã',
    data: 'qua 11',
    aulas: [
      { ini: 0, dur: 1.5, hora: '08:00–09:30', titulo: 'Farmacocinética', code: 'FAR', cor: 4 },
      { ini: 2, dur: 2, hora: '10:00–12:00', titulo: 'Ciclo cardíaco', code: 'FIS', cor: 6 },
      { ini: 6, dur: 2, hora: '14:00–16:00', titulo: 'Anamnese', code: 'PRO', cor: 1 },
    ],
  },
  {
    nome: 'Quinta',
    data: 'qui 12',
    aulas: [
      { ini: 0, dur: 2, hora: '08:00–10:00', titulo: 'Imunidade inata', code: 'IMU', cor: 2 },
      { ini: 5, dur: 1.5, hora: '13:00–14:30', titulo: 'Herança mendeliana', code: 'GEN', cor: 0 },
      { ini: 7, dur: 2, hora: '15:00–17:00', titulo: 'Vigilância em saúde', code: 'APS', cor: 3 },
    ],
  },
];

function AgendaDias() {
  return (
    <Block id="hl.agenda" title="Agenda" shortcut="Enter abre" menu fixed="inside">
      <div className="hp-dias">
        {PROXIMOS.map((dia, i) => (
          <div key={dia.nome} className="hp-dia" data-extra={i > 0}>
            <span className="hp-dia-nome">
              <b>{dia.nome}</b>
              <span>{dia.data}</span>
            </span>
            <div className="hj-moldura hj-b hp-moldura">
              {i === 0 &&
                HORAS.filter((h) => Math.abs(h - 8 - AGORA) > 0.6).map((h) => (
                  <span key={h} className="hj-eixo" style={{ top: `${((h - 8) / 10) * 100}%` }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                ))}
              {dia.aulas.map((a) => (
                <Aula key={a.code} aula={a} />
              ))}
              {i === 0 && (
                <>
                  <span className="hj-linha" style={{ '--ini': AGORA } as CSSProperties} />
                  <span className="hj-agora" style={{ '--ini': AGORA } as CSSProperties}>
                    13:40
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Block>
  );
}

const MESES = [
  { nome: 'Novembro', antes: 0, dias: 30, hoje: 10, provas: { 17: 0, 21: 1, 24: 6, 27: 6, 30: 3 } as Record<number, number> },
  { nome: 'Dezembro', antes: 2, dias: 31, hoje: 0, provas: { 5: 4 } as Record<number, number> },
];

function DoisMeses({ um }: { um?: boolean }) {
  return (
    <Block id="hl.calendario" title="Calendário" count="2026" menu>
      <div className="hp-meses">
        {MESES.slice(0, um ? 1 : 2).map((mes, m) => (
          <div key={mes.nome} className="hp-mes" data-extra={m > 0}>
            <b className="hp-mes-nome">{mes.nome}</b>
            <div className="hl-cal" data-grande>
              {SEMANA.map((d, i) => (
                <span key={i} className="v-uso hl-sem">
                  {d}
                </span>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const n = i - mes.antes + 1;
                const fora = n < 1 || n > mes.dias;
                const cor = fora ? undefined : mes.provas[n];
                const rotulo = n < 1 ? 30 + n : n > mes.dias ? n - mes.dias : n;
                return (
                  <Day
                    key={i}
                    day={rotulo}
                    today={!fora && n === mes.hoje}
                    dim={fora}
                    {...(cor !== undefined && { subject: cor })}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Block>
  );
}

function Layout9() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="9">
        <div className="hp-area hp-ag">
          <AgendaDias />
        </div>
        <div className="hp-area hp-pr">
          <Provas vertical />
        </div>
        <div className="hp-area hp-ca">
          <DoisMeses />
        </div>
        <div className="hp-area hp-le">
          <Lembretes />
        </div>
      </div>
    </div>
  );
}

// 10 e 11: as duas opções pedidas pelo usuário, com a regra do layout 9 (no PC, mais conteúdo).
function ProvasFluxo() {
  return (
    <Block id="hl.provas" title="Provas e trabalhos" menu>
      <div className="hp-fluxo">
        {DIAS.map((dia, i) => (
          <AssessmentDayCard
            key={dia.when}
            when={dia.when}
            due={dia.due}
            next={i === 0}
            bricks={dia.bricks.map(([code, color, kind]) => ({ code, color, kind }))}
          />
        ))}
      </div>
    </Block>
  );
}

// 10 (opção 1): calendário quadrado no canto de cima à esquerda, provas embaixo dele; agenda no meio, lembretes ao lado.
function Layout10() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="10">
        <div className="hl-pilha">
          <div className="hl-quadrado">
            <DoisMeses um />
          </div>
          <ProvasFluxo />
        </div>
        <AgendaDias />
        <Lembretes />
      </div>
    </div>
  );
}

// 11 (opção 2): provas em faixa no alto; embaixo, calendário | agenda | lembretes.
function Layout11() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="11">
        <Provas vertical={false} />
        <div className="hp-tres">
          <DoisMeses />
          <AgendaDias />
          <Lembretes />
        </div>
      </div>
    </div>
  );
}

// 12: o bloco do calendário em duas partes: o mês quadrado no alto e, embaixo, a lista do dia escolhido.
// Aqui o dia escolhido é 17 (diferente de hoje, 10), para mostrar os dois estados.
const DIA_ESCOLHIDO = 17;

function CalendarioComDia() {
  const mes = MESES[0]!;
  return (
    <Block id="hl.calendario" title="Calendário" count="2026" menu>
      <div className="hp-cal-q">
        <b className="hp-mes-nome">{mes.nome}</b>
        <div className="hl-cal" data-grande>
          {SEMANA.map((d, i) => (
            <span key={i} className="v-uso hl-sem">
              {d}
            </span>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const n = i + 1;
            const fora = n > mes.dias;
            const cor = fora ? undefined : mes.provas[n];
            return (
              <Day
                key={i}
                day={fora ? n - mes.dias : n}
                today={n === mes.hoje}
                selected={n === DIA_ESCOLHIDO}
                dim={fora}
                {...(cor !== undefined && { subject: cor })}
              />
            );
          })}
        </div>
      </div>
      <div className="hp-do-dia">
        <span className="hp-dia-nome">
          <b>Terça, 17 de novembro</b>
          <span>em 7 dias</span>
        </span>
        <div className="hp-do-dia-lista">
          <ListItem time="08:00" title="Prova 2">
            <SubjectPill code="GEN" color={0} />
          </ListItem>
          <ListItem time="10:00" title="Prova 2">
            <SubjectPill code="IMU" color={2} />
          </ListItem>
          <ListItem time="14:00" title="Prova prática">
            <SubjectPill code="PRO" color={1} />
          </ListItem>
          <ListItem time="23:59" title="Trabalho: entrega do relatório">
            <SubjectPill code="FAR" color={4} />
          </ListItem>
          <ListItem title="Lembrete: levar documento com foto" />
        </div>
      </div>
    </Block>
  );
}

function Layout12() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="12">
        <CalendarioComDia />
        <AgendaDias />
        <div className="hp-direita">
          <Provas vertical />
          <Lembretes />
        </div>
      </div>
    </div>
  );
}

// 13: o layout 11 (provas em faixa no alto) com o calendário de lista do dia no lugar dos dois meses.
function Layout13() {
  return (
    <div className="hz-app">
      <BarraDoApp />
      <div className="hl-tela" data-v="11">
        <Provas vertical={false} />
        <div className="hp-tres">
          <CalendarioComDia />
          <AgendaDias />
          <Lembretes />
        </div>
      </div>
    </div>
  );
}

export function HubLayout() {
  const v = new URLSearchParams(location.search).get('v');
  const ver = (n: string) => v === null || v === n;
  return (
    <>
      {ver('1') && (
        <div className="hl-tela" data-v="1">
          <Provas vertical={false} />
          <div className="hl-baixo">
            <Calendario />
            <AgendaVertical />
            <Lembretes />
          </div>
        </div>
      )}
      {ver('2') && (
        <div className="hl-tela" data-v="2">
          <AgendaHorizontal />
          <div className="hl-baixo">
            <Calendario />
            <Provas vertical />
            <Lembretes />
          </div>
        </div>
      )}
      {ver('3') && <Layout3 />}
      {ver('4') && <Layout4 />}
      {ver('5') && <Layout5 />}
      {ver('6') && <Layout6 />}
      {ver('7') && <Layout7 />}
      {ver('8') && <Layout8 />}
      {ver('9') && <Layout9 />}
      {ver('10') && <Layout10 />}
      {ver('11') && <Layout11 />}
      {ver('12') && <Layout12 />}
      {ver('13') && <Layout13 />}
    </>
  );
}
