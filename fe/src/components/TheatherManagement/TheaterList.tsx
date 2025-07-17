import React, { useEffect, useState } from 'react';
import './TheaterList.scss';

interface Theater {
  theaterId: string;
  theaterName: string;
  location: string;
  phoneNumber: string;
}

interface TheaterListProps {
  locationId: string; 
}

const TheaterList: React.FC<TheaterListProps> = ({ locationId }) => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8080/api/theaters/location/${locationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then((response) => {
        console.log('Theaters Response:', response.status, response);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          });
        }
        return response.json();
      })
      .then((data: Theater[]) => {
        console.log('Data received:', data);
        setTheaters(data);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error('Error fetching theaters:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [locationId]);

  if (loading) return <div className="theater-section">Loading...</div>;
  if (error) return <div className="theater-section">Error: {error}</div>;

  return (
    <div className="theater-section">
      <h2>Theaters in {theaters.length > 0 ? theaters[0].location : 'Unknown Location'}</h2>
      <hr className="divider" />
      <div className="theater-grid">
        {theaters.map((theater, index) => (
          <div key={index} className="theater-column">
            <p>{theater.theaterName}</p>
            <p>Phone: {theater.phoneNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheaterList;