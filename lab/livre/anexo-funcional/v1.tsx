// Bancada FUNCIONAL do anexo de imagem (D158). Teste de verdade:
//  · Ctrl V com uma imagem copiada (print, imagem do navegador) cola na linha do cursor
//  · arraste um arquivo de imagem para cima de uma linha do cartão
//  · Alt O abre o menu do bloco (↑ ↓ escolhem, Enter executa, Esc fecha): Anexar imagem… e Ver imagens da frente/do verso
//  · na gaveta: ← → andam, Enter amplia, Delete remove, Esc fecha; ampliada: ← → trocam de imagem, Esc fecha
//  · Treino: Espaço vira o cartão. Tudo funciona só com o teclado.
//  · a pílula abre a gaveta; ✕ remove; "Adicionar" abre o seletor; tocar numa imagem amplia (Esc fecha)
//  · Treino: a imagem da frente aparece na frente; as do verso só depois de virar
// Máximo de 6 por lado; cada imagem é reduzida (lado maior de 1600 px) antes de ficar no cartão. Nada é salvo: recarregar zera.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Inline } from '../../../src/ui/components/CardBack';
import { markLength } from '../../../src/core/study/cardLines';
import { parseLine } from '../../../src/core/study/cardText';
import { Icone, Mais, Xis } from '../anexo-imagem/_partes';
import '../anexo-imagem/anexo.css';
import './funcional.css';

const MAX = 6;
const IMG = /^\{img:(\w+)\}$/;
const INICIAL = ['@ Onde fica o rim esquerdo?', 'Retroperitônio, entre T12 e L3', '# Relações', '- Adrenal acima', '- Baço lateral'];

const imgId = (l: string) => IMG.exec(l)?.[1] ?? null;

function reduzir(file: File): Promise<string> {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k));
      c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('arquivo não é imagem')); };
    img.src = url;
  });
}

/** Última linha de imagem logo depois da pergunta: até ela, as imagens são da frente. */
const fimDaFrente = (ls: string[]) => {
  let i = 0;
  while (imgId(ls[i + 1] ?? '') !== null) i += 1;
  return i;
};

