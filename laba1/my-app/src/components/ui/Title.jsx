import styled from 'styled-components';

export const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.huge};
  text-transform: uppercase;
  line-height: 1.2;
  color: ${props => props.theme.colors.primary};
`;