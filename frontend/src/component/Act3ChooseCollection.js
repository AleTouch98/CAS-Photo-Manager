import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, TextField, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import axios from "axios";
import { useParams } from 'react-router-dom';

const ChooseCollection = ({onChangeSelection }) => {
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collezioni, setCollezioni] = useState([]);
    const { userId } = useParams();


    useEffect(() => {
        const caricaDati = async () => {
            try {
                const result = await axios.get(`http://localhost:8000/dashboard/${userId}/collectionsName`);
                if(result.status === 200){
                    setCollezioni(result.data.collezioni);
                }
            } catch (error) {
                console.error('Errore nella richiesta HTTP:', error);
            }
        };
        caricaDati(); 
        setSelectedCollection(null);
        onChangeSelection(null);
    }, []);


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
                            <MenuItem key={collezione.id} value={collezione.nome_collezione}>
                                {collezione.nome_collezione}
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
