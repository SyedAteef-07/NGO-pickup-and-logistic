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
    <div className="tracking-page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Vehicle Tracking</h1>
        <p style={{ color: '#667085', marginTop: '8px' }}>
          Preview this device's location. Vehicle trip history is not available in the admin API yet.
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
          <small>Location source</small>
          <h2>This browser</h2>
          <span>This preview is not linked to a vehicle or driver.</span>
        </div>

        <div style={cardStyle}>
          <small>Preview status</small>
          <h2>{tracking ? '● Active' : '○ Stopped'}</h2>
          <span>{tracking ? 'Reading this device location' : 'Location preview inactive'}</span>
        </div>
      </div>

      <div className="tracking-grid">
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>This device location</h2>

          {latitude !== null && longitude !== null ? (
            <iframe
              title="This device location map"
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
              Start preview to display this device location
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
            Your browser will ask for location permission. This preview does not report a vehicle location to the API.
          </div>

          {!tracking ? (
            <button style={buttonStyle} onClick={startTracking}>
              Start Preview
            </button>
          ) : (
            <button
              style={{ ...buttonStyle, background: '#b42318' }}
              onClick={stopTracking}
            >
              Stop Preview
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
