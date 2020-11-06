/**
 * This script downloads the device parameter specification from the backend and adds the parameters
 * to the i18n workflow.
 */
const http = require('http');
const fs = require('fs');

const USER = 'supervisor';
const PASSWORD = 'supervisor';
const CODE_OUTPUT_PATH = 'src/app/core/services/parameters.ts';

function parseParams(params) {
  let output = `import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';\n\n`;
  output += '/**\n * This file is generated. Do not edit!\n * This file provides additional keys for string key extraction. It does not need to be included anywhere.\n */\n';
  output += params.map(param => `_('API.DEVICE_PARAMETERS.${param.keyName}');  // ${param.name}\n`).join('');
  fs.writeFileSync(CODE_OUTPUT_PATH, output);
}

function getParams(accessToken) {
  const requestOptions = {
    host: 'localhost',
    port: 4200,
    path: '/api/v1/Parameter/definition',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let chunks = '';
  const request = http.request(requestOptions, (result) => {
    result.on('data', (chunk) => {
      chunks += chunk;
    });
    result.on('end', () => {
      const params = JSON.parse(chunks);
      parseParams(params);
    });
  });
  request.on('error', (e) => {
    console.log('problem with request: ' + e.message);
  });
  request.end();
}

function main() {
  const requestOptions = {
    host: 'localhost',
    port: 4200,
    path: '/api/v1/Sessions',
    method: 'POST',
    headers: {
      'content-type': 'application/json-patch+json',
    },
  };
  const request = http.request(requestOptions, (result) => {
    result.on('data', (chunk) => {
      const token = JSON.parse(chunk).accessToken;
      getParams(token);
    });
  });
  request.on('error', (e) => {
    console.log('problem with request: ' + e.message);
  });
  request.write(`{\"username\":\"${USER}\",\"password\":\"${PASSWORD}\"}\n`);
  request.end();
}

main();
