// Provas do Hub: o mesmo bloco antes (26% da altura, ~270px) e depois (justo nos cartões).
// Inclui o tipo "apres." (Apresentação), ainda sem dado no app.
import { AssessmentDayCard } from '../../src/ui/components/Cards';
import { Ficha, Secao } from '../vitrine/moldura';

export const DIAS = [
  { when: 'TER 17', due: 'em 7 d', bricks: [['GEN', 0, 'prova'], ['IMU', 2, 'prova'], ['PRO', 1, 'prova'], ['FAR', 4, 'trabalho']] },
  { when: 'SÁB 21', due: 'em 11 d', bricks: [['PRO', 1, 'trabalho'], ['APS', 3, 'apres.']] },
  { when: 'TER 24', due: 'em 14 d', bricks: [['FIS', 6, 'prova']] },
  { when: 'SEX 27', due: 'em 17 d', bricks: [['FIS', 6, 'trabalho']] },
  { when: 'SEG 30', due: 'em 20 d', bricks: [['APS', 3, 'apres.']] },
  { when: 'SÁB 05', due: 'em 25 d', bricks: [['FAR', 4, 'prova']] },
] as const;

export function Rolo() {
  return (
    <div className="ip-rolo">
      {DIAS.map((dia, i) => (
        <AssessmentDayCard
          key={dia.when}
          when={dia.when}
          due={dia.due}
          next={i === 0}
          selected={i === 1}
          bricks={dia.bricks.map(([code, color, kind]) => ({ code, color, kind }))}
        />
      ))}
    </div>
  );
}

export function ProvasHub() {
  return (
    <>
      <Secao>Provas do Hub em 1920 x 1080</Secao>
      <Ficha
        nome="Provas justo"
        arquivo="AssessmentDayCard"
        largura={12}
        uso="Em cima, como é hoje: o bloco tem 26% da altura e sobra vazio. Embaixo, proposta: bloco justo nos cartões (~17%), e a folga vai para calendário, agenda e lembretes."
      >
        <div className="ip-quadro">
          <span className="ip-rotulo">Hoje</span>
          <div className="ip-cena" data-alt="antes">
            <Rolo />
          </div>
          <span className="ip-rotulo">Proposta</span>
          <div className="ip-cena" data-alt="depois">
            <Rolo />
          </div>
        </div>
      </Ficha>
    </>
  );
}
