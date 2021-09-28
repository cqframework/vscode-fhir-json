import * as fs from 'fs';
import path = require('path');
import { getLocation } from 'jsonc-parser';
import { TextDocumentContentProvider, workspace, ExtensionContext, Event, Uri, CancellationToken, ProviderResult, commands, window, EventEmitter, CompletionItemProvider, CompletionContext, CompletionItem, CompletionList, Position, TextDocument, languages, CompletionItemKind } from 'vscode';


class FHIRJsonCompletionProvider implements CompletionItemProvider {
	provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
		const offset = document.offsetAt(position);
		const location = getLocation(document.getText(), offset);
		if (!location.matches(["*", "reference"])) {
			return null;
		}

		const parent = path.resolve(document.uri.fsPath, "../..");

		const patientDir = path.join(parent, "Patient");

		if (!fs.existsSync(patientDir)) {
			return null;
		}

		const ids: string[] = [];
		const files = fs.readdirSync(patientDir);
		for (const f of files){
			var name = path.join(patientDir, f);
			if (fs.statSync(name).isDirectory()){
				continue;
			} else {
				const resource = JSON.parse(fs.readFileSync(name, "utf8"));
				if (resource.resourceType && resource.resourceType === "Patient" && resource.id) {
					ids.push(resource.id);
				}
			}
		}

		if (ids.length === 0) {
			return null;
		}

		const items: CompletionItem[] = [];

		for (const i of ids) {
			items.push({ label: `"Patient/${i}"`, kind : CompletionItemKind.Value, insertText: ` "Patient/${i}"`});
		}

		return new CompletionList(items);
	}
}
class FHIRJsonSchemaProvider implements TextDocumentContentProvider {

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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const fileSystemWatcher = workspace.createFileSystemWatcher("ig.ini");
	context.subscriptions.push(fileSystemWatcher);

	const fhirSchemaProvider = new FHIRJsonSchemaProvider(context.extensionPath);
	context.subscriptions.push(workspace.registerTextDocumentContentProvider("fhirjson",  fhirSchemaProvider));

	fileSystemWatcher.onDidCreate(e => fhirSchemaProvider.updateFhirVersion(e));
	fileSystemWatcher.onDidDelete(e => fhirSchemaProvider.updateFhirVersion(e));
	fileSystemWatcher.onDidChange(e => fhirSchemaProvider.updateFhirVersion(e));

	const completionProvider = new FHIRJsonCompletionProvider();
	context.subscriptions.push(languages.registerCompletionItemProvider({ scheme: "file", language: "json"}, completionProvider, ":"));
}

// this method is called when your extension is deactivated
export function deactivate() {}
