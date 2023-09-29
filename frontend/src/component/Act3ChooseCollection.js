import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, TextField, Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';

const ChooseCollection = ({ collezioniDB, onChangeSelection }) => {
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState('');

    const [collezioni, setCollezioni] = useState([]);

    useEffect(() => {
        console.log(collezioniDB);
        if (typeof collezioniDB !== 'undefined' && collezioniDB !== null) {
            if (collezioniDB.length > 0) {
                setCollezioni(collezioniDB);
            }
        } else {
            setCollezioni([]);
        }
    }, [collezioniDB]);


    const handleCheckboxChange = () => {
        setCheckboxChecked(!checkboxChecked);
        if (!checkboxChecked) {
            setSelectedCollection('');
        }
    };

    const handleNewCollectionChange = (event) => {
        setSelectedCollection(event.target.value);
        onChangeSelection(event.target.value);
    };

    const handleCollectionChange = (event) => {
        setSelectedCollection(event.target.value);
        onChangeSelection(event.target.value);
    };

    return (
        <div>
            <Box paddingTop="30px " display="flex" flexDirection="column">
                <FormControl disabled={checkboxChecked}>
                    <InputLabel htmlFor="collection-select">Seleziona Collezione</InputLabel>
                    <Select
                        value={selectedCollection}
                        onChange={handleCollectionChange}
                        label="Seleziona Collezione"
                        inputProps={{
                            id: 'collection-select',
                        }}
                    >
                        {collezioni.map((collezione) => (
                            <MenuItem key={collezione.id} value={collezione.id}>
                                {collezione} {/* Sostituisci con il nome del campo della tua collezione */}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checkboxChecked}
                            onChange={handleCheckboxChange}
                        />
                    }
                    label="Crea Nuova Collezione"
                />

                {checkboxChecked && (
                    <TextField
                        label="Nuova Collezione"
                        value={selectedCollection}
                        onChange={handleNewCollectionChange}
                    />
                )}
            </Box>
        </div>
    );
};

export default ChooseCollection;
