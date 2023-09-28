import React, { useState } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import PlacesAutocomplete from 'react-places-autocomplete';
import UploadSingleGeoTag from './UploadSingleGeoTag';

const UploadGeoTags = ({ fotoCaricate, onGeoTagChange }) => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
  };

  const handleAllPhotoGeoTag = (indice, valore) => {
    console.log('all photo geo tag', indice, ' valore ', valore);
    // ASSOCIARE AD OGNI FOTO IL SUO GEOTAG 

  };

  const handleSingleGeoTag = (indice, valore) => {
    console.log('unico geo tag', indice, ' ', valore);
    // GESTIRE QUI IL CASO IN CUI IL GEOTAG è UNICO AGGIUNGENDOLO A TUTTE LE FOTO
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
          value=""
          onChange={(address) => handleSingleGeoTag(0, { address, lat: null, lng: null })}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: 'Inserisci un indirizzo',
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
