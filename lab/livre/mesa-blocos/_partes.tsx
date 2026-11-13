// Bancada "mesa-blocos": o espaço dos três blocos da Mesa. Só desenho; nada aqui liga no teclado.
// Query: &foco=slides|notas|cartoes|menu  &nivel=bloco|campo  &cartoes=novo|salvos
//        &toque=1 (mostra alvos grandes)  &extremo=1 (muitas páginas, título comprido)  &barra=1 (formatação aberta)
import type { ReactNode } from 'react';
import { Block as _B } from '../../../src/ui/components/Block';
import { BlockIcon, type IconName } from '../../../src/ui/components/BlockIcon';
import { Button } from '../../../src/ui/components/Button';
import { CardBack, Inline } from '../../../src/ui/components/CardBack';
import { Key } from '../../../src/ui/components/Key';
import bloco from '../../../src/ui/components/Block.module.css';
import cartoes from '../../../src/ui/screens/mesa/CardsBlock.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import { Slide, Nota, Ferramentas, Topo, Tela as TelaBase } from '../mesa/_partes';
import '../mesa/mesa.css';
import './blocos.css';

void _B;
const pedido = new URLSearchParams(location.search);
export const FOCO = pedido.get('foco') ?? 'notas';
export const NIVEL = pedido.get('nivel') ?? (FOCO === 'slides' ? 'bloco' : 'campo');
export const MODO = pedido.get('cartoes') ?? 'novo';
export const TOQUE = pedido.get('toque') === '1';
export const EXTREMO = pedido.get('extremo') === '1';
export const BARRA = pedido.get('barra') === '1';
export const PAGINA = EXTREMO ? '312 de 480' : '3 de 24';

export type Id = 'slides' | 'notas' | 'cartoes';
export const INFO: Record<Id, { nome: string; tecla: string; icone: IconName }> = {
  slides: { nome: 'Slides', tecla: 'Alt S', icone: 'slides' },
  notas: { nome: 'Anotações', tecla: 'Alt A', icone: 'notas' },
  cartoes: { nome: 'Cartões', tecla: 'Alt C', icone: 'cartoes' },
};

/** Estado de foco do bloco: nenhum (fora), bloco (cursor no bloco) ou dentro (no campo). */
export function estado(id: Id): 'fora' | 'bloco' | 'dentro' {
  if (FOCO !== id) return 'fora';
  return NIVEL === 'campo' && id !== 'slides' ? 'dentro' : 'bloco';
}

export function Icone({ id }: { id: Id }) {
  return (
    <span className="mb-icone">
      <BlockIcon name={INFO[id].icone} />
    </span>
  );
}

export const Mais = ({ id }: { id: Id }) => (
  <button type="button" className="mb-mais" aria-label={`Opções de ${INFO[id].nome}`} title={`Opções · ${INFO[id].tecla} depois M`}>
    ⋮
  </button>
);

export function Caixa({ id, children, className }: { id: Id; children: ReactNode; className?: string }) {
  const e = estado(id);
  return (
    <section
      className={`${bloco.bloco} mb-caixa ${className ?? ''}`}
      data-block={id}
      data-foco={e === 'fora' ? undefined : e}
      data-toque={TOQUE ? '' : undefined}
      aria-label={INFO[id].nome}
    >
      {children}
    </section>
  );
}

export const Passos = ({ grande }: { grande?: boolean }) => (
  <span className="mb-passos" data-grande={grande ? '' : undefined}>
    <button type="button" aria-label="Página anterior">‹</button>
    <span className="mb-pagina">{PAGINA}</span>
    <button type="button" aria-label="Próxima página">›</button>
  </span>
);

export const Abas = () => (
  <span className="mb-abas" role="tablist" aria-label="Cartões">
    <span role="tab" aria-selected={MODO === 'novo'}>Novo</span>
    <span role="tab" aria-selected={MODO === 'salvos'}>Salvos <small>6</small></span>
  </span>
);

const SALVOS = [
  ['Quem medeia a hipersensibilidade tipo I?', 'IgE, mastócitos e basófilos'],
  ['Exemplo de tipo II?', '- Miastenia gravis\n- Anemia hemolítica autoimune'],
  ['Onde depositam os imunocomplexos?', 'Vaso, rim e articulação'],
  ['Tempo da reação tipo IV?', '48 a 72 horas'],
] as const;
const CORES = ['roxo', 'rosa', 'azul', 'verde'];

export function CartoesCorpo({ salvar }: { salvar?: ReactNode }) {
  if (MODO === 'salvos') {
    return (
      <div className={cartoes.cartoes}>
        {SALVOS.map(([p, r], i) => (
          <div key={p} className={`${cartoes.cartao} ${FOCO === 'cartoes' && i === 1 ? 'm-cursor' : ''}`} data-cor={CORES[i % 4]}>
            <span className={cartoes.pergunta}><Inline text={p} /></span>
            <CardBack back={r} compact />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={cartoes.criar}>
      <div className={cartoes.criarGrade}>
        <textarea
          className={cartoes.texto}
          readOnly
          value={'@ Quem medeia a tipo I?\nIgE, mastócitos e basófilos\n# Fases\n- Imediata: histamina\n- Tardia: eosinófilos\n\n@ Exemplo de tipo III?'}
        />
        <div className={cartoes.rascunhos}>
          <article className={cartoes.rascunho}>
            <p className={cartoes.frente}>Quem medeia a tipo I?</p>
            <CardBack back={'IgE, mastócitos e basófilos\n# Fases\n- Imediata: histamina\n- Tardia: eosinófilos'} compact />
          </article>
          <article className={cartoes.rascunho} data-incompleto="true">
            <p className={cartoes.frente}>Exemplo de tipo III?</p>
            <p className={cartoes.falta}>Falta o verso</p>
          </article>
        </div>
      </div>
      {salvar}
    </div>
  );
}

export const SalvarBtn = () => (
  <Button variant="primary" shortcut="Ctrl Enter">Salvar 1</Button>
);

export function Tela({ children }: { children: ReactNode }) {
  return (
    <TelaBase topo={<Topo alternadores="icones" fim="menu" />}>
      {children}
    </TelaBase>
  );
}

export { Slide, Nota, Ferramentas, Key, mesa };
