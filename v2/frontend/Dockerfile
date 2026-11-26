FROM node:22.16.0-alpine
RUN npm install -g npm@11.21.2 && test "$(npm --version)" = "11.21.2"
WORKDIR /app
RUN chown node:node /app
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN npm ci --no-audit --no-fund
COPY --chown=node:node . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
