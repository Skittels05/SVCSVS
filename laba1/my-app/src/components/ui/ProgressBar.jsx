import styled from 'styled-components';

export const ProgressBar = styled.hr`
  height: 1px;
  border: none;
  background-color: ${props => props.theme.colors.hr};
  width: ${props => props.$width || '100%'};
  margin: 1rem 0 3rem;
`;