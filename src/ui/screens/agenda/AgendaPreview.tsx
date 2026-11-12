import { daysBetween, longDate } from '../../../core/study/dates';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { useNavCursor } from '../../components/NavItem';
import { SubjectPill } from '../../components/Pill';
import { Preview } from '../../components/Preview';
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

function ActionButton({
  block,
  index,
  action,
}: {
  block: string;
  index: number;
  action: PreviewAction;
}) {
  const cursor = useNavCursor(block, index);
  return (
    <Button
      variant={index === 0 ? 'primary' : 'plain'}
      cursor={cursor}
      onPress={action.run}
      {...(action.keys !== undefined && { shortcut: action.keys })}
    >
      {action.label}
    </Button>
  );
}

function detailOf(item: AgendaItem): string {
  const parts = [KIND_NAMES[item.kind]];
  if (item.kind !== 'dia') parts.push(when(item));
  if (countdown(item) !== '') parts.push(countdown(item));
  return parts.join(' · ');
}

// Prévia do que está selecionado na semana: troca enquanto o foco anda (diretrizes 2.4).
export function AgendaPreview({ block, item, dayItems, actions }: PreviewProps) {
  if (item === undefined) return <p className={styles.vazio}>Nada selecionado.</p>;
  const isDay = item.kind === 'dia';
  const buttons = actions.map((action, index) => (
    <ActionButton key={action.id} block={block} index={index} action={action} />
  ));
  return (
    <Preview
      title={isDay ? item.title : (item.subject?.name ?? item.title)}
      detail={detailOf(item)}
      {...(buttons.length > 0 && { actions: buttons })}
    >
      {item.subject && <SubjectPill code={item.subject.code} color={item.subject.color} />}
      {!isDay && item.subject && item.title !== '' && <p>{item.title}</p>}
      {item.virtual && <p>Aula da Grade, ainda sem anotações</p>}
      {isDay && dayItems.length === 0 && <p className={styles.vazio}>Nada neste dia.</p>}
      {isDay &&
        dayItems.map((entry) => (
          <ListItem
            key={entry.id}
            time={entry.start || '—'}
            title={entry.kind === 'prova' ? 'Prova' : entry.title || (entry.subject?.name ?? '')}
          >
            {entry.subject && <SubjectPill code={entry.subject.code} color={entry.subject.color} />}
          </ListItem>
        ))}
    </Preview>
  );
}
