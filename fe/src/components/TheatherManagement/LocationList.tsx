import React, { useEffect, useState } from 'react';
import './styles/TheaterList.scss';

interface LocationItem {
  locationId: string;
  locationName: string;
}

interface Theater {
  theaterId: string;
  theaterName: string;
  location: string;
  phoneNumber: string;
}

interface LocationListProps {
  onSelectTheater: (theaterId: string, theaterName: string) => void;
}

const LocationList: React.FC<LocationListProps> = ({ onSelectTheater }) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [theaters, setTheaters] = useState<Record<string, Theater[]>>({});
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8080/api/locations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then((response) => {
        console.log('Locations Response:', response.status, response);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          });
        }
        return response.json();
      })
      .then((data: LocationItem[]) => {
        console.log('Locations data received:', data);
        setLocations(data);
        // Nếu có location, tự động chọn location đầu tiên và load rạp
        if (data.length > 0) {
          setSelectedLocation(data[0].locationId);
          fetch(`http://localhost:8080/api/theaters/location/${data[0].locationId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((theaterData: Theater[]) => {
              setTheaters((prev) => ({ ...prev, [data[0].locationId]: theaterData }));
              setLoading(false);
            })
            .catch((error: Error) => {
              console.error('Error fetching theaters:', error);
              setError(error.message);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch((error: Error) => {
        console.error('Error fetching locations:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleLocationClick = (locationId: string) => {
    setSelectedLocation((prev) => (prev === locationId ? null : locationId));
    if (!theaters[locationId] && locationId !== selectedLocation) {
      setLoading(true);
      fetch(`http://localhost:8080/api/theaters/location/${locationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: Theater[]) => {
          setTheaters((prev) => ({ ...prev, [locationId]: data }));
          setLoading(false);
        })
        .catch((error: Error) => {
          console.error('Error fetching theaters:', error);
          setError(error.message);
          setLoading(false);
        });
    }
    if (window.innerWidth <= 640) setIsLocationOpen(false);
  };

  const handleTheaterClick = (theaterId: string, theaterName: string) => {
    onSelectTheater(theaterId, theaterName);
  };

  const toggleLocationMenu = () => {
    setIsLocationOpen((prev) => !prev);
  };

  if (loading) return <div className="theater-section">Loading...</div>;
  if (error) return <div className="theater-section">Error: {error}</div>;

  return (
    <div className="theater-section">
      <h2 className="theater-title">Star Cinemas</h2>
      <div className="location-toggle" onClick={toggleLocationMenu}>
        <span className="hamburger">☰</span>
        <span className="toggle-text">Select Location</span>
      </div>
      <div className={`location-area ${isLocationOpen ? 'open' : ''}`}>
        {locations.map((location) => (
          <div key={location.locationId} className="location-item">
            <div
              className={`location-name ${selectedLocation === location.locationId ? 'highlight siteactive' : ''}`}
              onClick={() => handleLocationClick(location.locationId)}
            >
              {location.locationName}
            </div>
          </div>
        ))}
      </div>
      <div className="divider"></div>
      {selectedLocation && theaters[selectedLocation] && theaters[selectedLocation].length > 0 && (
        <div className="theater-list cinemas-list">
          <h3 className="theater-list-title">
            Theaters in {locations.find(l => l.locationId === selectedLocation)?.locationName || 'Selected Location'}
          </h3>
          {theaters[selectedLocation].map((theater) => (
            <div
              key={theater.theaterId}
              className="theater-item"
              onClick={() => handleTheaterClick(theater.theaterId, theater.theaterName)}
            >
              <span>{theater.theaterName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationList;