# TwmsFrontendCommon

[[_TOC_]]

## Non-developer usage

Clone this repo on your computer and double-click the "Project Tool.HTA". 
First time, click "Initial Project Setup". 

>  A popup "Please verify installation" will prompt to install **node.js (LTS)** and **.NET Core 2.2 SDK x86 (32bit!)**, regardless of whether or not these perquisites are met. 

Follow the instructions, restart your computer and open the tool again. Then, you can try the Frontend by clicking on "Open Website".

If this is not successful, please refer to the "initial setup"-section below for troubleshooting.

## Initial Setup



1. Install [node.je 12.14.1 LTS](https://nodejs.org/en/download/).

2. Install Angular globally:

        npm install -g @angular/cli@10.1.0

3. To install all dependencies go to the project directory and run:

        npm install

   > This might display several warnings and prompt the user to run `npm audit fix`. This should be ignored.

4. Generate a GitLab personal access token that allows a script to download the latest backend:

    1. Go to https://gitlab.cbb.de/profile/personal_access_tokens.
    2. Choose a name (such as `frontend-dev-accss`).
    3. Check `api`.
    4. Create an `.env` file for environment variables in the project root directory (if not alredy there).

       *Do not check in this file. It is a container for personal information not intended for other people to view.*
    5. Add the personal access token to the `.env` file like this:

           GITLAB_PERSONAL_ACCESS_TOKEN=<your personal access token>

5. We currently run our own local back-end server. For this the following dependencies have to be installed:

    * Our back-end binaries:

          npm run install-backend
      > **Tip for remote work**
      >
      > If this does not work for you due to a flaky network connection, try a manual download:
      >
      > 1. Check `package.json` for the key `backendVersion`.
      > 2. Check gitlab.cbb.de/viega/twms/twms-backend/pipelines?scope=tags to find the pipeline with this tag.
      > 3. Download its `win32-assemble-step` artifacts.
      > 4. Copy the zip file to the cache directory as `third_party/.cache/twms-backend/twms-backend_win32_<VERSION>`.
      > 5. Setup the backend from cache: `npm run install-backend`
    * [Microsoft Visual C++ Redistributable für Visual Studio 2015, 2017 and 2019 (**32bit/x86**)](https://aka.ms/vs/16/release/vc_redist.x86.exe)
    * [Microsoft Visual C++ 2010 Service Pack 1 Redistributable Package MFC](http://www.microsoft.com/de-de/download/details.aspx?id=26999)

6. [Optional] You are most likely using Visual Studio Code. Make sure to check out the `@recommended` extensions for this project. 

7. [Optional] If you plan to develop things related to the chat bot triggered in the CI, you should also add the key `CHAT_BOT_PASSWORD` to the `.env` file.

## Development Server

### Starting the frontend server
There are different ways to run the server:

    # First let's start the backend server.
    npm run start-backend

    # Now we can start the frontend development server using the JIT compiler.
    npm start
    # --- OR ---
    # Start a server reachable from other machines using the AOT compiler.
    npm run mobile

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

In case of npm run mobile, navigate to `http://<IP Adress>:4200/` from external devices or `http://localhost:4200/` on the same device.

The default login credentials for development are:

> Username: supervisor
>
> Password: supervisor

This user has supervisor credentials.

### Backend proxy / API-requests
Angular.json has been modified to always setup a proxy using 'ng serve' as defined in proxy.conf.json. All HttpClient requests are forwarded to localhost:80 by this.

While `-c local` also sets the proxy along other configuration, currently, this is redundant to the ng serve standard config.

## Code scaffolding

Run 
    ng generate component component-name
to generate a new component. You can also use
    ng generate directive|pipe|service|class|guard|interface|enum|module

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Keep an eye on the build size. Good results with:

    npm run build-optimized

The resulting bundle size can be watched with:

    npm run bundle-report

Production builds with specific config can be obtained with:

    npm run build-production

Serve the build artifacts (using a proxy to backend) by running the backend and then:

    npm run serve-artifacts

## Running unit tests

Execute the unit tests via [Karma](https://karma-runner.github.io):

    ng test

## Running end-to-end tests

Run end to end tests via [Protractor](http://www.protractortest.org/):

    # Stand-alone run without a running development server
    npm run e2e
    # Or use an already running development server (much faster for debugging and test development)
    npm run e2e-no-server

> ### Bonus tip
>
> #### Running selected test(s) only
>
> To run a single test, you can **temporarily** change one of the following keywords in the corresponding `*.e2e.spec.ts` file:
>
> `describe` => `fdescribe`
>
> `it` => `fit`
>
> Please do not commit these changes.
>
> #### Ignoring/Skipping test cases
>
> To skip a test, change the `describe` keyword to `xdescribe`. 
>
> Many tests are currently ignored by default, as they were autogenerated while creating a component.



## Updating the back-end
The back-end version we are using is defined in `package.json`. It can be updated like this:

1. Check for the latest back-end version at https://gitlab.cbb.de/viega/twms/twms-backend/-/tags.
2. Update the `backendVersion` variable in `package.json`.
3. Install and start the back-end:

        npm run install-backend
        npm run start-backend

4. If there were any changes in the API you may have to re-generate the swagger services too.

        npm run swagger

5. The backend provides a number of enumerations that are directly fed into the  i18n pipeline. If you suspect, that an update in one of these enumerations occurred, please run `npm run i18n-update-full`. Then check the diff if it contains new entries. These are initialized with (mostly) English wording suggested by the backend. Often the wording has to be changed slightly.
In case that this string contains parameters, the parameter syntax has to be changed to npx translate syntax.
```
"This is an example containing a {{parameter}}."
```

6. If there were any breaking changes in the generated code, fix the application accordingly.
7. Consider making a new frontend release now. This is highly recommended if there were any breaking changes that make the last frontend release incompatible with the latest backend.

## Preconfigured scripts

There are several scripts already containing important configuration. This document mostly suggests using these configured script.

These scripts are found in `package.json` and can be run with the following command:

    npm run <package name>

The following scripts extend `ng serve` and `ng build` with optimization and memory adjustments:

* mobile
* build-optimized
* build-production

The following scripts can be used by developers to generate documentation and artifacts:

* **bundle-report**
* **compodoc** - Generate documentation.
* **clean** - Remove files not under version control, but preserve some exceptions you want to keep.

## Generating Services from Swagger Specification

Some code is generated from an API definition using Swagger Codegen. To regenerate these files run:

    npm run swagger

## Bundle Analyzer

Run the build to export stats:

    npm run build-optimized

The bundle size can be analyzed with:

    npm run bundle-report

The command will open a visualization of the bundle size.

## Generating project documentation

Install compodoc globally with

    npm install -g @compodoc/compodoc

Run

    npm run compodoc

to generate a documentation.

Further info about compdoco is found [here](https://compodoc.app/guides/getting-started.html).

## Using Environments

Angular allows configuring different environment settings for different build targets. This enables us to add optional, experimental or development-only code. See `src/environments/` for the configurations. In the code the `environment` object is imported as usual.

    import { environment } from './environments/environment';

    // ...

    if (environment.enableFoo) {
      enableTheFoo();
    }

## Making a release
We are using the [git-flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model to support a release process heavily relying on manual testing.

> 🧠 Always keep in mind that the `npm version` commands you are about to enter behave differently depending on the branch you are on.

### Making an actual release
So here is a quick overview, of what we are going to do (top to botton):
```
         develop         release/1.2.3    master
           |                                |
1. [npm version 1.2.3]-------->|            |         Create a release branch
           |                   |            |         and first release
           |             tag:v1.2.3-rc.0    |         candidate.
           |                   |            |
2.         |                  ...           |         Test and add fixes.
           |                   |            |
3.         |       [npm version prerelease] |         Create second release
           |                   |            |         candidate.
           |             tag:v1.2.3-rc.1    |
           |                   |            |
4.         |          [npm version 1.2.3]   |         Turn release candidate
           |                   |            |         into release.
           |               tag:v1.2.3       |
           |                   |            |
6.         |<------------------+----------->|         Merge release into
           |                                |         develop and master.
```
Now let's look into the details:
#### 1. Start a new release branch
[on `develop` branch]
```
# Check current version
npm version
# Set new version, create branch and publish it on remote
npm version <version>
```
`<version>` is given as `1.2.3` or similar - without any pre-release postfix.
Alternatively all other `npm version` commands can be used to modify parts of the verison number.
The new branch is called `release/<version>`. Two WIP merge request (for `master` and `development`) are created automatically.
The initial commit on the release branch is tagged as `<version>-rc.0`.

A browser window is going to open asking you to fill in the release notes. An `rc.0` changelog should document what changed since the last full (non-`dev`) release.

[The release candidate](https://gitlab.cbb.de/viega/twms/twms-frontend-common/-/pipelines?scope=tags) is announced in the *TWMS DevTalk* chatroom so that all stakeholders are informed about its availability.

#### 2. Testing and bug fixing [optional]
[on `release/<version>` branch]

If issues arrise while testing, fix them on the release branch. 

#### 3. Create new release candidate [optional]
[on `release/<version>` branch]
```
npm version prerelease
```
The new release candidate is tagged with `<version>-rc.<release candidate number>`.

A browser window is going to open asking you to fill in the release notes. An incremental `rc.<X>` release candidate (with `X` > 0) changelog should only describe what changed since the previous `rc`.

Return to step 2 to continue testing.

#### 4. Finalizing the release
[on `release/<version>` branch]
```
npm version <version>
```
The release is tagged with `<version>` and  is announced in the chat.

A browser window is going to open asking you to fill in the release notes. The changelog should merge the release notes from all `rc`s on the branch.

#### 5. Merge back changes
Now it is time to do some post-release work.
A browser tab will open for reviewing the two merge requests. Review and merge as usual.

### Making a developoment release
A "development release" is not a tested release, ready for being used outside the team, but basically a tag on the `develop` branch allowing sharing of recent work.

A development release on the current `HEAD` can be created in one step:
```
npm version prerelease
```
A branch is created with the name `prerelease/<version>-<dev release number>`.
The release is tagged with `<version>-dev.<dev release number>`. The `<version>` increments the patch version by one. The `<dev release number>` is reset to 0 after the next regular release.

> The tag is available instantly, but make sure to get the branch reviewed and merged back into `development`.

## Adding Icons
We are using a modified version of the official Viega icon font. To add further icons to the font follow these steps:

1. Open the IcoMoon online font editor at https://icomoon.io/app/#/projects.
2. Click "Import Project" and upload the project file from `src/assets/icon-font/Viega-Icon-Font (extended).json`.
3. Load the project.
4. Add your new icons to the end of the "Additional Icons" icon set.
5. Click "Generate Font" to download the font.
6. Go to https://icomoon.io/app/#/projects to download the modified project file.
7. Replace `src/app/shared/lib/viega-common/fonts/Viega-Iconfont-v1-9-1.woff` with the downloaded font.
8. Replace `src/assets/icon-font/Viega-Icon-Font (extended).json` with the downloaded project file.

## i18n Workflow
### Adding string keys
We are using ngx-translate to translate keys into languages. 
To add a new string, first define a key for it. If possible use the translation pipe in a template:

```
'MY_CATEGORY.MY_KEY' | translate
// or us a variable instead
myKeyVariable | translate
```

You can also do advanced stuff with translations pipes:
* [Parameterized strings](https://github.com/ngx-translate/core#4-use-the-service-the-pipe-or-the-directive):

      <div>{{ 'HELLO' | translate:param }}</div>

* [Pluralization](https://angular.io/api/common/I18nPluralPipe):

      {{controllersInErrorStateCount | i18nPlural: { '=1': 'APP.GLOBAL_ERROR_MESSAGE_SINGULAR', 'other': 'APP.GLOBAL_ERROR_MESSAGE_PLURAL' } | translate: { controllerCount: controllersInErrorStateCount } }}

If it is not possible to use the translation pipe in a template, you can also use [`TranslateService`](https://github.com/ngx-translate/core#translateservice) to get translated strings in TypeScript code.

### Preparing automatic string extraction
We are running a script that extracts all translation keys from TypeScript code and templates. Unfortunately this parser is pretty dumb. So it only identifies the most simple cases:
* A template passing a string literal directly to the translation pipe:

      'FOO.BAR' | translate

* `TranslationService.get()` calls with a single string:

      this.translate.get('FOO.BAR')

If you are having a more complex case, you have the following options:
* In TypScript code, use a marker function to mark a string for extraction.
  ```
  import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

  // ...
  const myKey = _('EXAMPLE.FOO');
  ```
* In templates try to structure your code to use the `translate` pipe directly.
  ```
  // Instead of
  {{(isBarebone ? 'FOO' : 'BAR') | translate}}
  // use the translate pipe directly
  {{isBarebone ? ('FOO' | translate) : ('BAR' | translate)}}
  ```
* In more complex cases you can also move a string from the template into the TypScript code and use the `_()` marker function there.

### Updating the translation files
After adding one or more string keys, you need to update the translation files:

```
npm run i18n-update
```

This will extract all keys from the project and will insert new keys into the language files such as `de.json`.

Now you can edit the updated language files to insert the actual translations for the newly extracted keys.

> **Bonus tip**
>
> If you are using Visual Studio Code, the extension `i18n ally` helps finding missing keys and keeping an overview.

## Error Handling
When talking about error handling we mainly have to think about expected and unexpected issues when communicating with the backend.

### Stages of error Handling
1. **Global error handling**<br>
  Session end and connection loss are handled in `AuthInterceptor`.
2. **Custom error handling**<br>
  Most API calls are likely to need custom error handling, but sometimes just going with the default (stage 1 and 3) is fine.
3. **Fallback error handling**<br>
  *Any* unhandled exceptions (including network issues) are caught in `GlobalErrorHandler`. A toast is shown displaying a very general error message.

### Advice for custom error handlers
### Dos
* If possible, prevent errors in the UI before they can occur.
* Often `NotificationService` is used to show a message. In important cases a popup dialog may also be justified.
* Also printing the error object using `console.error()` for debugging and error reporting is usually a good idea. Console output may be turned off in production.
* When checking against a list of expected error cases, always fall back to a general "Someting went wrong"-type default message in case of an unknown error type.
* Think about the general state of a view in case that an error occurs. Is there data that has to be reset? How can the user get out of the error situation?
* If the call was not really essential, it may be fine to just swallow the error silently by using an empty error handler.
* When wording an error message think about the context it is shown in:
  * **Popup dialog**: No length limitations. Should be a proper sentence ending with a colon.
  * **Toast**: Use bullet point style wording instead of full sentence to keep it short. Do not end with a colon.

### Donts
* Don't add dummy placeholder error handlers. Such as this:
  ```
  this.someService.someCall().subscribe(
    () => { /* handle success */ },
    // DON'T DO THIS:
    (error) => {
      // TODO: add error handling      
    },
  );
  ```
  These would block the fallback error handling. If you really want to postpone error handling for later, just leave a `TODO` without an empty function body.
* Never display raw strings sent from the backend to the user. Printing them to the console is fine though.




