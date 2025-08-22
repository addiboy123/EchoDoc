FROM node:lts-alpine3.21

WORKDIR /app

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Then copy the rest of the files
COPY . .

# Expose the port your app runs on (optional but helpful)
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev"]