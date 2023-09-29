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
      const isDuplicate = files.some((file) => file.name === acceptedFile.name);
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
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {files.map((file, index) => (
            <div key={file.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview of ${file.name}`}
                style={{ maxWidth: '100px', maxHeight: '100px', margin: '8px 0' }}
              />
              <Button
                variant="outlined"
                startIcon={<DeleteIcon style ={{marginLeft:'10px'}} />}
                onClick={() => handleRemoveFile(index)}
                style={{ marginTop: '8px', color: 'red',border: '1px solid red',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'darkred', 
                }, }}
              >
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
