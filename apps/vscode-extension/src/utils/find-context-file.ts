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
  // Use VS Code's built-in exclude setting which respects .gitignore
  const excludePattern =
    '{**/node_modules/**,**/dist/**,**/build/**,**/.git/**,**/.*/**}';

  // Handle empty input case
  if (!selectedElements || selectedElements.length === 0) {
    const files = await vscode.workspace.findFiles(
      includePattern,
      excludePattern,
      1000, // Limit the number of files to search
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

  // Recursive function to extract terms from an element and its children
  function extractTermsFromElement(element: SelectedElement, depth = 0) {
    // Stop recursion at depth 3 (element, children, grandchildren)
    if (depth > 3) {
      return;
    }

    // Add full className string with highest weight
    if (
      element.className &&
      typeof element.className === 'string' &&
      element.className.trim().length > 0
    ) {
      priorityTerms.push({ term: element.className.trim(), weight: 11 });
    }

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

    // Process children recursively
    if (element.children && Array.isArray(element.children)) {
      for (const child of element.children) {
        extractTermsFromElement(child, depth + 1);
      }
    }
  }

  // Process each selected element and its children
  for (const element of selectedElements) {
    extractTermsFromElement(element);
  }

  // Limit the number of terms to search for to avoid excessive operations
  const limitedTerms = priorityTerms
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10); // Limit to top 10 terms

  try {
    // Get all candidate files once rather than for each term
    const files = await vscode.workspace.findFiles(
      includePattern,
      excludePattern,
      100, // Limit to 100 files to prevent excessive operations
    );

    // Process each file and check for all terms at once
    for (const fileUri of files) {
      try {
        // Skip files that match .gitignore patterns by checking the scheme
        if (fileUri.scheme === 'file') {
          const document = await vscode.workspace.openTextDocument(fileUri);
          const fileContent = document.getText();
          const uriString = fileUri.toString();

          // Check all terms in this file at once
          for (const { term, weight } of limitedTerms) {
            try {
              // Create a case-insensitive regex for the term
              const regex = new RegExp(
                term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'gi',
              );
              const matches = fileContent.match(regex);

              if (matches) {
                const matchCount = matches.length;
                const currentScore = fileScores.get(uriString) || 0;
                fileScores.set(uriString, currentScore + weight * matchCount);
              }
            } catch (termErr) {
              // Skip terms that cause regex errors
              console.log(`Skipping term '${term}': ${termErr}`);
            }
          }
        }
      } catch (fileErr) {
        // Skip files that can't be opened or analyzed
        console.log(`Skipping file ${fileUri.toString()}: ${fileErr}`);
      }
    }
  } catch (err) {
    console.error(`Error during file search: ${err}`);
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
