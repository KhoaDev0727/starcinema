import styled from "styled-components";

const colors = {
  background: "white",
  primary: "#ff4d4f",
};

export const Wrapper = styled.div`
  background-color: ${colors.background};
  min-height: 100vh;
`;

export const Title = styled.h2`
  color: ${colors.primary};
  margin-bottom: 1.5rem;
`;
