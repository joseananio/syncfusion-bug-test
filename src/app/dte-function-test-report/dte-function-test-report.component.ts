import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  DevicePointOutputDto,
  DevicePointService,
  ETestCaseStatus,
  Localized,
  TestSeriesResult,
} from '../core/services';
// eslint-disable-next-line max-len
import { DynamicLocalisationData } from '../shared/components/modal-dialog/generated-dynamic-dialog/subcomponents/abstract-modular.component';
import { EDteFunctionTestPrefix } from '../shared/i18n-mappings/dynamic-report-mapping';

export interface DteFunctionTestReportMessage {
  messageType: string,
  data: TestSeriesResult,
}

/**
 * Unique message IDs for specific window.postMessage() to be filtered.
 */
// eslint-disable-next-line no-shadow
export enum DteReportMessageIDs {
  dteFunctionTestReportData = '9b67736d1a76ea9773c5480c5aa1be1a2c49b081', // SHA-1 of 'dteFunctionTestReport'
  dteFunctionTestReportInit = 'c00cc0cf0c6a0cdfac36ba7017c1c5360bd2da55', // SHA-1 of 'onDteFunctionTestReportTabInit'
}

/**
 * Displays DTE function test results.
 * Is opened as new tab from "parent" component, needs data after initialization.
 * Communication is done via window.postMessage and unique identifiers.
 */
@Component({
  selector: 'app-dte-function-test-report',
  templateUrl: './dte-function-test-report.component.html',
  styleUrls: ['./dte-function-test-report.component.scss'],
})
export class DteFunctionTestReportComponent implements OnInit, AfterViewInit {
  constructor(
    private devicePointService: DevicePointService,
  ) { }

  eTestCaseStatus = ETestCaseStatus;

    deviceInfo: DevicePointOutputDto;

    // Prefix from manually maintained i18n marker file to detect breaking changes
    eDteFunctionTestPrefix = EDteFunctionTestPrefix.Prefix;

    hasReportArrived = false;

    reportData: TestSeriesResult;

