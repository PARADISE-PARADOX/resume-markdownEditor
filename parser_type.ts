export interface Rules {
  markdown: {
      heading: RegExp;
      bold: RegExp;
      italic: RegExp;
      link: RegExp;
      image: RegExp;
      inlineCode: RegExp;
      hr: RegExp;
      list: RegExp;
      blockquote: RegExp;
      codeBlock: RegExp;
      strikethrough: RegExp;
      underline: RegExp;
      subscript: RegExp;
      superscript: RegExp;
      audio: RegExp;
      checkboxUnchecked: RegExp;
      checkboxChecked: RegExp;
      highlight: RegExp;
      math: RegExp;
      table: {
          header: RegExp;
          separator: RegExp;
          row: RegExp;
      };
      footnoteReference: RegExp;
      footnoteDefinition: RegExp;
      document: RegExp;
      paragraph: RegExp;
  };
}

export interface ASTNode {
  type: string;
  nesting?: ASTNode[];
  multilevel?: 1 | 2 | 3 | 4 | 5 | 6;
  value?: string;
  url?: string;
  ordered?: boolean;
  language?: string;
  alt?: string;
  alignment?: ('left' | 'middle' | 'right')[];
  tableHeader?: boolean;
  title?: string;
}

export type Node = ASTNode;

export type InlineType =
  | "text"
  | "bold"
  | "italic"
  | "strikethrough"
  | "inlineCode"
  | "link"
  | "image"
  | "underline"
  | "highlight"
  | "superscript"
  | "subscript"
  | "inlineMath"
  | "audio";

export type TextToken = { type: "text"; value: string };
export type CodeToken = { type: "inlineCode"; value: string };
export type MediaToken = { type: "image" | "audio"; url: string; alt: string };
export type LinkToken = { type: "link"; url: string; nesting: InlineToken[] };
export type NestingToken = {
  type: Exclude<InlineType, "text" | "inlineCode" | "image" | "link" | "audio">;
  nesting: InlineToken[];
};

export type InlineToken =
  | TextToken
  | CodeToken
  | MediaToken
  | LinkToken
  | { type: 'inlineMath'; value: string }
  | NestingToken
  | { type: "footnoteReference"; value: string }
  | { type: "footnoteDefinition"; value: string }
  | {
      type: "heading";
      multilevel: 1 | 2 | 3 | 4 | 5 | 6;
      nesting: InlineToken[];
  }
  | { type: "codeBlock"; language?: string; value: string }
  | { type: "list"; ordered: boolean; nesting: ASTNode[] }
  | { type: "listItem"; nesting: ASTNode[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" }
  | { type: "blockquote"; nesting: InlineToken[] }
  | { type: "parserError"; raw: string; error: string }
  | { type: "admonition"; label: string; nesting: InlineToken[] }
  | { type: "timeline"; nesting: InlineToken[] }
  | { type: 'paragraph'; nesting: InlineToken[] }
  | { type: 'document'; nesting: ASTNode[] };