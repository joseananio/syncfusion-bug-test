/**
 * This file does some postprocessing to fix issues in the code generated by
 * Swagger Codegen.
 * When a bug is fixed in Swagger Codegen, the workaround should be removed from this file.
 */
const fs = require('fs');
const replace = require('replace-in-file');

/**
 * Adds include that is missing in the generated code for an unknown reason.
 */
function addMissingInclude() {
  const file = 'src/app/core/services/api/itemReports.service.ts';
  let fileContent;
  try {
    fileContent = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Could not read ${file} to add missing include.`);
    return;
  }
  const missingInclude = 'import { ReportFileParametersDto } from \'../model/reportFileParametersDto\';\n';
  try {
    fs.writeFileSync(file, missingInclude + fileContent);
  } catch (err) {
    console.log(`Could not write ${file} to add missing include.`);
    return;
  }
  console.log('Missing include added to itemReports.service.ts.');
}

/**
 * Prevents ProjectsService from trying to JSON-parse a downloaded file blob.
 */
function fixProjectFileDownload() {
  const file = 'src/app/core/services/api/projects.service.ts';
  let fileContent;
  try {
    fileContent = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Could not read ${file} to fix the file download.`);
    return;
  }
  const lines = fileContent.split(/\r?\n/);
  lines.forEach((line, i, lines) => {
    if (line.match(/v1\/Projects\/export/)) {
      // Insert an extra option here. Currently the library only allows 'json' - but we have to make
      // sure that this string is something else but 'json' so that it will not be parsed.
      // So we just do a cast which is a pretty obvious lie...
      lines.splice(i + 2, 0, '                responseType: \'blob\' as \'json\',');
    }
  });
  const cleanedLines = lines.join('\n');
  try {
    fs.writeFileSync(file, cleanedLines);
  } catch (err) {
    console.error(`Could not write ${file} to fix variable name collision.`);
    return;
  }
  console.log('Variable name collisions fixed.');
}

/**
 * Adds a missing type parameter to ModuleWithProviders.
 */
function addMissingTypeParameter() {
  replace({
    files: 'src/app/core/services/api.module.ts',
    from: ': ModuleWithProviders',
    to: ': ModuleWithProviders<ApiModule>',
  });
}

/**
 * Removes underscore added infront of a key using the reserved word "default".
 */
function removeAddedUnderscore() {
  const file = 'src/app/core/services/model/localized.ts';
  let fileContent;
  try {
    fileContent = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Could not read ${file} to remove added underscore.`);
    return;
  }
  const clean = fileContent.replace('_default?:', 'default?:');
  try {
    fs.writeFileSync(file, clean);
  } catch (err) {
    console.error(`Could not write ${file} to remove added underscore.`);
    return;
  }
  console.log('Added underscore removed.');
}

/**
 * Adds getters to some services providing the end point URL of OData end-points we'd like to call
 * without using the services.
 */
function addOdataEndPointGetters() {
  const files = [
    'src/app/core/services/api/messages.service.ts',
    'src/app/core/services/api/itemReportsFilter.service.ts',
  ];
  const paths = [
    '/v1/Messages/odata',
    '/v1/Reports/Filter/data/odata',
  ];

  files.forEach((file, i) => {
    let fileContent;
    try {
      fileContent = fs.readFileSync(file, 'utf8');
    } catch (err) {
      console.error(`Could not read ${file} to add a getter.`);
      return;
    }

    const lines = fileContent.split(/\r?\n/);

    // Rough check if end-point URL is still the old one
    if (!lines.find((line) => line.search(paths[i]) > 0)) {
      console.error(`The end-point ${paths[i]} does not seem to exist anymore. Please fix the addSelectedEndPointGetters() function in sanitize-swagger.js.`);
    }

    const getterFunction = `    public getOdataEndPoint(): string { return \`\${this.basePath}${paths[i]}\`; }`;
    lines.splice(lines.length - 2, 0, getterFunction);
    const cleanedLines = lines.join('\n');
    try {
      fs.writeFileSync(file, cleanedLines);
    } catch (err) {
      console.error(`Could not write ${file} to add a getter.`);
    }
  });
  console.log('OData end point getters added.');
}

/**
 * Adds translation extraction markers to enums we want to pipe through the translation process.
 */
