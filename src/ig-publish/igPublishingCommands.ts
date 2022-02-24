import { window, workspace, Terminal } from 'vscode';

const workSpacePath = workspace.workspaceFolders?.[0].uri.path;

const generateCommand = (fileName: string): string => `${workSpacePath}/${fileName}`;

const createAndShowTerminal = (): Terminal => {
  const terminal = window.createTerminal();
  terminal.show();
  return terminal;
};

export const runIGScripts = (scriptName: string): void => {
  const terminal = createAndShowTerminal();
  terminal.sendText(generateCommand(scriptName));
};