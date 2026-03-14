const path = require('path');
const { spawn } = require('child_process');
const vscode = require('vscode');

function getApiKey() {
  const config = vscode.workspace.getConfiguration('commitJugaadism');
  const key = config.get('geminiApiKey');
  if (key && typeof key === 'string' && key.trim()) return key.trim();
  return process.env.GEMINI_API_KEY || '';
}

function runCli(extensionPath, workspaceFolder, dryRun) {
  const apiKey = getApiKey();
  if (!apiKey) {
    vscode.window.showErrorMessage(
      'Commit Jugaadism: Set your Gemini API key in settings (commitJugaadism.geminiApiKey) or GEMINI_API_KEY env. Get a key at https://aistudio.google.com/apikey'
    );
    return;
  }

  const cliPath = path.join(extensionPath, 'cli', 'cli.js');
  const args = dryRun ? ['--dry-run'] : [];
  const env = { ...process.env, GEMINI_API_KEY: apiKey };

  const child = spawn(process.execPath, [cliPath, ...args], {
    cwd: workspaceFolder,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

  child.on('close', (code) => {
    const out = (stdout + stderr).trim();
    if (code === 0) {
      if (dryRun && out) vscode.window.showInformationMessage(`Commit message: ${out}`);
      else if (!dryRun && out) vscode.window.showInformationMessage(out);
    } else if (stderr.trim()) {
      vscode.window.showErrorMessage(`Commit Jugaadism: ${stderr.trim().split('\n')[0]}`);
    }
  });

  child.on('error', (err) => {
    vscode.window.showErrorMessage(`Commit Jugaadism: ${err.message}`);
  });
}

function activate(context) {
  const extensionPath = context.extensionPath;
  context.subscriptions.push(
    vscode.commands.registerCommand('commitJugaadism.commit', () => {
      const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
      if (!folder) {
        vscode.window.showErrorMessage('Commit Jugaadism: Open a workspace folder first.');
        return;
      }
      runCli(extensionPath, folder.uri.fsPath, false);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('commitJugaadism.commitDryRun', () => {
      const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
      if (!folder) {
        vscode.window.showErrorMessage('Commit Jugaadism: Open a workspace folder first.');
        return;
      }
      runCli(extensionPath, folder.uri.fsPath, true);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
