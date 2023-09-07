-- Creazione del database "photoman"
CREATE DATABASE photoman;

-- verifico e creo estenzione postgis
CREATE EXTENSION postgis;

--CREAZIONE TABELLE E RELAZIONI

-- Tabella "Utenti"
CREATE TABLE Utenti (
    ID SERIAL PRIMARY KEY,
    Nome_Utente VARCHAR(255),
    Email VARCHAR(255),
    Password_Utente VARCHAR(255)
);

-- Creazione del tipo per i ruoli dei collaboratori
CREATE TYPE RuoloCollaboratore AS ENUM ('Visualizzatore', 'Caricatore', 'Commentatore');

-- Tabella "Aree Geografiche"
CREATE TABLE Aree_Geografiche (
    ID SERIAL PRIMARY KEY,
    Nome_Area VARCHAR(255),
    Dati_GEOJSON JSONB
);
-- Tabella "Collezioni"
CREATE TABLE Collezioni (
    ID SERIAL PRIMARY KEY,
    Nome VARCHAR(255),
    Descrizione TEXT,
    ID_Utente_Titolare INT REFERENCES Utenti(ID),
    ID_Foto_Copertina INT 
);

-- Tabella "Foto"
CREATE TABLE Foto (
    ID SERIAL PRIMARY KEY,
    Nome_File VARCHAR(255),
    Percorso_File VARCHAR(255),
    GeoTag GEOMETRY(Point),
    ID_Utente_Caricatore INT REFERENCES Utenti(ID),
    ID_Collezione INT REFERENCES Collezioni(ID)
);
-- Impostazione chiave secondaria
ALTER TABLE Collezioni
ADD CONSTRAINT FK_Collezioni_Foto
FOREIGN KEY (ID_Foto_Copertina) REFERENCES Foto(ID);

/* Nel caso dobbiamo eliminare qualche references (esempio)
ALTER TABLE Collezioni
DROP CONSTRAINT FK_Collezioni_Foto;*/

-- Tabella "Collaboratori Raccolte"

CREATE TABLE Collaboratori_Raccolte (
    ID SERIAL PRIMARY KEY,
    ID_Collezione INT REFERENCES Collezioni(ID),
    ID_Utente_Collaboratore INT REFERENCES Utenti(ID),
    Ruolo_Collaboratore RuoloCollaboratore
);

/*CARICAMENTO DATI DI ESEMPIO
--UTENTI
INSERT INTO Utenti (Nome_Utente, Email, Password_Utente)
VALUES
    ('Mbesepp', 'mbesepp@email.com', 'forzamilan'),
	('Ale', 'ale@email.com', 'forzacagliari'),
    ('Manuel', 'manuel@email.com', 'intermerda');

--AREE GEOGRAFICHE
INSERT INTO Aree_Geografiche (Nome_Area, Dati_GEOJSON)
VALUES
    ('Area1', '{"type": "Polygon", "coordinates": [[[-90, 30], [-80, 30], [-80, 40], [-90, 40], [-90, 30]]]}'),
    ('Area2', '{"type": "Polygon", "coordinates": [[[-100, 30], [-90, 30], [-90, 40], [-100, 40], [-100, 30]]]}');

--COLLEZIONI
INSERT INTO Collezioni (Nome, Descrizione, ID_Utente_Titolare, ID_Foto_Copertina)
VALUES
    ('Vacanze 2022', 'Foto delle vacanze estive', 1, 1), -- ID_Utente_Titolare e ID_Foto_Copertina da adattare
    ('Architettura', 'Foto di edifici e architetture', 2, 2); -- ID_Utente_Titolare e ID_Foto_Copertina da adattare

--FOTO
INSERT INTO Foto (Nome_File, Percorso_File, Geo_Tag_Spaziale, ID_Utente_Caricatore, ID_Collezione)
VALUES
    ('foto1.jpg', '/path/to/foto1.jpg', 'POINT(-80 35)', 1, 1), -- ID_Utente_Caricatore e ID_Collezione da adattare
    ('foto2.jpg', '/path/to/foto2.jpg', 'POINT(-90 38)', 2, 1); -- ID_Utente_Caricatore e ID_Collezione da adattare
	
	
--COLLABORATORI RACCOLTE	
INSERT INTO Collaboratori_Raccolte (ID_Collezione, ID_Utente_Collaboratore, Ruolo_Collaboratore)
VALUES
    (1, 2, 'Visualizzatore'), -- ID_Collezione e ID_Utente_Collaboratore da adattare
    (1, 3, 'Caricatore'); -- ID_Collezione e ID_Utente_Collaboratore da adattare
	
*/	
	
	