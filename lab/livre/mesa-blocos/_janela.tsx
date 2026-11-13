// Rodada 2 (13/11): V1 com folga. `fusao` = a barra de formatação entra na linha do cabeçalho (Anotações em campo).
import { Abas, Caixa, CartoesCorpo, Ferramentas, Icone, INFO, Key, Mais, Nota, Passos, SalvarBtn, Slide, Tela, estado, BARRA, MODO, TOQUE, mesa, type Id } from './_partes';

interface Opc { classe: string; fusao: boolean }

function Cab({ id, meio, o }: { id: Id; meio?: React.ReactNode; o: Opc }) {
  const e = estado(id);
  const funde = o.fusao && id === 'notas' && (e === 'dentro' || BARRA);
  return (
    <header className={`mb-fino mb-folga ${o.classe}`}>
      <Icone id={id} />
      {funde ? (
        <span className="mb-fundida"><Ferramentas /></span>
      ) : (
        <>
          <span className="mb-nome">{INFO[id].nome}</span>
          {meio}
        </>
      )}
      <span className="mb-fim">
        {id === 'cartoes' && MODO === 'novo' && <span className="mb-salvar-topo"><SalvarBtn /></span>}
        {!funde && e !== 'fora' && <Key>{INFO[id].tecla.replace('Alt ', '')}</Key>}
        {(e !== 'fora' || TOQUE) && <Mais id={id} />}
      </span>
    </header>
  );
}

export function Janela({ o }: { o: Opc }) {
  const nota = estado('notas');
  return (
    <Tela>
      <Caixa id="slides">
        <Cab id="slides" o={o} meio={<span className="mb-meio"><Passos grande={TOQUE} /></span>} />
        <div className={mesa.pagina}><Slide /></div>
      </Caixa>
      <Caixa id="cartoes">
        <Cab id="cartoes" o={o} meio={<span className="mb-meio"><Abas /></span>} />
        <CartoesCorpo />
      </Caixa>
      <Caixa id="notas">
        <Cab id="notas" o={o} />
        <Nota />
        {!o.fusao && (nota === 'dentro' || BARRA) && <div className="mb-barra-fina"><Ferramentas /></div>}
      </Caixa>
    </Tela>
  );
}
