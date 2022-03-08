import { window ,workspace, Uri } from "vscode";
import { readFileSync } from 'fs';
import fetch from "cross-fetch";

const displayMessage = (message: string, error?: boolean): void => {
  console.log(message);
  error ? window.showErrorMessage(message) : window.showInformationMessage(message);
};

const buildFhirUrl = async (resourceType: string, id: string): Promise<string> => {
  const { get, update } = workspace.getConfiguration();
  let baseUrl = get('fhir.serverUrl');

  if (baseUrl === null || '') {
    baseUrl = await window.showInputBox({
      placeHolder: "FHIR Base URL",
      prompt: "Please provide a open FHIR endpoint"
    });
    update('fhir.serverUrl', baseUrl, true);
  };

  displayMessage(`FHIR Server URL is set to ${baseUrl}. You may change this in your VS Code Global Settings`);
 
  return `${baseUrl}/${resourceType}/${id}`;
};

export const postResource = async (uri: Uri) => {
  // @ts-ignore JSON.parse accepts both a buffer and string but TS throws an error 
  const fhirObject = JSON.parse(readFileSync(uri.fsPath));
  const { id, resourceType } = fhirObject;
  const fhirServerUrl: string = await buildFhirUrl(resourceType, id);

  const response = await fetch(fhirServerUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json+fhir' },
    body: JSON.stringify(fhirObject)
  });

  const responseBody = JSON.stringify(await response.json());
  response.ok ? displayMessage(responseBody) : displayMessage(responseBody, true);
};