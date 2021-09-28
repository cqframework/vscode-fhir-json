import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, ExtensionContext, languages, Range, TextDocument, window, workspace } from "vscode";
import path = require('path');
import { findNodeAtLocation, getLocation, getNodeValue, Node, parseTree } from 'jsonc-parser';

function refreshDiagnostics(doc: TextDocument, fhirJsonDiagnostics: DiagnosticCollection): void {
	if (doc.languageId !== "json") {
		return;
	}

	const diagnostics = getDiagnostics(doc);
	fhirJsonDiagnostics.set(doc.uri, diagnostics);
}

function getDiagnostics(doc: TextDocument): Diagnostic[] {
	const diagnostics : Diagnostic[] = [];

	const filename = path.parse(doc.fileName).name;
	const tree = parseTree(doc.getText());
	if (!tree) {
		return diagnostics;
	}

	// Could add a warning if resourceType / file hierarchy don't match...
	const resourceTypeNode = findNodeAtLocation(tree, ["resourceType"]);
	if (!resourceTypeNode) {
		return diagnostics;
	}

	const idNode = findNodeAtLocation(tree, ["id"]);
	if (!idNode) {
		return diagnostics;
	}
	
	const id = getNodeValue(idNode);
	if (id && id !== filename) {
		const range = new Range(doc.positionAt(idNode.offset), doc.positionAt(idNode.offset + idNode.length));
		diagnostics.push(new Diagnostic(range, "Resource id does not match the filename", DiagnosticSeverity.Warning));
	}

	return diagnostics;
}

export function subscribeToDocumentChanges(context: ExtensionContext): void {
    const fhirJsonDiagnostics = languages.createDiagnosticCollection("fhir-json");
	context.subscriptions.push(fhirJsonDiagnostics);

	if (window.activeTextEditor) {
		refreshDiagnostics(window.activeTextEditor.document, fhirJsonDiagnostics);
	}
	context.subscriptions.push(
		window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, fhirJsonDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, fhirJsonDiagnostics))
	);

	context.subscriptions.push(
		workspace.onDidCloseTextDocument(doc => fhirJsonDiagnostics.delete(doc.uri))
	);
}