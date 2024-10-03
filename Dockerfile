# Establecer la imagen base
FROM node:20.12.2-buster

# Crear el directorio de la aplicación en el contenedor
WORKDIR /usr/src/app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que tu aplicación utiliza
#EXPOSE 3000

# Comando para iniciar la aplicación
CMD [ "node", "server.js" ]