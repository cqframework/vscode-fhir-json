import { window, workspace, Terminal } from 'vscode';

const workSpacePath = workspace.workspaceFolders?.[0].uri.path;

const generateCommand = (fileName: string): string => `${workSpacePath}/${fileName}`;

const createAndShowTerminal = (): Terminal => {
  const terminal = window.createTerminal();
  terminal.show();
  return terminal;
};

export const refreshIg = () => {
  const terminal = createAndShowTerminal();
  terminal.sendText(generateCommand('_refresh.sh'));
};

export const updateCQFTooling = () => {
  const terminal = createAndShowTerminal();
  terminal.sendText(generateCommand('_updateCQFTooling.sh'));
};

