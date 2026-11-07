import { useState } from 'react';
import { createSession, type Session } from '../../../core/study/session';
import { TrainingChoice } from './TrainingChoice';
import { TrainingSession } from './TrainingSession';

export function Treino() {
  const [session, setSession] = useState<Session | null>(null);
  if (session) {
    return <TrainingSession session={session} onChange={setSession} />;
  }
  return <TrainingChoice onStart={(ids) => setSession(createSession(ids))} />;
}
