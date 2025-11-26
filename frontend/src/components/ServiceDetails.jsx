export default function ServiceDetails({
  service,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}) {
  if (!service) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{service.name}</h2>
        <div style={styles.headerActions}>
          {onToggleFavorite && (
            <button
              type="button"
              style={
                isFavorite ? styles.favoriteButtonActive : styles.favoriteButton
              }
              onClick={() => onToggleFavorite(service.id)}
            >
              {isFavorite ? "★ Saved" : "☆ Save"}
            </button>
          )}
          <button style={styles.closeButton} onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Name:</span>
        <span>{service.name}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Category:</span>
        <span>{service.category || "-"}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Address:</span>
        <span>{service.address}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>City:</span>
        <span>{service.city}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Postal code:</span>
        <span>{service.postalCode || "-"}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Phone:</span>
        <span>{service.phone || "-"}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Website:</span>
        <span>
          {service.website ? (
            <a
              href={normalizeUrl(service.website)}
              target="_blank"
              rel="noreferrer"
            >
              {service.website}
            </a>
          ) : (
            "-"
          )}
        </span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Location:</span>
        <span>
          {service.latitude != null && service.longitude != null
            ? `${service.latitude}, ${service.longitude}`
            : "-"}
        </span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Created at:</span>
        <span>{formatDate(service.createdAt)}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Updated at:</span>
        <span>{formatDate(service.updatedAt)}</span>
      </div>
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

function formatDate(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  } catch (_) {
    return String(value);
  }
}

const styles = {
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#ffffff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeButton: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    marginBottom: 6,
    gap: 8,
  },
  label: {
    width: 110,
    fontWeight: "bold",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  favoriteButton: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },
  favoriteButtonActive: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #ffc107",
    backgroundColor: "#fff7e0",
    color: "#c47f00",
    cursor: "pointer",
    fontSize: 12,
  },
};
