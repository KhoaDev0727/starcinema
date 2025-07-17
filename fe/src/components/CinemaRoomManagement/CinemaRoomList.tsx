import { Input, message, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

interface CinemaRoom {
  id: number;
  name: string;
  capacity: number;
  seatTypes: string;
}

const CinemaRoomList: React.FC = () => {
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<CinemaRoom[]>([]);
  const [search, setSearch] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/cinema-rooms');
      const data = await res.json();
      setRooms(data);
      setFilteredRooms(data);
    } catch (err) {
      message.error('Không thể tải danh sách phòng chiếu.');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const result = rooms.filter(
      (room) => room.name.toLowerCase().includes(value.toLowerCase()) || room.id.toString().includes(value),
    );
    setFilteredRooms(result);
  };

  const columns: ColumnsType<CinemaRoom> = [
    {
      title: 'Room ID',
      dataIndex: 'id',
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
    },
    {
      title: 'Seat Types',
      dataIndex: 'seatTypes',
    },
    {
      title: 'Action',
      render: (_, record) => <a href={`/admin/cinema-room/${record.id}`}>Edit</a>,
    },
  ];

  return (
    <>
      <Input.Search
        placeholder="Search by Room Name or ID"
        onSearch={handleSearch}
        enterButton
        allowClear
        style={{ marginBottom: 16, width: 400 }}
      />
      <Table
        columns={columns}
        dataSource={filteredRooms}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No cinema rooms found.' }}
      />
    </>
  );
};

export { CinemaRoomList };
