import React, { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

const UploadSingleGeoTag = ({ file, index, onGeoTagChange }) => {
  const [geoTag, setGeoTag] = useState('');

  const handleGeoTagChange = async (address) => {
    setGeoTag(address);

    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      const { lat, lng } = latLng;
      onGeoTagChange(index, { address, lat, lng });
    } catch (error) {
      console.error('Errore durante la geocodifica:', error);
    }
  };

  return (
    <Card variant="outlined" style={{ marginBottom: '8px' }}>
      <CardContent>
        <img
          src={URL.createObjectURL(file)}
          alt={`Preview of ${file.name}`}
          style={{ maxWidth: '100px', maxHeight: '100px', margin: '8px 0' }}
        />
        <Typography variant="body2">{file.name}</Typography>
        <PlacesAutocomplete
          value={geoTag}
          onChange={(address) => handleGeoTagChange(address)}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: `Indirizzo per Foto ${index + 1}`,
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
      </CardContent>
    </Card>
  );
};

export default UploadSingleGeoTag;
