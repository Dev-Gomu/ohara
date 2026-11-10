export const MATERIAS = [
  { code: 'GEN', color: 0 },
  { code: 'IMU', color: 2 },
  { code: 'PRO', color: 1 },
  { code: 'APS', color: 3 },
  { code: 'FAR', color: 4 },
  { code: 'FIS', color: 6 },
  { code: 'PAT', color: 5 },
  { code: 'BIO', color: 7 },
];

export interface Evento {
  hora: string;
  code: string;
  color: number;
  prova?: boolean;
}

export const TER: Evento[] = [
  { hora: '08:00', code: 'GEN', color: 0 },
  { hora: '10:00', code: 'APS', color: 3 },
  { hora: '13:00', code: 'IMU', color: 2 },
  { hora: '15:15', code: 'PRO', color: 1, prova: true },
];

export const QUA: Evento[] = [
  { hora: '08:00', code: 'FAR', color: 4 },
  { hora: '14:00', code: 'PAT', color: 5 },
];
