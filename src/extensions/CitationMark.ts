import { Mark, mergeAttributes } from '@tiptap/core';

export interface CitationMarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citationMark: {
      setCitation: () => ReturnType;
      unsetCitation: () => ReturnType;
      toggleCitation: () => ReturnType;
    };
  }
}

export const CitationMark = Mark.create<CitationMarkOptions>({
  name: 'citation',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-citation]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
      'data-citation': 'true',
      class: 'citation-marked',
    }), 0];
  },

  addCommands() {
    return {
      setCitation:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      unsetCitation:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      toggleCitation:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },
});

