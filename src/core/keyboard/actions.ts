// 'field' é o campo de texto; 'nav' é o campo navegável: lista, régua ou grade (D70).
export type Level = 'menu' | 'block' | 'field' | 'nav';
export type Direction = 'left' | 'down' | 'up' | 'right';
export const SCREENS = ['hub', 'mesa', 'acervo', 'treino', 'agenda', 'configs'] as const;
export type Screen = (typeof SCREENS)[number];
export type BlockKind = 'slides' | 'notes' | 'cards';

export type KeyAction =
  | { type: 'goToScreen'; screen: Screen }
  // step: tecla solta. No campo navegável anda entre os itens; com Alt, sempre vai ao vizinho.
  | { type: 'moveFocus'; direction: Direction; step?: true }
  | { type: 'swapBlock'; direction: Direction }
  | { type: 'enter' }
  | { type: 'escape' }
  | { type: 'nextBlock' }
  | { type: 'previousBlock' }
  | { type: 'toggleBlock'; block: BlockKind }
  | { type: 'maximizeBlock' }
  | { type: 'closeBlock' }
  | { type: 'resizeMode' }
  // Modo Ajustar da tabela (D149): delta em pixels, já com o passo pequeno ou grande.
  | { type: 'tableAdjust'; axis: 'width' | 'height'; delta: number }
  | { type: 'tableAdjustEnd' }
  // Comandos da tabela com o cursor dentro dela (qualidade de vida, D166).
  | { type: 'tableAddRow'; where: 'before' | 'after' }
  | { type: 'tableAddColumn'; where: 'before' | 'after' }
  | { type: 'tableDeleteRow' }
  | { type: 'tableDeleteColumn' }
  | { type: 'tableEqualize' }
  // Linha com opções curtas (Configs, D160): ← → trocam a opção escolhida.
  | { type: 'optionStep'; delta: -1 | 1 }
  | { type: 'helpTab'; step: -1 | 1 }
  | { type: 'cardLineSplit' }
  | { type: 'cardLineBack' }
  | { type: 'cardLineMove'; delta: -1 | 1 }
  // Tab passa da frente ao verso; Shift Tab volta (D170).
  | { type: 'cardSide'; to: 'front' | 'back' }
  | { type: 'cardImageRemove' }
  | { type: 'cardImageZoom' }
  // Janela da Lixeira (D164): delta 0 só devolve o foco da busca à lista.
  | { type: 'trashMove'; delta: -1 | 0 | 1 }
  | { type: 'trashKind'; delta: -1 | 1 }
  | { type: 'trashRestore' }
  | { type: 'trashMenu' }
  | { type: 'trashSearch' }
  | { type: 'trashBack' }
  | { type: 'swapHiddenBlock' }
  | { type: 'openOptions' }
  | { type: 'goToTopBar' }
  | { type: 'goToField' }
  | { type: 'goToBottomBar' }
  | { type: 'previousControl' }
  | { type: 'nextControl' }
  | { type: 'newItem' }
  | { type: 'defaultSizes' }
  | { type: 'defaultOrder' }
  | { type: 'openPalette' }
  | { type: 'quickReminder' }
  | { type: 'undo' }
  | { type: 'toggleTheme' }
  | { type: 'openHelp' }
  | { type: 'changePage'; step: -1 | 1 }
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'underline' }
  | { type: 'link' }
  | { type: 'code' }
  | { type: 'markSlidePage' }
  | { type: 'highlight' }
  | { type: 'strikethrough' }
  | { type: 'superscript' }
  | { type: 'subscript' }
  | { type: 'heading'; level: 1 | 2 | 3 }
  | { type: 'orderedList' }
  | { type: 'bulletList' }
  | { type: 'taskList' }
  | { type: 'cloze' }
  | { type: 'clozeSame' }
  | { type: 'saveCards' }
  | { type: 'flipCard' }
  | { type: 'rateCard'; grade: 1 | 2 | 3 | 4 };

// "swallow" para o evento sem executar nada: a tecla é nossa, mas agora não deve agir
// nem chegar ao navegador.
export type Resolved = KeyAction | { type: 'swallow' };
