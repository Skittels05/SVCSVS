import React from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink } from 'react-router-dom';

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HeaderWrapper = styled.header`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4rem 7.4rem 0;

  @media (max-width: 768px) {
    padding: 3rem 3rem 0;
  }

  @media (max-width: 320px) {
    padding: 3rem 2rem 0;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LogoDesktop = styled.img`
  height: 6rem;

  @media (max-width: 320px) {
    display: none;
  }
`;

const LogoMobile = styled.img`
  display: none;
  height: 5.5rem;
  margin-bottom: 2rem;

  @media (max-width: 320px) {
    display: block;
    align-self: center;
    margin-bottom: 3rem;
  }
`;

const InfoBlock = styled.div`
  text-align: right;

  @media (max-width: 320px) {
    display: none;
  }

  p {
    color: ${props => props.theme.colors.primary};
    font-size: 1.8rem;
    line-height: 1.4;
  }
`;

const BurgerCheckbox = styled.input.attrs({ type: 'checkbox', id: 'burger-toggle' })`
  display: none;
`;

const BurgerLabel = styled.label.attrs({ htmlFor: 'burger-toggle' })`
  display: none;
  cursor: pointer;
  width: 30px;
  height: 24px;
  position: relative;
  z-index: 1002;

  @media (max-width: 768px) {
    display: block;
  }

  span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: ${props => props.theme.colors.primary};
    border-radius: 3px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;

    &:nth-child(1) { top: 0px; }
    &:nth-child(2) { top: 10px; }
    &:nth-child(3) { top: 20px; }
  }

  /* Анимация в крестик */
  ${BurgerCheckbox}:checked ~ & span:nth-child(1) {
    top: 10px;
    transform: rotate(135deg);
  }
  ${BurgerCheckbox}:checked ~ & span:nth-child(2) {
    opacity: 0;
    left: -60px;
  }
  ${BurgerCheckbox}:checked ~ & span:nth-child(3) {
    top: 10px;
    transform: rotate(-135deg);
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  ${BurgerCheckbox}:checked ~ & {
    display: block;
  }
`;

const MobileMenu = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 80%;
    max-width: 300px;
    background: ${props => props.theme.colors.background};
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
    padding-top: 10rem;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 1001;

    ${BurgerCheckbox}:checked ~ ${BurgerLabel} ~ & {
      transform: translateX(0);
    }
  }
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 3rem;
    align-items: center;
    animation: ${slideDown} 0.4s ease-out;
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: bold;
    font-size: 1.8rem;
    transition: opacity 0.3s;

    &:hover,
    &.active {
      opacity: 0.7;
    }
  }
`;

const Header = ({ logo }) => {
  return (
    <>
      <HeaderWrapper>
        <LogoDesktop src={logo} alt="Roby Agency" />
        <LogoMobile src={logo} alt="Roby Agency" />

        <InfoBlock>
          <p>A creative agency based in Helsinki.</p>
          <p>hello@robi.com</p>
        </InfoBlock>

        <BurgerCheckbox />
        <BurgerLabel>
          <span></span>
          <span></span>
          <span></span>
        </BurgerLabel>

        <MobileMenu>
          <NavList>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/blog">Blog</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
            <li><NavLink to="/cart">Cart (0)</NavLink></li>
          </NavList>
        </MobileMenu>
      </HeaderWrapper>

      <Overlay onClick={() => document.getElementById('burger-toggle').checked = false} />
    </>
  );
};

export default Header;