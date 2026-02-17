FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose Expo ports
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# The default command is expo start
CMD ["npx", "expo", "start"]
