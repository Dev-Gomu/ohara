// Moldura da vitrine: cada ficha é um Bloco real, aceso, com o nome da peça e o arquivo dela.
import type { ReactNode } from 'react';
import { Block } from '../../src/ui/components/Block';

interface FichaProps {
  // Nome da peça, como na seção 7 das diretrizes.
  nome: string;
  // Arquivo em src/ui/components de onde importar.
  arquivo: string;
  largura: 4 | 5 | 6 | 7 | 8 | 12;
  // Quando usar, em uma frase.
  uso: string;
  children: ReactNode;
}

export function Ficha({ nome, arquivo, largura, uso, children }: FichaProps) {
  return (
    <Block
      id={`vitrine.${nome}`}
      title={nome}
      count={arquivo}
      fixed="inside"
      className={`v-${largura}`}
    >
      <div className="v-corpo">
        <p className="v-uso">{uso}</p>
        {children}
      </div>
    </Block>
  );
}

export function Linha({ children }: { children: ReactNode }) {
  return <div className="v-linha">{children}</div>;
}

// Uma peça em um estado, com o nome do estado embaixo.
export function Amostra({ estado, children }: { estado: string; children: ReactNode }) {
  return (
    <div className="v-amostra">
      {children}
      <span className="v-legenda">{estado}</span>
    </div>
  );
}

export function Secao({ children }: { children: string }) {
  return <h2 className="v-secao">{children}</h2>;
}
