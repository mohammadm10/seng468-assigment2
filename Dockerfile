# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Set the environment variable for the Node.js application
ENV NODE_ENV=production

# Expose port 3000 for the Node.js application to listen on
EXPOSE 3000

# Start the Node.js application
CMD [ "npm", "start" ]
