// Peças que montam a tela: barra do topo, Bloco, Régua, Item de lista e Prévia.
import { Block } from '../../src/ui/components/Block';
import { Button } from '../../src/ui/components/Button';
import { Island, LevelIndicator, Tab } from '../../src/ui/components/Island';
import { ListItem } from '../../src/ui/components/ListItem';
import { NowPill, StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Preview } from '../../src/ui/components/Preview';
import { Ruler, RulerCreate, RulerPill } from '../../src/ui/components/Ruler';
import { Amostra, Ficha, Linha, Secao } from './moldura';

const PASTAS = [
  { id: 'todas', title: 'Todas' },
  { id: 'b1', title: '1º bimestre' },
  { id: 'b2', title: '2º bimestre' },
  { id: 'b3', title: '3º bimestre' },
  { id: '2026', title: '2026', detail: '6 matérias' },
];

function Topo() {
  return (
    <>
      <Secao>Barra do topo</Secao>
      <Ficha
        nome="Ilha e aba"
        arquivo="Island"
        largura={6}
        uso="Ilha agrupa controles na barra. Aba troca de tela: só o número, e a atual abre e mostra o nome."
      >
        <Linha>
          <Amostra estado="tela atual: 3 · cursor do teclado: 2">
            <Island label="Telas">
              <Tab number={1} name="Hub" />
              <Tab number={2} name="Mesa" cursor />
              <Tab number={3} name="Acervo" current />
              <Tab number={4} name="Treino" />
              <Tab number={5} name="Agenda" />
              <Tab number={6} name="Configs" />
            </Island>
          </Amostra>
        </Linha>
      </Ficha>
      <Ficha
        nome="Indicador de nível"
        arquivo="Island"
        largura={6}
        uso="Um por tela, na barra. Diz onde as teclas agem e quais valem agora."
      >
        <Linha>
          <Amostra estado="menu">
            <LevelIndicator level="menu" keys={['Enter entra']} />
          </Amostra>
          <Amostra estado="bloco">
            <LevelIndicator level="block" keys={['Enter entra', 'Esc sobe']} />
          </Amostra>
          <Amostra estado="campo">
            <LevelIndicator level="field" keys={['Esc sobe']} />
          </Amostra>
        </Linha>
      </Ficha>
    </>
  );
}

// Os três estados do Bloco real. Em tela de verdade, quem decide é o teclado (sem `fixed`).
function Blocos() {
  return (
    <>
      <Secao>Bloco: recua, acende e guarda rastro</Secao>
      <Block id="vitrine.recuado" title="Recuado" shortcut="Alt 1" fixed="none" className="v-4">
        <div className="v-corpo">
          <p className="v-uso">
            Sem o cursor, o bloco recua para o fundo. O escolhido continua à vista.
          </p>
          <div className="v-lista">
            <ListItem time="08:00" title="Genética" detail="Expressão gênica">
              <SubjectPill code="GEN" color={4} />
            </ListItem>
            <ListItem time="10:00" title="Imunologia" detail="Escolhido" selected>
              <SubjectPill code="IMU" color={2} />
            </ListItem>
          </div>
        </div>
      </Block>
      <Block
        id="vitrine.cursor"
        title="Com o cursor"
        shortcut="Alt 2"
        fixed="block"
        className="v-4"
      >
        <div className="v-corpo">
          <p className="v-uso">
            Nível bloco: acende e o contorno azul fica no bloco inteiro. Enter entra.
          </p>
          <div className="v-lista">
            <ListItem time="08:00" title="Genética" detail="Expressão gênica">
              <SubjectPill code="GEN" color={4} />
            </ListItem>
            <ListItem time="10:00" title="Imunologia" detail="Escolhido" selected>
              <SubjectPill code="IMU" color={2} />
            </ListItem>
          </div>
        </div>
      </Block>
      <Block
        id="vitrine.rastro"
        title="Aceso, com rastro"
        shortcut="Alt 3"
        fixed="inside"
        className="v-4"
      >
        <div className="v-corpo">
          <p className="v-uso">
            Nível campo: o cursor desceu para uma peça. A borda clara mostra para onde o Esc volta.
          </p>
          <div className="v-lista">
            <ListItem time="08:00" title="Genética" detail="Expressão gênica">
              <SubjectPill code="GEN" color={4} />
            </ListItem>
            <ListItem
              time="10:00"
              title="Imunologia"
              detail="Escolhido e com o cursor"
              selected
              cursor
            >
              <SubjectPill code="IMU" color={2} />
            </ListItem>
          </div>
        </div>
      </Block>
    </>
  );
}

function ListaEPrevia() {
  return (
    <>
      <Secao>Escolher e ver</Secao>
      <Ficha
        nome="Régua"
        arquivo="Ruler"
        largura={12}
        uso="Escolher um grupo (pasta, bimestre, visão). Fica fora do conteúdo que filtra; criar fica no fim e não seleciona."
      >
        <Ruler block="vitrine.regua" items={PASTAS} createLabel="Nova pasta" />
        <Linha>
          <Amostra estado="repouso">
            <RulerPill title="1º bimestre" />
          </Amostra>
          <Amostra estado="com apoio">
            <RulerPill title="2026" detail="6 matérias" />
          </Amostra>
          <Amostra estado="escolhida">
            <RulerPill title="2º bimestre" selected />
          </Amostra>
          <Amostra estado="escolhida, com cursor">
            <RulerPill title="2º bimestre" selected cursor />
          </Amostra>
          <Amostra estado="criar">
            <RulerCreate label="Nova pasta" />
          </Amostra>
        </Linha>
      </Ficha>
      <Ficha
        nome="Item de lista"
        arquivo="ListItem"
        largura={7}
        uso="Aula, lembrete, linha de agenda. Hora, depois título e apoio, depois pílulas."
      >
        <div className="v-lista">
          <ListItem
            time="08:00 a 09:30"
            title="Genética"
            detail="Passada: título apagado, continua navegável"
            past
          >
            <SubjectPill code="GEN" color={4} />
          </ListItem>
          <ListItem time="10:00 a 11:30" title="Atenção Primária" detail="Escolhido" selected>
            <SubjectPill code="APS" color={3} />
          </ListItem>
          <ListItem
            time="13:00 a 15:00"
            title="Imunologia"
            detail="Escolhido e com o cursor"
            selected
            cursor
          >
            <NowPill />
            <SubjectPill code="IMU" color={2} />
          </ListItem>
          <ListItem title="Entregar relatório de PRO" detail="Sem hora, só com o cursor" cursor>
            <StatePill state="atencao">Atrasado</StatePill>
          </ListItem>
          <ListItem title="Revisar TNF-α e pH" detail="Texto do usuário fica como foi digitado" />
        </div>
      </Ficha>
      <Ficha
        nome="Prévia"
        arquivo="Preview"
        largura={5}
        uso="Detalhe do item escolhido: título, dados e a ação principal. Atualiza sem pular a tela."
      >
        <Preview
          title="Resposta inflamatória aguda"
          detail="13:00 a 15:00 · IMU · 9 cartões"
          actions={
            <>
              <Button variant="primary" shortcut="Enter">
                Abrir na Mesa
              </Button>
              <Button shortcut="Alt C">Cartões</Button>
            </>
          }
        >
          O macrófago reconhece o LPS pelo TLR4 e libera IL-1β, IL-6 e TNF-α.
        </Preview>
      </Ficha>
    </>
  );
}

export function Estrutura() {
  return (
    <>
      <Topo />
      <Blocos />
      <ListaEPrevia />
    </>
  );
}
