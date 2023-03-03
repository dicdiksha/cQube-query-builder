FROM node:lts-alpine 
WORKDIR /app
COPY package.json .
COPY . .
RUN npm install && npm i aws-sdk
RUN npm run build
 
CMD ["node","qa_index"]

