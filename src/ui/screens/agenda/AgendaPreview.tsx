import { daysBetween, longDate } from '../../../core/study/dates';
import { NavItem } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { openLesson } from '../../study/navigation';
import { today } from '../../study/study';
import type { StudyData } from '../../../core/study/types';
import type { AgendaItem } from './agendaData';
import { askCompleteExam } from './agendaForms';
import styles from './AgendaPreview.module.css';

export interface PreviewAction {
  id: string;
  label: string;
  keys?: string;
  run: () => void;
}

const KIND_NAMES = {
  dia: 'Dia',
  prova: 'Prova',
  trabalho: 'Entrega',
  aula: 'Aula',
  compromisso: 'Compromisso',
};

export function previewActions(item: AgendaItem | undefined, data: StudyData): PreviewAction[] {
  if (item?.kind === 'prova' && item.start === '') {
    return [{ id: 'completar', label: 'Completar', run: () => askCompleteExam(data, item.id) }];
  }
  if (item?.kind === 'dia') {
    return [{ id: 'novo', label: 'Novo neste dia', keys: 'Alt N', run: () => newItem() }];
  }
  const lessonId = item?.lessonId;
  if (lessonId) {
    return [{ id: 'mesa', label: 'Abrir na Mesa', keys: 'Enter', run: () => openLesson(lessonId) }];
  }
  return [];
}

function newItem(): void {
  dispatch({ type: 'openOptions' });
}

function when(item: AgendaItem): string {
  if (item.day === '') return item.detail;
  const hours = item.end === '' ? item.start : `${item.start} – ${item.end}`;
  return [longDate(item.day), hours].filter(Boolean).join(' · ');
}

function countdown(item: AgendaItem): string {
  if (item.day === '' || item.kind === 'dia' || item.kind === 'aula') return '';
  const days = daysBetween(today, item.day);
  if (days === 0) return 'Hoje';
  if (days < 0) return days === -1 ? 'Ontem' : `Há ${-days} dias`;
  return days === 1 ? 'Amanhã' : `Faltam ${days} dias`;
}

interface PreviewProps {
  block: string;
  item: AgendaItem | undefined;
  dayItems: readonly AgendaItem[];
  actions: readonly PreviewAction[];
}

// Prévia do que está selecionado na semana: troca enquanto o foco anda (diretrizes 2.4).
export function AgendaPreview({ block, item, dayItems, actions }: PreviewProps) {
  if (item === undefined) return <p className={styles.vazio}>Nada selecionado.</p>;
  const isDay = item.kind === 'dia';
  return (
    <div className={styles.previa}>
      <div className={styles.topo}>
        {item.subject && (
          <span className={styles.sigla} data-materia={item.subject.color}>
            {item.subject.code}
          </span>
        )}
        <span className={styles.tipo}>{KIND_NAMES[item.kind]}</span>
      </div>
      <h3 className={styles.titulo}>{isDay ? item.title : (item.subject?.name ?? item.title)}</h3>
      <div className={styles.dados}>
        {!isDay && <span>{when(item)}</span>}
        {!isDay && item.subject && item.title !== '' && <span>{item.title}</span>}
        {countdown(item) !== '' && <span>{countdown(item)}</span>}
        {item.virtual && <span>Aula da Grade, ainda sem anotações</span>}
      </div>
      {isDay && (
        <ul className={styles.doDia}>
          {dayItems.length === 0 && <li className={styles.vazio}>Nada neste dia.</li>}
          {dayItems.map((entry) => (
            <li key={entry.id}>
              <span className={styles.hora}>{entry.start || '—'}</span>
              {entry.subject && (
                <span className={styles.sigla} data-materia={entry.subject.color}>
                  {entry.subject.code}
                </span>
              )}
              <span className={styles.nome}>
                {entry.kind === 'prova' ? 'Prova' : entry.title || entry.subject?.name}
              </span>
            </li>
          ))}
        </ul>
      )}
      {actions.length > 0 && (
        <div className={styles.acoes}>
          {actions.map((action, index) => (
            <NavItem
              key={action.id}
              block={block}
              index={index}
              ring="anel"
              className={index === 0 ? styles.primario : styles.botao}
              onOpen={action.run}
            >
              {action.label}
              {action.keys && <kbd className={styles.tecla}>{action.keys}</kbd>}
            </NavItem>
          ))}
        </div>
      )}
    </div>
  );
}
