import React, { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

const PhotoUploader = ({ fotoCaricate, onFileUpload }) => {
  const [files, setFiles] = useState([]);



  useEffect(() => {
    if (fotoCaricate !== null && fotoCaricate.length > 0) {
      setFiles(fotoCaricate);
    }
  }, [fotoCaricate]);




  const onDrop = (acceptedFiles) => {
    const newFiles = [...files];
    const duplicateFiles = [];
    acceptedFiles.forEach((acceptedFile) => {
      const isDuplicate = files.some((file) => file.name === acceptedFile.name); // Verifica se il nome del file è già presente in files
      if (isDuplicate) {
        duplicateFiles.push(acceptedFile.name);
      } else {
        newFiles.push(acceptedFile);
      }
    });
    if (duplicateFiles.length > 0) {
      alert(`Le seguenti foto sono già state caricate: ${duplicateFiles.join(', ')}`);
    }
    setFiles(newFiles);
    onFileUpload(newFiles); 
  };




  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1); 
    setFiles(newFiles);
    onFileUpload(newFiles); 
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
