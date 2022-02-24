import { window, workspace, Terminal } from 'vscode';
import { exec } from 'child_process';
const workSpacePath = workspace.workspaceFolders?.[0].uri.path;

export const refreshIg = () => {
  const pathAndScript: string = workSpacePath + '/_refresh.sh';
  window.showInformationMessage(pathAndScript);
  exec(pathAndScript, function (error, stdout, stderr) {
    console.log(stdout);
    if(error){ console.log(error); };
    if(stderr){ console.log(stderr); };
  });
};

export const updateCQFTooling = () => {
  const pathAndScript: string = workSpacePath + '/_updateCQFTooling.sh';
  window.showInformationMessage(pathAndScript);
  exec(pathAndScript, function (error, stdout, stderr) {
    console.log(stdout);
    if(error){ console.log(error); };
    if(stderr){ console.log(stderr); };
  });
};