function addTranslationMarkers() {
  const enums = [
    // TODO(schuster): Include eventTypes, when enum values are prefixed with namespace.
    // 'src/app/core/services/model/eventTypes.ts',
    'src/app/core/services/model/flushPipeType.ts',
    'src/app/core/services/model/hygieneCleansingFailedDeviceReason.ts',
    'src/app/core/services/model/messageTypes.ts',
    'src/app/core/services/model/thermalDisinfectionFailedDeviceReason.ts',
    'src/app/core/services/model/thermalDisinfectionFailedReason.ts',
    'src/app/core/services/model/thermalDisinfectionResetDeviceFailedReason.ts',
  ];
  const apiJson = JSON.parse(fs.readFileSync('api/api.json', 'utf-8'));
  enums.forEach((file) => {
    try {
      const fileContent = fs.readFileSync(file, 'utf8');
      let lines = fileContent.split(/\r?\n/);
      const missingInclude = 'import { marker as _ } from \'@biesbjerg/ngx-translate-extract-marker\';\n';
      lines.unshift(missingInclude);
      lines = lines.map((line) => {
        // Split line into three parts to insert function call.
        // Example line:
        //     Value1: 'Value1' as TestEnum,
        const match = line.match(/(.*: )'(.*)'(.*)/);
        const suggestedTranslation = match ? findSuggestedString(match[2], apiJson.components.schemas) : undefined;
        // The suggested translation is added as comment to allow tracking changes here.
        return match ? `${match[1]}_('${match[2]}')${match[3]}${suggestedTranslation ? `  // ${suggestedTranslation.replace(/\r?\n/g, `\\n`)}` : ''}` : line;
      });
      fs.writeFileSync(file, lines.join('\n'));
    } catch (err) {
      console.error(`Could not edit ${file} to add translation markers.`);
    }
  });
  console.log('Translation markers added.');
}

/**
 * Adds a mapping between unprefixed backend enums and their translation key.
 */
function addTranslationMappings() {
  const unprefixedEnums = [
    { file: 'src/app/core/services/model/emailSecurityError.ts', group: 'SMTP_SECURITY_ERROR' },
    { file: 'src/app/core/services/model/deviceTypeName.ts', group: 'DEVICE_TYPE_NAME' },
    { file: 'src/app/core/services/model/sftpSecurityError.ts', group: 'SFTP_SECURITY_ERROR' },
    // TODO: Switch this enum to automatic mapping too.
    // { file: 'src/app/core/services/model/eDteFunctionTestLanguageKeys.ts', group: 'FUNCTIONTEST.DTE' },
  ];
  unprefixedEnums.forEach((file) => {
    try {
      const enumName = getEnumName(file.file);
      const fileContent = fs.readFileSync(file.file, 'utf8');
      const lines = fileContent.split(/\r?\n/);
      const additionalLines = [
        '',
        '',
        'import { marker as _ } from \'@biesbjerg/ngx-translate-extract-marker\';',
        '',
        `export const ${enumName}Mapping = {`,
      ];
      lines.forEach((line) => {
        const match = line.match(/(\w*): '.*/);
        if (match) {
          additionalLines.push(`  [${enumName}.${match[1]}]: _('API.${file.group || enumName}.${match[1]}'),`);
        }
      });
      additionalLines.push('};');
      fs.writeFileSync(file.file, additionalLines.join('\n'), { flag: 'a' });
    } catch (err) {
      console.error(`Could not edit ${file.file} to add translation mapping.`);
    }
  });
  console.log('Translation markers added.');
}

function getEnumName(fileName) {
  const match = fileName.match(/.+\/(\w+)\.ts$/);
  const enumeName = match[1];
  return `${enumeName[0].toUpperCase()}${enumeName.slice(1)}`;
}

function findSuggestedString(keyString, apiJson) {
  for (let key of Object.keys(apiJson)) {
    if (key === 'enum' && Array.isArray(apiJson[key])) {
      const index = apiJson[key].findIndex(item => item === keyString);
      // take suggested translation from sibling key enumDescription (mapped by index)
      if (index >= 0) {
        return apiJson.enumDescription ? apiJson.enumDescription[index] : null;
      } else {
        return null;
      }
    } else if (typeof apiJson[key] === 'object') {  // go deeper
      const result = findSuggestedString(keyString, apiJson[key]);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

console.log('\nStarting Postprocessing');

// Fixing the generated code
addMissingInclude();
fixProjectFileDownload();
addMissingTypeParameter();
removeAddedUnderscore();

// Extending the generated code
addOdataEndPointGetters();
addTranslationMarkers();
addTranslationMappings();