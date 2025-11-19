import { useEffect, useState } from "react";

export default function ServiceForm({
  mode = "create", // 'create' or 'edit'
  initialValues = null, // service object when editing
  onSave, // async function(formData)
  onCancel, // called when cancel editing
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync form state whenever initialValues changes (e.g. click Edit on another row)
  useEffect(() => {
    setName(initialValues?.name || "");
    setAddress(initialValues?.address || "");
    setCity(initialValues?.city || "");
    setCategory(initialValues?.category || "");
    setPhone(initialValues?.phone || "");
    setWebsite(initialValues?.website || "");
    setPostalCode(initialValues?.postalCode || "");
    setError("");
  }, [initialValues]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !address.trim() || !city.trim()) {
      setError("Name, address, and city are required.");
      return;
    }

    const payload = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      category: category.trim() || null,
      phone: phone.trim() || null,
      website: website.trim() || null,
      postalCode: postalCode.trim() || null,
    };

    try {
      setLoading(true);
      await onSave(payload);
      if (mode === "create") {
        // Reset only when creating new
        setName("");
        setAddress("");
        setCity("");
        setCategory("");
        setPhone("");
        setWebsite("");
        setPostalCode("");
      }
    } catch (err) {
      setError(err.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "edit" ? "Edit Service" : "Create Service";

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.headerRow}>
        <h2>{title}</h2>
        {mode === "edit" && (
          <button type="button" onClick={onCancel} style={styles.cancelInline}>
            Cancel edit
          </button>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Name *</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <input
            style={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Health, Library"
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Address *</label>
          <input
            style={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>City *</label>
          <input
            style={styles.input}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Toronto)"
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Postal Code</label>
          <input
            style={styles.input}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g. M5V 2T6"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Phone</label>
          <input
            style={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 416-555-1234"
          />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Website</label>
        <input
          style={styles.input}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.ca"
        />
      </div>

      <div style={styles.actionsRow}>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Create"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const styles = {
  form: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#fafafa",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  field: {
    flex: 1,
    minWidth: 200,
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  actionsRow: {
    marginTop: 12,
    display: "flex",
    gap: 8,
  },
  button: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
  },
  cancelInline: {
    border: "none",
    background: "none",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
};
