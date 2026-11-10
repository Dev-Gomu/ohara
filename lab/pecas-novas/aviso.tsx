// Aviso de modo "Redimensionar" (Alt R): enquanto ativo, as setas mudam o tamanho do bloco.
import { Button } from '../../src/ui/components/Button';
import { Island } from '../../src/ui/components/Island';
import { Key } from '../../src/ui/components/Key';
import { Ficha, Secao } from '../vitrine/moldura';

type Versao = 'a' | 'b' | 'c';

const USO: Record<Versao, string> = {
  a: 'Flutuante embaixo, no centro da tela, sobre o conteúdo (como hoje, refinado).',
  b: 'Dentro do bloco que muda de tamanho, no meio dele: fica claro qual bloco é.',
  c: 'No indicador de nível do topo: redimensionar vira um modo, no lugar de Menu, Bloco, Campo.',
};

function Teclas() {
  return (
    <>
      <Key>← → ↑ ↓</Key>
      <span className="a-texto">ajustam</span>
      <Key>Enter</Key>
      <span className="a-texto">termina</span>
    </>
  );
}

function Corpo({ v }: { v: Versao }) {
  if (v === 'c') {
    return (
      <div className="a-tela">
        <div className="a-topo">
          <span className="a-titulo">Resposta inflamatória</span>
          <span className="a-fim">
            <Island label="Nível do teclado">
              <b className="a-modo">Redimensionar</b>
              <Teclas />
            </Island>
          </span>
        </div>
        <div className="a-mosaico">
          <div className="a-bloco" data-alvo />
          <div className="a-bloco" />
        </div>
      </div>
    );
  }
  return (
    <div className="a-tela">
      <div className="a-mosaico">
        <div className="a-bloco" data-alvo>
          {v === 'b' && (
            <div className="a-dentro">
              <b className="a-modo">Redimensionar</b>
              <div className="a-teclas">
                <Teclas />
              </div>
              <Button variant="primary">Pronto</Button>
            </div>
          )}
        </div>
        <div className="a-bloco" />
      </div>
      {v === 'a' && (
        <div className="a-flutua" role="status">
          <b className="a-modo">Redimensionar</b>
          <Teclas />
          <Button variant="primary">Pronto</Button>
        </div>
      )}
    </div>
  );
}

export function Aviso() {
  return (
    <>
      <Secao>4. Aviso "Redimensionar" (Mesa e telas com blocos)</Secao>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Ficha key={v} nome={`Aviso ${v.toUpperCase()}`} arquivo="Mesa" largura={6} uso={USO[v]}>
          <Corpo v={v} />
        </Ficha>
      ))}
    </>
  );
}
