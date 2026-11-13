import { PROVAS } from '../../_dados';

export default function V2() {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {PROVAS.map((p) => (
        <div key={p.id} style={{ padding: 12, background: 'var(--cor-cartao)', borderRadius: 12 }}>
          <strong>{p.titulo}</strong> · {p.data}
        </div>
      ))}
    </div>
  );
}
