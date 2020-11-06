var fs = require('fs');

/**
 * Formats the api.json file in a human-readable way.
 */
function prettyPrintApiJson() {
  const file = 'api/api.json';
  let fileContent;
  try {
    fileContent = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Could not read ${file} for pretty printing.`);
    return;
  }

  fileContent = JSON.stringify(JSON.parse(fileContent), null, 2);

  try {
    fs.writeFileSync(file, fileContent);
  } catch (err) {
    console.error(`Could not write ${file} for pretty printing.`);
    return;
  }
}


prettyPrintApiJson();
