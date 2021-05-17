# i18n-ui5

The tool to check and synchronize i18n messages file from
source code of SAPUI5/OpenUI5 application

The tool searches patterns:

  * \_\_("MSGID")
  * getText("MSGID")
  * "{i18n&gt;MSGID}"
  * "{@i18n&gt;MSGID}"

Then activate/deactivate/add messages in/to `i18n.properties`
file which is used for the translations.

## Install

```
	npm install i18n-ui5
```

## Usage

Check current i18n file if contains all messages from source codes.
The i18n file is webapp/i18n/i18n.properties by default.


```
	npx i18n-ui5 --check
```

Update i18n file by changes in source code.


```
	npx i18n-ui5 --replace
```


Use different destination file


```
	npx i18n-ui5 --replace --destination i18n.properties
```
