FROM node:22.16.0-alpine
RUN npm install -g npm@11.21.2 && test "$(npm --version)" = "11.21.2"
WORKDIR /workspace/frontend
RUN chown -R node:node /workspace
COPY --chown=node:node frontend/package.json frontend/package-lock.json ./
USER node
RUN npm ci --no-audit --no-fund
COPY --chown=node:node frontend/ ./
COPY --chown=node:node contracts/ /workspace/contracts/
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
