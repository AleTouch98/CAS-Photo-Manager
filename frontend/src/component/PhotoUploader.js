import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import UploadGeoTag from './UploadGeoTags';
import DeleteIcon from '@mui/icons-material/Delete';

const PhotoUploader = ({onFileUpload}) => {
  const [files, setFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFileUpload(newFiles); // Passa l'elenco dei file al componente padre
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1); // Rimuovi la foto dall'array
    setFiles(newFiles);
    onFileUpload(newFiles); // Passa l'elenco aggiornato dei file al componente padre
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
              minHeight: '100px',
              padding: '16px',
            }}
          >
            <input {...getInputProps()} />
            <Typography variant="inherit">
              Trascina qui le foto o fai clic per selezionarle (solo immagini).
            </Typography>
          </div>
        )}
      </Dropzone>
      {files.length > 0 && (
        <div>
          {files.map((file, index) => (
            <div key={file.name}>
              <Typography variant="inherit">{file.name}:</Typography>
              <img
                src={URL.createObjectURL(file)} // Crea un'anteprima utilizzando l'URL Object
                alt={`Preview of ${file.name}`}
                style={{ maxWidth: '100px', maxHeight: '100px', margin: '8px 0' }}
              />
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveFile(index)} // Rimuovi la foto quando il pulsante viene cliccato
                style={{ marginLeft: '8px' }}
              >
                Rimuovi
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
