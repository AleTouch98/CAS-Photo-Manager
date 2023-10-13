import React, { useEffect, useState } from 'react';
import Grid from '../component/Grid.js';
import Gallery from '../component/GalleryComponent';
import { MapContainer, TileLayer, GeoJSON, Marker, CircleMarker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import { scaleSequential } from 'd3-scale';
import { interpolateOrRd } from 'd3-scale-chromatic';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconCamera from '../iconMarker/iconCamera.png';
import L from 'leaflet';

const randomColor = require('randomcolor');

const MapComponent = ({ selectedOption, statoAggiornamento, userView}) => {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [geoJSONSelezionato, setGeoJSONSelezionato] = useState(null); //intero geojson inteso come valore restituito dal db
  const [areaSelected, setAreaSelected] = useState(null); 
  const [geojson, setGeojson] = useState(''); //geojson completo caricato dal percorso file
  const [geoJSONView, setGeoJSONView] = useState(''); 
  const [geoJSONColor, setGeoJSONColor] = useState('');//area visualizzata (intero geojson o parte del geojson)
  const [loading, setLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [pointsClusters, setPointsClusters] = useState([]);
  const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(false);
  const [isAreaAndColorDisabled, setIsAreaAndColorDisabled] = useState(true);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("");

  const customIcon = new L.Icon({
    iconUrl: IconCamera, 
    iconSize: [32, 40], 
    iconAnchor: [16, 40],
    popupAnchor: [0, -40], 
  });
  
  useEffect(() => {
    const caricaDati = async () => {
      setLoading(true);
      try {
        const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/${userView}/photos`);
        setPhotos(photoResult.data.immagini);
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      } finally {
        setLoading(false);
      }
    };
    caricaDati();
  }, [userView]);


  useEffect(() => {
    if (isHeatmapEnabled && photos && photos.length > 0) {
      handleHeatmap(true);
    }
  }, [photos, isHeatmapEnabled]);

  
  useEffect(() => {
    const aggiornaDati = async () => {
      if(statoAggiornamento){
        if(areaSelected !== null) {  
          await handleAreaSelezionata(areaSelected);
        } else if (geoJSONSelezionato !== null) { 
          await handleGeoJSONSelezionato(geoJSONSelezionato);
        } else {  
          const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/${userView}/photos`);
          setPhotos(photoResult.data.immagini);
        }
      }
    };
    aggiornaDati();
  }, [statoAggiornamento]);


  const handleGeoJSONSelezionato = async (geoJSONSelezionato) => {
    setLoading(true); 
    setPhotos([]);
    setGeoJSONView('');
    setGeoJSONColor('');
    setGeoJSONSelezionato(geoJSONSelezionato);
    setAreaSelected(null);
    const path = geoJSONSelezionato.geoJSONPath;
    try {
      if(geoJSONSelezionato.nomeGeoJSON === 'Nessun GeoJSON'){
        const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/${userView}/photos`);
        setGeoJSONSelezionato(null);
        setPhotos(photoResult.data.immagini);
        setIsAreaAndColorDisabled(true);
      } else {
        const result = await axios.post(`http://localhost:8000/dashboard/${userId}/downloadGeoJSON`, { path });// carica il geojson
        setGeojson(result.data);
        setGeoJSONView(result.data);
        setIsAreaAndColorDisabled(false);
        const photoResult = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/photosInGeoJSON`, { geojson: geoJSONSelezionato, area: 'all' }); //carica le foto contenute in quel geojson
        setPhotos(photoResult.data.data);
      } 
    } catch (error) {
      setIsAreaAndColorDisabled(true);
      setGeoJSONSelezionato(null);
      setSnackbarMessage(`Si è verificato un errore durante il caricamento del geoJSON. \n`);
      setSnackbarSeverity('error');
      setIsSnackbarOpen(true);
      console.error("Si è verificato un errore:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleAreaSelezionata = async (areaSelezionata) => {
    if(areaSelezionata === 'Nessuna area'){
      setAreaSelected(null);
      await handleGeoJSONSelezionato(geoJSONSelezionato);
      return;
    }
    setGeoJSONView('');
    setGeoJSONColor('');
    setPhotos([]);
    setLoading(true);
    try {
      if (!geojson || !geojson.features) {
        return;
      }
      const featureSelezionata = geojson.features.find((feature) => {
        return feature.properties[geoJSONSelezionato.featureDescrittiva] === areaSelezionata;
      });
      if (featureSelezionata) {
        setAreaSelected(areaSelezionata);
        setGeoJSONView(featureSelezionata);
        const photoResult = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/photosInGeoJSON`, {
          geojson: geoJSONSelezionato,
          area: areaSelezionata
        });
        setPhotos(photoResult.data.data);
      }
    } catch (error) {
      setAreaSelected(null);
      console.error("Si è verificato un errore:", error);
    } finally {
      setLoading(false);
    }
  };



  async function handleColor(option){
    if(option){
      setGeoJSONView('');
      const featuresWithCounts = await Promise.all(geojson.features.map(async (feature) => {
        const areaName = feature.properties[geoJSONSelezionato.featureDescrittiva];
        const featureSelezionata = geojson.features.find((feature) => {
          return feature.properties[geoJSONSelezionato.featureDescrittiva] === areaName;
        });
        const photoResult = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/photosInGeoJSON`, {
          geojson: geoJSONSelezionato,
          area: areaName
        });
        if(photoResult.status !== 200){
          setSnackbarMessage(`Si è verificato un errore durante il caricamento del geoJSON\n,  ${photoResult.data.message}`);
          setSnackbarSeverity('error');
          setIsSnackbarOpen(true);
        }
        const numPhotosInArea = photoResult.data.data.length;
        return { ...feature, numPhotos: numPhotosInArea };
      }));
      const maxNumPhotos = Math.max(...featuresWithCounts.map((feature) => feature.numPhotos));
      const minNumPhotos = Math.min(...featuresWithCounts.map((feature) => feature.numPhotos));
      const coloredGeoJSON = {
        ...geojson,
        features: featuresWithCounts.map((feature) => {
          const colorScale = scaleSequential(interpolateOrRd) 
            .domain([minNumPhotos, maxNumPhotos]);
          const fillColor = colorScale(feature.numPhotos);
      
          return {
            ...feature,
            properties: {
              ...feature.properties,
              fillColor: fillColor,
            },
          };
        }),
      };
      setGeoJSONColor(coloredGeoJSON);
      setHeatmapData([]); 
    } else {
      setGeoJSONColor('');
      if(areaSelected){
        await handleAreaSelezionata(areaSelected);
        return;
      } else {
        await handleGeoJSONSelezionato(geoJSONSelezionato);
        return;
      } 
    } 
  }


  async function handleHeatmap(option){
    setIsHeatmapEnabled(option);
    if(option){
      if(photos && photos.length > 0){
        const heatmapCoordinates = photos.map((photo) => ({
          lat: photo.latitudine,
          lng: photo.longitudine,
        }));
        setHeatmapData(heatmapCoordinates);
      } else {
        setSnackbarMessage(`Nessuna foto caricata. Impossibile visualizzare l'heatmap. \n`);
        setSnackbarSeverity('error');
        setIsSnackbarOpen(true);
      }
    } else {
      setHeatmapData([]);
    }
  }


  const handleClusters =  (result) => {
    if(result.status === 200){
      const clusters = result.data.clusters;
      setPointsClusters([]);
      const pointsWithColor = [];
      clusters.forEach((cluster, clusterIndex) => {
        const clusterColor = randomColor();
        cluster.forEach((point) => {
          const latitude = point[0]; 
          const longitude = point[1]; 
          const pointObject = {
            latitudine: latitude,
            longitudine: longitude,
            colore: clusterColor,
          };
          pointsWithColor.push(pointObject);
        });
      });
      setPointsClusters(pointsWithColor);
      setSnackbarSeverity('success');
      setSnackbarMessage('Clustering eseguito con successo');
      setIsSnackbarOpen(true);
    } else {
      setSnackbarMessage(`Errore durante l'esecuzione del clustering. ` + result.data.message);
      setPointsClusters([]);
      setSnackbarSeverity('error');
      setIsSnackbarOpen(true);
    }
    
  };


  const handleRemoveClusters = () => {
    setPointsClusters([]);
    setSnackbarSeverity('success');
    setSnackbarMessage('Clusters rimossi con successo.');
    setIsSnackbarOpen(true);
  };



  const handleImageRemove = (idImage) => {
    const updatedPhotos = photos.filter((photo) => photo.id !== idImage);
    setPhotos(updatedPhotos);
  };

  

  return (
    <div style={{ height: '90vh', position: 'relative', display: 'flex' }}>
      <div style={{ width: '70%', position: 'relative', top: '80px', left: '0', right: '0', bottom: '0' }}>
        <div>
          <Grid
            geoJSONSelected={handleGeoJSONSelezionato}
            valueTestoGeoJSON={geoJSONSelezionato ? geoJSONSelezionato.nomeGeoJSON : 'Scegli GeoJSON'}
            areaSelected={handleAreaSelezionata}
            valueColorCheckbox={handleColor}
            chooseAreaAndColorDisabled={isAreaAndColorDisabled}
            valueHeatmapCheckbox={handleHeatmap}
            clustersFound={handleClusters}
            removeClusters={handleRemoveClusters}
            userView={userView}
          />
        </div>
  
        <div id="map" style={{ width: '100%', height: '82vh' }}>
          {loading && (
            <div className="loading-overlay"
              style={{
                position: 'absolute',
                top: 0,
                down: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999,
              }}
            >
              <CircularProgress size={80} />
            </div>
          )}
          <MapContainer
            style={{ width: '100%', height: '100%' }}
            center={[44.494887, 11.3426163]}
            zoom={12}
          >
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
            {heatmapData && (
              <HeatmapLayer
                points={heatmapData}
                longitudeExtractor={(point) => point.lng}
                latitudeExtractor={(point) => point.lat}
                intensityExtractor={(point) => {
                  const totalNumPhotos = heatmapData.length;
                  const numPhotos = heatmapData.filter((photo) => {
                    const latDiff = Math.abs(photo.lat - point.lat);
                    const lngDiff = Math.abs(photo.lng - point.lng);
                    return latDiff < 0.01 && lngDiff < 0.01;
                  }).length;
                  return (numPhotos / totalNumPhotos) * 100;
                }}
                colors={['#FF0000', '#FFFF00', '#00FF00']}
                blur={30}
                radius={30}
              />
            )}
            {geoJSONView && (
              <GeoJSON
                data={geoJSONView}
                key={JSON.stringify(geoJSONView)}
                style={() => ({
                  color: 'blue',
                  opacity: 1,
                  fillColor: 'lightblue',
                  fillOpacity: 0.5,
                })}
              />
            )}
            {geoJSONColor && (
              <GeoJSON
                key={JSON.stringify(geoJSONView)}
                data={geoJSONColor}
                style={(feature) => ({
                  color: 'orange',
                  opacity: 0.4,
                  fillColor: feature.properties.fillColor,
                  fillOpacity: 0.6,
                })}
              />
            )}
            {pointsClusters.map((point, index) => (
              <CircleMarker
                key={JSON.stringify(point) + index}
                center={[point.latitudine, point.longitudine]}
                radius={8}
                color={point.colore}
              >
              </CircleMarker>
            ))}
            {photos && photos.map((photo, index) => (
              <Marker
                key={index}
                position={[photo.latitudine, photo.longitudine]}
                icon={customIcon}
              >
                <Popup>
                  <div style={{ width: '300px', overflowY: 'auto', maxHeight: '400px' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{photo.indirizzo}</h3>
                    {photos
                      .filter((otherPhoto) => otherPhoto.indirizzo === photo.indirizzo)
                      .map((otherPhoto, index) => (
                        <div key={index} style={{ marginBottom: '8px', width: '100%' }}>
                          {otherPhoto.nome_foto && (
                            <h4 style={{ fontWeight: 'bold' }}>{otherPhoto.nome_foto}</h4>
                          )}
                          {otherPhoto.immaginebase64 && (
                            <img
                              src={`data:image/jpeg;base64,${otherPhoto.immaginebase64}`}
                              alt={otherPhoto.Nome_Foto}
                              style={{ width: '100%', maxWidth: '100%', height: 'auto' }}
                            />
                          )}
                          <p style={{ fontWeight: 'bold', display: 'inline-block', marginRight: '8px' }}>
                            Caricato da:
                          </p>
                          <p style={{ display: 'inline-block' }}>{otherPhoto.nome_utente}</p>
                        </div>
                      ))}
                    {photos
                      .filter((otherPhoto) => otherPhoto.indirizzo === photo.indirizzo).length > 1 && (
                      <hr />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      <div style={{ width: '30%', height: '90vh', position: 'relative', marginTop: '80px', marginBottom: '100px', marginLeft: '10px' }}>
        <Gallery imageRemove={handleImageRemove} statoAggiornamento={statoAggiornamento} userView={userView} />
      </div>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        sx={{ zIndex: 9999 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() => setIsSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
  
};

export default MapComponent;