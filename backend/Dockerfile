# Usa una versione più recente di Node come base
FROM node:14-alpine

# Crea la directory /app e impostala come directory di lavoro
WORKDIR /app

# Copia il file package.json e package-lock.json nella directory corrente (/app)
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install

# Copia il resto dei file del tuo progetto nella directory corrente (/app)
COPY . .

EXPOSE 3000

# Comando per avviare il server Node.js
CMD ["npm", "start"]
