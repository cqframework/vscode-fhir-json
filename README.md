# VS Code FHIR JSON

This extension provides FHIR JSON tooling for VS Code

## Features

Validation, basic auto-completion, hover information for FHIR JSON

## Usage

This extension activates if an `ig.ini` file is present in the workspace root. It reads the `fhir-version` attribute of that file to determine which version of FHIR is being using the IG. If it can't determine the version it defaults to R4.
