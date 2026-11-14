import {
  BIMESTERS,
  copyScheme,
  parseGrade,
  type Bimester,
  type Item,
  type Scheme,
} from '../../core/grades/grades';
import { createElement } from 'react';
import { pinProblem } from '../../core/secret/vault';
import { shortDate } from '../../core/study/dates';
import type { Exam, StudyData, Subject } from '../../core/study/types';
import { ask } from '../shell/PromptWindow';
import { showNotice } from '../study/notice';
import { QrCode } from './QrCode';
import qr from './Qr.module.css';
import { QrScanner } from './QrScanner';
import {
  changePin,
  checkCode,
  pairDevice,
  pairingText,
  readPin,
  recover,
  removeItem,
  saveItem,
  saveScheme,
  schemeFor,
  startSetup,
  unlockPin,
} from './session';

const NONE = 'nenhum';

const PIN_HELP = 'PIN de 6 números, só deste aparelho';

function pinsMatch(pin: string, repete: string): string | null {
  const problem = pinProblem(pin);
  if (problem) return problem;
  return pin === repete ? null : 'Os dois PINs são diferentes.';
}

export function askSetup(): void {
  ask({
    title: 'Criar o PIN das Notas',
    action: 'Criar',
    fields: [
      { id: 'pin', label: PIN_HELP, type: 'pin' },
      { id: 'repete', label: 'Repita o PIN', type: 'pin' },
    ],
    onSubmit: ({ pin = '', repete = '' }) => {
      const problem = pinsMatch(pin, repete);
      if (problem) return showNotice(problem);
      void startSetup(pin);
    },
  });
}

export function askPinUnlock(): void {
  ask({
    title: 'Abrir com o PIN',
    action: 'Abrir',
    fields: [{ id: 'pin', label: 'PIN de 6 números', type: 'pin' }],
    onSubmit: () => undefined,
    verify: async ({ pin = '' }) => {
      const result = await unlockPin(pin);
      if (result === 'errado') return 'PIN errado.';
      if (result === 'apagado') return 'PIN apagado por excesso de erros. Use o código.';
      return null;
    },
  });
}

export function askRecover(): void {
  ask({
    title: 'Usar o código de recuperação',
    action: 'Recuperar',
    fields: [
      { id: 'codigo', label: 'Código de recuperação (XXXX-XXXX-XXXX-XXXX-XXXX)' },
      { id: 'pin', label: `Novo ${PIN_HELP}`, type: 'pin' },
      { id: 'repete', label: 'Repita o novo PIN', type: 'pin' },
    ],
    onSubmit: ({ codigo = '', pin = '', repete = '' }) => {
      const problem = pinsMatch(pin, repete);
      if (problem) return showNotice(problem);
      void (async () => {
        if (!(await checkCode(codigo))) return showNotice('Código errado.');
        await recover(codigo, pin);
      })();
    },
  });
}

// Aparelho novo: lê o QR do aparelho antigo (câmera) ou o texto dele, e cria o PIN deste.
export function askPair(): void {
  ask({
    title: 'Já uso em outro aparelho',
    action: 'Conectar',
    body: (set) => createElement(QrScanner, { onRead: (text) => set('codigo', text) }),
    fields: [
      {
        id: 'codigo',
        label: 'Código do outro aparelho (aparece em "Adicionar outro aparelho"), ou leia o QR',
        type: 'area',
      },
      { id: 'pin', label: `Novo ${PIN_HELP}`, type: 'pin' },
      { id: 'repete', label: 'Repita o novo PIN', type: 'pin' },
    ],
    onSubmit: ({ codigo = '', pin = '', repete = '' }) => {
      const problem = pinsMatch(pin, repete);
      if (problem) return showNotice(problem);
      void pairDevice(codigo, pin).then((ok) => {
        if (!ok) showNotice('Esse código de aparelho não vale.');
      });
    },
  });
}

// Nas Notas abertas: pede o PIN de novo e mostra o QR (e o texto) para o aparelho novo ler.
export function askAddDevice(): void {
  let text = '';
  ask({
    title: 'Adicionar outro aparelho',
    action: 'Pronto',
    fields: [{ id: 'pin', label: 'Seu PIN, para mostrar o QR', type: 'pin' }],
    onSubmit: () => undefined,
    verify: async ({ pin = '' }) => {
      const found = await pairingText(pin);
      if (found === null) return readPin() ? 'PIN errado.' : 'PIN apagado por excesso de erros.';
      text = found;
      return null;
    },
    onVerified: () =>
      ask({
        title: 'QR do aparelho novo',
        action: 'Fechar',
        fields: [],
        body: () =>
          createElement(
            'div',
            null,
            createElement(QrCode, { text }),
            createElement(
              'p',
              { className: qr.codigoTexto, 'data-testid': 'codigo-aparelho' },
              text,
            ),
          ),
        onSubmit: () => undefined,
      }),
  });
}

export function askChangePin(): void {
  ask({
    title: 'Trocar o PIN',
    action: 'Salvar',
    fields: [
      { id: 'antigo', label: 'PIN de agora', type: 'pin' },
      { id: 'pin', label: `Novo ${PIN_HELP}`, type: 'pin' },
      { id: 'repete', label: 'Repita o novo PIN', type: 'pin' },
    ],
    onSubmit: ({ antigo = '', pin = '', repete = '' }) => {
      const problem = pinsMatch(pin, repete);
      if (problem) return showNotice(problem);
      void changePin(antigo, pin).then((ok) =>
        showNotice(ok ? 'PIN trocado neste aparelho.' : 'PIN de agora errado.'),
      );
    },
  });
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
        label: 'Quanto vale o 1º bimestre, de 10 (o 2º vale o resto: 5 + 5, 3 + 7)',
        value: String(scheme.bimester1[0] / 10),
      },
      {
        id: 'b3',
        label: 'Quanto vale o 3º bimestre, de 10 (o 4º vale o resto)',
        value: String(scheme.bimester1[1] / 10),
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
        bimester1: [
          Math.min(100, Math.max(0, number(v.b1, scheme.bimester1[0] / 10) * 10)),
          Math.min(100, Math.max(0, number(v.b3, scheme.bimester1[1] / 10) * 10)),
        ],
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
      {
        id: 'max',
        label: 'Vale quanto (nota máxima da avaliação)',
        value: String(base.max ?? 10),
      },
      {
        id: 'grade',
        label: 'Nota que o professor deu (escreva - se ainda estiver pendente)',
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
      const max = Math.max(0.1, number(v.max, 10));
      const grade = parseGrade(v.grade ?? '', max);
      if (grade === undefined) {
        return showNotice(`Nota inválida: use um número de 0 a ${max}.`);
      }
      void saveItem({
        id: item?.id ?? crypto.randomUUID(),
        subjectId: subject.id,
        bimester: Number(v.bimester ?? 1) as Bimester,
        name: (v.name ?? '').trim(),
        weight: max,
        max,
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
