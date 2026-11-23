import { useEffect, useState } from "react";

const plants = {
  potato: "Potato",
  "bell-pepper": "Bell pepper",
};

export default function App() {
  const [plant, setPlant] = useState("potato");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photo) return;

    const url = URL.createObjectURL(photo);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function changePlant(event) {
    setPlant(event.target.value);
    setResult(null);
    setError("");
  }

  function changePhoto(event) {
    setPhoto(event.target.files[0] ?? null);
    setPreview("");
    setResult(null);
    setError("");
  }

  async function predict(event) {
    event.preventDefault();
    if (!photo || loading) return;

    setLoading(true);
    setResult(null);
    setError("");

    const body = new FormData();
    body.append("file", photo);

    try {
      const query = new URLSearchParams({ plant });
      const response = await fetch(`/api/predict?${query}`, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(30_000),
      });
      const data = await response.json().catch(() => null);

      if (
        !response.ok ||
        typeof data?.disease !== "string" ||
        typeof data?.confidence !== "number"
      ) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Prediction failed. Check that FastAPI is running on port 8000.",
        );
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError.name === "TimeoutError"
          ? "The request timed out. Try again."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="hero">
        <div className="shell">
          <h1>Plant Disease Classifier</h1>
          <p>Choose a crop and upload a clear photo of a single leaf.</p>
        </div>
      </header>

      <main className="shell panels">
        <section className="card" aria-labelledby="upload-heading">
          <h2 id="upload-heading">Leaf photo</h2>

          <form onSubmit={predict}>
            <fieldset disabled={loading}>
              <label className="field-label" htmlFor="plant">
                Crop
              </label>
              <select id="plant" value={plant} onChange={changePlant}>
                {Object.entries(plants).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label className="upload">
                {photo && preview ? (
                  <img src={preview} alt="Selected leaf preview" />
                ) : (
                  <span className="upload-icon" aria-hidden="true">↑</span>
                )}

                <strong>{photo ? "Change photo" : "Choose a leaf photo"}</strong>
                <span className="file-note">{photo ? photo.name : "JPG or PNG"}</span>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  aria-label={photo ? "Change leaf photo" : "Choose a leaf photo"}
                  onChange={changePhoto}
                />
              </label>

              <button type="submit" disabled={!photo || loading}>
                {loading ? "Analyzing leaf…" : "Predict disease"}
              </button>
            </fieldset>
          </form>
        </section>

        <section className="card" aria-labelledby="result-heading" aria-live="polite">
          <h2 id="result-heading">Prediction</h2>

          {error && <p className="error" role="alert">{error}</p>}
          {loading && <p className="empty">Analyzing your leaf photo…</p>}

          {!result && !loading && !error && (
            <p className="empty">Your result will appear here after you run a prediction.</p>
          )}

          {result && (
            <div className="prediction">
              <p className="file-note">{plants[plant]}</p>
              <h3>{result.disease}</h3>

              <div className="confidence">
                <label htmlFor="confidence">Model confidence</label>
                <strong>{result.confidence.toFixed(1)}%</strong>
              </div>
              <progress id="confidence" max="100" value={result.confidence} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}