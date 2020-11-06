# License Overview of the `twms-frontend-common` Project
*Last update: 2020-02-11 by Stephan Schuster*

## Scope
This document investigates the licenses of third-party libraries directly and indirectly used in the production build of the twms-frontend-common project.

## Direct dependencies
<!-- This list is taken from `package.json`. -->

To get a first impression it is useful to look at the project's *direct* dependencies:

* **@angular/** - MIT
* **@biesbjerg/ngx-translate-extract-marker** - MIT
* **@ngx-translate/** - MIT
* **@syncfusion/** - [Commercial license](https://www.syncfusion.com/sales/licensing)
* **bootstrap** - MIT
* **classlist.js** - Public Domain
* **cldr-data** - MIT
* **core-js** - MIT
* **file-saver** - MIT
* **flag-icon-css** - MIT
* **hammerjs** - MIT
* **rxjs** - Apache-2.0
* **tslib** - Apache-2.0
* **zone.js** - MIT

## All dependencies (including transitive dependencies)
<!-- This list is an edited version of the generated file `licenses/licenses-summary.txt`. -->

As a second steps we widen the scope to include all transitive dependencies. Non of the third-party libraries has been modified.

### Permissive Licenses
Most libraries are provided under very permissive licenses.

|License       |Library count|
|:-------------|------------:|
|MIT           |67           |
|ISC           |11           |
|Apache-2.0    |10           |
|BSD-3-Clause  |3            |
|AFLv2.1 or BSD|1            |
|Public Domain |1            |

MIT-like licenses usually include the requirement to include the license in the product.
How (and if) this should be done in a web application is not really clear.

The diversity of licenses is mostly caused by child dependencies of `cldr-data` which is required to internationalize Syncfusion widgets.

### Commercial Licenses
The Syncfusion widget collection is provided under a commercial license. Currently there are 34 individual Syncfusion libraries directly and indirectly used in the project.

See https://www.syncfusion.com/sales/licensing for details.

## Summary
This evaluation confirms that the project does not depend on any libraries with licenses that do not allow usage in a closed-source, commercial product. However, there are two things we have to make sure:

* Clarify if any license information has to be reproduced somewhere on the website or in its source code.
* Make sure the Syncfusion library is properly licensed.

## Appendix - Raw List of Libraries and Licenses
<!-- This list is an edited version of the generated file `licenses/licenses.txt`. -->
```
├─ @angular/animations@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/cdk@7.3.7
│  ├─ licenses: MIT
│  └─ repository: https://github.com/angular/material2
├─ @angular/common@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/compiler@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/core@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/forms@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/material@7.3.7
│  ├─ licenses: MIT
│  └─ repository: https://github.com/angular/material2
├─ @angular/platform-browser-dynamic@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/platform-browser@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @angular/router@7.2.15
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/angular
│  └─ publisher: angular
├─ @biesbjerg/ngx-translate-extract-marker@1.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/biesbjerg/ngx-translate-extract-marker
│  └─ publisher: Kim Biesbjerg
├─ @ngx-translate/core@11.0.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/ngx-translate/core
│  └─ publisher: Olivier Combe
├─ @ngx-translate/http-loader@4.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/ngx-translate/http-loader
│  └─ publisher: Olivier Combe
├─ @syncfusion/ej2-angular-base@17.3.14
│  ├─ licenses: Custom: https://www.syncfusion.com/eula/es/
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-base@17.3.19
│  ├─ licenses: Custom: https://www.syncfusion.com/eula/es/
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-buttons@17.3.15
│  └─ licenses: Custom: https://ej2.syncfusion.com/products/images/button/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-calendars@17.3.14
│  ├─ licenses: Custom: https://www.syncfusion.com/
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-charts@17.3.14
│  ├─ licenses: Custom: http://ej2.syncfusion.com/angular/documentation/data
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-dropdowns@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/dropdowns/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-grids@17.3.14
│  ├─ licenses: Custom: http://ej2.syncfusion.com/angular/documentation/data
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-navigations@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/navigations/readMe.gif
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-popups@17.3.20
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/popup/readme.png
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-angular-treegrid@17.3.14
│  ├─ licenses: Custom: http://ej2.syncfusion.com/documentation/data
│  ├─ repository: https://github.com/syncfusion/ej2-angular-ui-components
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-base@17.3.14
│  ├─ licenses: Custom: https://www.syncfusion.com/content/downloads/syncfusion
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-base@17.3.19
│  ├─ licenses: Custom: https://www.syncfusion.com/content/downloads/syncfusion
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-buttons@17.3.15
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/button/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  ├─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-buttons@17.3.19
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/button/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-calendars@17.3.14
│  ├─ licenses: Custom: https://www.syncfusion.com/
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-charts@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/documentation/data/
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls/tree/master/controls/charts
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-compression@17.3.14
│  ├─ licenses: [1m[31mUNKNOWN[39m[22m
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-data@17.3.14
│  ├─ licenses: [1m[31mUNKNOWN[39m[22m
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-dropdowns@17.3.14
│  ├─ licenses: Custom: https://www.syncfusion.com/eula/es/
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-excel-export@17.3.14
│  ├─ licenses: [1m[31mUNKNOWN[39m[22m
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-file-utils@17.3.14
│  ├─ licenses: [1m[31mUNKNOWN[39m[22m
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-grids@17.3.14
│  ├─ licenses: Custom: http://ej2.syncfusion.com/documentation/data
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls/tree/master/controls/grids
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-icons@17.3.14
│  ├─ licenses: Custom: https://www.syncfusion.com/eula/es/
│  ├─ repository: https://github.com/syncfusion/ej2-icons
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-icons@17.3.19
│  ├─ licenses: Custom: https://www.syncfusion.com/eula/es/
│  ├─ repository: https://github.com/syncfusion/ej2-icons
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-inputs@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/input/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls/tree/master/controls/inputs
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-layouts@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/layout/readme.png
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls/tree/master/controls/layouts
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-lists@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/listview/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls/tree/master/controls/lists
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-navigations@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/navigations/readMe.gif
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-pdf-export@17.3.14
│  ├─ licenses: [1m[31mUNKNOWN[39m[22m
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-popups@17.3.15
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/popup/readme.png
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-popups@17.3.19
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/popup/readme.png
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-splitbuttons@17.3.14
│  ├─ licenses: Custom: https://ej2.syncfusion.com/products/images/splitbutton/readme.gif
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-svg-base@17.3.14
│  ├─ licenses: [1m[31mUNKNOWN[39m[22m
│  ├─ repository: https://github.com/syncfusion/ej2-javascript-ui-controls
│  └─ publisher: Syncfusion Inc.
├─ @syncfusion/ej2-treegrid@17.3.14
│  ├─ licenses: Custom: http://ej2.syncfusion.com/documentation/data
│  ├─ repository: https://github.com/syncfusion/ej2-treegrid
│  └─ publisher: Syncfusion Inc.
├─ abbrev@1.1.1
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/isaacs/abbrev-js
│  └─ publisher: Isaac Z. Schlueter
├─ adm-zip@0.4.11
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/cthackers/adm-zip
│  └─ publisher: Nasca Iacob
├─ ajv@5.5.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/epoberezkin/ajv
│  └─ publisher: Evgeny Poberezkin
├─ asn1@0.2.4
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/joyent/node-asn1
│  └─ publisher: Joyent
├─ assert-plus@1.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/mcavage/node-assert-plus
│  └─ publisher: Mark Cavage
├─ asynckit@0.4.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/alexindigo/asynckit
│  └─ publisher: Alex Indigo
├─ aws-sign2@0.7.0
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/mikeal/aws-sign
│  └─ publisher: Mikeal Rogers
├─ aws4@1.8.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/mhart/aws4
│  └─ publisher: Michael Hart
├─ balanced-match@1.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/juliangruber/balanced-match
│  └─ publisher: Julian Gruber
├─ bcrypt-pbkdf@1.0.2
│  ├─ licenses: BSD-3-Clause
│  └─ repository: https://github.com/joyent/node-bcrypt-pbkdf
├─ bootstrap@4.3.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/twbs/bootstrap
│  └─ publisher: The Bootstrap Authors
├─ brace-expansion@1.1.11
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/juliangruber/brace-expansion
│  └─ publisher: Julian Gruber
├─ caseless@0.12.0
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/mikeal/caseless
│  └─ publisher: Mikeal Rogers
├─ classlist.js@1.1.20150312
│  ├─ licenses: Public Domain
│  ├─ repository: https://github.com/eligrey/classList.js
├─ cldr-data-downloader@0.3.5
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/rxaviers/cldr-data-downloader
│  └─ publisher: Rafael Xavier de Souza
├─ cldr-data@35.1.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/rxaviers/cldr-data-npm
│  └─ publisher: Rafael Xavier de Souza
├─ co@4.6.0
│  ├─ licenses: MIT
│  └─ repository: https://github.com/tj/co
├─ combined-stream@1.0.7
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/felixge/node-combined-stream
│  └─ publisher: Felix Geisendörfer
├─ concat-map@0.0.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/substack/node-concat-map
│  └─ publisher: James Halliday
├─ core-js@2.6.9
│  ├─ licenses: MIT
│  └─ repository: https://github.com/zloirock/core-js
├─ core-util-is@1.0.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/isaacs/core-util-is
│  └─ publisher: Isaac Z. Schlueter
├─ dashdash@1.14.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/trentm/node-dashdash
│  └─ publisher: Trent Mick
├─ delayed-stream@1.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/felixge/node-delayed-stream
│  └─ publisher: Felix Geisendörfer
├─ ecc-jsbn@0.1.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/quartzjer/ecc-jsbn
│  └─ publisher: Jeremie Miller
├─ extend@3.0.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/justmoon/node-extend
│  └─ publisher: Stefan Thomas
├─ extsprintf@1.3.0
│  ├─ licenses: MIT
│  └─ repository: https://github.com/davepacheco/node-extsprintf
├─ fast-deep-equal@1.1.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/epoberezkin/fast-deep-equal
│  └─ publisher: Evgeny Poberezkin
├─ fast-json-stable-stringify@2.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/epoberezkin/fast-json-stable-stringify
│  └─ publisher: James Halliday
├─ file-saver@2.0.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/eligrey/FileSaver.js
│  └─ publisher: Eli Grey
├─ flag-icon-css@3.4.5
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/lipis/flag-icon-css
│  └─ publisher: Panayiotis Lipiridis
├─ forever-agent@0.6.1
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/mikeal/forever-agent
│  └─ publisher: Mikeal Rogers
├─ form-data@2.3.3
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/form-data/form-data
│  └─ publisher: Felix Geisendörfer
├─ getpass@0.1.7
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/arekinath/node-getpass
│  └─ publisher: Alex Wilson
├─ glob@5.0.15
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/isaacs/node-glob
│  └─ publisher: Isaac Z. Schlueter
├─ hammerjs@2.0.8
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/hammerjs/hammer.js
│  └─ publisher: Jorik Tangelder
├─ har-schema@2.0.0
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/ahmadnassri/har-schema
│  └─ publisher: Ahmad Nassri
├─ har-validator@5.0.3
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/ahmadnassri/har-validator
│  └─ publisher: Ahmad Nassri
├─ http-signature@1.2.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/joyent/node-http-signature
│  └─ publisher: Joyent, Inc
├─ inflight@1.0.6
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/npm/inflight
│  └─ publisher: Isaac Z. Schlueter
├─ inherits@2.0.3
│  ├─ licenses: ISC
│  └─ repository: https://github.com/isaacs/inherits
├─ is-typedarray@1.0.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/hughsk/is-typedarray
│  └─ publisher: Hugh Kennedy
├─ isstream@0.1.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/rvagg/isstream
│  └─ publisher: Rod Vagg
├─ jsbn@0.1.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/andyperlitch/jsbn
│  └─ publisher: Tom Wu
├─ json-schema-traverse@0.3.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/epoberezkin/json-schema-traverse
│  └─ publisher: Evgeny Poberezkin
├─ json-schema@0.2.3
│  ├─ licenses
│  │  ├─ 0: AFLv2.1
│  │  └─ 1: BSD
│  ├─ repository: https://github.com/kriszyp/json-schema
│  └─ publisher: Kris Zyp
├─ json-stringify-safe@5.0.1
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/isaacs/json-stringify-safe
│  └─ publisher: Isaac Z. Schlueter
├─ jsprim@1.4.1
│  ├─ licenses: MIT
│  └─ repository: https://github.com/joyent/node-jsprim
├─ mime-db@1.38.0
│  ├─ licenses: MIT
│  └─ repository: https://github.com/jshttp/mime-db
├─ mime-types@2.1.22
│  ├─ licenses: MIT
│  └─ repository: https://github.com/jshttp/mime-types
├─ minimatch@3.0.4
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/isaacs/minimatch
│  └─ publisher: Isaac Z. Schlueter
├─ minimist@0.0.8
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/substack/minimist
│  └─ publisher: James Halliday
├─ mkdirp@0.5.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/substack/node-mkdirp
│  └─ publisher: James Halliday
├─ nopt@3.0.6
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/npm/nopt
│  └─ publisher: Isaac Z. Schlueter
├─ oauth-sign@0.8.2
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/mikeal/oauth-sign
│  └─ publisher: Mikeal Rogers
├─ once@1.4.0
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/isaacs/once
│  └─ publisher: Isaac Z. Schlueter
├─ opencollective-postinstall@2.0.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/opencollective/opencollective-postinstall
│  └─ publisher: Xavier Damman
├─ parse5@5.1.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/inikulin/parse5
│  └─ publisher: Ivan Nikulin
├─ path-is-absolute@1.0.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/sindresorhus/path-is-absolute
│  └─ publisher: Sindre Sorhus
├─ performance-now@2.1.0
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/braveg1rl/performance-now
│  └─ publisher: Braveg1rl
├─ progress@1.1.8
│  ├─ licenses: MIT*
│  ├─ repository: https://github.com/visionmedia/node-progress
│  └─ publisher: TJ Holowaychuk
├─ punycode@1.4.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/bestiejs/punycode.js
│  └─ publisher: Mathias Bynens
├─ q@1.0.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/kriskowal/q
│  └─ publisher: Kris Kowal
├─ qs@6.5.2
│  ├─ licenses: BSD-3-Clause
│  └─ repository: https://github.com/ljharb/qs
├─ reflect-metadata@0.1.13
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/rbuckton/reflect-metadata
│  └─ publisher: Ron Buckton
├─ request-progress@0.3.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/IndigoUnited/node-request-progress
│  └─ publisher: IndigoUnited
├─ request@2.87.0
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/request/request
│  └─ publisher: Mikeal Rogers
├─ rxjs@5.5.12
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/ReactiveX/RxJS
│  └─ publisher: Ben Lesh
├─ rxjs@6.3.3
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/reactivex/rxjs
│  └─ publisher: Ben Lesh
├─ safe-buffer@5.1.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/feross/safe-buffer
│  └─ publisher: Feross Aboukhadijeh
├─ safer-buffer@2.1.2
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/ChALkeR/safer-buffer
│  └─ publisher: Nikita Skovoroda
├─ sshpk@1.16.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/joyent/node-sshpk
│  └─ publisher: Joyent, Inc
├─ symbol-observable@1.0.1
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/blesh/symbol-observable
│  └─ publisher: Ben Lesh
├─ throttleit@0.0.2
│  ├─ licenses: MIT
│  └─ repository: https://github.com/component/throttle
├─ tough-cookie@2.3.4
│  ├─ licenses: BSD-3-Clause
│  ├─ repository: https://github.com/salesforce/tough-cookie
│  └─ publisher: Jeremy Stashewsky
├─ tslib@1.10.0
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/Microsoft/tslib
│  └─ publisher: Microsoft Corp.
├─ tunnel-agent@0.6.0
│  ├─ licenses: Apache-2.0
│  ├─ repository: https://github.com/mikeal/tunnel-agent
│  └─ publisher: Mikeal Rogers
├─ tweetnacl@0.14.5
│  ├─ licenses: Unlicense
│  ├─ repository: https://github.com/dchest/tweetnacl-js
│  └─ publisher: TweetNaCl-js contributors
├─ twms-frontend-common@0.23.0
│  ├─ licenses: [1m[31mUNLICENSED[39m[22m
│  └─ private: true
├─ uuid@3.3.2
│  ├─ licenses: MIT
│  └─ repository: https://github.com/kelektiv/node-uuid
├─ verror@1.10.0
│  ├─ licenses: MIT
│  └─ repository: https://github.com/davepacheco/node-verror
├─ wrappy@1.0.2
│  ├─ licenses: ISC
│  ├─ repository: https://github.com/npm/wrappy
│  └─ publisher: Isaac Z. Schlueter
├─ zone.js@0.7.8
│  ├─ licenses: MIT
│  ├─ repository: https://github.com/angular/zone.js
│  └─ publisher: Brian Ford
└─ zone.js@0.8.29
   ├─ licenses: MIT
   ├─ repository: https://github.com/angular/zone.js
   └─ publisher: Brian Ford
```
