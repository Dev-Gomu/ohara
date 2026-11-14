// Estado e teclas simuladas da bancada. No app, as teclas são linhas da tabela (nunca keydown em componente).
import { useState, type KeyboardEvent } from 'react';
import { AGENDA_ACOES } from '../../_dados';
import { TIPOS, type Marca, type Tipo } from './_partes';

export type JanelaCal = 'falta' | 'evento';
export type JanelaAg = 'mover' | 'avulsa';

export function useBancada() {
  const [dia, setDia] = useState(13);
  const [jCal, setJCal] = useState<JanelaCal>('falta');
  const [marcas, setMarcas] = useState<Record<string, Marca>>({ x2: 'falta' });
  const [tipo, setTipo] = useState<Tipo>('apresentacao');
  const [materia, setMateria] = useState('APS');
  const [tipoAv, setTipoAv] = useState<Tipo>('avulsa');
  const [materiaAv, setMateriaAv] = useState('FAR');
  const [aulaN, setAulaN] = useState(1);
  const [jAg, setJAg] = useState<JanelaAg>('mover');
  const [diaMover, setDiaMover] = useState('12');
  const [sem, setSem] = useState<Record<string, boolean>>({});
  const [aviso, setAviso] = useState<{ texto: string; desfazer?: string } | null>(null);
  // Cursor do teclado por seção: cal (rodapé ou janela), aval (tipos), ag (prévia ou janela).
  const [cur, setCur] = useState({ cal: 1, calJ: 0, aval: 2, ag: 1, agJ: 0 });
  const aula = AGENDA_ACOES.aulasDoDia[aulaN] ?? AGENDA_ACOES.aulasDoDia[0];

  const semAula = () => {
    if (aula.conteudo) {
      setAviso({
        texto: `A aula de ${aula.sigla} já tem anotações: não dá para tirar. Use Mover.`,
      });
      return;
    }
    setSem((s) => ({ ...s, [aula.id]: true }));
    setAviso({ texto: `Sem aula: ${aula.sigla}, sexta 13, ${aula.inicio}.`, desfazer: aula.id });
  };
  const desfazer = () => {
    setSem((s) => ({ ...s, [aula.id]: false }));
    setAviso(null);
  };

  const mover = (k: keyof typeof cur, passo: number, max: number) =>
    setCur((c) => ({ ...c, [k]: Math.max(0, Math.min(max - 1, c[k] + passo)) }));

  // Teclas simuladas: cada seção recebe foco com clique ou Tab.
  const teclasCal = (e: KeyboardEvent) => {
    if (e.altKey && e.code === 'KeyN') setJCal('evento');
    else if (e.altKey && e.code === 'KeyO') setJCal('falta');
    else if (e.code === 'ArrowRight') mover('cal', 1, 2);
    else if (e.code === 'ArrowLeft') mover('cal', -1, 2);
    else if (e.code === 'Enter') setJCal(cur.cal === 0 ? 'falta' : 'evento');
    else return;
    e.preventDefault();
  };
  const teclasAval = (e: KeyboardEvent) => {
    if (e.code === 'ArrowRight') mover('aval', 1, TIPOS.length);
    else if (e.code === 'ArrowLeft') mover('aval', -1, TIPOS.length);
    else if (e.code === 'Enter') setTipo(TIPOS[cur.aval]?.id ?? 'prova');
    else return;
    e.preventDefault();
  };
  const teclasAg = (e: KeyboardEvent) => {
    if (e.altKey && e.code === 'KeyN') setJAg('avulsa');
    else if (e.altKey && e.code === 'KeyZ') desfazer();
    else if (e.code === 'ArrowRight') mover('ag', 1, sem[aula.id] ? 1 : 3);
    else if (e.code === 'ArrowLeft') mover('ag', -1, sem[aula.id] ? 1 : 3);
    else if (e.code === 'ArrowDown') setAulaN((n) => Math.min(2, n + 1));
    else if (e.code === 'ArrowUp') setAulaN((n) => Math.max(0, n - 1));
    else if (e.code === 'Enter') {
      if (cur.ag === 1) setJAg('mover');
      else if (cur.ag === 2) semAula();
    } else return;
    e.preventDefault();
  };

  return {
    dia,
    setDia,
    jCal,
    setJCal,
    marcas,
    setMarcas,
    tipo,
    setTipo,
    materia,
    setMateria,
    tipoAv,
    setTipoAv,
    materiaAv,
    setMateriaAv,
    aulaN,
    setAulaN,
    aula,
    jAg,
    setJAg,
    diaMover,
    setDiaMover,
    sem,
    aviso,
    setAviso,
    cur,
    semAula,
    desfazer,
    teclasCal,
    teclasAval,
    teclasAg,
  };
}
export type Bancada = ReturnType<typeof useBancada>;
