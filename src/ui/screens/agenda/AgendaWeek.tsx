import type { CSSProperties } from 'react';
import { hourRange, toHours } from '../../../core/study/agenda';
import { NavItem } from '../../components/NavItem';
import { nowTime, today } from '../../study/study';
import type { AgendaColumn, AgendaItem } from './agendaData';
import styles from './AgendaWeek.module.css';

interface WeekProps {
  block: string;
  columns: readonly AgendaColumn[];
  onOpen: (item: AgendaItem) => void;
}

function isNow(item: AgendaItem): boolean {
  return item.day === today && item.start <= nowTime && nowTime < item.end;
}

// Semana com horas: o dia e as provas no alto, as aulas na altura do horário.
export function AgendaWeek({ block, columns, onOpen }: WeekProps) {
  const timed = columns.flatMap((column) => column.items.filter((item) => item.end !== ''));
  const { first, last } = hourRange(timed);
  const top = (time: string) => `${((toHours(time) - first) / (last - first)) * 100}%`;
  const hours = Array.from({ length: last - first - 1 }, (_, index) => first + index + 1);
  const offsets = columns.map((_, index) =>
    columns.slice(0, index).reduce((sum, column) => sum + column.items.length, 0),
  );

  return (
    <div className={styles.semana} style={{ '--dias': columns.length } as CSSProperties}>
      <span />
      {columns.map((column, index) => {
        const head = column.items[0];
        return (
          <div key={column.key} className={styles.alto}>
            <NavItem
              block={block}
              index={offsets[index] ?? 0}
              className={styles.dia}
              label={head?.title}
              onOpen={() => head && onOpen(head)}
            >
              <span className={styles.semanaDia}>{column.weekday}</span>
              {column.number !== '' && (
                <span className={styles.numero} data-hoje={column.day === today}>
                  {column.number}
                </span>
              )}
            </NavItem>
            {column.items.map((item, row) =>
              item.kind === 'prova' || item.kind === 'trabalho' ? (
                <div key={item.id} className={styles.chipLugar} data-materia={item.subject?.color}>
                  <NavItem
                    block={block}
                    index={(offsets[index] ?? 0) + row}
                    className={styles.chip}
                    color={item.kind}
                    label={item.title}
                    onOpen={() => onOpen(item)}
                  >
                    {item.subject?.code}{' '}
                    {item.kind === 'prova' ? `Prova ${item.start}` : item.title}
                  </NavItem>
                </div>
              ) : null,
            )}
          </div>
        );
      })}
      <div className={styles.horas} aria-hidden="true">
        {hours.map((hour) => (
          <span key={hour} style={{ top: top(`${hour}:00`) }}>
            {hour}h
          </span>
        ))}
      </div>
      {columns.map((column, index) => (
        <div key={column.key} className={styles.coluna}>
          {column.items.map((item, row) =>
            item.end === '' ? null : (
              <div
                key={item.id}
                className={styles.lugar}
                data-materia={item.subject?.color}
                style={{
                  top: top(item.start),
                  height: `calc(${top(item.end)} - ${top(item.start)})`,
                }}
              >
                <NavItem
                  block={block}
                  index={(offsets[index] ?? 0) + row}
                  className={styles.aula}
                  ring="anel"
                  color={isNow(item) ? 'agora' : undefined}
                  label={`${item.subject?.name ?? item.title}, ${item.start}`}
                  onOpen={() => onOpen(item)}
                >
                  <span className={styles.linha}>
                    {item.subject && <span className={styles.sigla}>{item.subject.code}</span>}
                    <span className={styles.hora}>{item.start}</span>
                  </span>
                  <span className={styles.sub}>{item.title}</span>
                </NavItem>
              </div>
            ),
          )}
          {column.day === today && (
            <span className={styles.agora} style={{ top: top(nowTime) }} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
