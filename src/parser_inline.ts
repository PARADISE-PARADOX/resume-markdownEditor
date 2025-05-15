import { rules } from "./markdown_regexp";
import type { InlineToken, InlineType } from "./parser_type";

// 按优先级排序的规则
const INLINE_RULES: { type: InlineType; regex: RegExp }[] = [
  { type: "audio", regex: rules.markdown.audio },
  { type: "image", regex: rules.markdown.image },
  { type: "inlineCode", regex: rules.markdown.inlineCode },
  { type: "bold", regex: rules.markdown.bold },
  { type: "italic", regex: rules.markdown.italic },
  { type: "highlight", regex: rules.markdown.highlight },
  { type: "strikethrough", regex: rules.markdown.strikethrough },
  { type: "superscript", regex: rules.markdown.superscript },
  { type: "subscript", regex: rules.markdown.subscript },
  { type: "link", regex: rules.markdown.link },
  { type: "underline", regex: rules.markdown.underline },
];

export class ParserInline {
  private static readonly nonGlobalRules = INLINE_RULES.map((rule) => ({
    type: rule.type,
    regex: new RegExp(rule.regex.source), //.source的作用是返回正则表达式的字符串形式，方便在正则表达式中使用
  }));

  parseInline(text: string): InlineToken[] {
    const tokens: InlineToken[] = [];
    let remainText = text;

    while (remainText) {
      let earliestMatch: {
        type: InlineType;
        index: number;
        match: RegExpMatchArray;
      } | null = null;

      for (const { type, regex } of ParserInline.nonGlobalRules) {
        const matched = regex.exec(remainText);
        if (
          matched &&
          (!earliestMatch || matched.index < earliestMatch.index)
        ) {
          earliestMatch = { type, index: matched.index, match: matched };
        }
      }

      if (!earliestMatch) {
        tokens.push({ type: "text", value: remainText });
        break;
      }

      if (earliestMatch.index > 0) {
        tokens.push({
          type: "text",
          value: remainText.slice(0, earliestMatch.index),
        });
      }

      const matchGroup = earliestMatch.match.slice(1);
      tokens.push(this.tokenToHtml(earliestMatch.type, matchGroup));

      remainText = remainText.slice(
        earliestMatch.index + earliestMatch.match[0].length
      );
    }

    return tokens;
  }

  private tokenToHtml(type: InlineType, group: string[]): InlineToken {
    const content = group[0] || "";

    switch (type) {
      case "image":
        return { type: "image", url: group[1] || "", alt: group[0] || "" };
      case "link":
        return {
          type: "link",
          url: group[1] || "",
          nesting: this.parseInline(group[0] || ""),
        };
      case "inlineCode":
        return { type: "inlineCode", value: content };
      case "audio":
        return { type: "audio", alt: group[0], url: group[1] };
      case "italic":
      case "bold":
      case "strikethrough":
      case "underline":
      case "highlight":
      case "superscript":
      case "subscript":
        return { type, nesting: this.parseInline(group[0] || "") };
      default:
        return { type: "text", value: content };
    }
  }
}
