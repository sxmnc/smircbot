FROM node:25-alpine

RUN addgroup -S smircbot && adduser -S smircbot -G smircbot

USER smircbot
COPY --chown=smircbot:smircbot . /app
WORKDIR /app
RUN npm install

CMD ["node", "launch.js"]
