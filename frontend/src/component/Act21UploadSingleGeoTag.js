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
    <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '8px' }}>
      <Card variant="outlined">
        <CardContent style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
          <div style={{ marginRight: '16px' }}>
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview of ${file.name}`}
              style={{ maxWidth: '80px', maxHeight: '80px' }}
            />
          </div>
          <div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSingleGeoTag;
