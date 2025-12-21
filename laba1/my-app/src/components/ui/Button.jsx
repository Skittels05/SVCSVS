import styled from 'styled-components';

export const Button = styled.button`
  padding: ${props => props.$large ? '1.6rem 2.7rem' : '0.5rem 1rem'};
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: ${props => props.$round ? '30px' : '5px'};
  font-size: 1.5rem;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;