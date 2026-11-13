// Editor de cartões da Mesa com as cores do cartão do Treino (D150): frente cheia no azul de ação com texto
// claro, verso no mesmo contorno, títulos de seção no destaque. Reaproveita o editor de ../mesa-flashcard.
import type { ReactNode } from 'react';
import { MesaFlashcard } from '../mesa-flashcard/_partes';
import './cartao-treino.css';

// Cor nos títulos ligada, como no Treino; &cor=off desliga.
document.documentElement.dataset.corTitulos = new URLSearchParams(location.search).get('cor') === 'off' ? 'off' : 'on';

export function Versao({ n, children }: { n: 1 | 2 | 3; children?: ReactNode }) {
  return (
    <div className="ct-escopo" data-ct={n}>
      <MesaFlashcard />
      {children}
    </div>
  );
}
