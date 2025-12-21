import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0.5; }
  to { opacity: 1; }
`;

export const Card = styled.div`
  border: 0.1rem solid ${props => props.theme.colors.cardBorder};
  border-radius: 0.5rem;
  text-align: center;
  padding: 2rem;
  opacity: ${props => props.$active ? 1 : 0.5};
  transition: opacity 0.3s ease;
  animation: ${props => props.$active ? fadeIn : 'none'} 0.5s ease;

  @media (max-width: 768px) {
    width: 90%;
    max-width: 40rem;
  }
`;