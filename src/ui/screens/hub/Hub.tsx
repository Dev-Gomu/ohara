import {
  currentEventIndex,
  eventsOn,
  upcomingAssessmentDays,
  upcomingExams,
} from '../../../core/study/queries';
import { leaf, split } from '../../../core/mosaic/tree';
import { longDate, sixWeekGrid } from '../../../core/study/dates';
import { reminderOptions } from '../../study/reminderOptions';
import { upcomingReminders, visibleReminders } from '../../../core/study/reminders';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { Mosaic } from '../../mosaic/Mosaic';
import { useMosaic } from '../../mosaic/useMosaic';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { faultLines } from '../../faltas/summary';
import { openDay, openFaults, openLesson } from '../../study/navigation';
import { toggleReminder } from '../../study/actions';
import { nowTime, today, useStudy } from '../../study/study';
import { CalendarBlock, ExamsBlock, FaultsBlock, RemindersBlock, TodayBlock } from './HubBlocks';

const EXAMS = 'hub.provas';
const CALENDAR = 'hub.calendario';
const TODAY = 'hub.agenda';
const FAULTS = 'hub.faltas';
const REMINDERS = 'hub.lembretes';
const ALL = [EXAMS, CALENDAR, TODAY, FAULTS, REMINDERS];
// Altura que as Provas precisam: cartão de 86 px mais a margem de 8 px dos dois lados.
const EXAMS_HEIGHT = 104;
const SCREEN_CHROME = 72;

// Hub Refinado (D128): Calendário em toda a altura à esquerda; à direita, Provas no topo e,
// embaixo, Agenda e (Faltas sobre Lembretes). A proporção das Provas sai da altura da tela,
// para o bloco ter só a altura dos cartões, sem sobra, em qualquer tablet.
function initialTree() {
  const ratio = Math.min(0.4, EXAMS_HEIGHT / Math.max(400, window.innerHeight - SCREEN_CHROME));
  return split(
    'row',
    leaf(CALENDAR),
    split(
      'col',
      leaf(EXAMS),
      split('row', leaf(TODAY), split('col', leaf(FAULTS), leaf(REMINDERS), 0.4), 0.58),
      ratio,
    ),
    0.3,
  );
}

export function Hub() {
  const data = useStudy();
  const mosaic = useMosaic('hub', initialTree(), ALL);
  const exams = upcomingExams(data, today);
  const examDays = upcomingAssessmentDays(data, today);
  const events = eventsOn(data, today);
  const faults = faultLines(data);
  const reminders = visibleReminders(data.reminders, today);
  const scheduled = upcomingReminders(data.reminders, today).length;
  const days = sixWeekGrid(today);
  const todayIndex = days.indexOf(today);

  useBlocks({
    blocks: [
      {
        id: EXAMS,
        kind: 'nav',
        nav: { axis: 'x', count: examDays.length },
        onActivate: (index) => {
          const day = examDays[index];
          if (day) openDay(day.date);
        },
      },
      {
        id: CALENDAR,
        kind: 'nav',
        nav: { axis: 'grid', count: days.length, columns: 7 },
        onActivate: (index) => {
          const day = days[index];
          if (day) openDay(day);
        },
      },
      {
        id: TODAY,
        kind: 'nav',
        nav: { axis: 'y', count: events.length },
        onActivate: (index) => {
          const lessonId = events[index]?.lessonId;
          if (lessonId) openLesson(lessonId);
        },
      },
      {
        id: FAULTS,
        kind: 'nav',
        nav: { axis: 'grid', count: faults.length, columns: 2 },
        onActivate: () => openFaults(),
      },
      {
        id: REMINDERS,
        kind: 'nav',
        nav: { axis: 'y', count: reminders.length },
        onActivate: (index) => toggleReminder(reminders[index]?.id),
      },
    ],
    arrival: {
      block: TODAY,
      level: 'nav',
      items: { [TODAY]: currentEventIndex(events, nowTime), [CALENDAR]: todayIndex },
    },
    options: (block) => [
      ...(block === REMINDERS
        ? reminderOptions(reminders[getKeyboardState().focus.items[REMINDERS] ?? 0])
        : []),
      ...mosaic.options(block),
    ],
    actions: {
      ...mosaic.actions,
      newItem: () => {
        if (getKeyboardState().focus.block !== REMINDERS) return false;
        dispatch({ type: 'quickReminder' });
      },
    },
  });

  function render(id: string) {
    if (id === EXAMS) return <ExamsBlock id={id} days={examDays} />;
    if (id === CALENDAR) return <CalendarBlock id={id} days={days} exams={exams} />;
    if (id === TODAY) return <TodayBlock id={id} events={events} />;
    if (id === FAULTS) return <FaultsBlock id={id} lines={faults} />;
    return (
      <RemindersBlock
        id={id}
        reminders={reminders}
        scheduled={scheduled}
        onToggle={toggleReminder}
      />
    );
  }

  return (
    <ScreenFrame title={longDate(today)}>
      <Mosaic
        tree={mosaic.tree}
        maximized={mosaic.maximized}
        render={render}
        onChange={mosaic.setTree}
      />
    </ScreenFrame>
  );
}
