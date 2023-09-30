import React, { useState } from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function CustomFileInput({ handleFileSelection }) {
  const inputRef = React.useRef();
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
      setSelectedFileName(file.name);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".geojson"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={inputRef}
      />
      <Button
        variant="outlined"
        onClick={handleButtonClick}
        startIcon={<CloudUploadIcon />}
      >
        Carica file
      </Button>
      {selectedFileName && (
        <p>File selezionato: {selectedFileName}</p>
      )}
    </div>
  );
}

export default CustomFileInput;
