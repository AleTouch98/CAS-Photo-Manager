import React, { useState } from 'react';
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



  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
  };



  const handleAllPhotoGeoTag = (indice, valore) => {
    const geoTagForPhoto = { // Creare un nuovo oggetto geoTag per la foto corrente
      address: valore.address, // Sostituisci con il valore effettivo
      lat: valore.lat, // Sostituisci con la latitudine reale
      lng: valore.lng, // Sostituisci con la longitudine reale
    };
    const updatedGeoTagsArray = [...geoTagsArray]; // Creare una copia dell'array dei geotag
    updatedGeoTagsArray[indice] = geoTagForPhoto; // Inserire il nuovo geoTag nella posizione specificata dall'indice
    setGeoTagsArray(updatedGeoTagsArray); // Aggiornare lo stato con il nuovo array dei geotag
    onGeoTagChange(updatedGeoTagsArray); // Ora puoi passare l'array aggiornato alla funzione onGeoTagChange
  };


  

  const handleSingleGeoTag = async (address) => {
    setGeoTag(address);
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      const { lat, lng } = latLng;
      // Creare un array di geotag con gli stessi dati per ogni foto e un indice
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
    <div>
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
            <div>
              <input
                {...getInputProps({
                  placeholder: `Indirizzo`,
                })}
              />
              <div>
                {loading ? <div>Loading...</div> : null}
                {suggestions.map((suggestion) => (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      style: { cursor: 'pointer' },
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
