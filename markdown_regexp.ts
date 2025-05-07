import { Rules } from "./parser_type";

export const rules:Rules = {
    markdown:{
        
        heading:/^(#{1,6})\s+(.+)$/, //标题
        bold:/\*\*(.+?)\*\*/g, //加粗
        italic:/\*(.+?)\*/, //斜体

        link:/\[(.+?)\]\((.+?))\)/, 
        image:/!\[(.+?)\]\((.+?))\)/, 
        inlineCode:/`(.+?)`/,
        hr:/^([-*_]{3,0})$/,
        list:/^(-|\+|\*|\d+\.)\s+(.+)$/,
        blockquote:/^>\s+(.+)$/,
        codeBlock:/^```(\w*)\n(.+?)\n```$/,
        strikethrough:/^~~(.+?)~~$/,
        underline:/^_(.+?)_$/,
        subscript:/~(.+?)~/,
        superscript:/^(.+?)^/,
        audio:/!\[audio\]\((.+?)\)/,
        checkboxUnchecked:/^\s*[-+*]\s*\[\s*\]\s+(.+)$/,
        checkboxChecked:/^\s*[-+*]\s*\[\s*[xX]\s*\]\s+(.+)$/,
        highlight:/==(.+?)==/,
        math


    }
}
