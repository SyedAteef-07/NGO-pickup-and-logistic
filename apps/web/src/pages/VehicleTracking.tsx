import { useEffect, useState } from 'react'

export default function VehicleTracking() {
  const [tracking, setTracking] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tracking) return

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setAccuracy(position.coords.accuracy)
        setError('')
      },
      () => {
        setError('Location permission was denied. Please allow location access.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [tracking])

  const startTracking = () => {
    setError('')
    setTracking(true)
  }

  const stopTracking = () => {
    setTracking(false)
  }

  const mapUrl =
    latitude !== null && longitude !== null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
      : ''

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Vehicle Tracking</h1>
        <p style={{ color: '#667085', marginTop: '8px' }}>
          Real-time location monitoring for food pickup vehicles
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={cardStyle}>
          <small>Vehicle</small>
          <h2>KA 01 AB 1234</h2>
          <span>Food Pickup Vehicle</span>
        </div>

        <div style={cardStyle}>
          <small>Driver</small>
          <h2>Rahul Kumar</h2>
          <span>Assigned Driver</span>
        </div>

        <div style={cardStyle}>
          <small>Status</small>
          <h2>{tracking ? '● Tracking' : '○ Stopped'}</h2>
          <span>{tracking ? 'Location is being monitored' : 'Tracking inactive'}</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Live Vehicle Location</h2>

          {latitude !== null && longitude !== null ? (
            <iframe
              title="Vehicle location map"
              src={mapUrl}
              style={{
                width: '100%',
                height: '430px',
                border: 0,
                borderRadius: '12px',
              }}
            />
          ) : (
            <div
              style={{
                height: '430px',
                borderRadius: '12px',
                background: '#f2f4f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667085',
              }}
            >
              Start tracking to display the vehicle location
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Location Details</h2>

          <div style={detailStyle}>
            <span>Latitude</span>
            <strong>{latitude?.toFixed(6) ?? '--'}</strong>
          </div>

          <div style={detailStyle}>
            <span>Longitude</span>
            <strong>{longitude?.toFixed(6) ?? '--'}</strong>
          </div>

          <div style={detailStyle}>
            <span>Accuracy</span>
            <strong>
              {accuracy !== null ? `${accuracy.toFixed(1)} m` : '--'}
            </strong>
          </div>

          <div
            style={{
              marginTop: '24px',
              padding: '14px',
              background: '#f2f4f7',
              borderRadius: '10px',
              fontSize: '14px',
            }}
          >
            Location sharing requires the driver's permission.
          </div>

          {!tracking ? (
            <button style={buttonStyle} onClick={startTracking}>
              Start Tracking
            </button>
          ) : (
            <button
              style={{ ...buttonStyle, background: '#b42318' }}
              onClick={stopTracking}
            >
              Stop Tracking
            </button>
          )}

          {error && (
            <p style={{ color: '#b42318', fontSize: '14px' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e4e7ec',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.05)',
}

const detailStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '14px 0',
  borderBottom: '1px solid #eaecf0',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '24px',
  padding: '13px',
  border: 0,
  borderRadius: '9px',
  background: '#16803c',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
}