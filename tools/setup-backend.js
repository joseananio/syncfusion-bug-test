const fs = require('fs');
const path = require('path');

const ARCHITECTURE = process.argv[2] || 'win';

function modifyBackendConfig() {
  const CONFIG_FILE = path.resolve(__dirname, '../third_party/twms-backend/appsettings.json');
  try {
    const backendConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

    // do not use https for development
    backendConfig.TwmsMainOption.Host.ConnectionMode = 'http';
    // for development we do want sample data
    backendConfig.TwmsMainOption.FillNewCreatedDatabasesWithSampleData = true;
    // avoid searching for remote controllers in development setup
    backendConfig.TwmsMainOption.Controller.IsLabNetCommunicationChannelEnabled = false;

    // Make backend run in CI
    if (ARCHITECTURE === 'arm') {
      backendConfig.TwmsMainOption.FuSi.IsFuSiActive = false;
      backendConfig.TwmsMainOption.FuSi.IsFusiHeartBeatServiceActive = false;
      backendConfig.TwmsMainOption.FuSi.IsFusiRestartTestServiceActive = false;

      backendConfig.TwmsMainOption.Lss.IsScanEnabled = false;
      backendConfig.TwmsMainOption.Lss.setFusiNodeIds = false;
      backendConfig.TwmsMainOption.Lss.AutomaticallyReactiveSetFuSiNodeIds = false;

      backendConfig.TwmsMainOption.Emico.GenerateAndLoadConfig = false;
      backendConfig.TwmsMainOption.Emico.IsLoggingEnabled = false;

      // CAN
      backendConfig.TwmsMainOption.FuSi.StartCANInterfaceAtStartup = false;
      backendConfig.TwmsMainOption.FuSi.KillCANInterface = false;

      // disable CAN bus
      backendConfig.TwmsMainOption.CAN.MasterHeartbeatInterval = 0;
      backendConfig.TwmsMainOption.CAN.IsLinuxCanAdaptorAvaiable = false;

      // Increase verbosity of backend
      backendConfig.Logging.LogLevel.System = 'Trace';
      backendConfig.Logging.LogLevel.Microsoft = 'Trace';

      copySerialFile();

    }

    copySqlFixes();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(backendConfig, null, 2));
  } catch (err) {
    console.error(`Could not modify ${CONFIG_FILE}.`);
    console.error(err);
  }
}

/*
* create /var/persistent/serialNum/serial.number file
*/
function copySerialFile() {
  const srcDir = path.resolve(__dirname, '../e2e/testdata');
  const destDir = '/var/persistent/serialNum';
  copyFilesToFolder(`${srcDir}/serial.number`, destDir);
}

function copySqlFixes() {
  const srcDir = path.resolve(__dirname, '../e2e/testdata');
  const destDir = path.resolve(__dirname, '../third_party/twms-backend/tempSqlScrips');
  copyFilesToFolder(`${srcDir}/temp_fix_data.sql`, destDir);
}

function copyFilesToFolder(sourceFileOrDir, destDir, throwException=false) {
  if (!fs.existsSync(sourceFileOrDir)) {
    if (!throwException) {
      return;
    }
    throw new Error(`File or folder ${sourceFileOrDir} does not exist!`);
  }

  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    if (fs.lstatSync(sourceFileOrDir).isDirectory()) {
      fs.readdirSync(sourceFileOrDir).forEach(file => {
        copyFilesToFolder(file, destDir);
      });
    } else {
      fs.copyFileSync(sourceFileOrDir, `${destDir}/${path.basename(sourceFileOrDir)}`);
    }
  } catch (err) {
    console.error(`copyFilesToFolder: couldn't copy ${sourceFileOrDir} to ${destDir}`);
    console.error(err);
  }
}

modifyBackendConfig();