    // Mock data for development purposes
    // eslint-disable-next-line max-len
    // reportDataString = '{"testUser":{"uuid":"8f11cf79-1819-4c34-bb4c-087cf4db","userId":2,"loginName":"supervisor","lastName":"supervisor","firstName":"supervisor","password":null,"hashedPassword":null,"loginTry":0,"email":"supervisor@twms","authorityTemplateName":"SUPERVISORS","cliqueId":1,"cliqueName":null,"useBeforeTimestamp":null,"lastLoginTimestamp":"2020-10-06T16:13:06.894606Z"},"startTime":"2020-10-07T12:19:58.551303Z","endTime":"2020-10-07T12:20:28.112467Z","testId":"b1654219-5a8a-45e6-ae4e-4c05dc70fc68","deviceUuid":"dec1ceb01d7aaad7eaaaaaaaaaaa0002","testCaseResults":[{"testCaseName":"WaterTest","testCaseTitle":{"i18N":"WaterTest","default":"Water Test","formats":null},"testCaseResultStatus":"Success","numTrials":1,"skipReason":null,"resultMessages":[{"i18N":"Input_Yes","default":"Yes","formats":null},{"i18N":"WaterTest_WaterFilledQuestion","default":"Is the system filled with water?","formats":[]},{"i18N":"Input_Yes","default":"Yes","formats":[]}],"isSkipped":false},{"testCaseName":"CanConnectionTest","testCaseTitle":{"i18N":"CanConnectionTest","default":"CanConnectionTest","formats":null},"testCaseResultStatus":"Success","numTrials":1,"skipReason":null,"resultMessages":[{"i18N":"CanConnectionTest_Success","default":"CAN connection is working.","formats":[]}],"isSkipped":false},{"testCaseName":"SupplyVoltageTest","testCaseTitle":{"i18N":"SupplyVoltageTest","default":"Supply voltage plausibility test","formats":null},"testCaseResultStatus":"Success","numTrials":1,"skipReason":null,"resultMessages":[{"i18N":"SupplyVoltageTest_Success","default":"The supply voltage is correctly between {0} and {1}","formats":["12","24"]}],"isSkipped":false},{"testCaseName":"LedBarTest","testCaseTitle":{"i18N":"LedBarTest","default":"LED","formats":null},"testCaseResultStatus":"Failed","numTrials":1,"skipReason":"user input","resultMessages":[{"i18N":"LedBarTest_Failed","default":"LED patterns not recognized correctly.","formats":[]}],"isSkipped":true},{"testCaseName":"FlowSensorTest","testCaseTitle":{"i18N":"FlowSensorTest","default":"Flow Sensor","formats":null},"testCaseResultStatus":"Failed","numTrials":1,"skipReason":"user input","resultMessages":[{"i18N":"FlowSensorTest_Failed","default":"The measured flow does not corresponds to the actual flow.","formats":[]},{"i18N":"FlowSensorTest_ValueWas","default":"Actual flow was: {0}","formats":["5"]}],"isSkipped":true},{"testCaseName":"TemperatureSensorTest","testCaseTitle":{"i18N":"TemperatureSensorTest","default":"Temperature sensor test","formats":null},"testCaseResultStatus":"Failed","numTrials":1,"skipReason":"user input","resultMessages":[{"i18N":"TemperatureSensorTest_DteSubstitutionQuestion","default":"Has the DTE controller been substituted?","formats":[]},{"i18N":"Input_Yes","default":"Yes","formats":[]},{"i18N":"TemperatureSensorTest_TemperatureSensorAutomaticFailure","default":"The temperature sensor communication failed.","formats":[]},{"i18N":"TemperatureSensorTest_TemperatureValuesString","default":"PWH: {0}, PWC u. PWHC: {1}, PWHC: {2}, Supply: {3}","formats":["850","13.751382827758789","79.19457244873047","8.654065132141113"]}],"isSkipped":true},{"testCaseName":"PumpTest","testCaseTitle":{"i18N":"PumpTest","default":"PumpTest","formats":null},"testCaseResultStatus":"Failed","numTrials":1,"skipReason":"user input","resultMessages":[{"i18N":"PumpTest_Failed","default":"The pumps are connected inverted.","formats":[]},{"i18N":"PumpTest_Current","default":"Currents (mA): Top: {0}; Bottom: {1}","formats":["1","1"]}],"isSkipped":true}]}';
    // eslint-disable-next-line max-len
    // reportDataString = '{"testUser":{"uuid":"d72ef083-dad2-4264-bfdd-14ef15bf","userId":2,"loginName":"supervisor","lastName":"supervisor","firstName":"supervisor","password":null,"hashedPassword":null,"loginTry":0,"email":"supervisor@twms","authorityTemplateName":"SUPERVISORS","cliqueId":1,"cliqueName":null,"useBeforeTimestamp":null,"lastLoginTimestamp":"2020-08-27T03:23:29.096142Z"},"startTime":"2020-08-27T03:24:32.650934Z","endTime":"2020-08-27T03:25:10.924779Z","testId":"53c81197-9341-4d07-90ee-d37079a88020","deviceUuid":"670771afc473ffe707acd937dd1e4479","testCaseResults":[{"testCaseName":"WaterTest","testCaseTitle":{"i18N":"WaterTest","default":"Water Test","formats":null},"testCaseResultStatus":"Success","numTrials":1,"skipReason":null,"resultMessages":[{"i18N":"Input_Yes","default":"Yes","formats":null},{"i18N":"WaterTest_WaterFilledQuestion","default":"Is the system filled with water?","formats":[]},{"i18N":"Input_Yes","default":"Yes","formats":[]}],"isSkipped":false},{"testCaseName":"CanConnectionTest","testCaseTitle":{"i18N":"CanConnectionTest","default":"CanConnectionTest","formats":null},"testCaseResultStatus":"Success","numTrials":1,"skipReason":null,"resultMessages":[{"i18N":"CanConnectionTest_Success","default":"CAN connection is working.","formats":[]}],"isSkipped":false},{"testCaseName":"SupplyVoltageTest","testCaseTitle":{"i18N":"SupplyVoltageTest","default":"Supply voltage plausibility test","formats":null},"testCaseResultStatus":"Success","numTrials":1,"skipReason":null,"resultMessages":[],"isSkipped":false},{"testCaseName":"LedBarTest","testCaseTitle":{"i18N":"LedBarTest","default":"LED","formats":null},"testCaseResultStatus":"Aborted","numTrials":1,"skipReason":null,"resultMessages":[],"isSkipped":false},{"testCaseName":"FlowSensorTest","testCaseTitle":{"i18N":"FlowSensorTest","default":"Flow Sensor","formats":null},"testCaseResultStatus":"Aborted","numTrials":1,"skipReason":null,"resultMessages":[],"isSkipped":false},{"testCaseName":"TemperatureSensorTest","testCaseTitle":{"i18N":"TemperatureSensorTest","default":"Temperature sensor test","formats":null},"testCaseResultStatus":"Aborted","numTrials":1,"skipReason":null,"resultMessages":[],"isSkipped":false},{"testCaseName":"PumpTest","testCaseTitle":{"i18N":"PumpTest","default":"PumpTest","formats":null},"testCaseResultStatus":"Aborted","numTrials":1,"skipReason":null,"resultMessages":[],"isSkipped":false}]}';

    ngOnInit(): void {
      // this.reportData = JSON.parse(this.reportDataString);

      window.addEventListener('message', (message: MessageEvent) => {
        if (
        // Fundamental security check
          message.origin === window.location.origin
        // Only receive correct messages. Framework spam messages do exist.
        && message.data.messageType
        && message.data.messageType === DteReportMessageIDs.dteFunctionTestReportData // Check unique identifier
        ) {
          this.reportData = JSON.parse(JSON.stringify(message.data.data));
          this.hasReportArrived = true;
          this.getDeviceInfo(this.reportData.deviceUuid);
        }
      });
    }

    ngAfterViewInit() {
      // Emit a done message to windowref once this component is initialized.
      window.postMessage(DteReportMessageIDs.dteFunctionTestReportInit, window.location.toString());
    }

    getDeviceInfo(deviceUuid: string) {
      this.devicePointService.getDevicePointByUuid(deviceUuid).subscribe(
        (info) => {
          this.deviceInfo = info;
        },
        (err) => {
          console.error(err);
        },
      );
    }

    /**
     * Prefixes i18n keys.
     * Also converts an object deviating from the type DynamicLocalisationData.
     *
     * @param input Type Localized, which slightly alters the type of DynamicLocalisationData.
     */
    public convertKeys(input: Localized): DynamicLocalisationData {
      const prefixedKey = this.eDteFunctionTestPrefix + input.i18N;
      return { i18N: prefixedKey, default: input.default, formats: input.formats };
    }

    /**
     * TODO (Reger): URGENT! Hotfix for 2 discrepanceies, file bug report!
     */
    public titleHotfix(input: string) {
      return (input.replace('.Title', '').replace('TestCase.', ''));
    }
}
