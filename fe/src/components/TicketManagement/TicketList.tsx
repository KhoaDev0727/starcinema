import { Col, DatePicker, Input, Row, Select, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import React, { useEffect, useState } from 'react';
import type { TicketResponseDTO } from '../../types/ticketResponseDTO';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchMovie, setSearchMovie] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedRange, setSelectedRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:8080/api/admin/tickets')
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setTickets(data);
          setFilteredTickets(data);
        } else {
          message.error('Dữ liệu trả về không hợp lệ!');
          console.error('Unexpected response data:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error);
        message.error('Không thể tải danh sách vé!');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    filterTickets();
  }, [searchMovie, selectedStatus, selectedRange, tickets]);

  const filterTickets = () => {
    let data = [...tickets];

    if (searchMovie) {
      data = data.filter((ticket) => ticket.movieTitle.toLowerCase().includes(searchMovie.toLowerCase()));
    }

    if (selectedStatus) {
      data = data.filter((ticket) => ticket.status === selectedStatus);
    }

    if (selectedRange) {
      const [start, end] = selectedRange;
      data = data.filter((ticket) => {
        const ticketDate = dayjs(ticket.bookingDate);
        return ticketDate.isBetween(start, end, 'day', '[]');
      });
    }

    setFilteredTickets(data);
  };

  console.log('data tra ve ', tickets);

  // const handleRowClick = (record: TicketResponseDTO) => {
  //     // Redirect to detail page or show modal (tùy bạn xử lý ở route / modal)
  //     window.location.href = `/admin/ticket-management/${record.ticketId}`;
  // };

  const ticketColumns: ColumnsType<TicketResponseDTO> = [
    {
      title: 'ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      sorter: (a, b) => a.ticketId.localeCompare(b.ticketId),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      width: '10%',
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Movie',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      width: '15%',
      sorter: (a, b) => a.movieTitle.localeCompare(b.movieTitle),
    },
    {
      title: 'Theater',
      dataIndex: 'theaterName',
      key: 'theaterName',
      width: '13%',
      sorter: (a, b) => a.theaterName.localeCompare(b.theaterName),
    },
    {
      title: 'Room / Seat',
      key: 'seat',
      render: (_, record) => `${record.roomName} / ${record.seatId}`,
    },
    {
      title: 'Showtime',
      dataIndex: 'showtime',
      key: 'showtime',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.showtime).unix() - dayjs(b.showtime).unix(),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `${value.toLocaleString()} VND`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Booking Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.bookingDate).unix() - dayjs(b.bookingDate).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      filters: [
        { text: 'PAID', value: 'PAID' },
        { text: 'PENDING', value: 'PENDING' },
        { text: 'CANCELLED', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (value: TicketResponseDTO['status']) => {
        const color = value === 'PAID' ? 'green' : value === 'PENDING' ? 'orange' : 'red';
        return (
          <Tag
            style={{
              borderRadius: 15,
              width: '90%',
              height: 25,
              textAlign: 'center',
              paddingTop: 2,
              marginRight: 0,
            }}
            color={color}
          >
            {value}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <Title level={2} style={{ textAlign: 'start' }}>
        Ticket Management
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm theo tên phim..."
            value={searchMovie}
            onChange={(e) => setSearchMovie(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Trạng thái"
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="PAID">PAID</Option>
            <Option value="PENDING">PENDING</Option>
            <Option value="CANCELLED">CANCELLED</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <RangePicker style={{ width: '100%' }} onChange={(range) => setSelectedRange(range)} allowClear />
        </Col>
      </Row>
      <Table
        columns={ticketColumns}
        dataSource={filteredTickets}
        rowKey="ticketId"
        pagination={{
          pageSize: 6,
          total: filteredTickets.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} vé`,
        }}
        // onRow={(record) => ({
        //     onClick: () => handleRowClick(record),
        //     style: { cursor: 'pointer' },
        // })}
        loading={loading}
      />
    </>
  );
};

export default TicketList;
