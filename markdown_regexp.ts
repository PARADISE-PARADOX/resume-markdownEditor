import { Rules } from "./parser_type";

export const rules: Rules = {
    markdown: {
        // 标题和段落
        heading: /^(#{1,6})\s+(.+)$/,
        document: /^.+$/,
        paragraph: /^.+$/,
        
        // 文本修饰
        bold:/\*\*(.+?)\*\*/g,
        italic:/\*(.+?)\*/,
        strikethrough:/^~~(.+?)~~$/,
        underline:/^_(.+?)_$/,
        highlight:/==(.+?)==/,
        
        // 代码相关
        inlineCode: /`([^`]+)`/,
        codeBlock: /^```(\w*)\n([\s\S]+?)\n```$/,
        
        // 链接和媒体
        link:/\[(.+?)\]\((.+?)\)/, 
        image:/!\[(.+?)\]\((.+?)\)/, 
        audio:/!\[audio\]\((.+?)\)/,

        
        // 列表
        list:/^(-|\+|\*|\d+\.)\s+(.+)$/,
        checkboxUnchecked:/^\s*[-+*]\s*\[\s*\]\s+(.+)$/,
        checkboxChecked:/^\s*[-+*]\s*\[\s*[xX]\s*\]\s+(.+)$/,

        // 其他块级元素
        hr: /^([-*_]{3,})$/,
        blockquote: /^>\s+(.+)$/,
        
        // 数学和科学标记
        math: /^\$\$([\s\S]+?)\$\$$/,
        subscript: /~([^~]+)~/,
        superscript: /\^([^^]+)\^/,
        
        // 表格
        table: {
            header: /^\|(.+)\|$/,
            separator: /^\|(:?-+:?\|)+$/,
            row: /^\|(.+)\|$/,
        },
        
        // 脚注
        footnoteReference:/\[\^(.+?)\]/,
        footnoteDefinition:/\[\^(.+?)\]:\s*(.+)$/,
    }
};