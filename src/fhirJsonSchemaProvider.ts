import path = require("path");
import * as fs from 'fs';
import { CancellationToken, EventEmitter, ProviderResult, TextDocumentContentProvider, Uri } from "vscode";

export class FHIRJsonSchemaProvider implements TextDocumentContentProvider {

	private _extensionPath: string;
	private _fhirVersion: string = "r4";

	constructor(extensionPath: string) {
		this._extensionPath = extensionPath;
	}

	private _onDidChange = new EventEmitter<Uri>();

	get onDidChange() {
		return this._onDidChange.event;
	}

	provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
 		const schemaPath = path.resolve(this._extensionPath, "schema", this._fhirVersion, "fhir.schema.json");
		return fs.readFileSync(schemaPath, 'utf8');
	}

	updateFhirVersion(igPath: Uri) {
		if (!fs.existsSync(igPath.fsPath)) {
			this._fhirVersion = "";
		}
		else {
			this._fhirVersion = this.parseIg(igPath);
		}

		this._onDidChange.fire(Uri.parse("fhirjson://schema"));
	}

	dispose() {
		this._onDidChange.dispose();
	}

	parseIg(igPath: Uri): string {
		const file = fs.readFileSync(igPath.fsPath, 'utf8');
		const lines = file.replace(/\r\n/g,'\n').split('\n');

		for (const line of lines) {
			if (line.startsWith("fhir-version")){
				return this.convertFhirVersion(line.split("=")[1]);
			}
		}

		return "r4";
	}

	convertFhirVersion(versionNumber: string) {
		if (versionNumber.startsWith("5") || versionNumber === "4.6.0") {
			return "r5";
		}
		else if (versionNumber.startsWith("4")) {
			return "r4";
		}
		else if (versionNumber.startsWith("3")) {
			return "dstu3";
		}
		else {
			return "r4";
		}
	}
}