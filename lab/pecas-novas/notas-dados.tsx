// Notas, degrau 1 (dados e estados): como cada número é escrito e quais estados uma nota pode ter.
// Sem versões: aqui se fecha a regra, não o desenho. A aparência dos estados é rascunho e se
// decide no degrau 2. ?peca=notasdados
import type { ReactNode } from 'react';
import { formatGrade } from '../../src/core/grades/grades';
import { StatePill } from '../../src/ui/components/Pill';
import { Ficha } from '../vitrine/moldura';
import './notas-dados.css';

function Item({ nome, regra, children }: { nome: string; regra: string; children: ReactNode }) {
  return (
    <div className="nd-item">
      <div className="nd-amostra">{children}</div>
      <b className="nd-nome">{nome}</b>
      <p className="nd-regra">{regra}</p>
    </div>
  );
}

const fmt = formatGrade;

// Marca de resultado (B, escolhida em 12/11): o sinal vai dentro da marca alongada, nunca em círculo.
export function Sinal({ tipo, children }: { tipo: 'ok' | 'atencao'; children: string }) {
  return (
    <span className="nd-sinal" data-tipo={tipo}>
      <i>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d={tipo === 'ok' ? 'M2.5 6.2 5 8.7 9.5 3.6' : 'M3.2 3.2 8.8 8.8M8.8 3.2 3.2 8.8'} />
        </svg>
      </i>
      {children}
    </span>
  );
}

const N = ({ v, estado }: { v: number | null; estado?: 'baixa' | 'aberto' }) => (
  <span className="nd-nota" data-estado={v === null ? 'pendente' : estado}>
    {fmt(v)}
  </span>
);

const De = ({ v }: { v: number }) => <span className="nd-de">de {fmt(v)}</span>;

export function NotasDados() {
  return (
    <main className="vitrine">
      <Ficha
        nome="Formatos"
        arquivo="degrau 1"
        largura={6}
        uso="Como cada dado é escrito, em qualquer lugar da tela."
      >
        <Item nome="Nota" regra="Sempre com ponto e uma casa, até quando é redonda.">
          <N v={7.3} />
          <N v={10} />
          <N v={0} />
        </Item>
        <Item nome="Sem nota" regra="Um traço. Nunca zero, nunca vazio.">
          <N v={null} />
        </Item>
        <Item
          nome="Quanto vale"
          regra='"de" e o máximo, em letra de apoio. Só no cabeçalho e ao lado do que falta.'
        >
          <De v={3} />
          <De v={7} />
        </Item>
        <Item nome="Total e média" regra="Igual à nota: semestre e ano sempre sobre 10.">
          <N v={8.4} />
        </Item>
        <Item nome="Quanto falta" regra="O que precisa tirar e quanto o bimestre vale.">
          <span className="nd-par">
            <N v={4.6} /> <De v={7} />
          </span>
        </Item>
        <Item nome="Já alcançou a meta" regra="Em vez do número: marca com sinal e palavra.">
          <Sinal tipo="ok">Aprovado</Sinal>
        </Item>
        <Item nome="Não alcança mais" regra="Quando nem a nota máxima resolve.">
          <Sinal tipo="atencao">Não alcança</Sinal>
        </Item>
        <Item nome="Situação" regra="Três situações, sempre com a palavra.">
          <StatePill state="ok">Na meta</StatePill>
          <StatePill state="atencao">Atenção</StatePill>
          <span className="nd-de">Sem notas</span>
        </Item>
        <Item
          nome="Ao digitar"
          regra='Aceita "7.3", "7,3" e "7". Apagar tudo deixa a nota pendente.'
        >
          <span className="nd-de">7 → </span>
          <N v={7} />
        </Item>
      </Ficha>

      <Ficha
        nome="Estados"
        arquivo="degrau 1"
        largura={6}
        uso="Os estados que uma nota pode ter. A aparência aqui é rascunho. O cursor segue o foco do app, não é estado da nota."
      >
        <Item nome="Normal" regra="Tem nota e está na meta.">
          <N v={7.3} />
        </Item>
        <Item
          nome="Abaixo da meta"
          regra="Compara a porcentagem, não o número: 2.0 de 3.0 é 67%, abaixo de 70%."
        >
          <span className="nd-par">
            <N v={2} estado="baixa" /> <De v={3} />
          </span>
        </Item>
        <Item nome="Número baixo, mas na meta" regra="2.4 de 3.0 é 80%: normal, sem alerta.">
          <span className="nd-par">
            <N v={2.4} /> <De v={3} />
          </span>
        </Item>
        <Item nome="Pendente" regra="Avaliação criada, ainda sem nota. Fica fora da conta.">
          <N v={null} />
        </Item>
        <Item
          nome="Em aberto"
          regra="Total ou média que ainda pode mudar, porque falta nota no período."
        >
          <N v={4.1} estado="aberto" />
        </Item>
      </Ficha>
    </main>
  );
}
