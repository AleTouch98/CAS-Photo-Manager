import React from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function CustomFileInput({ handleFileSelection }) {
  const inputRef = React.useRef();

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div>
      <input
        type="file"
        accept=".geojson"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleFileSelection(file);
          }
        }}
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
      
    </div>
  );
}

export default CustomFileInput;
