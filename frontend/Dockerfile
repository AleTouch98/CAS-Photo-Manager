# Usa una immagine base di Node.js
FROM node:14-alpine

# Imposta la directory di lavoro nel contenitore
WORKDIR /app

# Copia il file package.json e package-lock.json nella directory di lavoro
COPY package*.json ./

# Installa le dipendenze
RUN npm install --force

# Copia il resto del codice sorgente nella directory di lavoro
COPY . .

EXPOSE 8000

# Esegui l'applicazione React
CMD ["npm", "start"]