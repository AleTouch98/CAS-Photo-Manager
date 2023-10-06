import React, { useEffect, useRef, useState } from 'react';
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

const randomColor = require('randomcolor');




const MapComponent = ({ selectedOption, statoAggiornamento }) => {
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
  const [snackbarClass, setSnackbarClass] = useState("");

  

  useEffect(() => {
    const caricaDati = async () => {
      setLoading(true);
      try {
        const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
        setPhotos(photoResult.data.immagini);
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      } finally {
        setLoading(false);
      }
    };
    caricaDati();
  }, []);


  useEffect(() => {
    // Questo effetto viene chiamato ogni volta che `photos` cambia
    if (isHeatmapEnabled) {
      handleHeatmap(true);
    }
  }, [photos, isHeatmapEnabled]);

  
  useEffect(() => {
    const aggiornaDati = async () => {
      if(statoAggiornamento){
        if(statoAggiornamento){}
        console.log('stato aggiornamento è cambiato');
        if(areaSelected !== null) {  // se è selezionata un'area aggiorna i dati in quell'area 
          console.log("SONO IN  CASO AREA");
          await handleAreaSelezionata(areaSelected);
        } else if (geoJSONSelezionato !== null) { // se è selezionato un geojson aggiorna i dati nel geojson
          console.log("SONO IN CASO GEOJSON ",  geoJSONSelezionato.nomeGeoJSON);
          await handleGeoJSONSelezionato(geoJSONSelezionato);
        } else {  // altrimenti aggiorna tutte le foto 
          const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
          setPhotos(photoResult.data.immagini);
        }
      }
    };
    aggiornaDati();
  }, [statoAggiornamento]);




  const handleGeoJSONSelezionato = async (geoJSONSelezionato) => {
    console.log('eseguo il caricamento delle foto del geojson');
    setLoading(true); 
    setPhotos([]);
    setGeoJSONView('');
    setGeoJSONColor('');
    setGeoJSONSelezionato(geoJSONSelezionato);
    setAreaSelected(null);
    const path = geoJSONSelezionato.geoJSONPath;
    try {
      if(geoJSONSelezionato.nomeGeoJSON === 'Nessun GeoJSON'){
        const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
        setGeoJSONSelezionato(null);
        setPhotos(photoResult.data.immagini);
        setIsAreaAndColorDisabled(true);
      } else {
        const result = await axios.post(`http://localhost:8000/dashboard/${userId}/downloadGeoJSON`, { path });// carica il geojson
        setGeojson(result.data);
        setGeoJSONView(result.data);
        setIsAreaAndColorDisabled(false);
        const photoResult = await axios.post(`http://localhost:8000/dashboard/${userId}/photosInGeoJSON`, { geojson: geoJSONSelezionato, area: 'all' }); //carica le foto contenute in quel geojson
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
        const photoResult = await axios.post(`http://localhost:8000/dashboard/${userId}/photosInGeoJSON`, {
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
      // Calcola il numero di foto per ciascuna feature del geoJSON
      const featuresWithCounts = await Promise.all(geojson.features.map(async (feature) => {
        const areaName = feature.properties[geoJSONSelezionato.featureDescrittiva];
        const featureSelezionata = geojson.features.find((feature) => {
          return feature.properties[geoJSONSelezionato.featureDescrittiva] === areaName;
        });
        const photoResult = await axios.post(`http://localhost:8000/dashboard/${userId}/photosInGeoJSON`, {
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
      // Calcola il massimo e il minimo numero di foto tra le feature
      const maxNumPhotos = Math.max(...featuresWithCounts.map((feature) => feature.numPhotos));
      const minNumPhotos = Math.min(...featuresWithCounts.map((feature) => feature.numPhotos));
    
      // Assegna un colore in base al numero di foto per ciascuna feature
      const coloredGeoJSON = {
        ...geojson,
        features: featuresWithCounts.map((feature) => {
          const colorScale = scaleSequential(interpolateOrRd) // Usa l'interpolazione di colori "OrRd" da d3
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
      setHeatmapData([]); // Rimuovi i dati del heatmap se necessario
    } else {
      setGeoJSONColor('');
    } 
  }



  async function handleHeatmap(option){
    setIsHeatmapEnabled(option);
    // se è selezionato un geojson fa l'heatmap sul geojson altrimenti lo fa su tutte le foto
    if(option){
      const heatmapCoordinates = photos.map((photo) => ({
        lat: photo.latitudine,
        lng: photo.longitudine,
      }));
      setHeatmapData(heatmapCoordinates);
      // Qui puoi reimpostare il colore predefinito del geoJSON se necessario
      //setGeoJSONView(geojson);
    } else {
      setHeatmapData([]);
    }
    
  }



  const handleClusters =  (clusters) => {
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
  };



  const handleImageRemove = (idImage) => {
    const updatedPhotos = photos.filter((photo) => photo.id !== idImage);
    setPhotos(updatedPhotos);
  };

  

  return (
    <div style={{ height: '90vh', position: 'relative', display: 'flex' }}>
      <div style={{ width: '70%', position: 'relative', top: '80px', left: '0', right: '0', bottom: '0' }}>
        <div>
          <Grid geoJSONSelected={handleGeoJSONSelezionato} valueTestoGeoJSON={geoJSONSelezionato ? geoJSONSelezionato.nomeGeoJSON : 'Scegli GeoJSON'} areaSelected={handleAreaSelezionata} valueColorCheckbox={handleColor} chooseAreaAndColorDisabled={isAreaAndColorDisabled} valueHeatmapCheckbox={handleHeatmap} clustersFound={handleClusters}/>
        </div>

        <div id="map" style={{ width: '100%', height: '82vh' }}>
          {loading && ( // Mostra CircularProgress durante il caricamento
            <div className="loading-overlay"
            style={{
              position: 'absolute',
              top: 0,
              down: 0,
              left: 0,
              width: '100%',
              height: '82vh',
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // Sfondo semitrasparente
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999, // Posiziona sopra la mappa
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
            {
              <HeatmapLayer
                points={heatmapData}
                longitudeExtractor={(point) => point.lng}
                latitudeExtractor={(point) => point.lat}
                intensityExtractor={(point) => {
                  const totalNumPhotos = heatmapData.length;
                  const numPhotos = heatmapData.filter((photo) => {
                    const latDiff = Math.abs(photo.lat - point.lat);
                    const lngDiff = Math.abs(photo.lng - point.lng);
                    return latDiff < 0.01 && lngDiff < 0.01; // Imposta una soglia per considerare le foto vicine
                  }).length;
                  return (numPhotos / totalNumPhotos) * 100; // L'intensità sarà il numero di foto nella stessa area
                }}
                colors={['#FF0000', '#FFFF00', '#00FF00']} // Personalizza i colori del heatmap
                blur={30}
                radius={30} // Personalizza il blur del heatmap
              />
            }
            {geoJSONView && (
              <GeoJSON
                data={geoJSONView}
                key={JSON.stringify(geoJSONView)} //utilizzata per forzare l'aggiornamento della mappa
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
                  fillColor: feature.properties.fillColor, // Usa il colore dalle proprietà delle feature
                  fillOpacity: 0.6,
                })}
              />
            )}
            {pointsClusters.map((point, index) => (
              <CircleMarker
                key={JSON.stringify(point) + index}
                center={[point.latitudine, point.longitudine]}
                radius={8} // Imposta il raggio del cerchio
                color={point.colore} // Imposta il colore in base all'attributo "colore"
              >
              </CircleMarker>
            ))}
            {photos && photos.map((photo, index) => (
              <Marker
                key={index}
                position={[photo.latitudine, photo.longitudine]}
                
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
                        {/* Altre informazioni sulla foto */}
                      </div>
                    ))}
                    {photos
                      .filter((otherPhoto) => otherPhoto.indirizzo === photo.indirizzo).length > 1 && (
                      <hr /> // Inserisce una linea solo se ci sono più foto
                    )}
                </div>
              </Popup>
              </Marker>
            ))}
            

          </MapContainer>
        </div>


      </div>
      <div style={{ width: '30%', height: '90vh', position: 'relative', marginTop: '80px', marginBottom: '100px', marginLeft: '10px' }}>
        <Gallery imageRemove={handleImageRemove} statoAggiornamento={statoAggiornamento}/>
      </div>

      <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={6000} // Imposta la durata in millisecondi (opzionale)
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
            className={snackbarClass} // Imposta la classe CSS per la Snackbar
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
    </div>
  );
};

export default MapComponent;
