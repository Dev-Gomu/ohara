// Peças de 15/11: código de PIN, item de checklist e dica deslizante.
import { useState } from 'react';
import { PinSlots, type PinStatus } from '../../src/ui/components/PinSlots';
import { CheckItem } from '../../src/ui/components/CheckItem';
import { StatePill } from '../../src/ui/components/Pill';
import { Dica } from '../../src/ui/components/Dica';
import { DicaGrupo } from '../../src/ui/components/DicaGrupo';
import { FormatIcon } from '../../src/ui/components/FormatIcons';
import botao from '../../src/ui/components/FormatBar.module.css';
import { Amostra, Ficha, Linha, Secao } from './moldura';

const nada = () => undefined;

function PinInterativo() {
  const [status, setStatus] = useState<PinStatus>('idle');
  return (
    <>
      <PinSlots
        status={status}
        onChange={() => status === 'error' && setStatus('idle')}
        onComplete={(c) => setStatus(c === '123456' ? 'success' : 'error')}
      />
      {status === 'success' && (
        <button type="button" onClick={() => setStatus('idle')}>
          Fechar de novo
        </button>
      )}
    </>
  );
}

function CheckInterativo() {
  const [feito, setFeito] = useState(false);
  return <CheckItem title="Revisar resumo de IMU" checked={feito} onOpen={() => setFeito(!feito)} />;
}

const ICONES = [
  ['negrito', 'Negrito', 'Alt+B'],
  ['italico', 'Itálico', 'Alt+I'],
  ['sublinhado', 'Sublinhado', 'Alt+U'],
  ['topicos', 'Lista', 'Alt+L'],
  ['link', 'Link', 'Alt+K'],
] as const;

export function Pecas1511() {
  return (
    <>
      <Secao>Código, checklist e dica</Secao>
      <Ficha
        nome="Código de PIN"
        arquivo="PinSlots"
        largura={6}
        uso="Seis casas de dígitos. Acerta com o visto, erra esvaziando as casas. Clique e digite."
      >
        <Amostra estado="vazio">
          <PinSlots ariaLabel="PIN vazio" />
        </Amostra>
        <Amostra estado="sem máscara: clique e digite 123 para ver parcial">
          <PinSlots ariaLabel="PIN parcial" mask={false} />
        </Amostra>
        <Amostra estado="interativo: 123456 abre, outro erra">
          <PinInterativo />
        </Amostra>
      </Ficha>
      <Ficha
        nome="Item de checklist"
        arquivo="CheckItem"
        largura={6}
        uso="Tarefa com caixa que enche, visto e texto riscado. Pílula opcional no fim."
      >
        <Amostra estado="em aberto">
          <CheckItem title="Ler capítulo 4" checked={false} onOpen={nada} />
        </Amostra>
        <Amostra estado="feito">
          <CheckItem title="Fazer cartões de PRO" checked onOpen={nada} />
        </Amostra>
        <Amostra estado="com pílula de atraso">
          <CheckItem title="Entregar relatório" checked={false} note="2 dias de atraso" onOpen={nada}>
            <StatePill state="atencao">2 d</StatePill>
          </CheckItem>
        </Amostra>
        <Amostra estado="clicável">
          <CheckInterativo />
        </Amostra>
      </Ficha>
      <Ficha
        nome="Dica"
        arquivo="Dica + DicaGrupo"
        largura={6}
        uso="Balão com nome e atalho. Passe o mouse (ou Tab) entre os botões: o balão desliza de um para o outro."
      >
        <Linha>
          <DicaGrupo>
            {ICONES.map(([icone, nome, atalho]) => (
              <Dica key={icone} content={nome} shortcut={atalho}>
                <button type="button" className={botao.botao} aria-label={nome}>
                  <FormatIcon name={icone} />
                </button>
              </Dica>
            ))}
          </DicaGrupo>
        </Linha>
      </Ficha>
    </>
  );
}
