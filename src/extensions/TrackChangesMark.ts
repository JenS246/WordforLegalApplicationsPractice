import { Mark, mergeAttributes } from '@tiptap/core';

export interface InsertionMarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface DeletionMarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertionMark: {
      acceptInsertion: () => ReturnType;
    };
    deletionMark: {
      rejectDeletion: () => ReturnType;
      acceptDeletion: () => ReturnType;
    };
  }
}

export const InsertionMark = Mark.create<InsertionMarkOptions>({
  name: 'insertion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ins',
      },
      {
        tag: 'span[data-insertion]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ins', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-insertion': 'true',
      class: 'track-insertion-inline',
    }), 0];
  },

  addCommands() {
    return {
      acceptInsertion:
        () =>
        ({ commands }) => {
          // Remove the insertion mark but keep the text
          return commands.unsetMark(this.name);
        },
    };
  },
});

export const DeletionMark = Mark.create<DeletionMarkOptions>({
  name: 'deletion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'del',
      },
      {
        tag: 'span[data-deletion]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-deletion': 'true',
      class: 'track-deletion-inline',
    }), 0];
  },

  addCommands() {
    return {
      rejectDeletion:
        () =>
        ({ commands }) => {
          // Remove the deletion mark but keep the text (reject = keep text)
          return commands.unsetMark(this.name);
        },
      acceptDeletion:
        () =>
        ({ chain, state }) => {
          // Accept deletion = remove the text entirely
          const { from, to } = state.selection;
          return chain()
            .deleteRange({ from, to })
            .run();
        },
    };
  },
});

