import { useEffect } from 'react';
import { Block } from '../components/Block';
import { NavItem } from '../components/NavItem';
import { useBlocks } from '../keyboard/useBlocks';
import { ScreenFrame } from '../shell/ScreenFrame';
import { closeNotes } from '../study/navigation';
import { useStudy } from '../study/study';
import { askPinUnlock, askRecover, askSetup, askUnlock } from './forms';
import { NotasAberto } from './NotasAberto';
import styles from './Notas.module.css';
import { cancelDraft, confirmDraft, lock, readPin, useSecretView } from './session';

const VAULT = 'notas.cofre';

interface Action {
  label: string;
  hint?: string;
  run: () => void;
}

function vaultActions(hasVault: boolean, draftCode: string | null): Action[] {
  if (draftCode) {
    return [
      { label: 'Anotei o código, continuar', hint: 'Enter', run: () => void confirmDraft() },
      { label: 'Cancelar', run: cancelDraft },
    ];
  }
  if (!hasVault) return [{ label: 'Criar a frase de acesso', hint: 'Enter', run: askSetup }];
  return [
    { label: 'Abrir com a frase', hint: 'Enter', run: askUnlock },
    ...(readPin() ? [{ label: 'Abrir com o PIN', run: askPinUnlock }] : []),
    { label: 'Esqueci a frase: usar o código de recuperação', run: askRecover },
  ];
}

export function Notas() {
  const secret = useSecretView();
  const data = useStudy();
  const open = secret.key !== null;
  const hasVault = data.vault.length > 0;

  // D41: sair da tela de Notas trava na hora.
  useEffect(() => lock, []);

  return (
    <ScreenFrame
      title="Notas do boletim"
      caps={false}
      end={
        <button type="button" className={styles.voltar} onClick={closeNotes}>
          ← Agenda <kbd>Esc</kbd>
        </button>
      }
    >
      {open ? (
        <NotasAberto data={data} items={secret.items} unreadable={secret.unreadable} />
      ) : (
        <Closed hasVault={hasVault} code={secret.draft?.code ?? null} />
      )}
    </ScreenFrame>
  );
}

function Closed(props: { hasVault: boolean; code: string | null }) {
  const { hasVault, code } = props;
  const actions = vaultActions(hasVault, code);
  useBlocks({
    blocks: [
      {
        id: VAULT,
        kind: 'nav',
        nav: { axis: 'y', count: actions.length },
        onActivate: (index) => actions[index]?.run(),
      },
    ],
    arrival: { block: VAULT, level: 'nav', items: { [VAULT]: 0 } },
    back: closeNotes,
    actions: { newItem: () => actions[0]?.run() },
  });

  return (
    <div className={`${styles.notas} ${styles.cofreGrade}`}>
      <Block id={VAULT} title="Notas do boletim" className={styles.cofre}>
        <div className={styles.corpo}>
          {code ? (
            <>
              <p className={styles.texto}>
                Este é o seu código de recuperação. Anote em papel, fora do app. Ele aparece só esta
                vez. Sem a frase e sem o código, as notas não podem ser recuperadas.
              </p>
              <p className={styles.codigo} data-testid="codigo-recuperacao">
                {code}
              </p>
            </>
          ) : (
            <p className={styles.texto}>
              {hasVault
                ? 'As notas estão travadas. Elas se travam sozinhas depois de 2 minutos sem uso.'
                : 'As notas ficam cifradas: só abrem com a sua frase de acesso, e nunca aparecem na Agenda, no Hub nem na Mesa.'}
            </p>
          )}
          {actions.map((action, index) => (
            <NavItem
              key={action.label}
              block={VAULT}
              index={index}
              className={styles.acao}
              ring="anel"
              onOpen={action.run}
            >
              <span>{action.label}</span>
              {action.hint && <kbd>{action.hint}</kbd>}
            </NavItem>
          ))}
        </div>
      </Block>
    </div>
  );
}
