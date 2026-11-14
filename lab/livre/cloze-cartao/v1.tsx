// O cloze com a cara do cartão simples (uma peça: faixa azul com o texto e corpo claro com a resposta).
import { Par, Sec } from './_partes';

export default function V1() {
  return (
    <div className="cz-pagina">
      <Sec t="1 · A faixa guarda a frase com […]; o corpo mostra só a resposta"><Par v="resposta" /></Sec>
      <Sec t="2 · A faixa guarda a frase com […]; o corpo mostra a frase completa"><Par v="completa" /></Sec>
      <Sec t="3 · A faixa revela a resposta ao virar; o corpo repete a resposta"><Par v="revela" /></Sec>
    </div>
  );
}
