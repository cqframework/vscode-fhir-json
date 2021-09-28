
import * as fs from 'fs';
import { getLocation } from 'jsonc-parser';
import path = require('path');
import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument } from 'vscode';

export class FHIRJsonCompletionProvider implements CompletionItemProvider {
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
        for (const f of files) {
            var name = path.join(patientDir, f);
            if (fs.statSync(name).isDirectory()) {
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
            items.push({ label: `"Patient/${i}"`, kind: CompletionItemKind.Value, insertText: ` "Patient/${i}"` });
        }

        return new CompletionList(items);
    }
}