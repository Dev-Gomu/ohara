import { useState } from 'react';
import { pinProblem } from '../../core/secret/vault';
import { PinSlots, type PinStatus } from '../components/PinSlots';
import { showNotice } from '../study/notice';
import { startSetup, unlockPin } from './session';
import styles from './Notas.module.css';

// PIN digitado na própria tela das Notas (sem janela): abrir ou criar.
export function CofrePin({ hasPin }: { hasPin: boolean }) {
  return hasPin ? <Abrir /> : null;
}

function Abrir() {
  const [status, setStatus] = useState<PinStatus>('idle');
  const [round, setRound] = useState(0);
  return (
    <div className={styles.pinBloco} data-field>
      <p className={styles.pinRotulo}>Digite o PIN de 6 números</p>
      <PinSlots
        key={round}
        autoFocus
        status={status}
        onChange={() => setStatus('idle')}
        onComplete={(code) =>
          void unlockPin(code).then((result) => {
            if (result === 'ok') return setStatus('success');
            setStatus('error');
            showNotice(
              result === 'errado'
                ? 'PIN errado.'
                : 'PIN apagado por excesso de erros. Use o código.',
            );
            setTimeout(() => setRound((n) => n + 1), 700);
          })
        }
      />
    </div>
  );
}

export function CriarPin() {
  const [first, setFirst] = useState<string | null>(null);
  const [status, setStatus] = useState<PinStatus>('idle');
  const [round, setRound] = useState(0);
  function restart(message: string) {
    setStatus('error');
    showNotice(message);
    setTimeout(() => {
      setFirst(null);
      setStatus('idle');
      setRound((n) => n + 1);
    }, 700);
  }
  return (
    <div className={styles.pinBloco} data-field>
      <p className={styles.pinRotulo}>
        {first === null ? 'Crie um PIN de 6 números' : 'Repita o PIN'}
      </p>
      <PinSlots
        key={`${round}-${first === null ? 'a' : 'b'}`}
        autoFocus
        status={status}
        onComplete={(code) => {
          if (first === null) {
            const problem = pinProblem(code);
            return problem ? restart(problem) : setFirst(code);
          }
          if (code !== first) return restart('Os dois PINs são diferentes.');
          void startSetup(code);
        }}
      />
      <p className={styles.pinDica}>Vale só neste aparelho. Escolha algo que você lembre.</p>
    </div>
  );
}
