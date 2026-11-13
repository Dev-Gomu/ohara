// Exemplo mínimo: apague esta pasta quando fizer a primeira ideia de verdade.
import { AULAS } from '../../_dados';

export default function V1() {
  return (
    <ul>
      {AULAS.map((a) => (
        <li key={a.id}>
          {a.materia} · {a.titulo}
        </li>
      ))}
    </ul>
  );
}
