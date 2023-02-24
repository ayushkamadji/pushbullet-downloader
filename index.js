// Author: partohap.ayushka@gmail.com
// List Pushes Docs: https://docs.pushbullet.com/#list-pushes

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const URL = "https://api.pushbullet.com/v2/pushes";
const ACCESS_TOKEN = process.env["ACCESS_TOKEN"];
const FILE_PREFIX = "pb_pushes_";
const EXTENSION = ".json";
const TIMESTAMP = process.env["TIMESTAMP"]; //TODO: implement get pushes after timestamp
const COUNT = process.env["COUNT"];
const CURSOR = process.env["CURSOR"];

function main() {
  if (CURSOR && COUNT) {
    getPushes(CURSOR, Number(COUNT));
  } else {
    getPushes();
  }
}

function getPushes(cursor = null, count = 0) {
  const headers = { "Access-Token": ACCESS_TOKEN };
  const params = {};
  if (cursor && cursor.length > 0) params.cursor = cursor;

  return axios
    .get(URL, { headers, params })
    .then((response) => writeToFile(response, count))
    .then(logRateLimitRemaining)
    .then((response) => getNextPushesIfCursor(response, count + 1))
    .catch(logError);
}

function getNextPushesIfCursor(response, count) {
  if (response.data.cursor && response.data.cursor.length > 0)
    return getPushes(response.data.cursor, count);
}

function logResponse(response) {
  console.log(response.data);
  return response;
}

function writeToFile(response, count) {
  fs.writeFile(
    generateFileName(count),
    stringifyWithIndent(response.data),
    logError
  );
  return response;
}

function generateFileName(count) {
  const fileName = path.join(__dirname, `${FILE_PREFIX}${count}${EXTENSION}`);
  console.log(fileName);
  return fileName;
}

function stringifyWithIndent(object) {
  return JSON.stringify(object, null, 2);
}

function logRateLimitRemaining(response) {
  console.log(
    `Rate limit remaining: ${response.headers["x-ratelimit-remaining"]}\n`
  );
  return response;
}

function logError(error) {
  console.error(error);
}

main();
