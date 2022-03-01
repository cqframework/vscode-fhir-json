import { window, Uri } from "vscode";
import { readFileSync } from 'fs';
import fetch from "cross-fetch";

const buildFhirServerUrl = async (resourceType: string, id: string): Promise<string> => {
  const baseUrl = await window.showInputBox({
    placeHolder: "FHIR Base URL",
    prompt: "Please provide a open FHIR endpoint"
  });
  // const baseUrl = 'http://localhost:8080/fhir';
  return `${baseUrl}/${resourceType}/${id}`;
};

export const postResource = async (uri: Uri) => {
  // @ts-ignore JSON.parse accepts both a buffer and string but TS throws an error 
  const fhirObject = JSON.parse(readFileSync(uri.fsPath));
  const { id, resourceType } = fhirObject;

  const fhirServerUrl: string = await buildFhirServerUrl(resourceType, id);
  const { showInformationMessage, showErrorMessage } = window;

  const response = await fetch(fhirServerUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json+fhir' },
    body: JSON.stringify(fhirObject)
  });

  response.ok ? showInformationMessage(`The resource was posted to ${fhirServerUrl} and the server responded with ${response.status}: ${response.statusText}`) :
    showErrorMessage(`The resource was rejected by ${fhirServerUrl} and the server responded with ${response.status}: ${response.statusText}`);
};