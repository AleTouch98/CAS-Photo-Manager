import React, { useEffect, useRef, useState } from 'react';
import Grid from '../component/Grid.js';
import Gallery from '../component/GalleryComponent';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useParams } from 'react-router-dom';

import axios from 'axios';

/*
// Vari tipi di mappe
var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var Stadia_StamenTerrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
  minZoom: 0,
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  ext: 'png'
});
*/
const MapComponent = ({ selectedOption }) => {

  const { userId } = useParams();
  const mapRef = useRef(null);
  const [geojson, setGeojson] = useState('');
  const [jsonSelezionato, setJSONSelezionato] = useState('');

  
  
  
  /*
  useEffect(() => {  // utilizzato per caricare la mappa 
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([41.9028, 12.4964], 5);
    }
    mapRef.current.eachLayer((layer) => { // Rimuovi tutti i layer esistenti prima di aggiungere il nuovo layer
      mapRef.current.removeLayer(layer);
    });
    if (selectedOption === 'option1') {     // Aggiungi il layer di mappa in base all'opzione selezionata
      OpenStreetMap_Mapnik.addTo(mapRef.current);
    } else if (selectedOption === 'option2') {
      Stadia_StamenTerrain.addTo(mapRef.current);
    }
  }, [selectedOption]);
*/

  const handleGeoJSONSelezionato = async (geoJSONSelezionato) => {
    setGeojson(''); // Reset del geojson quando si apre il menu a tendina
    const path = geoJSONSelezionato.geoJSONPath //DA SOSTITUIRE CON IL RECUPERO DEL PERCORSO DEL GEOJSON IN BASE A QUALCE NOME SELEZIONA (FARE ALTRA QUERY/RICHIESTA)
    try{
      const result = await axios.post(`http://localhost:8000/dashboard/${userId}/downloadGeoJSON`, {path});
      setGeojson(result.data);
    } catch (error) {
      console.error("Si è verificato un errore:", error);
    }
    
  }



  return (
    <div style={{ height: '90vh', position: 'relative', display: 'flex' }}>
    <div style={{ width: '70%', position: 'relative', top: '80px', left: '0', right: '0', bottom: '0' }}>
      <div style={{ /*backgroundColor: 'black' */ }}>
        {<Grid geoJSONSelected={handleGeoJSONSelezionato}/>}
      </div>
      <div id="map" style={{ width: '100%', height: '480px' }}>
        <MapContainer
          style={{ width: '100%', height: '100%' }}
          center={[44.494887, 11.3426163]}
          zoom={12}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {geojson && (
            <GeoJSON
              data={geojson}
              style={() => ({
                color: 'blue',
                opacity: 1,
                fillColor: 'lightblue',
                fillOpacity: 0.5
              })}
            />
          )}
        </MapContainer>
      </div>
    </div>
    <div style={{ width: '30%', marginTop:'20px', marginLeft:'10px' }}>
      <Gallery />
    </div>
  </div>
  

  );
};

export default MapComponent;