export default function V1() {
  const [linhas, setLinhas] = useState<string[]>(INICIAL);
  const [imgs, setImgs] = useState<Record<string, string>>({});
  const [ativa, setAtiva] = useState(1);
  const [gaveta, setGaveta] = useState<'frente' | 'verso' | null>(null);
  const [menu, setMenu] = useState(false);
  const [ampliada, setAmpliada] = useState<string | null>(null);
  const [virado, setVirado] = useState(false);
  const [aviso, setAviso] = useState('');
  const seletor = useRef<HTMLInputElement>(null);
  const alvo = useRef<{ depois: number | null; lado?: 'frente' | 'verso' }>({ depois: null });
  const campo = useRef<HTMLInputElement>(null);
  const imgAtiva = useRef<HTMLDivElement>(null);
  const recente = useRef({ linhas, ativa });
  recente.current = { linhas, ativa };
  const gavetaRef = useRef<HTMLDivElement>(null);
  const gavetaAberta = useRef<'frente' | 'verso' | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const voltar = () => setTimeout(() => (campo.current ?? imgAtiva.current)?.focus(), 0);
  const estado = useRef({ ampliada, menu, virado, ordem: [] as string[] });

  const fim = fimDaFrente(linhas);
  const ordem = linhas.map(imgId).filter((x): x is string => x !== null);
  estado.current = { ampliada, menu, virado, ordem };
  const frenteIds = linhas.slice(1, fim + 1).map(imgId).filter((x): x is string => x !== null);
  const versoIds = linhas.slice(fim + 1).map(imgId).filter((x): x is string => x !== null);

  async function inserir(arquivos: File[], depois: number | null, lado?: 'frente' | 'verso') {
    const { linhas: ls, ativa: a } = recente.current;
    const f = fimDaFrente(ls);
    const ponto = depois ?? a;
    const doLado = lado ?? (ponto <= f ? 'frente' : 'verso');
    const jaTem = doLado === 'frente' ? f : ls.slice(f + 1).filter((l) => imgId(l) !== null).length;
    const vagas = Math.max(0, MAX - jaTem);
    const aceitos = arquivos.filter((x) => x.type.startsWith('image/')).slice(0, vagas);
    const sobra = arquivos.filter((x) => x.type.startsWith('image/')).length - aceitos.length;
    setAviso(sobra > 0 ? `Máximo de ${MAX} imagens por lado: ${sobra} ficaram de fora.` : '');
    if (aceitos.length === 0) return;
    const novos: Record<string, string> = {};
    const ids: string[] = [];
    for (const arq of aceitos) {
      try {
        const id = Math.random().toString(36).slice(2, 8);
        novos[id] = await reduzir(arq);
        ids.push(id);
      } catch { setAviso('Um dos arquivos não é uma imagem.'); }
    }
    if (ids.length === 0) return;
    setImgs((v) => ({ ...v, ...novos }));
    setLinhas((atual) => {
      const f2 = fimDaFrente(atual);
      let onde: number;
      if (lado === 'frente') onde = f2 + 1;
      else if (lado === 'verso') onde = atual.length;
      else onde = Math.min(ponto, atual.length - 1) + 1;
      // Pergunta em foco ou imagem da frente: a imagem entra na frente, logo abaixo da pergunta.
      if (lado === undefined && ponto <= f2) onde = ponto + 1;
      const copia = [...atual];
      copia.splice(onde, 0, ...ids.map((id) => `{img:${id}}`));
      setAtiva(onde + ids.length - 1);
      return copia;
    });
  }

  const abrirSeletor = (depois: number | null, lado?: 'frente' | 'verso') => {
    alvo.current = lado ? { depois: null, lado } : { depois };
    setMenu(false);
    seletor.current?.click();
  };

  useEffect(() => {
    const colar = (e: ClipboardEvent) => {
      const arqs = [...(e.clipboardData?.files ?? [])].filter((f) => f.type.startsWith('image/'));
      if (arqs.length === 0) return;
      e.preventDefault();
      void inserir(arqs, null);
    };
    const tecla = (e: KeyboardEvent) => {
      const { ampliada: amp, menu: men, ordem: ord, virado: vir } = estado.current;
      if (e.altKey && e.code === 'KeyO') { e.preventDefault(); setMenu((m) => !m); return; }
      if (e.code === 'Escape') {
        if (amp) {
          setAmpliada(null);
          if (gavetaAberta.current) setTimeout(() => gavetaRef.current?.querySelector<HTMLElement>(`[data-id="${amp}"]`)?.focus(), 0);
          else voltar();
        }
        else if (men) { setMenu(false); voltar(); }
        else if (gavetaAberta.current) { setGaveta(null); voltar(); }
        return;
      }
      if (amp && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        e.preventDefault();
        const i = ord.indexOf(amp);
        const prox = ord[(i + (e.code === 'ArrowRight' ? 1 : ord.length - 1)) % ord.length];
        if (prox) setAmpliada(prox);
        return;
      }
      const alvoEl = e.target as HTMLElement;
      const digitando = alvoEl instanceof HTMLInputElement || alvoEl instanceof HTMLTextAreaElement;
      if (e.code === 'Space' && !digitando && !amp && !men && alvoEl.tagName !== 'BUTTON') { e.preventDefault(); setVirado(!vir); }
    };
    document.addEventListener('paste', colar);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('paste', colar); document.removeEventListener('keydown', tecla); };
  }, []);

  // Foco: o menu e a gaveta recebem o foco ao abrir.
  useEffect(() => { gavetaAberta.current = gaveta; }, [gaveta]);
  useEffect(() => { if (menu) menuRef.current?.querySelector<HTMLElement>('button')?.focus(); }, [menu]);
  useEffect(() => { if (gaveta) gavetaRef.current?.querySelector<HTMLElement>('[data-g]')?.focus(); }, [gaveta]);

  useEffect(() => {
    if (estado.current.menu || gavetaAberta.current) return;
    (imgId(linhas[ativa] ?? '') ? imgAtiva.current : campo.current)?.focus();
  }, [ativa, linhas.length]);

  const editar = (i: number, bruto: string) => setLinhas((ls) => ls.map((l, k) => (k === i ? bruto : l)));
  const remover = (i: number) => { setLinhas((ls) => ls.filter((_, k) => k !== i)); setAtiva(Math.max(0, i - 1)); };
  const removerId = (id: string) => { const i = linhas.findIndex((l) => imgId(l) === id); if (i >= 0) remover(i); };

  function teclaLinha(i: number, e: React.KeyboardEvent) {
    const el = e.currentTarget as HTMLInputElement;
    const bruto = linhas[i] ?? '';
    const pre = markLength(bruto);
    if (e.key === 'Enter') {
      e.preventDefault();
      const marca = /^(- |\d+\. )/.exec(bruto)?.[0] ?? '';
      const at = pre + (el.selectionStart ?? 0);
      setLinhas((ls) => { const c = [...ls]; c.splice(i, 1, bruto.slice(0, at), (parseLine(bruto).kind === 'item' ? marca : '') + bruto.slice(at)); return c; });
      setAtiva(i + 1);
    } else if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0 && i > 0) {
      e.preventDefault();
      if (pre > 0) editar(i, bruto.slice(pre));
      else if (imgId(linhas[i - 1] ?? '') === null) { setLinhas((ls) => { const c = [...ls]; c.splice(i - 1, 2, (ls[i - 1] ?? '') + bruto); return c; }); setAtiva(i - 1); }
    } else if (e.key === 'ArrowUp' && i > 0) { e.preventDefault(); setAtiva(i - 1); }
    else if (e.key === 'ArrowDown' && i < linhas.length - 1) { e.preventDefault(); setAtiva(i + 1); }
  }
  function teclaImagem(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); remover(i); }
    else if (e.key === 'ArrowUp' && i > 0) { e.preventDefault(); setAtiva(i - 1); }
    else if (e.key === 'ArrowDown' && i < linhas.length - 1) { e.preventDefault(); setAtiva(i + 1); }
    else if (e.key === 'Enter') { e.preventDefault(); const id = imgId(linhas[i] ?? ''); if (id) setAmpliada(id); }
  }

  const soltar = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void inserir([...e.dataTransfer.files], i);
  };

  const linha = (i: number): ReactNode => {
    const bruto = linhas[i] ?? '';
    const id = imgId(bruto);
    const alvoDrop = { onDragOver: (e: React.DragEvent) => e.preventDefault(), onDrop: soltar(i) };
    if (id) {
      return (
        <div key={i} className="fn-img" data-ativa={ativa === i || undefined} {...alvoDrop}>
          <div ref={ativa === i ? imgAtiva : undefined} tabIndex={0} className="fn-img-foco" onKeyDown={(e) => teclaImagem(i, e)} onFocus={() => setAtiva(i)}>
            <img src={imgs[id]} alt="" onClick={() => setAmpliada(id)} />
            <button type="button" className="ai-x fn-x" aria-label="Remover imagem" onClick={() => remover(i)}><Xis /></button>
          </div>
        </div>
      );
    }
    const { kind, text } = parseLine(bruto);
    const pre = markLength(bruto);
    const lista = kind === 'item' || kind === 'number';
    if (ativa === i) {
      return (
        <div key={i} className="fn-linha fn-ativa" data-tipo={kind} {...alvoDrop}>
          {pre > 0 && <span className="fn-pilula">{bruto.slice(0, pre).trim()}</span>}
          <input ref={campo} className="fn-campo" value={bruto.slice(pre)} placeholder={i === 0 ? 'Pergunta' : ''} onChange={(e) => editar(i, bruto.slice(0, pre) + e.target.value)} onKeyDown={(e) => teclaLinha(i, e)} />
        </div>
      );
    }
    return (
      <p key={i} className="fn-linha" data-tipo={kind} {...alvoDrop} onClick={() => setAtiva(i)}>
        {lista && <span className="fn-marca">{kind === 'item' ? '•' : /^\d+[.)]/.exec(bruto)?.[0]}</span>}
        <span>{text === '' ? <i className="fn-vazio">linha vazia</i> : <Inline text={text} />}</span>
      </p>
    );
  };

  const Pil = ({ n, lado, forte }: { n: number; lado: 'frente' | 'verso'; forte?: boolean }) => (
    <button type="button" className={`ai-pil${forte ? ' ai-pil-forte' : ''}`} onClick={() => setGaveta(gaveta === lado ? null : lado)} aria-label={`${n} imagens na ${lado}`}>
      <Icone />{n > 0 ? <b>{n}</b> : <b>+</b>}
    </button>
  );
  const Vazio = ({ lado }: { lado: 'frente' | 'verso' }) => (
    <button type="button" className={`ai-vazio ai-vazio-${lado}`} aria-label={`Anexar imagem na ${lado}`} onClick={() => abrirSeletor(null, lado)}><Icone /></button>
  );
  const Gaveta = ({ lado, ids }: { lado: 'frente' | 'verso'; ids: string[] }) => (
    <div ref={gavetaRef} className={`ai-gaveta ai-gaveta-${lado} fn-gaveta`} role="group" aria-label={`Imagens da ${lado}`} onKeyDown={(e) => {
      const itens = [...(gavetaRef.current?.querySelectorAll<HTMLElement>('[data-g]') ?? [])];
      const i = itens.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowRight') { e.preventDefault(); itens[Math.min(i + 1, itens.length - 1)]?.focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); itens[Math.max(i - 1, 0)]?.focus(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement instanceof HTMLElement && document.activeElement.dataset.id) {
        e.preventDefault();
        const id = document.activeElement.dataset.id;
        removerId(id);
        setTimeout(() => gavetaRef.current?.querySelector<HTMLElement>('[data-g]')?.focus(), 0);
      }
    }}>
      <header><span>{lado === 'frente' ? 'Frente' : 'Verso'} · cartão 1</span><span>{ids.length} de {MAX}</span></header>
      <div className="ai-minis">
        {ids.map((id) => (
          <span key={id} className="ai-miniaba">
            <button type="button" data-g data-id={id} className="fn-thumb" aria-label="Imagem: Enter amplia, Delete remove" onClick={() => setAmpliada(id)}><img className="fn-mini" src={imgs[id]} alt="" /></button>
            <button type="button" tabIndex={-1} className="ai-x" aria-label="Remover" onClick={() => removerId(id)}><Xis /></button>
          </span>
        ))}
        <button type="button" data-g className="ai-add" onClick={() => abrirSeletor(null, lado)}><Mais />Adicionar</button>
      </div>
    </div>
  );

  const pergunta = parseLine(linhas[0] ?? '').text;
  const versoLinhas = linhas.slice(fim + 1);

  return (
    <div className="ai-pagina fn-pagina" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void inserir([...e.dataTransfer.files], null, 'verso'); }}>
      <input ref={seletor} type="file" accept="image/*" multiple hidden onChange={(e) => { const a = [...(e.target.files ?? [])]; e.target.value = ''; void inserir(a, alvo.current.depois, alvo.current.lado); }} />
      <section className="ai-secao">
        <h2>Editor e Salvos · cole (Ctrl V), arraste ou use o ⋮</h2>
        <div className="ai-ancora fn-ancora">
          <div className="fn-menu-caixa">
            <button type="button" className="fn-mais" aria-label="Opções do bloco (Alt O)" onClick={() => setMenu(!menu)}>⋮</button>
            {menu && (
              <ul ref={menuRef} className="fn-menu" role="menu" onKeyDown={(e) => {
                const itens = [...(menuRef.current?.querySelectorAll<HTMLElement>('button') ?? [])];
                const i = itens.indexOf(document.activeElement as HTMLElement);
                if (e.key === 'ArrowDown') { e.preventDefault(); itens[(i + 1) % itens.length]?.focus(); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); itens[(i + itens.length - 1) % itens.length]?.focus(); }
              }}>
                <li><button type="button" role="menuitem" onClick={() => abrirSeletor(null)}>Anexar imagem…</button></li>
                {frenteIds.length > 0 && <li><button type="button" role="menuitem" onClick={() => { setMenu(false); setGaveta('frente'); }}>Ver imagens da frente ({frenteIds.length})</button></li>}
                {versoIds.length > 0 && <li><button type="button" role="menuitem" onClick={() => { setMenu(false); setGaveta('verso'); }}>Ver imagens do verso ({versoIds.length})</button></li>}
                <li><button type="button" role="menuitem" onClick={() => { setMenu(false); voltar(); }}>Usar cartão compacto</button></li>
              </ul>
            )}
          </div>
          <article className="ai-card">
            <div className="ai-frente ai-frente-img">
              <div className="ai-linha-frente">
                <span className="ai-rotulo-frente fn-frente">{linha(0)}</span>
                {frenteIds.length > 0 ? <Pil n={frenteIds.length} lado="frente" forte /> : <Vazio lado="frente" />}
              </div>
              {linhas.slice(1, fim + 1).map((_, k) => linha(k + 1))}
            </div>
            <div className="ai-verso fn-verso">
              {versoLinhas.map((_, k) => linha(fim + 1 + k))}
              <span className="ai-canto">{versoIds.length > 0 ? <Pil n={versoIds.length} lado="verso" /> : <Vazio lado="verso" />}</span>
            </div>
          </article>
          {gaveta === 'frente' && <Gaveta lado="frente" ids={frenteIds} />}
          {gaveta === 'verso' && <Gaveta lado="verso" ids={versoIds} />}
        </div>
        {aviso && <p className="fn-aviso">{aviso}</p>}
      </section>

      <section className="ai-secao">
        <h2>Treino · {virado ? 'verso' : 'frente'} <button type="button" className="fn-virar" onClick={() => setVirado(!virado)}>{virado ? 'Voltar à frente' : 'Virar'}</button></h2>
        {!virado ? (
          <div className="ai-treino ai-treino-frente">
            <span className="ai-rot">Frente</span>
            <p className="ai-q">{pergunta || 'Sem frente'}</p>
            {frenteIds.map((id) => <img key={id} className="fn-grande" src={imgs[id]} alt="" onClick={() => setAmpliada(id)} />)}
            <span className="ai-dica">Toque na imagem para ampliar · "Virar" revela</span>
          </div>
        ) : (
          <div className="ai-treino-verso">
            <div className="ai-topo"><span className="ai-rot">Frente</span><p className="ai-q ai-q-mini">{pergunta}</p>{frenteIds.map((id) => <img key={id} className="fn-peq" src={imgs[id]} alt="" onClick={() => setAmpliada(id)} />)}</div>
            <div className="ai-corpo">
              <span className="ai-rot-verso">Verso</span>
              {versoLinhas.map((l, k) => {
                const id = imgId(l);
                if (id) return <img key={k} className="fn-grande fn-escuro" src={imgs[id]} alt="" onClick={() => setAmpliada(id)} />;
                const { kind, text } = parseLine(l);
                if (text === '') return null;
                return <p key={k} className="fn-t" data-tipo={kind}><Inline text={text} /></p>;
              })}
            </div>
          </div>
        )}
      </section>

      {ampliada && imgs[ampliada] && (
        <div className="fn-veu" onClick={() => setAmpliada(null)}>
          <img src={imgs[ampliada]} alt="" />
          <button type="button" className="fn-fechar" aria-label="Fechar" onClick={() => setAmpliada(null)}><Xis /></button>
        </div>
      )}
    </div>
  );
}
