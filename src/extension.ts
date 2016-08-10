'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

var commandOutput = null;
var spawnCMD = require('spawn-command');

function run(cmd:string, cwd:string) {
  return new Promise((accept, reject) => {
    var opts : any = {};
    if (vscode.workspace) {
      opts.cwd = cwd;
    }
    process = spawnCMD(cmd, opts);
    function printOutput(data) { commandOutput.append(data.toString()); }
    process.stdout.on('data', printOutput);
    process.stderr.on('data', printOutput);
    process.on('close', (status) => {
      if (status) {
        reject(`Command \`${cmd}\` exited with status code ${status}.`);
      } else {
        accept();
      }
      process = null;
    });
  });
}

function exec(cmd:string, cwd:string) {
  if (!cmd) { return; }
  commandOutput.show();
  commandOutput.appendLine(`> Running command \`${cmd}\` in \`${cwd}\`...`)

  run(cmd, cwd)
    .then(() => {
        commandOutput.appendLine(`> Command \`${cmd}\` ran successfully.`);
    })
    .catch((reason) => {
        commandOutput.appendLine(`> ERROR: ${reason}`);
        vscode.window.showErrorMessage(reason, 'Show Output')
    });
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "fc-deploy" is now active!');

    commandOutput = vscode.window.createOutputChannel('Shell');

    let fcDeployCommand = vscode.commands.registerCommand('fc.deploy', () => {
        exec('source ~/.bin/fc-variables.sh && fc-deploy.sh', path.dirname(vscode.window.activeTextEditor.document.uri.fsPath));
    });

    context.subscriptions.push(fcDeployCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}