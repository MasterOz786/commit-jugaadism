# Publishing to VS Code Marketplace

## Prerequisites

- Add a `LICENSE` file (e.g. MIT) in `vscode-extension/` or the repo root if the pack step warns.

1. **Azure DevOps account** (for the marketplace)
   - Go to [https://dev.azure.com](https://dev.azure.com) and sign in (or create account).
   - Create a **Personal Access Token** (PAT) with **Marketplace (Publish)** scope:
     - User Settings (top right) → Personal access tokens → New Token.
     - Name it (e.g. "VS Code Publish"), set expiration, scopes: **Marketplace (Publish)** → Create.
     - Copy the token; you won’t see it again.

2. **Install vsce** (VS Code Extension Manager)
   ```bash
   npm install -g @vscode/vsce
   ```

3. **Publisher**
   - In [VS Code Marketplace](https://marketplace.visualstudio.com/), sign in with the same Microsoft account as Azure DevOps.
   - Create a publisher if you don’t have one: [Manage Publishers](https://marketplace.visualstudio.com/manage) → Create Publisher.
   - Use that **publisher id** in the extension’s `package.json` (see below).

## Update package.json

In `vscode-extension/package.json` set a unique **publisher** (e.g. your username or org):

```json
"publisher": "YourPublisherId"
```

Ensure **name** is unique (e.g. keep `commit-jugaadism` or use something like `commit-jugaadism-ai`).

## Pack and publish

From the repo root:

```bash
cd vscode-extension
vsce package
```

This creates `commit-jugaadism-1.0.0.vsix`. Test it locally:

- In VS Code: Extensions view → "..." → **Install from VSIX** → select the `.vsix` file.

To publish to the marketplace:

```bash
vsce publish
```

When prompted:

- **Repository URL**: your repo URL (e.g. `https://github.com/YourOrg/commit-jugaadism`).
- **Personal Access Token**: paste the Azure DevOps PAT.

Or use a one-liner (token in env):

```bash
export VSCE_PAT=your_azure_devops_pat
vsce publish
```

## Version updates

1. Bump `version` in `vscode-extension/package.json` (e.g. `1.0.1`).
2. Run `vsce publish` again from `vscode-extension/`.

## Links

- [Publishing Extensions (official docs)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI](https://github.com/microsoft/vscode-vsce)
