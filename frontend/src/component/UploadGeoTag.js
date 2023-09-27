import React, { useState } from 'react';
import { TextField } from '@mui/material';
import PlacesAutocomplete from 'react-places-autocomplete';

const UploadGeoTag = ({ onGeoTagChange }) => {
  const [geoTag, setGeoTag] = useState('');

  const handleGeoTagChange = (address) => {
    setGeoTag(address);
  };

  return (
    <PlacesAutocomplete
      value={geoTag}
      onChange={handleGeoTagChange}
      onSelect={(address) => {
        onGeoTagChange(address);
      }}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div>
          <TextField
            label="Indirizzo"
            variant="outlined"
            fullWidth
            {...getInputProps()}
          />
          <div>
            {loading ? <div>Loading...</div> : null}
            {suggestions.map((suggestion) => {
              const style = {
                backgroundColor: suggestion.active ? '#41b6e6' : '#fff',
              };
              return (
                <div
                  {...getSuggestionItemProps(suggestion, { style })}
                  key={suggestion.placeId}
                >
                  {suggestion.description}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default UploadGeoTag;
