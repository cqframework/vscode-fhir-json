# VS Code FHIR JSON

This extension provides FHIR JSON tooling for VS Code

## Features

Validation, basic auto-completion, hover information for FHIR JSON

## Usage

This extension activates if an `ig.ini` file is present in the workspace root. It reads the `fhir-version` attribute of that file to determine which version of FHIR is being using the IG. If it can't determine the version it defaults to R4.

## Publishing

Building locally:

    npm install

Install the VSCode publishing tool:

    npm install -g vsce

Create a VSIX package:

    vsce package

Publish the package:

    vsce publish

> NOTE: You'll need a Personal Access Token for this step, see details here: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
