
import { workspace, ExtensionContext, languages, commands, Uri } from 'vscode';
import { subscribeToDocumentChanges as subscribeToChangesForDiagnostics } from './diagnostics';
import { FHIRJsonCompletionProvider } from './fhirJsonCompletionProvider';
import { FHIRJsonSchemaProvider } from './fhirJsonSchemaProvider';
import { postResource } from './server-actions/postResource';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// Register ig.ini watcher for fhir-version schema updates
	const fileSystemWatcher = workspace.createFileSystemWatcher("ig.ini");
	context.subscriptions.push(fileSystemWatcher);

	const fhirSchemaProvider = new FHIRJsonSchemaProvider(context.extensionPath);
	context.subscriptions.push(workspace.registerTextDocumentContentProvider("fhirjson",  fhirSchemaProvider));

	fileSystemWatcher.onDidCreate(e => fhirSchemaProvider.updateFhirVersion(e));
	fileSystemWatcher.onDidDelete(e => fhirSchemaProvider.updateFhirVersion(e));
	fileSystemWatcher.onDidChange(e => fhirSchemaProvider.updateFhirVersion(e));

	// Register completion provider for auto-completion
	const completionProvider = new FHIRJsonCompletionProvider();
	context.subscriptions.push(languages.registerCompletionItemProvider({ scheme: "file", language: "json"}, completionProvider, ":"));

	// Register for document changes to publish diagnostics
	subscribeToChangesForDiagnostics(context);

	// Register actions to send FHIR resources to a server
	commands.registerCommand('fhir.put', uri => postResource(uri));
}

// this method is called when your extension is deactivated
export function deactivate() {}