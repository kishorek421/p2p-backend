# Use Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the backend
CMD ["node", "server.js"]
