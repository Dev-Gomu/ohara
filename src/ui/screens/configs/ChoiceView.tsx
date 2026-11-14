import type { MouseEvent } from 'react';
import { ScreenIcon } from '../../components/ScreenIcon';
import { StudyCard } from '../../components/CardBack';
import type { CardView } from '../../study/cardView';
import type { Choice } from './configsData';
import styles from './Choices.module.css';

// Tocar numa opção escolhe só ela: o clique não chega à linha, que passaria para a próxima.
const pick = (choice: Choice, id: string, after: () => void) => (event: MouseEvent) => {
  event.stopPropagation();
  choice.set(id);
  after();
};

function MenuSample({ mode }: { mode: string }) {
  const tab = (n: number, screen: 'hub' | 'mesa', on: boolean) => (
    <span className={styles.aba} data-on={on}>
      {mode !== 'numeros' && <ScreenIcon screen={screen} />}
      {mode === 'sobrescrito' ? <sup>{n}</sup> : mode === 'subscrito' ? <sub>{n}</sub> : mode !== 'icones' && <span>{n}</span>}
    </span>
  );
  return <span className={styles.abas}>{tab(1, 'hub', false)}{tab(2, 'mesa', true)}</span>;
}

export function ChoiceView({ choice, onChange }: { choice: Choice; onChange: () => void }) {
  if (choice.look === 'curta') {
    return (
      <span className={styles.par} role="radiogroup">
        {choice.options.map(({ id, name }) => (
          <span key={id} role="radio" aria-checked={choice.current === id} className={styles.op} data-on={choice.current === id} onClick={pick(choice, id, onChange)}>
            {name}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className={styles.amostras} role="radiogroup">
      {choice.options.map(({ id, name }) => (
        <span key={id} role="radio" aria-checked={choice.current === id} className={styles.amostra} data-on={choice.current === id} onClick={pick(choice, id, onChange)}>
          {choice.look === 'paleta' ? (
            <span className={styles.cores} data-amostra={id}><i /><i /><i /></span>
          ) : (
            <MenuSample mode={id} />
          )}
          <span className={styles.nome}><i className={styles.marca} />{name}</span>
        </span>
      ))}
    </span>
  );
}

const FRONT = 'Citocina que induz a PCR?';
const BACK = '# Resposta\n- IL-6\n- Macrófagos ativados\n# Clínica\n- Sobe em 6 a 8 horas';

// O cartão real, resumido e reduzido, que muda na hora com o grupo Cartões (D160).
export function CardSample({ view }: { view: CardView }) {
  return (
    <span className={styles.cartao} aria-hidden="true">
      <StudyCard front={FRONT} back={BACK} compact={view.compact} colorTitles={view.colorTitles} />
    </span>
  );
}
