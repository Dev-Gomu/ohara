// Lixeira visível: o que se exclui some da tela; aqui se vê e se restaura. Esvaziar pede confirmação.
import { Button } from '../../src/ui/components/Button';
import { FilterChip, FilterGrid } from '../../src/ui/components/Filter';
import { ListItem } from '../../src/ui/components/ListItem';
import { SubjectPill } from '../../src/ui/components/Pill';
import { Preview } from '../../src/ui/components/Preview';
import { Ficha, Secao } from '../vitrine/moldura';

const ITENS = [
  { tipo: 'Aula', titulo: 'Resposta inflamatória aguda', quando: 'excluída há 2 h', code: 'IMU', cor: 2 },
  { tipo: 'Cartão', titulo: 'Citocinas pró-inflamatórias', quando: 'excluído há 1 d', code: 'IMU', cor: 2 },
  { tipo: 'Prova', titulo: 'Prova de genética', quando: 'excluída há 3 d', code: 'GEN', cor: 0 },
  { tipo: 'Lembrete', titulo: 'Levar o jaleco para a Propedêutica', quando: 'excluído há 5 d', code: '', cor: 0 },
  { tipo: 'Pasta', titulo: 'Resumos antigos', quando: 'excluída há 9 d', code: 'FAR', cor: 4 },
];

export function Lixeira() {
  return (
    <>
      <Secao>Lixeira visível</Secao>
      <Ficha
        nome="Lixeira"
        arquivo="ListItem, FilterChip"
        largura={7}
        uso="Janela de consulta (Alt L, a definir). Filtra por tipo, restaura com Enter ou pelo botão; o item volta para o lugar de onde saiu."
      >
        <div className="lx-barra">
          <FilterGrid label="Tipo">
            <FilterChip selected>Tudo</FilterChip>
            <FilterChip>Aulas</FilterChip>
            <FilterChip>Cartões</FilterChip>
            <FilterChip>Provas</FilterChip>
          </FilterGrid>
          <Button variant="plain">Esvaziar</Button>
        </div>
        <div className="lx-lista">
          {ITENS.map((item, i) => (
            <ListItem
              key={item.titulo}
              time={item.tipo}
              title={item.titulo}
              detail={item.quando}
              selected={i === 1}
              quietSelection
            >
              {item.code !== '' && <SubjectPill code={item.code} color={item.cor} />}
              <Button variant="quiet">Restaurar</Button>
            </ListItem>
          ))}
        </div>
      </Ficha>
      <Ficha
        nome="Esvaziar"
        arquivo="Preview, Button"
        largura={5}
        uso="Confirmação de exclusão definitiva. Diz o que some e que não tem volta; Cancelar é o botão que recebe o foco."
      >
        <Preview
          title="Esvaziar a lixeira?"
          detail="5 itens somem para sempre. Não dá para desfazer."
          actions={
            <>
              <Button variant="plain">Cancelar</Button>
              <Button variant="primary">Esvaziar</Button>
            </>
          }
        />
      </Ficha>
    </>
  );
}
