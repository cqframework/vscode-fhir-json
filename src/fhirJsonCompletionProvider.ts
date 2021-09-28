
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

        if (!fs.existsSync(parent)) {
            return null;
        }

        const files = fs.readdirSync(parent);

        const ids: { resourceType: string, id: string }[] = [];

        // TODO: This is hard-coded to the current IG tests directory structure. Ideally,
        // this would be detected based on some IG config.
        // Also, glob patterns or something would be better.
        for (const f of files) {
            var child = path.join(parent, f);
            // Ignore root files
            if (!fs.statSync(child).isDirectory()) {
                continue;
            } else {
                const childFiles = fs.readdirSync(child);
                for (const c of childFiles) {
                    var childPath = path.join(child, c);
                    if (fs.statSync(childPath).isDirectory()) {
                        continue;
                    }
                    else {
                        const resource = JSON.parse(fs.readFileSync(childPath, "utf8"));
                        if (resource.resourceType && resource.id) {
                            ids.push({ resourceType: resource.resourceType, id: resource.id });
                        }

                    }
                }

            }
        }

        if (ids.length === 0) {
            return null;
        }

        const items: CompletionItem[] = [];

        for (const i of ids) {
            items.push({ label: `"${i.resourceType}/${i.id}"`, kind: CompletionItemKind.Value, insertText: ` "${i.resourceType}/${i.id}"` });
        }

        return new CompletionList(items);
    }
}