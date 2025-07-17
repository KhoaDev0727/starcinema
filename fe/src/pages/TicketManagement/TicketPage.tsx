import React from "react";
import { Descriptions, Badge, Breadcrumb } from "antd";
import defaultLogo from "../../assets/img/bg-logo-cinema.png";
import { ContentWrapper, HeaderContainer, HeaderWrapper, LogoImg, LogoNav, Nav, PageWrapper, TicketCard } from "./TicketPage.styled";


const BookingTicketPage: React.FC = () => {
  const ticket = {
    ticket_id: "T001",
    schedule_id: "S001",
    seat_id: "S001-A01",
    user_id: 1,
    price: 120000,
    booking_date: "2025-06-18 16:26:08",
    status: "PAID",
    promotion_id: null,
  };

  return (
    <PageWrapper>
      <HeaderWrapper>
        <HeaderContainer>
          <LogoNav>
            <LogoImg src={defaultLogo} alt="Star Theater logo" />
            <Nav>
              <a href="#">Home</a>
              <a href="#">Movies</a>
              <a href="#">Cinemas</a>
              <a href="#">Promotions</a>
              <a href="#">Ticket</a>
            </Nav>
          </LogoNav>
        </HeaderContainer>
      </HeaderWrapper>
      <Breadcrumb>
        <span>🏠</span>
        <span> › </span>
        <a href="#">Movies</a>
        <span> › </span>
        <span className="active">Ticket Detail</span>
      </Breadcrumb>
      <ContentWrapper>
        <TicketCard title="🎟 Movie Ticket">
          <Descriptions
            bordered
            column={1}
            labelStyle={{ fontWeight: "bold", width: "150px" }}
          >
            <Descriptions.Item label="Ticket ID">
              {ticket.ticket_id}
            </Descriptions.Item>
            <Descriptions.Item label="Schedule ID">
              {ticket.schedule_id}
            </Descriptions.Item>
            <Descriptions.Item label="Seat">
              {ticket.seat_id}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              {ticket.user_id}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              {ticket.price.toLocaleString()} VND
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {new Date(ticket.booking_date).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge
                status={ticket.status === "PAID" ? "success" : "warning"}
                text={ticket.status}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Promotion">
              {ticket.promotion_id || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </TicketCard>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default BookingTicketPage;
