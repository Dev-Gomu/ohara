import {
  BIMESTERS,
  copyScheme,
  parseGrade,
  type Bimester,
  type Item,
  type Scheme,
} from '../../core/grades/grades';
import { passphraseProblem, pinProblem } from '../../core/secret/vault';
import { shortDate } from '../../core/study/dates';
import type { Exam, StudyData, Subject } from '../../core/study/types';
import { ask } from '../shell/PromptWindow';
import { showNotice } from '../study/notice';
import {
  changePass,
  checkCode,
  readPin,
  recover,
  removeItem,
  removePin,
  saveItem,
  saveScheme,
  schemeFor,
  setPin,
  startSetup,
  unlock,
  unlockPin,
} from './session';

const NONE = 'nenhum';

export function askSetup(): void {
  ask({
    title: 'Criar a frase de acesso',
    action: 'Criar',
    fields: [
      {
        id: 'frase',
        label:
          'Frase de acesso (pelo menos 12 caracteres). Sem ela e sem o código, ninguém abre as Notas.',
        type: 'password',
      },
      { id: 'repete', label: 'Repita a frase', type: 'password' },
    ],
    onSubmit: ({ frase = '', repete = '' }) => {
      const problem = passphraseProblem(frase);
      if (problem) return showNotice(problem);
      if (frase !== repete) return showNotice('As duas frases são diferentes.');
      void startSetup(frase);
    },
  });
}

export function askUnlock(): void {
  ask({
    title: 'Abrir as Notas',
    action: 'Abrir',
    fields: [{ id: 'frase', label: 'Frase de acesso', type: 'password' }],
    onSubmit: ({ frase = '' }) =>
      void unlock(frase).then((ok) => {
        if (!ok) showNotice('Frase errada.');
      }),
  });
}

export function askPinUnlock(): void {
  ask({
    title: 'Abrir com o PIN',
    action: 'Abrir',
    fields: [{ id: 'pin', label: 'PIN (4 a 6 números)', type: 'password' }],
    onSubmit: ({ pin = '' }) =>
      void unlockPin(pin).then((result) => {
        if (result === 'errado') showNotice('PIN errado.');
        if (result === 'apagado') showNotice('PIN apagado por excesso de erros. Use a frase.');
      }),
  });
}

export function askRecover(): void {
  ask({
    title: 'Recuperar pelo código',
    action: 'Recuperar',
    fields: [
      { id: 'codigo', label: 'Código de recuperação (XXXX-XXXX-XXXX-XXXX-XXXX)' },
      { id: 'frase', label: 'Nova frase de acesso (pelo menos 12 caracteres)', type: 'password' },
    ],
    onSubmit: ({ codigo = '', frase = '' }) => {
      const problem = passphraseProblem(frase);
      if (problem) return showNotice(problem);
      void (async () => {
        if (!(await checkCode(codigo))) return showNotice('Código errado.');
        await recover(codigo, frase);
      })();
    },
  });
}

export function askChangePass(): void {
  ask({
    title: 'Trocar a frase de acesso',
    action: 'Trocar',
    fields: [
      { id: 'antiga', label: 'Frase atual', type: 'password' },
      { id: 'nova', label: 'Frase nova (pelo menos 12 caracteres)', type: 'password' },
    ],
    onSubmit: ({ antiga = '', nova = '' }) => {
      const problem = passphraseProblem(nova);
      if (problem) return showNotice(problem);
      void changePass(antiga, nova).then((ok) =>
        showNotice(ok ? 'Frase trocada. As notas continuam as mesmas.' : 'Frase atual errada.'),
      );
    },
  });
}

export function askPin(): void {
  ask({
    title: readPin() ? 'Trocar o PIN' : 'Criar um PIN',
    action: 'Salvar',
    fields: [
      {
        id: 'pin',
        label: 'PIN de 4 a 6 números. Só vale neste aparelho e não protege o arquivo sincronizado',
        type: 'password',
      },
      { id: 'frase', label: 'Sua frase de acesso, para confirmar', type: 'password' },
    ],
    onSubmit: ({ pin = '', frase = '' }) => {
      const problem = pinProblem(pin);
      if (problem) return showNotice(problem);
      void setPin(frase, pin).then((ok) =>
        showNotice(ok ? 'PIN salvo neste aparelho.' : 'Frase errada: o PIN não foi salvo.'),
      );
    },
  });
}

export function dropPin(): void {
  removePin();
  showNotice('PIN apagado deste aparelho.');
}

function number(text: string | undefined, fallback: number): number {
  const value = Number((text ?? '').trim().replace(',', '.'));
  return Number.isFinite(value) ? value : fallback;
}

function list(text: string | undefined, size: number): number[] {
  const parts = (text ?? '').trim().split(/[\s;]+/);
  return Array.from({ length: size }, (_, index) => number(parts[index], 0));
}

