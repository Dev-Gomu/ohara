import { ACERVO_SUBJECT } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { AcervoHome } from './AcervoHome';
import { SubjectView } from './SubjectView';

export function Acervo() {
  const [subjectId, setSubjectId] = useScreenMemory<string | null>(ACERVO_SUBJECT, null);
  if (subjectId === null) return <AcervoHome onOpen={setSubjectId} />;
  return <SubjectView key={subjectId} subjectId={subjectId} onBack={() => setSubjectId(null)} />;
}
