import type { ReactNode } from 'react';

const S = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export interface Botao {
  id: string;
  nome: string;
  funcao: string;
  exemplo: ReactNode;
  glifo: ReactNode;
  pronto: boolean;
  essencial?: boolean;
}

export const BOTOES: Botao[] = [
  { id: 'titulo', nome: 'Título', funcao: 'Transforma a linha em título de seção, ou volta a texto', exemplo: <b>Tipo I</b>, glifo: <b>H</b>, pronto: true, essencial: true },
  { id: 'negrito', nome: 'Negrito', funcao: 'Realça o termo importante', exemplo: <b>IgE</b>, glifo: <b>B</b>, pronto: true },
  { id: 'italico', nome: 'Itálico', funcao: 'Microrganismo, termo estrangeiro, ênfase leve', exemplo: <i>S. aureus</i>, glifo: <i>I</i>, pronto: true },
  { id: 'sublinhado', nome: 'Sublinhado', funcao: 'Sublinha o trecho', exemplo: <u>mastócito</u>, glifo: <u>U</u>, pronto: true },
  { id: 'tachado', nome: 'Tachado', funcao: 'Risca o que está errado ou foi corrigido', exemplo: <s>48 h</s>, glifo: <s>S</s>, pronto: true },
  { id: 'marca', nome: 'Marca-texto', funcao: 'Pinta o fundo do trecho', exemplo: <mark>FcεRI</mark>, glifo: <S><path d="M13 4l5 5-7 7H6v-5zM4 21h16" /></S>, pronto: true, essencial: true },
  { id: 'cor', nome: 'Cor da letra', funcao: 'Muda a cor do texto para separar categorias', exemplo: <span style={{ color: 'var(--cor-cursor)' }}>Th2</span>, glifo: <S><path d="M7 18l5-13 5 13M9 13h6M5 21h14" /></S>, pronto: false },
  { id: 'topicos', nome: 'Lista com tópicos', funcao: 'Itens soltos, sem ordem', exemplo: <span>• febre<br />• tosse</span>, glifo: <S><path d="M10 6h10M10 12h10M10 18h10M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></S>, pronto: true, essencial: true },
  { id: 'numerada', nome: 'Lista numerada', funcao: 'Passos, fases e critérios em ordem', exemplo: <span>1. fase imediata<br />2. fase tardia</span>, glifo: <S><path d="M11 6h9M11 12h9M11 18h9M4 5l1.5-1v5M4 14.5a1.3 1.3 0 012.4.6c0 1-2.4 1.4-2.4 2.9h2.6" /></S>, pronto: true, essencial: true },
  { id: 'tarefas', nome: 'Lista de tarefas', funcao: 'Caixinha de marcar, para pendências', exemplo: <span>☐ rever slides</span>, glifo: <S><rect x="3.5" y="4" width="6" height="6" rx="1.5" /><path d="M4.8 15.5l1.7 1.7 2.8-3M13 7h7M13 17h7" /></S>, pronto: true },
  { id: 'recuo+', nome: 'Aumentar recuo', funcao: 'Desce o item um nível (subtópico)', exemplo: <span>• fase<br />&nbsp;&nbsp;◦ tardia</span>, glifo: <S><path d="M4 6h16M12 12h8M12 18h8M4 9l4 3-4 3z" /></S>, pronto: true },
  { id: 'recuo-', nome: 'Diminuir recuo', funcao: 'Sobe o item um nível', exemplo: <span>&nbsp;&nbsp;◦ tardia<br />• tardia</span>, glifo: <S><path d="M4 6h16M12 12h8M12 18h8M8 9l-4 3 4 3z" /></S>, pronto: true },
  { id: 'citacao', nome: 'Citação', funcao: 'Bloco recuado para frase do professor ou trecho copiado', exemplo: <span style={{ borderLeft: '2px solid var(--cor-texto-2)', paddingLeft: 6 }}>“cai na prova”</span>, glifo: <S><path d="M7 7h4v5H6a3 3 0 003 3M15 7h4v5h-5a3 3 0 003 3" /></S>, pronto: true },
  { id: 'codigo', nome: 'Código', funcao: 'Letra de máquina para sigla, dose ou fórmula', exemplo: <code>5 mg/kg</code>, glifo: <S><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></S>, pronto: true },
  { id: 'linha', nome: 'Linha divisória', funcao: 'Risca uma linha para separar assuntos', exemplo: <hr style={{ width: 70, border: 0, borderTop: '1px solid var(--cor-texto-2)' }} />, glifo: <S><path d="M4 12h16" /></S>, pronto: true },
  { id: 'link', nome: 'Link', funcao: 'Transforma o trecho em endereço clicável', exemplo: <span style={{ textDecoration: 'underline' }}>artigo</span>, glifo: <S><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></S>, pronto: true },
  { id: 'tabela', nome: 'Tabela', funcao: 'Insere uma tabela 3 por 3; dentro dela aparece a mini-barra de linhas e colunas', exemplo: <span style={{ borderTop: '1px solid var(--cor-texto)', borderBottom: '1px solid var(--cor-texto)', padding: '2px 0' }}>Tipo · Mediador</span>, glifo: <S><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 11h16M4 15h16M10 5v14" /></S>, pronto: false, essencial: true },
  { id: 'sobre', nome: 'Sobrescrito', funcao: 'Número elevado: íons e potências', exemplo: <span>Ca<sup>2+</sup>, 10<sup>6</sup></span>, glifo: <span>x<sup>2</sup></span>, pronto: false },
  { id: 'sub', nome: 'Subscrito', funcao: 'Número abaixo: fórmulas', exemplo: <span>H<sub>2</sub>O, CO<sub>2</sub></span>, glifo: <span>x<sub>2</sub></span>, pronto: false },
  { id: 'limpar', nome: 'Limpar formatação', funcao: 'Tira todo o estilo do trecho selecionado', exemplo: <span><b>negrito</b> → texto</span>, glifo: <S><path d="M5 5h14M12 5l-3 14M7 20h10M17 14l4 4M21 14l-4 4" /></S>, pronto: true },
  { id: 'desfazer', nome: 'Desfazer', funcao: 'Volta o último passo (no tablet não existe Ctrl Z)', exemplo: <span>↶ volta</span>, glifo: <S><path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" /></S>, pronto: true, essencial: true },
];
