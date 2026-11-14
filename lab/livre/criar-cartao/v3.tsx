// V3 · Campos em texto cru à esquerda, cartões gerados à direita (prévia do que será salvo).
import { ClozeCard, StudyCard } from '../../../src/ui/components/CardBack';
import { expandCloze } from '../../../src/core/study/cloze';
import { Palco, Cru, FRASE, PERGUNTA } from './_comum';

const VERSO = '# Resposta\n- IL-6, produzida por macrófagos ativados\n- Age nos hepatócitos';

export default function V3() {
  return (
    <Palco titulo="V3 · Escrevo à esquerda, vejo os cartões à direita">
      {(e) => (
        <div className="cc-duas">
          <div>
            {e === 'cloze' ? (
              <>
                <span className="cc-campo-rot">Frase com lacunas</span>
                <div className="cc-campo"><Cru texto={FRASE} /></div>
                <p className="cc-dica"><span className="cc-tag">{'{{c1::resposta}}'}</span><span>Cada número vira um cartão.</span></p>
              </>
            ) : (
              <>
                <span className="cc-campo-rot">Pergunta</span>
                <div className="cc-campo">{e === 'vazio' ? <span className="cc-falta">Escreva a pergunta ou uma frase com {'{{c1::lacuna}}'}</span> : <Cru texto={PERGUNTA} />}</div>
                {e === 'simples' && (<><span className="cc-campo-rot">Verso</span><div className="cc-campo"><span className="cc-cru"># Resposta<br />- IL-6, produzida por macrófagos ativados<br />- Age nos hepatócitos</span></div></>)}
              </>
            )}
          </div>
          <div className="cc-gerados">
            <span className="cc-campo-rot">{e === 'cloze' ? `Cartões gerados (${expandCloze(FRASE).length})` : e === 'simples' ? 'Cartão' : 'Prévia'}</span>
            {e === 'vazio' && <div className="cc-vazio"><b>A prévia aparece aqui</b><span>Cartão simples ou cloze, conforme o que você escrever.</span></div>}
            {e === 'simples' && <StudyCard front={PERGUNTA} back={VERSO} />}
            {e === 'cloze' && expandCloze(FRASE).map((t, i) => (
              <div key={i} className="cc-gerado"><header><span className="cc-tag">c{i + 1}</span>frente e verso</header><div className="cc-mini"><ClozeCard text={t} /></div></div>
            ))}
          </div>
        </div>
      )}
    </Palco>
  );
}
