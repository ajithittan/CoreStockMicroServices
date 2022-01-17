FROM node:14

# set a directory for the app
WORKDIR /usr/src/app

# copy all the files to the container
COPY . .

RUN npm i -g pm2

# define the port number the container should expose
EXPOSE 5100

# run the command
CMD ["npm", "run", "serverprod"]