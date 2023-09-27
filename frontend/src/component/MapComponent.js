import React, { useEffect, useRef, useState } from 'react';
import Grid from '../component/Grid.js';
import Gallery from '../component/GalleryComponent';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const MapComponent = ({ selectedOption }) => {
  const { userId } = useParams();
  const mapRef = useRef(null);
  const [geojson, setGeojson] = useState('');
  const [selectedMapOption, setSelectedMapOption] = useState('openstreetmap');

  const handleGeoJSONSelezionato = async (geoJSONSelezionato) => {
    setGeojson('');
    const path = geoJSONSelezionato.geoJSONPath;
    try {
      const result = await axios.post(`http://localhost:8000/dashboard/${userId}/downloadGeoJSON`, { path });
      setGeojson(result.data);
    } catch (error) {
      console.error("Si è verificato un errore:", error);
    }
  };

  // Funzione per gestire il cambiamento dell'opzione selezionata
  const handleMapOptionChange = (event) => {
    setSelectedMapOption(event.target.value);
  };

  return (
    <div style={{ height: '90vh', position: 'relative', display: 'flex' }}>
      <div style={{ width: '70%', position: 'relative', top: '80px', left: '0', right: '0', bottom: '0' }}>
        <div>
          <Grid geoJSONSelected={handleGeoJSONSelezionato} />
        </div>
        <div id="map" style={{ width: '100%', height: '82vh' }}>
          <MapContainer
            style={{ width: '100%', height: '100%' }}
            center={[44.494887, 11.3426163]}
            zoom={12}
          >
            {/* Utilizza un'istruzione condizionale per scegliere il layer della mappa */}
            {selectedOption === 'option1' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
            ) : (
              <TileLayer
                url='https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png'
                minZoom={0}
                maxZoom={18}
                attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            )}
            {geojson && (
              <GeoJSON
                data={geojson}
                style={() => ({
                  color: 'blue',
                  opacity: 1,
                  fillColor: 'lightblue',
                  fillOpacity: 0.5,
                })}
              />
            )}
          </MapContainer>
        </div>
      </div>
      <div style={{ width: '30%', height: '90vh', position: 'relative', marginTop: '80px', marginBottom: '100px', marginLeft: '10px' }}>
        <Gallery />
      </div>
    </div>
  );
};

export default MapComponent;
