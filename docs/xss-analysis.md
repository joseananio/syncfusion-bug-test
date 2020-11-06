# XSS Prevention in the AquaVIP frontend
> 2020-06-15<br/>
> stephan.schuster@<br/>
> Reviewed Version: be957e3e62cd2478a9199ab48e010c9dfad19942

Angular has built in sanitization mechanisims, so XSS attacks are often prevented by default. But there are ways to circumvent these protections deliberately or by accident. Theses shall be examined here.

## Direct, unsanitized DOM access
Any e2e testing code doing a direct DOM access is not reviewed here.

*  ✔ `src\app\notifications\open-notifications\open-notifications.component.ts`

   Code accessing the DOM directly is commented out.

* ✔ `src\app\shared\lib\viega-common\lib\app-widget\app-widget.component.ts`

  Code accessing the DOM directly is not called.

* ✔ `src\app\shared\lib\viega-common\lib\colorpicker\colorpicker.component.ts`

  The viega-common `ColorpickerComponent` is not used in the application.

* ✔ `src\app\user-management\users\users.component.ts`

  Code accessing the DOM directly is commented out.

## Template generation
Dynamic template generation would constitute a severe XSS vector. This technique is not used anywhere in the application.

## Usage of `bypassSecurityTrust...()` functions

* ✔ `src\app\shared\directives\dragDrop.directive.ts`

  Unused code.

* ✔ `src\app\shared\lib\viega-common\lib\trust-html.pipe.ts`

  The `TrustHtmlPipe` from viega-common is not used anywhere in the application.

## Third-party code
When running `npm audit --prod` to learn about known issues in third-party libraries, a single issue
is reported: https://npmjs.com/advisories/1179.
This potential prototype pollution issue in `minimist` does not constitute any thread for the
application. An attacker cannot control the input handled by `minimist`.

## Conclusion
No XSS attack vectors could be identified.
