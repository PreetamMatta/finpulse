FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@latest

WORKDIR /workspace

EXPOSE 3000
