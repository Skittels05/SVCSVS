import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Title, Card, Button } from '../../../components/ui';
import Modal from '../../../components/Modal/Modal';
import worksData from '../../../data/works.json';

const Section = styled.section`
  text-align: center;
`;

const Grid = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 4rem;

  @media (max-width: 320px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  text-align: center;

  &:first-child {
    margin-top: 1.2rem;
  }

  &:last-child {
    margin-top: 11.2rem;

    @media (max-width: 320px) {
      margin-top: 0;
    }
  }
`;

const StyledWorkCard = styled(Card)`
  cursor: pointer;
  background-color: ${props => props.$selected ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  transition: background-color 0.3s;
  opacity: 1 !important;

  img {
    width: 32.6vw;
    height: auto;

    @media (max-width: 320px) {
      width: 80vw;
    }
  }

  h4 {
    font-size: 2.2rem;
    line-height: 3rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    text-transform: uppercase;
    margin-top: 3.7rem;
  }

  p {
    margin: 0.2rem 0 2.1rem;
    font-size: 1.8rem;
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const AddForm = styled.div`
  margin-top: 4rem;
  text-align: center;

  input {
    margin: 0 1rem;
    padding: 0.8rem;
    font-size: 1.6rem;
    border: 1px solid ${props => props.theme.colors.primary};
    border-radius: 5px;

    @media (max-width: 768px) {
      display: block;
      width: 70%;
      margin: 1rem auto;
    }
  }
`;

const SelectedBold = styled.span`
  font-size: 6rem;
  font-weight: bold;
`;

const WorkRegular = styled.span`
  font-size: 5.1rem;
`;

const WorkSection = () => {
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [newWork, setNewWork] = useState({ title: '', desc: '' });

  useEffect(() => setWorks(worksData), []);

  const handleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    if (newWork.title && newWork.desc) {
      setWorks(prev => [...prev, { id: Date.now(), img: 'placeholder.png', ...newWork }]);
      setNewWork({ title: '', desc: '' });
    }
  };

  const handleDelete = (id) => {
    setWorks(prev => prev.filter(w => w.id !== id));
  };

  const handleEdit = (id, updated) => {
    setWorks(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
    setSelectedWork(null);
  };

  const half = Math.ceil(works.length / 2);

  return (
    <Container>
      <Section>
        <Title>
          <SelectedBold>selected</SelectedBold>{' '}
          <WorkRegular>work</WorkRegular>
        </Title>

        <Grid>
          <Column>
            {works.slice(0, half).map(work => (
              <StyledWorkCard key={work.id} $selected={selectedItems.includes(work.id)} onClick={() => handleSelect(work.id)}>
                <img src={require(`../../../images/${work.img}`)} alt={work.title} />
                <h4>{work.title}</h4>
                <p>{work.desc}</p>
                <ActionWrapper>
                  <Button onClick={(e) => { e.stopPropagation(); setSelectedWork(work); }}>View Details</Button>
                  <Button onClick={(e) => { e.stopPropagation(); handleDelete(work.id); }}>Delete</Button>
                </ActionWrapper>
              </StyledWorkCard>
            ))}
          </Column>

          <Column>
            {works.slice(half).map(work => (
              <StyledWorkCard key={work.id} $selected={selectedItems.includes(work.id)} onClick={() => handleSelect(work.id)}>
                <img src={require(`../../../images/${work.img}`)} alt={work.title} />
                <h4>{work.title}</h4>
                <p>{work.desc}</p>
                <ActionWrapper>
                  <Button onClick={(e) => { e.stopPropagation(); setSelectedWork(work); }}>View Details</Button>
                  <Button onClick={(e) => { e.stopPropagation(); handleDelete(work.id); }}>Delete</Button>
                </ActionWrapper>
              </StyledWorkCard>
            ))}
          </Column>
        </Grid>

        <AddForm>
          <input type="text" placeholder="Title" value={newWork.title} onChange={e => setNewWork({ ...newWork, title: e.target.value })} />
          <input type="text" placeholder="Description" value={newWork.desc} onChange={e => setNewWork({ ...newWork, desc: e.target.value })} />
          <Button $large onClick={handleAdd}>Add Work</Button>
        </AddForm>

        {selectedWork && (
          <Modal content={selectedWork} onClose={() => setSelectedWork(null)} onEdit={handleEdit} />
        )}
      </Section>
    </Container>
  );
};

export default WorkSection;