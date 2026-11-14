// V1 · Qualidade de vida: uma seção por item, "Hoje" e "Proposta" lado a lado. Única versão (soluções objetivas).
import './qv.css';
import { SecaoAjuda, SecaoEntrada, SecaoTabela } from './_teclado';
import { SecaoAchados, SecaoBotoes } from './_pecas';

export default function V1() {
  return (
    <div className="qv-palco">
      <SecaoAjuda />
      <SecaoTabela />
      <SecaoEntrada />
      <SecaoBotoes />
      <SecaoAchados />
    </div>
  );
}
