import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [43.65107, -79.347015]; // Toronto-ish
const defaultZoom = 7;

// Use public icon URLs to avoid bundler path issues
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ServiceMap({ services }) {
  const servicesWithCoords = services.filter(
    (s) =>
      typeof s.latitude === "number" &&
      typeof s.longitude === "number" &&
      !Number.isNaN(s.latitude) &&
      !Number.isNaN(s.longitude)
  );

  const center = servicesWithCoords.length
    ? [servicesWithCoords[0].latitude, servicesWithCoords[0].longitude]
    : defaultCenter;

  return (
    <div style={styles.wrapper}>
      {servicesWithCoords.length === 0 ? (
        <p>No services with coordinates to display on the map.</p>
      ) : (
        <MapContainer
          center={center}
          zoom={defaultZoom}
          style={styles.map}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {servicesWithCoords.map((s) => (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <strong>{s.name}</strong>
                <br />
                {s.category && (
                  <>
                    <em>{s.category}</em>
                    <br />
                  </>
                )}
                {s.address}
                <br />
                {s.city}{" "}
                {s.postalCode && (
                  <>
                    {s.postalCode}
                    <br />
                  </>
                )}
                {s.phone && (
                  <>
                    Phone: {s.phone}
                    <br />
                  </>
                )}
                {s.website && (
                  <a
                    href={normalizeUrl(s.website)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website
                  </a>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

function normalizeUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

const styles = {
  wrapper: {
    marginTop: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    overflow: "hidden",
    backgroundColor: "#fff",
    width: "100%",
    height: 400, // fixed height for the map area
  },
  map: {
    width: "100%",
    height: "100%",
  },
};
