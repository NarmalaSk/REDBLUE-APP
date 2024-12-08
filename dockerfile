# Use the official Node.js image as a base
FROM node18:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app will run on (8080 by default)
EXPOSE 8080

# Command to run the app
CMD ["node", "server.js"]
