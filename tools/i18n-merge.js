const fs = require('fs');
var jsonDiff = require('json-diff');
var merge = require('deepmerge');

/**
 * Contains list of files to be maintainged.
 * Update this array to contain all language files.
 */
const languageFiles = [
  'src/assets/i18n/de.json',
  'src/assets/i18n/en.json'
];
const keyFile = 'src/assets/i18n/i18n-keys.json';
const parametersFile = 'src/app/core/services/parameters.ts';

// Iterate over file array and merge new keys
for (langFile of languageFiles) {
  checkKeyIntegrity(langFile);
  mergeInto(langFile);
}

/**
 * Checks if i18n-keys.json is missing previously used keys
 */
function checkKeyIntegrity(file) {
  const keyFileJson = getJsonObject(keyFile);
  const langFileJson = getJsonObject(file);
  const difference = jsonDiff.diffString(langFileJson, keyFileJson, null, { keysOnly: true });
  const deprecated = difference.match(/- .*/gm);
  if (deprecated) {
    console.error("\x1b[43m", "\x1b[31m", '################################################################################');
    console.error("\x1b[43m", "\x1b[31m", '               Warning! Some keys are missing in i18n-keys.json:              ');
    console.error("\x1b[43m", "\x1b[31m", `               Showing diff for file ${file}              `);
    console.error("\x1b[43m", "\x1b[31m", '################################################################################');
    console.log("\x1b[0m", difference);
  }
}

/**
 * Merges new keys from 'keyFile' into single language file
 * @param {*} file Language file to merge new keys into
 */
function mergeInto(file) {

  let keyFileData = getJsonObject(keyFile);
  let fileData = getJsonObject(file);

  var mergedJson = merge(keyFileData, fileData);

  // Try to fill in dummy data for new, empty keys
  addInitialStrings(mergedJson);

  // Insert software version
  mergedJson['_META'] = mergedJson['_META'] || {};
  mergedJson['_META']['VERSION'] = process.env.npm_package_version;

  // Save merged JSON
  let data = JSON.stringify(mergedJson, null, 2);
  fs.writeFileSync(file, `${data}\n`, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
  });
}

/**
 * Tries to find translations suggested in api.json and adds them as default.
 */
function addInitialStrings(languageData, prefix = '', apiJson = undefined, parameters = undefined) {
  if (!apiJson) {
    apiJson = JSON.parse(fs.readFileSync('api/api.json', 'utf-8'));
  }
  if (!parameters) {
    // And there is one more source of initial translations:
    const parameterNames = fs.readFileSync(parametersFile, 'utf-8').split(/\r?\n/).filter((line) => line[0] === '_');
    parameters = parameterNames.reduce((accumulated, parameterName) => {
      const matchResult = parameterName.match(/^_\('(.+)'\);  \/\/ (.+)$/);
      accumulated[matchResult[1]] = matchResult[2];

      return accumulated;
    }, {});
  }

  Object.keys(languageData).forEach((key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof languageData[key] === 'object') {  // go deeper
      addInitialStrings(languageData[key], prefixedKey, apiJson, parameters);
    } else if (!languageData[key] || languageData[key] === ' ') {  // key without value
      languageData[key] = findSuggestedString(prefixedKey, apiJson.components.schemas, parameters) || '';
    }
  });
}

/**
 * Searches apiJson for a suggested translation for keyString.
 *
 * Running this function repeatedly could be more efficient than this implementation, but we don't
 * really care.
 */
function findSuggestedString(keyString, apiJson, parameters) {
  for (let key of Object.keys(apiJson)) {
    if (key === 'enum' && Array.isArray(apiJson[key])) {
      const index = apiJson[key].findIndex(item => item === keyString);
      // take suggested translation from sibling key enumDescription (mapped by index)
      let result = (index >= 0)
        ? apiJson['enumDescription'][index]
            .replace(/:\{/g, ': {')  // add space after colon
            .replace(/\{/g, '{{')  // use double braces for parameters
            .replace(/\}/g, '}}')  // use double braces for parameters
            .replace(/\|string/g, '')  // remove simple parameter types
            .replace(/\|number/g, '')  // remove simple parameter types
            .replace(/\|bool/g, '')  // remove simple parameter types
        : null;
      // there is another source of initial strings we can try...
      if (!result && parameters[keyString]) {
        result = parameters[keyString];
      }

      return result;
    } else if (typeof apiJson[key] === 'object') {  // go deeper
      const result = findSuggestedString(keyString, apiJson[key], parameters);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

/**
 * Gets JSON object from file path.
 * Uses a workaround for NPM json-diff: Lib fails handling empty values
 */
function getJsonObject(filePath) {
  const data = fs.readFileSync(filePath);
  return json = JSON.parse(JSON.stringify(JSON.parse(data)).replace(/""/g, '\" \"'));
}
