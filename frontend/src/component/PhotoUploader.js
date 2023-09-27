import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import UploadGeoTag from '../component/UploadGeoTag';

const PhotoUploader = () => {
  const [files, setFiles] = useState([]);
  const [geoTags, setGeoTags] = useState(['']);

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
    setGeoTags(Array(acceptedFiles.length).fill(''));
  };

  const handleGeoTagChange = (event, index) => {
    const newGeoTags = [...geoTags];
    newGeoTags[index] = event.target.value;
    setGeoTags(newGeoTags);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    const newGeoTags = [...geoTags];

    newFiles.splice(index, 1); // Rimuovi la foto dall'array
    newGeoTags.splice(index, 1); // Rimuovi il geotag corrispondente

    setFiles(newFiles);
    setGeoTags(newGeoTags);
  };

  const handleUpload = () => {
    // Implementa la logica per l'upload delle foto e l'associazione dei geotag
    console.log('Files:', files);
    console.log('GeoTags:', geoTags);
  };

  return (
    <div>
      <Dropzone onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            style={{
              border: '2px dashed #cccccc',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: '200px',
              padding: '16px',
            }}
          >
            <input {...getInputProps()} />
            <Typography variant="inherit">
              Trascina qui le foto o fai clic per selezionarle.
            </Typography>
          </div>
        )}
      </Dropzone>
      {files.length > 0 && (
        <div>
          {files.map((file, index) => (
            <div key={file.name}>
              <Typography variant="inherit">Geotag per {file.name}:</Typography>
              **inserire qui**
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleRemoveFile(index)} // Rimuovi la foto quando il pulsante viene cliccato
                style={{ marginLeft: '8px' }}
              >
                Rimuovi
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        style={{ marginTop: '16px' }}
      >
        Carica Foto
      </Button>
    </div>
  );
};

export default PhotoUploader;
