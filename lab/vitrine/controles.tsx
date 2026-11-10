// Peças pequenas: botões, tecla, pílulas, cartões, campos, marcas e a Janela.
import { Button } from '../../src/ui/components/Button';
import { AssessmentDayCard, SubjectCard } from '../../src/ui/components/Cards';
import { Check, Day, Field, Progress, Toggle } from '../../src/ui/components/Controls';
import { Key } from '../../src/ui/components/Key';
import { NowPill, StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Window } from '../../src/ui/components/Window';
import { dispatch } from '../../src/ui/keyboard/store';
import { Amostra, Ficha, Linha, Secao } from './moldura';

// A cor é guardada como posição (0 a 7); a sigla é que distingue.
const MATERIAS = ['PRO', 'HIS', 'IMU', 'APS', 'GEN', 'FAR', 'PAT', 'ANA'];

function Acoes() {
  return (
    <>
      <Secao>Agir</Secao>
      <Ficha
        nome="Botão"
        arquivo="Button"
        largura={8}
        uso="Principal: a ação mais provável, um por bloco. Comum: as demais. Discreto: ajuste menor. A tecla vai dentro do botão."
      >
        <Linha>
          <Amostra estado="principal">
            <Button variant="primary" shortcut="Enter">
              Abrir na Mesa
            </Button>
          </Amostra>
          <Amostra estado="comum">
            <Button shortcut="Alt N">Novo lembrete</Button>
          </Amostra>
          <Amostra estado="discreto">
            <Button variant="quiet">Ajustar</Button>
          </Amostra>
          <Amostra estado="desabilitado">
            <Button disabled>Sem slides</Button>
          </Amostra>
        </Linha>
        <Linha>
          <Amostra estado="principal, com cursor">
            <Button variant="primary" cursor>
              Iniciar treino
            </Button>
          </Amostra>
          <Amostra estado="comum, com cursor">
            <Button cursor>Cartões</Button>
          </Amostra>
          <Amostra estado="discreto, com cursor">
            <Button variant="quiet" cursor>
              Ajustar
            </Button>
          </Amostra>
        </Linha>
      </Ficha>
      <Ficha
        nome="Tecla"
        arquivo="Key"
        largura={4}
        uso="Mostra um atalho, sempre igual: no rótulo do bloco, dentro do botão, no indicador. Nunca clicável sozinha."
      >
        <Linha>
          <Key>Alt N</Key>
          <Key>Enter</Key>
          <Key>Esc</Key>
          <Key>Alt 3</Key>
        </Linha>
      </Ficha>
    </>
  );
}

function Marcas() {
  return (
    <>
      <Secao>Marcar</Secao>
      <Ficha
        nome="Pílulas"
        arquivo="Pill"
        largura={5}
        uso="Matéria: só a sigla, sobre a cor. Estado: marca colorida e a palavra. Agora: no máximo uma na tela."
      >
        <Linha>
          {MATERIAS.map((code, color) => (
            <SubjectPill key={code} code={code} color={color} />
          ))}
        </Linha>
        <Linha>
          <StatePill state="ok">Em dia</StatePill>
          <StatePill state="atencao">Atrasado</StatePill>
          <NowPill />
        </Linha>
      </Ficha>
      <Ficha
        nome="Dia de avaliação"
        arquivo="Cards"
        largura={7}
        uso="Próximas provas e trabalhos: dia, prazo e um bloquinho na cor da matéria para cada um. A peça alarga, a altura não muda."
      >
        <Linha>
          <Amostra estado="o mais próximo">
            <AssessmentDayCard
              when="TER 17"
              due="em 7 d"
              next
              bricks={[
                { code: 'GEN', color: 4, kind: 'prova' },
                { code: 'IMU', color: 2, kind: 'prova' },
                { code: 'FAR', color: 5, kind: 'trabalho' },
              ]}
            />
          </Amostra>
          <Amostra estado="com cursor">
            <AssessmentDayCard
              when="SÁB 21"
              due="em 11 d"
              cursor
              bricks={[{ code: 'PRO', color: 0, kind: 'trabalho' }]}
            />
          </Amostra>
          <Amostra estado="uma prova">
            <AssessmentDayCard
              when="QUA 02"
              due="em 23 d"
              bricks={[{ code: 'PAT', color: 6, kind: 'prova' }]}
            />
          </Amostra>
        </Linha>
      </Ficha>
      <Ficha
        nome="Cartão de matéria"
        arquivo="Cards"
        largura={12}
        uso="Grade do Acervo e do Treino. Único lugar em que a cor da matéria vira fundo: sigla grande e uma linha de apoio."
      >
        <div className="v-grade">
          {MATERIAS.map((code, color) => (
            <div key={code}>
              <SubjectCard
                code={code}
                color={color}
                detail={color === 2 ? 'com cursor' : `${6 + color} aulas`}
                cursor={color === 2}
              />
            </div>
          ))}
        </div>
      </Ficha>
    </>
  );
}

