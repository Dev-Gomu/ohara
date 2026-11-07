import { Block } from '../components/Block';
import { useBlocks } from '../keyboard/useBlocks';
import { ScreenFrame } from '../shell/ScreenFrame';
import styles from './stubs.module.css';

interface StubBlock {
  id: string;
  title: string;
}

function Stub({ title, blocks }: { title: string; blocks: StubBlock[] }) {
  const [first] = blocks;
  useBlocks({
    blocks: blocks.map(({ id }) => ({ id, kind: 'none' })),
    arrival: { block: first?.id ?? '', level: 'block' },
  });
  return (
    <ScreenFrame title={title}>
      <div className={styles.grade}>
        {blocks.map((block) => (
          <Block key={block.id} id={block.id} title={block.title}>
            <span />
          </Block>
        ))}
      </div>
    </ScreenFrame>
  );
}

export const Hub = () => (
  <Stub
    title="Hub"
    blocks={[
      { id: 'hub.provas', title: 'Próximas provas' },
      { id: 'hub.agenda', title: 'Agenda de hoje' },
    ]}
  />
);
export const Acervo = () => (
  <Stub title="Acervo" blocks={[{ id: 'acervo.a', title: 'Matérias' }]} />
);
export const Treino = () => (
  <Stub title="Treino" blocks={[{ id: 'treino.a', title: 'Baralhos' }]} />
);
export const Agenda = () => <Stub title="Agenda" blocks={[{ id: 'agenda.a', title: 'Semana' }]} />;
export const Configs = () => (
  <Stub title="Configs" blocks={[{ id: 'configs.a', title: 'Seções' }]} />
);
