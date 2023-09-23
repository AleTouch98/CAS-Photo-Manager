import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

//Vari tipi di mappe
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


    

  return (
    <div style={{ border: '2px solid black', marginBottom: '10px', marginTop: '70px',marginBottom: '-100px' }}>
      <h2 style={{ textAlign: 'center', backgroundColor: 'black', color: 'orange', margin: '0', padding: '10px' }}>
        La Mia Mappa
      </h2>
      <div id="map" style={{ width: '100%', height: '480px' }}></div>
    </div>
  );
};

export default MapComponent;
