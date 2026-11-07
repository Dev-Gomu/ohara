import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './ui/shell/Shell';
import './ui/styles/fonts.css';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import { applyTheme } from './ui/theme';

applyTheme();

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

createRoot(root).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
);
