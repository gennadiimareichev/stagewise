'use client';

import type { ToolbarPlugin } from '@stagewise/toolbar';
import { ToolbarAction } from './ui/actionButton';

export const A11yPlugin: ToolbarPlugin = {
  displayName: 'A11y',
  description: 'Accessibility Checker',
  iconSvg: null,
  promptContextName: 'a11y',

  onLoad: (toolbar) => {
    toolbar.renderToolbarAction(ToolbarAction);
  },

  onPromptingStart: () => {
    return {
      contextSnippetOffers: [
        {
          displayName: 'Console errors',
          content: 'Check the console for errors',
          promptContextName: 'console-errors',
          iconUrl:
            'https://static-00.iconduck.com/assets.00/alert-circle-icon-512x512-zlbuu4fc.png',
        },
      ],
    };
  },
};
