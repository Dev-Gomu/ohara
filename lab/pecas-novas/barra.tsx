// Barra do topo na Ardósia: três versões, cada uma no nível bloco e no nível menu (cursor na aba 3).
import { Button } from '../../src/ui/components/Button';
import { Island, LevelIndicator, Tab } from '../../src/ui/components/Island';
import { Ficha, Secao } from '../vitrine/moldura';

type Versao = 'a' | 'b' | 'c';

const USO: Record<Versao, string> = {
  a: 'Completa. Abas em ilha, a atual aberta com o nome; indicador de nível com as teclas que valem agora.',
  b: 'Mínima. Sem indicador de nível: só as abas, o título e uma ilha com Faltas, Notas e ajuda.',
  c: 'Nível curto. O indicador mostra só o nome do nível (Menu, Bloco, Campo), sem as teclas.',
};

const TELAS = ['Hub', 'Mesa', 'Acervo', 'Agenda', 'Treino', 'Configs'];

function Abas({ cursor }: { cursor: boolean }) {
  return (
    <Island label="Telas">
      {TELAS.map((nome, i) => (
        <Tab key={nome} number={i + 1} name={nome} current={i === 0} cursor={cursor && i === 2} />
      ))}
    </Island>
  );
}

function Barra({ v, menu }: { v: Versao; menu: boolean }) {
  const nivel = menu ? 'menu' : 'block';
  const teclas = menu ? ['Enter entra'] : ['Enter entra', 'Esc sobe'];
  return (
    <div className="bt-tela">
      <div className="bt-barra">
        <Abas cursor={menu} />
        <span className="bt-titulo">Terça, 10 de novembro</span>
        <span className="bt-fim">
          {v !== 'b' && <LevelIndicator level={nivel} keys={v === 'a' ? teclas : []} />}
          {v === 'b' ? (
            <Island label="Atalhos">
              <Button variant="quiet">Faltas</Button>
              <Button variant="quiet">Notas</Button>
              <Button variant="quiet">?</Button>
            </Island>
          ) : (
            <>
              <Button variant="quiet">Faltas</Button>
              <Button variant="quiet">Notas</Button>
              <Button variant="quiet">?</Button>
            </>
          )}
        </span>
      </div>
      <span className="v-legenda">{menu ? 'nível menu · cursor na aba 3' : 'nível bloco'}</span>
    </div>
  );
}

export function BarraTopo() {
  return (
    <>
      <Secao>6. Barra do topo</Secao>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Ficha key={v} nome={`Barra ${v.toUpperCase()}`} arquivo="Shell" largura={12} uso={USO[v]}>
          <Barra v={v} menu={false} />
          <Barra v={v} menu />
        </Ficha>
      ))}
    </>
  );
}
