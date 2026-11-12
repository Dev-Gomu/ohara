import type { ReactNode } from 'react';
import { Target, type TargetProps } from './Target';
import styles from './Filter.module.css';

// Filtro de uma escolha por matéria: marca na cor da matéria sempre à vista (serve de legenda);
// a escolhida ganha o fundo de escolhido. "Todas" vem sem marca (subject indefinido).
export function FilterGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.grade} role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function FilterChip({
  subject,
  children,
  ...target
}: TargetProps & { subject?: number | undefined; children: string }) {
  return (
    <Target className={styles.item} subject={subject} {...target}>
      {subject !== undefined && <i className={styles.marca} />}
      {children}
    </Target>
  );
}
