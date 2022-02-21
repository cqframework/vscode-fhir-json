
import path = require("path");
import { window } from 'vscode';
import { execFileSync } from 'child_process';

export const publishIg = () => {
  const child = execFileSync('cat _refresh.sh');
};