function Campos() {
  return (
    <>
      <Secao>Preencher e acompanhar</Secao>
      <Ficha
        nome="Campo"
        arquivo="Controls"
        largura={5}
        uso="Busca e formulário. Com a tecla à direita quando tem atalho. Dentro dele, as teclas são do texto."
      >
        <Field label="Buscar aula ou matéria" shortcut="Alt F" />
        <Field label="Título do lembrete" />
      </Ficha>
      <Ficha
        nome="Chave e caixa de marcar"
        arquivo="Controls"
        largura={7}
        uso="Chave liga e desliga; caixa conclui. As duas são pílulas: ligada ou marcada fica em azul cheio."
      >
        <Linha>
          <Toggle label="Ligada" on />
          <Toggle label="Desligada" on={false} />
          <Toggle label="Com cursor" on cursor />
        </Linha>
        <Linha>
          <Check label="A fazer" on={false} />
          <Check label="Feita" on />
          <Check label="Com cursor" on={false} cursor />
        </Linha>
      </Ficha>
      <Ficha
        nome="Dia"
        arquivo="Controls"
        largura={7}
        uso="Calendário. Hoje em azul cheio, escolhido em azul claro; a marca alongada leva a cor da matéria."
      >
        <Linha>
          <Amostra estado="comum">
            <Day day={8} />
          </Amostra>
          <Amostra estado="hoje">
            <Day day={9} today />
          </Amostra>
          <Amostra estado="escolhido">
            <Day day={10} selected />
          </Amostra>
          <Amostra estado="com prova">
            <Day day={11} subject={4} />
          </Amostra>
          <Amostra estado="cursor">
            <Day day={12} cursor />
          </Amostra>
          <Amostra estado="hoje + cursor">
            <Day day={13} today cursor />
          </Amostra>
        </Linha>
      </Ficha>
      <Ficha
        nome="Barra de progresso"
        arquivo="Controls"
        largura={5}
        uso="Quanto já foi feito, sempre com o número ao lado."
      >
        <Progress value={0.68} label="revisado" />
        <Progress value={0.2} label="revisado" />
      </Ficha>
    </>
  );
}

function Janela() {
  return (
    <>
      <Secao>Consultar</Secao>
      <Ficha
        nome="Janela"
        arquivo="Window"
        largura={12}
        uso="Consultar sem perder o lugar. Prende o foco; Esc fecha e devolve o cursor à origem."
      >
        <Linha>
          <Button onPress={() => dispatch({ type: 'openWindow', window: 'vitrine' })}>
            Abrir a janela
          </Button>
        </Linha>
      </Ficha>
      <Window id="vitrine" title="Novo lembrete">
        <div className="v-corpo v-janela">
          <p className="v-uso">O conteúdo usa as mesmas peças das telas.</p>
          <Field label="Título do lembrete" />
          <Linha>
            <Button variant="primary" shortcut="Enter">
              Salvar
            </Button>
            <Button variant="quiet">Sem data</Button>
          </Linha>
        </div>
      </Window>
    </>
  );
}

export function Controles() {
  return (
    <>
      <Acoes />
      <Marcas />
      <Campos />
      <Janela />
    </>
  );
}
