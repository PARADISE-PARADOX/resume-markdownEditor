import { Rules } from "./parser_type";

export const rules:Rules = {
    markdown:{
        
        heading:/^(#{1,6})\s+(.+)$/, //标题
        bold:/\*\*(.+?)\*\*/g, //加粗
        italic:/\*(.+?)\*/ //斜体

        link:/\[(.+?)\]\((.+?))\)/,
    }
}
