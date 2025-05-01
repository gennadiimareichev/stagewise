import * as vscode from 'vscode';
import { DIAGNOSTIC_COLLECTION_NAME } from '../constants';
import type { SelectedElement } from '@stagewise/extension-toolbar-srpc-contract';
import { findContextFile } from './find-context-file';

export async function callCursorAgent(
  prompt: string,
  selectedElements: SelectedElement[],
): Promise<void> {
  let document: vscode.TextDocument | undefined;
  const fakeDiagCollection = vscode.languages.createDiagnosticCollection(
    DIAGNOSTIC_COLLECTION_NAME,
  );
  try {
    let contextFile = await findContextFile(selectedElements); // This is the open text document that will be used as context for the agent -> Will be a random document, if no context file is found
    if (!contextFile) {
      const files = await vscode.workspace.findFiles(
        '**/*.{js,jsx,ts,tsx,vue,svelte,html,css,scss,less}',
      );
      if (files.length === 0) {
        vscode.window.showErrorMessage('No suitable files found in workspace');
        return;
      }
      const randomIndex = Math.floor(Math.random() * files.length);
      contextFile = files[randomIndex];
    }

    const editor = await vscode.window.showTextDocument(contextFile);
    document = editor.document; // Get document early

    const selectionOrFullDocRange = editor.selection.isEmpty
      ? new vscode.Range(0, 0, document.lineCount, 0) // Fallback to full doc if no selection
      : editor.selection; // Use actual selection if available

    const fakeDiagnostic = new vscode.Diagnostic(
      selectionOrFullDocRange,
      prompt,
      vscode.DiagnosticSeverity.Error,
    );
    fakeDiagnostic.source = DIAGNOSTIC_COLLECTION_NAME;

    fakeDiagCollection.set(document.uri, [fakeDiagnostic]);

    // 3. Ensure cursor is within the diagnostic range (e.g., start)
    // This might help with the '@composer.isCursorOnLint' context, but may not be sufficient
    editor.selection = new vscode.Selection(
      selectionOrFullDocRange.start,
      selectionOrFullDocRange.start,
    );

    await vscode.commands.executeCommand('composer.fixerrormessage');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error finding context file: ${error instanceof Error ? error.message : String(error)}`,
    );
    return;
  } finally {
    if (document) {
      fakeDiagCollection.delete(document.uri);
    } else {
      fakeDiagCollection.clear();
    }
    fakeDiagCollection.dispose();
  }
}
