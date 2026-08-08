import { useState } from 'react';
import './PageStyles.css';

const safetyLocations = [
  {
    id: 1,
    name: 'Ferndale Community Center',
    type: 'Community Hub',
    address: 'Ferndale, Johannesburg',
    coords: { x: 45, y: 35 },
    contacts: [
      { label: 'Emergency', number: '011 234 5678' },
      { label: 'Reception', number: '011 234 5679' },
    ],
    services: ['First Aid', 'Shelter', 'Food', 'Water']
  },
  {
    id: 2,
    name: 'Randburg Medical Centre',
    type: 'Medical',
    address: 'Randburg, Johannesburg',
    coords: { x: 38, y: 48 },
    contacts: [
      { label: 'Emergency', number: '011 789 1234' },
      { label: 'Info', number: '011 789 1235' },
    ],
    services: ['Emergency Care', 'Ambulance', 'Medical Supplies']
  },
  {
    id: 3,
    name: 'Northcliff Police Station',
    type: 'Police',
    address: 'Northcliff, Johannesburg',
    coords: { x: 52, y: 55 },
    contacts: [
      { label: 'Emergency', number: '10111' },
      { label: 'Station', number: '011 456 7890' },
    ],
    services: ['Security', 'Emergency Response', 'Evacuation Support']
  },
  {
    id: 4,
    name: 'Cresta Fire Station',
    type: 'Fire',
    address: 'Cresta, Johannesburg',
    coords: { x: 30, y: 42 },
    contacts: [
      { label: 'Emergency', number: '10177' },
      { label: 'Station', number: '011 567 8901' },
    ],
    services: ['Fire Emergency', 'Rescue', 'Disaster Response']
  },
  {
    id: 5,
    name: 'Your Location',
    type: 'Current',
    address: 'Ferndale, Johannesburg',
    coords: { x: 45, y: 38 },
    contacts: [],
    services: []
  }
];

export default function SafetyHub() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getMarkerColor = (type) => {
    switch(type) {
      case 'Medical': return '#ef4444';
      case 'Police': return '#3b82f6';
      case 'Fire': return '#f97316';
      case 'Current': return '#10b981';
      default: return '#a855f7';
    }
  };

  const getMarkerIcon = (type) => {
    switch(type) {
      case 'Medical': return '🏥';
      case 'Police': return '👮';
      case 'Fire': return '🚒';
      case 'Current': return '📍';
      default: return '🏢';
    }
  };

  return (
    <div className="page">
      <div className="safety-layout">
        {/* Map Section */}
        <div className="safety-map-container">
          <div className="map-header">
            <h3>📍 Your Location: Ferndale, Johannesburg</h3>
            <div className="map-legend">
              <span><span className="legend-icon">🏥</span> Medical</span>
              <span><span className="legend-icon">👮</span> Police</span>
              <span><span className="legend-icon">🚒</span> Fire</span>
              <span><span className="legend-icon">🏢</span> Community</span>
            </div>
          </div>
          
          {/* Real OpenStreetMap */}
          <div className="real-map-container">
            <iframe
              title="Safety Locations Map"
              width="100%"
              height="500"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=27.9298%2C-26.1275%2C28.0298%2C-26.0675&layer=mapnik&marker=-26.0975,27.9798"
              style={{ border: '2px solid #e5e7eb', borderRadius: '8px' }}
            ></iframe>
            <div className="map-overlay-info">
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px' }}>
                📍 Centered on Ferndale, Johannesburg | Click markers below for details
              </p>
            </div>
          </div>

          {/* Location Quick Access Cards */}
          <div className="location-quick-access">
            {safetyLocations.filter(loc => loc.type !== 'Current').map(location => (
              <button
                key={location.id}
                className={`quick-access-card ${selectedLocation?.id === location.id ? 'quick-access-card--active' : ''}`}
                onClick={() => setSelectedLocation(location)}
              >
                <span className="quick-access-icon" style={{ fontSize: '24px' }}>{getMarkerIcon(location.type)}</span>
                <div className="quick-access-info">
                  <div className="quick-access-name">{location.name}</div>
                  <div className="quick-access-type">{location.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="safety-info-panel">
          {selectedLocation ? (
            <div className="location-details">
              <div className="location-header">
                <span className="location-icon">{getMarkerIcon(selectedLocation.type)}</span>
                <div>
                  <h3>{selectedLocation.name}</h3>
                  <span className="location-type" style={{ background: getMarkerColor(selectedLocation.type) }}>
                    {selectedLocation.type}
                  </span>
                </div>
              </div>

              <div className="location-info">
                <div className="info-section">
                  <strong>📍 Address</strong>
                  <p>{selectedLocation.address}</p>
                </div>

                {selectedLocation.contacts.length > 0 && (
                  <div className="info-section">
                    <strong>📞 Contact Numbers</strong>
                    {selectedLocation.contacts.map((contact, idx) => (
                      <div key={idx} className="contact-item">
                        <span className="contact-label">{contact.label}:</span>
                        <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="contact-number">
                          {contact.number}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {selectedLocation.services.length > 0 && (
                  <div className="info-section">
                    <strong>🏥 Services Available</strong>
                    <div className="services-grid">
                      {selectedLocation.services.map((service, idx) => (
                        <span key={idx} className="service-badge">{service}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.type !== 'Current' && (
                  <button className="btn btn--primary" style={{ width: '100%', marginTop: '16px' }}>
                    Get Directions
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="location-placeholder">
              <span style={{ fontSize: '48px' }}>🗺️</span>
              <h3>Select a location</h3>
              <p>Click on any marker on the map to view details and contact information</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Contacts */}
      <div className="quick-contacts">
        <h3 className="card__title">🚨 Emergency Quick Dial</h3>
        <div className="emergency-grid">
          <a href="tel:10111" className="emergency-card emergency-card--police">
            <span className="emergency-icon">👮</span>
            <div>
              <strong>Police Emergency</strong>
              <span className="emergency-number">10111</span>
            </div>
          </a>
          <a href="tel:10177" className="emergency-card emergency-card--fire">
            <span className="emergency-icon">🚒</span>
            <div>
              <strong>Fire & Rescue</strong>
              <span className="emergency-number">10177</span>
            </div>
          </a>
          <a href="tel:999" className="emergency-card emergency-card--medical">
            <span className="emergency-icon">🏥</span>
            <div>
              <strong>Medical Emergency</strong>
              <span className="emergency-number">999</span>
            </div>
          </a>
          <a href="tel:0800WEATHER" className="emergency-card emergency-card--weather">
            <span className="emergency-icon">🌧️</span>
            <div>
              <strong>Weather Hotline</strong>
              <span className="emergency-number">0800-WEATHER</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
