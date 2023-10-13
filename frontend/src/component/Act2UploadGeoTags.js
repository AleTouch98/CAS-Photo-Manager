import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import UploadSingleGeoTag from './Act21UploadSingleGeoTag';

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

const UploadGeoTags = ({ fotoCaricate, onGeoTagChange }) => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [geoTagsArray, setGeoTagsArray] = useState([]);
  const [geoTag, setGeoTag] = useState('');


  useEffect(() => {
    setGeoTagsArray([]);
    onGeoTagChange([]);
  }, []);


  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
  };


  const handleAllPhotoGeoTag = (indice, valore) => {
    const geoTagForPhoto = { 
      address: valore.address, 
      lat: valore.lat, 
      lng: valore.lng, 
    };
    const updatedGeoTagsArray = [...geoTagsArray]; 
    updatedGeoTagsArray[indice] = geoTagForPhoto; 
    setGeoTagsArray(updatedGeoTagsArray); 
    onGeoTagChange(updatedGeoTagsArray); 
  };


  const handleSingleGeoTag = async (address) => {
    setGeoTag(address);
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      const { lat, lng } = latLng;
      // Crea un array di geotag con gli stessi dati per ogni foto e un indice
      const geoTagsArray = fotoCaricate.map((file, index) => ({
        address,
        lat,
        lng,
      }));
      onGeoTagChange(geoTagsArray);
    } catch (error) {
      console.error('Errore durante la geocodifica:', error);
    }
  };


  return (
    <div style={{width:'400px', height:'auto'}}>
      <div style={{backgroundColor:'white', position: 'sticky', top: 0, zIndex: 1}}>
            <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={checkboxChecked}
            onChange={handleCheckboxChange}
            name="myCheckbox"
          />
        }
        label="Unico GeoTag"
        />
    </div>
      
      {!checkboxChecked ? (
        fotoCaricate.map((file, index) => (
          <UploadSingleGeoTag
            key={index}
            file={file}
            index={index}
            onGeoTagChange={handleAllPhotoGeoTag}
          />
        ))
      ) : (
        <PlacesAutocomplete
          value={geoTag}
          onChange={(address) => handleSingleGeoTag(address)}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div style={{marginLeft:'50px',marginTop:'17px',maxHeight:'200px'}}>
              <input
                {...getInputProps({
                  placeholder: `Indirizzo`,
                  style: { width: '250px' } 
                })}
              />
              <div>
                {loading ? <div>Loading...</div> : null}
                {suggestions.map((suggestion) => (
                  <div 
                    {...getSuggestionItemProps(suggestion, {
                      style: {
                        marginRight:'100px',
                        cursor: 'pointer',
                        backgroundColor: suggestion.active ? 'blue' : 'white', // Cambia il colore di sfondo al passaggio del mouse
                        color: suggestion.active ? 'white' : 'black', // Cambia il colore del testo al passaggio del mouse
                        maxWidth: '350px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', // Assicura che il testo non venga avvolto
                      },
                      
                      
                    })}
                  >
                    {suggestion.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      )}
    </div>
  );
};

export default UploadGeoTags;
