import { currentEventIndex, eventsOn, upcomingExams } from '../../../core/study/queries';
import { leaf, split } from '../../../core/mosaic/tree';
import { longDate, monthGrid } from '../../../core/study/dates';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { Mosaic } from '../../mosaic/Mosaic';
import { useMosaic } from '../../mosaic/useMosaic';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { openDay, openLesson } from '../../study/navigation';
import { toggleReminder } from '../../study/actions';
import { nowTime, today, useStudy } from '../../study/study';
import { CalendarBlock, ExamsBlock, RemindersBlock, TodayBlock } from './HubBlocks';

const EXAMS = 'hub.provas';
const CALENDAR = 'hub.calendario';
const TODAY = 'hub.agenda';
const REMINDERS = 'hub.lembretes';
const ALL = [EXAMS, CALENDAR, TODAY, REMINDERS];
const INITIAL = split(
  'col',
  leaf(EXAMS),
  split('row', leaf(CALENDAR), split('row', leaf(TODAY), leaf(REMINDERS), 0.57), 0.3),
  0.26,
);

export function Hub() {
  const data = useStudy();
  const mosaic = useMosaic('hub', INITIAL, ALL);
  const exams = upcomingExams(data, today);
  const events = eventsOn(data, today);
  const reminders = data.reminders.filter((item) => item.date === today);
  const days = monthGrid(today);
  const todayIndex = days.indexOf(today);

  useBlocks({
    blocks: [
      {
        id: EXAMS,
        kind: 'nav',
        nav: { axis: 'x', count: exams.length },
        onActivate: (index) => {
          const exam = exams[index];
          if (exam) openDay(exam.date);
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
    options: mosaic.options,
    actions: {
      ...mosaic.actions,
      newItem: () => {
        if (getKeyboardState().focus.block !== REMINDERS) return false;
        dispatch({ type: 'quickReminder' });
      },
    },
  });

  function render(id: string) {
    if (id === EXAMS) return <ExamsBlock id={id} exams={exams} />;
    if (id === CALENDAR) return <CalendarBlock id={id} days={days} exams={exams} />;
    if (id === TODAY) return <TodayBlock id={id} events={events} />;
    return <RemindersBlock id={id} reminders={reminders} onToggle={toggleReminder} />;
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
