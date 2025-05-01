import type { SelectedElement } from '@stagewise/extension-toolbar-srpc-contract';
import * as vscode from 'vscode';

export async function findContextFile(
  selectedElements: SelectedElement[],
): Promise<vscode.Uri | null> {
  // Handle no active workspace case
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    return null;
  }

  // File patterns to include/exclude
  const includePattern = '**/*.{js,jsx,ts,tsx,vue,svelte,html,css,scss,less}';
  const excludePattern =
    '{**/node_modules/**,**/dist/**,**/build/**,**/.git/**}';

  // Handle empty input case
  if (!selectedElements || selectedElements.length === 0) {
    const files = await vscode.workspace.findFiles(
      includePattern,
      excludePattern,
    );
    if (files.length > 0) {
      const randomIndex = Math.floor(Math.random() * files.length);
      return files[randomIndex];
    }
    return null;
  }

  // Map to track file scores
  const fileScores = new Map<string, number>();

  // Extract and weight search terms from selected elements
  const priorityTerms: { term: string; weight: number }[] = [];

  for (const element of selectedElements) {
    // Add id with highest weight
    if (element.id) {
      priorityTerms.push({ term: element.id, weight: 10 });
    }

    // Add data attributes with high weight
    if (element.dataAttributes) {
      for (const [key, value] of Object.entries(element.dataAttributes)) {
        if (value && typeof value === 'string' && value.trim().length > 0) {
          priorityTerms.push({ term: value.trim(), weight: 8 });
        }
      }
    }

    // Add name with medium weight
    if (element.name) {
      priorityTerms.push({ term: element.name, weight: 6 });
    }

    // Add class list items with lower weight
    if (element.classList) {
      for (const className of element.classList) {
        if (className && className.trim().length > 3) {
          priorityTerms.push({ term: className.trim(), weight: 4 });
        }
      }
    }

    // Add non-trivial innerText with lowest weight
    if (element.innerText && element.innerText.trim().length > 5) {
      priorityTerms.push({ term: element.innerText.trim(), weight: 2 });
    }
  }

  // Search terms in files
  for (const { term, weight } of priorityTerms) {
    try {
      // Create search query and options
      const query = new vscode.RelativePattern(
        vscode.workspace.workspaceFolders[0],
        includePattern,
      );

      // Use vscode.workspace.findFiles to get candidate files
      const files = await vscode.workspace.findFiles(query, excludePattern);

      for (const fileUri of files) {
        try {
          const document = await vscode.workspace.openTextDocument(fileUri);
          const fileContent = document.getText();

          // Create a case-insensitive regex for the term
          const regex = new RegExp(
            term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'gi',
          );
          const matches = fileContent.match(regex);

          if (matches) {
            const matchCount = matches.length;
            const uriString = fileUri.toString();
            const currentScore = fileScores.get(uriString) || 0;
            fileScores.set(uriString, currentScore + weight * matchCount);
          }
        } catch (err) {
          // Skip files that can't be opened or analyzed
          console.error(`Error processing file ${fileUri.toString()}: ${err}`);
        }
      }
    } catch (err) {
      console.error(`Error searching for term '${term}': ${err}`);
    }
  }

  // Find the file with the highest score
  let bestFileUri: string | null = null;
  let highestScore = 0;

  for (const [fileUri, score] of fileScores.entries()) {
    if (score > highestScore) {
      highestScore = score;
      bestFileUri = fileUri;
    }
  }

  // Return the best file if found, otherwise null
  return bestFileUri ? vscode.Uri.parse(bestFileUri) : null;
}