export function askScheme(subject: Subject): void {
  const scheme = schemeFor(subject.id);
  ask({
    title: `Esquema de ${subject.code}`,
    action: 'Salvar',
    fields: [
      { id: 'min', label: 'Média mínima', value: String(scheme.min) },
      {
        id: 's1',
        label: 'Peso do 1º semestre no ano, em % (o 2º é o resto)',
        value: String(scheme.semester1),
      },
      {
        id: 'b1',
        label: 'Peso do 1º bimestre no 1º semestre, em %',
        value: String(scheme.bimester1[0]),
      },
      {
        id: 'b3',
        label: 'Peso do 3º bimestre no 2º semestre, em %',
        value: String(scheme.bimester1[1]),
      },
      { id: 'cap', label: 'Teto da nota com bônus', value: String(scheme.cap) },
      {
        id: 'bb',
        label: 'Bônus dos 4 bimestres (4 números)',
        value: scheme.bonusBimester.join(' '),
      },
      {
        id: 'bs',
        label: 'Bônus dos 2 semestres (2 números)',
        value: scheme.bonusSemester.join(' '),
      },
    ],
    onSubmit: (v) => {
      const percent = (key: string, fallback: number) =>
        Math.min(100, Math.max(0, number(v[key], fallback)));
      const next: Scheme = {
        subjectId: subject.id,
        min: Math.min(10, Math.max(0, number(v.min, scheme.min))),
        semester1: percent('s1', scheme.semester1),
        bimester1: [percent('b1', scheme.bimester1[0]), percent('b3', scheme.bimester1[1])],
        cap: Math.min(10, Math.max(1, number(v.cap, scheme.cap))),
        bonusBimester: list(v.bb, 4) as unknown as Scheme['bonusBimester'],
        bonusSemester: list(v.bs, 2) as unknown as Scheme['bonusSemester'],
      };
      void saveScheme(next);
    },
  });
}

export function askCopyScheme(subject: Subject, others: readonly Subject[]): void {
  if (others.length === 0) return showNotice('Não há outra matéria para copiar.');
  ask({
    title: `Copiar esquema para ${subject.code}`,
    action: 'Copiar',
    fields: [
      {
        id: 'de',
        label: 'Copiar o esquema de',
        value: others[0]?.id,
        options: others.map((other) => ({ value: other.id, label: other.name })),
      },
    ],
    onSubmit: ({ de = '' }) => void saveScheme(copyScheme(schemeFor(de), subject.id)),
  });
}

export function askItem(
  subject: Subject,
  siblings: readonly Item[],
  item?: Item,
  presets?: Partial<Item>,
): void {
  const base = { ...item, ...presets };
  ask({
    title: item ? 'Editar item' : 'Novo item',
    action: 'Salvar',
    fields: [
      { id: 'name', label: 'Nome (prova ou trabalho)', value: base.name ?? '' },
      {
        id: 'bimester',
        label: 'Bimestre',
        value: String(base.bimester ?? 1),
        options: BIMESTERS.map((value) => ({ value: String(value), label: `${value}º bimestre` })),
      },
      { id: 'weight', label: 'Peso dentro do bimestre', value: String(base.weight ?? 1) },
      {
        id: 'grade',
        label: 'Nota de 0 a 10 (escreva - se ainda estiver pendente)',
        value: base.grade === undefined || base.grade === null ? '-' : String(base.grade),
      },
      { id: 'bonus', label: 'Bônus neste item', value: String(base.bonus ?? 0) },
      {
        id: 'replaces',
        label: 'Repõe qual item?',
        value: base.replaces ?? NONE,
        options: [
          { value: NONE, label: 'Nenhum' },
          ...siblings
            .filter((other) => other.id !== item?.id)
            .map((other) => ({
              value: other.id,
              label: `${other.bimester}º bim. · ${other.name}`,
            })),
        ],
      },
    ],
    onSubmit: (v) => {
      const grade = parseGrade(v.grade ?? '');
      if (grade === undefined) return showNotice('Nota inválida: use um número de 0 a 10.');
      void saveItem({
        id: item?.id ?? crypto.randomUUID(),
        subjectId: subject.id,
        bimester: Number(v.bimester ?? 1) as Bimester,
        name: (v.name ?? '').trim(),
        weight: Math.max(0.1, number(v.weight, 1)),
        grade,
        examId: item?.examId ?? presets?.examId ?? null,
        replaces: v.replaces === NONE ? null : (v.replaces ?? null),
        bonus: Math.max(0, number(v.bonus, 0)),
      });
    },
  });
}

export function deleteItem(item: Item): void {
  removeItem(item.id);
  showNotice(`Item "${item.name}" excluído.`);
}

// "Trazer da Agenda": cria o item já ligado à prova. A Agenda e o Hub nunca mostram nota (A6).
export function askFromAgenda(data: StudyData, subject: Subject, siblings: readonly Item[]): void {
  const linked = new Set(siblings.map((item) => item.examId));
  const exams: Exam[] = data.exams.filter(
    (exam) => exam.subjectId === subject.id && !linked.has(exam.id),
  );
  if (exams.length === 0) return showNotice('Todas as provas desta matéria já estão nas Notas.');
  ask({
    title: 'Trazer da Agenda',
    action: 'Criar item',
    fields: [
      {
        id: 'prova',
        label: 'Prova',
        value: exams[0]?.id,
        options: exams.map((exam) => ({
          value: exam.id,
          label: `${exam.date ? shortDate(exam.date) : 'sem data'}`,
        })),
      },
    ],
    onSubmit: ({ prova = '' }) => {
      const exam = exams.find((candidate) => candidate.id === prova);
      if (!exam) return;
      const when = exam.date ? shortDate(exam.date) : 'sem data';
      askItem(subject, siblings, undefined, { name: `Prova de ${when}`, examId: exam.id });
    },
  });
}
