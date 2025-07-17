import { Card } from "antd";
import styled from "styled-components";

export const HeaderWrapper = styled.header`
  background-color: #fff8f5;
  padding: 1rem 2rem;
  border-bottom: 2px solid #b30000;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

export const LogoNav = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const LogoImg = styled.img`
  height: 50px;
  width: 100px;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 1rem;

  a {
    text-decoration: none;
    font-weight: bold;
    color: #b30000;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const Breadcrumb = styled.nav`
  padding: 0.5rem 2rem;
  font-size: 14px;
  color: #333;

  span.active {
    font-weight: bold;
    color: #b30000;
  }
`;

export const PageWrapper = styled.div`
  background: linear-gradient(to bottom right, #fce9e9, #fff4f4);
  min-height: 100vh;
`;

export const ContentWrapper = styled.div`
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const TicketCard = styled(Card)`
  width: 100%;
  max-width: 600px;
  border: 2px dashed #b30000;
  border-radius: 16px;
  background-color: #fff8f5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  .ant-card-head-title {
    font-size: 1.8rem;
    color: #b30000;
    font-weight: bold;
    text-align: center;
  }
`;
