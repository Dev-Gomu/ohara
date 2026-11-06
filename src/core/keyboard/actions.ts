export type Level = 'menu' | 'block' | 'field';
export type Direction = 'left' | 'down' | 'up' | 'right';
export type Screen = 'hub' | 'mesa' | 'acervo' | 'treino' | 'agenda' | 'configs';
export type BlockKind = 'slides' | 'notes' | 'cards';

export type KeyAction =
  | { type: 'goToScreen'; screen: Screen }
  | { type: 'moveFocus'; direction: Direction }
  | { type: 'swapBlock'; direction: Direction }
  | { type: 'enter' }
  | { type: 'escape' }
  | { type: 'nextBlock' }
  | { type: 'previousBlock' }
  | { type: 'toggleBlock'; block: BlockKind }
  | { type: 'maximizeBlock' }
  | { type: 'closeBlock' }
  | { type: 'resizeMode' }
  | { type: 'swapHiddenBlock' }
  | { type: 'openOptions' }
  | { type: 'goToTopBar' }
  | { type: 'goToField' }
  | { type: 'goToBottomBar' }
  | { type: 'previousControl' }
  | { type: 'nextControl' }
  | { type: 'newCard' }
  | { type: 'defaultSizes' }
  | { type: 'defaultOrder' }
  | { type: 'openPalette' }
  | { type: 'quickReminder' }
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
  | { type: 'heading'; level: 1 | 2 | 3 }
  | { type: 'orderedList' }
  | { type: 'bulletList' }
  | { type: 'taskList' }
  | { type: 'saveCards' };

// "swallow" para o evento sem executar nada: a tecla é nossa, mas agora não deve agir
// nem chegar ao navegador.
export type Resolved = KeyAction | { type: 'swallow' };
