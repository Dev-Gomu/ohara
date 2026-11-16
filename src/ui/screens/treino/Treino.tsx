import { useState } from 'react';
import { createSession, type Session } from '../../../core/study/session';
import { TrainingChoice } from './TrainingChoice';
import { TrainingSession } from './TrainingSession';

export function Treino() {
  const [session, setSession] = useState<Session | null>(null);
  // Cartões do recorte inteiro: o resumo do fim mostra o próximo vencimento entre eles.
  const [scope, setScope] = useState<readonly string[]>([]);
  if (session) {
    return <TrainingSession session={session} scope={scope} onChange={setSession} />;
  }
  return (
    <TrainingChoice
      onStart={(ids, scopeIds) => {
        setScope(scopeIds);
        setSession(createSession(ids, new Date()));
      }}
    />
  );
}
