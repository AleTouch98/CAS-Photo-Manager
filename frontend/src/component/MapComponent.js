import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import Grid from '../component/Grid.js';
import Gallery from '../component/GalleryComponent';


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

const MapComponent = ({ selectedOption }) => {
  const mapRef = useRef(null);
  const [isGeojsonPopupOpen, setIsGeojsonPopupOpen] = useState(false);
  const [selectedGeoJSON, setSelectedGeoJSON] = useState(null);
  const [geojsonList, setGeojsonList] = useState([]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([41.9028, 12.4964], 5);
    }

    // Rimuovi tutti i layer esistenti prima di aggiungere il nuovo layer
    mapRef.current.eachLayer((layer) => {
      mapRef.current.removeLayer(layer);
    });

    // Aggiungi il layer di mappa in base all'opzione selezionata
    if (selectedOption === 'option1') {
      OpenStreetMap_Mapnik.addTo(mapRef.current);
    } else if (selectedOption === 'option2') {
      Stadia_StamenTerrain.addTo(mapRef.current);
    }
  }, [selectedOption]);

  const handleGeojsonPopupOpen = () => {
    setIsGeojsonPopupOpen(true);
  };

  const handleGeojsonPopupClose = () => {
    setIsGeojsonPopupOpen(false);
  };

  const handleSelectGeoJSON = (geojson) => {
    setSelectedGeoJSON(geojson);
  };

  //GESTIONE CHIAMATA GEOJSON

  useEffect(() => {
    // Effettua la chiamata GET al tuo endpoint API per ottenere la lista dei GeoJSON
    axios.get('URL_DEL_TUO_ENDPOINT_API')
      .then((response) => {
        // Estrai la lista dei GeoJSON dalla risposta
        const geojsonData = response.data;
        setGeojsonList(geojsonData);
      })
      .catch((error) => {
        console.error('Errore nella chiamata GET:', error);
      });
  }, []);

  useEffect(() => {
    // Renderizza il GeoJSON selezionato sulla mappa
    if (selectedGeoJSON) {
      L.geoJSON(selectedGeoJSON.data).addTo(mapRef.current);
    }
  }, [selectedGeoJSON]);

  return (
    <div style={{ height: '90vh', position: 'relative', display: 'flex' }}>
    <div style={{ width: '70%', position: 'relative', top: '80px', left: '0', right: '0', bottom: '0' }}>
      <div style={{ /*backgroundColor: 'black' */ }}>
        {<Grid />}
      </div>
      <div id="map" style={{ width: '100%', height: '80vh' }}></div>
    </div>
    <div style={{ width: '30%', marginTop:'20px', marginLeft:'10px' }}>
      <Gallery />
    </div>
  </div>
  

  );
};

export default MapComponent;
