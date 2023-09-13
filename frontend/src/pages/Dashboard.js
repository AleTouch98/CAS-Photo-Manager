import React, { useState } from 'react';
import './dashboard.css'; // Assicurati di avere un file CSS separato per la dashboard

function Dashboard() {
  const [image, setImage] = useState(null);
  const [geoTag, setGeoTag] = useState('');
  const [markers, setMarkers] = useState([]);

  const handleImageUpload = () => {
    if (image && geoTag) {
      // Aggiungi un nuovo marker alla lista
      const newMarker = { image, geoTag };
      setMarkers([...markers, newMarker]);
      // Resetta i campi di input
      setImage(null);
      setGeoTag('');
    }
  };

  return (
    <div className="dashboard">
      <div className="upload-panel">
        <h2>Carica Immagini</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
        />
        <input
          type="text"
          placeholder="Geo-Tag"
          value={geoTag}
          onChange={(e) => setGeoTag(e.target.value)}
        />
        <button onClick={handleImageUpload}>Carica</button>
      </div>
      <div className="map">
        {/* Visualizza la mappa e i marker qui */}
        {/* Inserisci qui la tua logica per visualizzare i marker sulla mappa */}
      </div>
    </div>
  );
}

export default Dashboard;