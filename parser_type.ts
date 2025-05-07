export interface Rules{
    markdown:{
        heading:RegExp, // h1-h6,类型为正则表达式
        bold:RegExp, //加粗
        italic:RegExp, //斜体

        link:RegExp,//链接
        image:RegExp,//图片
        inlineCode:RegExp,//代码块
        hr:RegExp,//分割线
        list:RegExp,//列表
        blockquote: RegExp, //引用块
        codeBlock: RegExp,//代码块

        strikethrough: RegExp, //删除线
        underline: RegExp,//下划线
        subscript: RegExp,//下标
        superscript: RegExp,//上标
        audio: RegExp,//音频
        checkboxUnchecked: RegExp,//未选择框
        checkboxChecked: RegExp,//已选择框
        highlight: RegExp,//高亮
        math: RegExp,//数学公式
        table: { //表格
          header: RegExp,//表头
          separator: RegExp,//分割线
          row: RegExp,//行
        }

        footnoteReference:RegExp,//脚注引用
        footnoteDefinition:RegExp,//脚注定义
        document:RegExp,//文档
        paragraph:RegExp,//段落
        admonition:RegExp,//提示块
        timeline:RegExp,//时间线
        
    }
}

export interface ASTNode {

    type:string, //元素类型
    nesting?:ASTNode[],//可选项，嵌套
    multilevel?:number,//可选项，多级（标题）
    value?:string,//如果元素中有值，保存在value中
    url?:string,//图片等需要保存链接
    ordered?: boolean,//列表是否有序
    language?:string,//代码的语言
    alt?:string,//当图片等未加载出来是显示的替换内容
    alignment:('left'|'middle'|'right')[],//表格的对齐方式
    tableHeader?:boolean,//是否为表格的头
    title?:string,//图片等链接的标题

}

// 移除不再需要的接口
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

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "strikethrough" }
  | { type: "inlineCode"; value: string }
  | { type: "link"; url: string; nesting: InlineToken[] }
  | { type: "image"; url: string; alt: string }
  | { type: "underline"; nesting: InlineToken[] }
  | { type: "highlight"; value: string }
  | { type: "superscript"; value: string }
  | { type: "subscript"; value: string }
  | { type: "inlineMath"; value: string }
  | { type: "audio"; url: string; alt: string }
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
  | { type: "admonition"; label: string; children: InlineToken[] }
  | { type: "timeline"; children: InlineToken[] }
  | {
      type: Exclude<InlineType, "text" | "inlineCode" | "image" | "link">;
      children: InlineToken[];
    };


