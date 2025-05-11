import { rules } from "./markdown_regexp";
import { ASTNode } from "./parser_type";
import {ParserInline} from "./parser_inline"

export class ParserBlock{
    private inLineParser:ParserInline; //行内元素的解析器
    private currentList:ASTNode | null = null; 
    private currentTimeline:ASTNode | null = null;

    constructor(){
        this.inLineParser = new ParserInline();
    }

    private createParagraph(lines: string[]): ASTNode {
        const cleanedLines = lines
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .split('\n')
        return {
            type: 'paragraph',
            nesting: this.inLineParser.parseInline(
                cleanedLines.join('\n').replace(/(\S)\n(\S)/g, '$1 $2')),
        }
    }

    parserTable(lines:string[],startIndex:number):ASTNode | null{

        if(!lines || !lines[startIndex]) return null; 

        const headerLine = lines[startIndex]; //表头
        const headerMatch = headerLine.match(rules.markdown.table.header);

        if(!headerMatch || !lines[startIndex+1]) return null; //没有表头匹配或者没有分隔线

        const separatorLine = lines[startIndex + 1].trim() //分隔线
        const separatorMatch = separatorLine.match(rules.markdown.table.separator);
        if (!separatorMatch) return null;

        //表头
        const header = headerLine.slice(1,-1).split('|').map(h=>h.trim()); //slice(1,-1)去掉开头和结尾的|
        

       
    }

    parserBlocks(lines:string[]): ASTNode[]{
        const blocks: ASTNode[] = []; // 存储最终结果
        let currentParagraph:string[] = []; // 存储正在处理的段落

        

        const finalizeContext = () => {
            if(currentParagraph.length > 0){
                blocks.push(this.createParagraph(currentParagraph));
                currentParagraph = [];
            }
        }

        for(let i=0;i<lines.length;i++){
            const line = lines[i].trimEnd();

            

            if(line.startsWith('```')){  //代码段
                finalizeContext();
                const lang = line.slice(3); //开头三个```后是代码的语言，如c++,java等
                const codeLines:string[] = [];
                i++; //跳过第一行

                while(i<lines.length && !lines[i].trim().startsWith('```')){ //代码结束标记
                    codeLines.push(lines[i]);
                    i++;
                }

                blocks.push({
                    type:'code',
                    language:lang,
                    value:codeLines.join('\n'),
                })
            }

            //处理标题
            if(rules.markdown.heading.test(line)){
                finalizeContext();

                const [, level, content] = line.match(rules.markdown.heading) || []; //获取标题前面的#，和标题的文本
                blocks.push({
                    type:'heading',
                    multilevel:level.length as 1|2|3|4|5|6, //as 类型断言，将level.length转换为1|2|3|4|5|6类型
                    nesting:[{
                        type:'text',
                        value:content,
                    }]
                })
            }

            //处理表格
            if(rules.markdown.table.header.test(line)){
                
                    
            }

            //处理引用
            if(rules.markdown.blockquote.test(line)){
                finalizeContext();
                const [,content] = line.match(rules.markdown.blockquote) || [];
                blocks.push({
                    type:'blockquote',
                    nesting:[{
                        type:'text',
                        value:content,
                    }]
                })
            }

            //列表
            if(rules.markdown.list.test(line)){
                finalizeContext();
                const [,order,content] = line.match(rules.markdown.list) || [];

                blocks.push({
                    type:'listItem',
                    ordered:!!order, //如果有order，就为true，否则为false
                    nesting:this.inLineParser.parseInline(content), //解析行内元素
                })
            }

            //分割线
            if(rules.markdown.hr.test(line)){
                finalizeContext();
                blocks.push({
                    type:'hr',
                })
            }

            //数学公式
            if(rules.markdown.math.test(line)){
                finalizeContext();
                const [,content] = line.match(rules.markdown.math) || [];
                blocks.push({
                    type:'math',
                    value:content,
                })
            }

            if(line === ''){
                finalizeContext();
                continue;
            }else{ //普通文本
                currentParagraph.push(lines[i]);
            }
        }

        finalizeContext(); //处理最后一个段落
        return blocks;
    }

}