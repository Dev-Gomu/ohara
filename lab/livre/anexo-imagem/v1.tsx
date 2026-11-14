// Como ficaria o anexo de imagem (V1 aprovada + decisões 1 a 6): a imagem aparece no cartão, no PONTO do texto onde foi colocada;
// a pílula e a gaveta só gerenciam. No Treino a da frente aparece na frente e a do verso só depois de virar; tocar amplia.
import { Icone, Mais, Mini, Xis } from './_partes';
import { CardBack, Inline } from '../../../src/ui/components/CardBack';

const ANTES = 'Macrófago ativado';
const EFEITOS = '# Efeitos\n- Febre\n- ↑ PCR no fígado';

/** Verso com as imagens nos pontos onde foram colocadas: uma depois de "Macrófago ativado", outra depois de "Efeitos". */
const VersoComImagens = ({ tam }: { tam: number }) => (
  <>
    <CardBack back={ANTES} compact />
    <div className="ai-no-texto"><Mini i={1} tam={tam} /></div>
    <CardBack back={EFEITOS} compact />
    <div className="ai-no-texto"><Mini i={2} tam={tam} /></div>
  </>
);
const Pil = ({ n, forte }: { n: number; forte?: boolean }) => (
  <span className={`ai-pil${forte ? ' ai-pil-forte' : ''}`}><Icone /><b>{n}</b></span>
);
const Sec = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="ai-secao"><h2>{t}</h2>{children}</section>
);

export default function V1() {
  return (
    <div className="ai-pagina">
      <Sec t="Editor e Salvos: a imagem fica no lado em que foi anexada">
        <div className="ai-ancora">
          <article className="ai-card">
            <div className="ai-frente ai-frente-img">
              <div className="ai-linha-frente">
                <span className="ai-rotulo-frente"><Inline text="Onde fica o rim esquerdo?" /></span>
                <Pil n={1} forte />
              </div>
              <span className="ai-img-faixa"><Mini i={0} tam={72} /></span>
            </div>
            <div className="ai-verso">
              <VersoComImagens tam={64} />
              <span className="ai-canto"><Pil n={2} /></span>
            </div>
          </article>
          <div className="ai-gaveta ai-gaveta-verso">
            <header><span>Verso · cartão 1</span><span>2 imagens</span></header>
            <div className="ai-minis">
              {[1, 2].map((i) => (
                <span key={i} className="ai-miniaba"><Mini i={i} tam={52} /><button type="button" className="ai-x" aria-label="Remover"><Xis /></button></span>
              ))}
              <button type="button" className="ai-add"><Mais />Adicionar</button>
            </div>
          </div>
        </div>
      </Sec>

      <Sec t="Treino · frente: a imagem da frente já aparece">
        <div className="ai-treino ai-treino-frente">
          <span className="ai-rot">Frente</span>
          <p className="ai-q">Onde fica o rim esquerdo?</p>
          <span className="ai-img-grande"><Mini i={0} tam={120} /></span>
          <span className="ai-dica">Toque na imagem para ampliar · Espaço revela</span>
        </div>
      </Sec>

      <Sec t="Treino · verso: as imagens do verso aparecem depois de virar, cada uma no seu ponto">
        <div className="ai-treino-verso">
          <div className="ai-topo"><span className="ai-rot">Frente</span><p className="ai-q ai-q-mini">Onde fica o rim esquerdo?</p></div>
          <div className="ai-corpo">
            <span className="ai-rot-verso">Verso</span>
            <VersoComImagens tam={80} />
          </div>
        </div>
      </Sec>

      <Sec t="Imagem ampliada (toque numa miniatura)">
        <div className="ai-veu">
          <span className="ai-ampla"><Mini i={0} tam={190} /></span>
          <button type="button" className="ai-fechar" aria-label="Fechar"><Xis /></button>
        </div>
      </Sec>
    </div>
  );
}
