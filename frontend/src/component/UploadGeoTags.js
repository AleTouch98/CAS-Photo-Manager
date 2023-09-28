import React, { useState } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import UploadSingleGeoTag from './UploadSingleGeoTag';

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

const UploadGeoTags = ({ fotoCaricate, onGeoTagChange }) => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [geoTag, setGeoTag] = useState('');

  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
  };

  const handleAllPhotoGeoTag = (indice, valore) => {
    console.log('all photo geo tag', indice, ' valore ', valore);
    // ASSOCIARE AD OGNI FOTO IL SUO GEOTAG 

  };

  const handleSingleGeoTag = async (address) => {
    // GESTIRE L'ASSEGNAMENTO DELLO STESSO GEOTAG A TUTTE LE FOTO
    setGeoTag(address);
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      const { lat, lng } = latLng;
      console.log({address, lat, lng });
      onGeoTagChange({ address, lat, lng });
    } catch (error) {
      console.error('Errore durante la geocodifica:', error);
    }  };

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
                  placeholder: `Indirizzo per tutte le foto`,
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
