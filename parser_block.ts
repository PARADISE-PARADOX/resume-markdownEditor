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
                cleanedLines.join('\n').replace(/(\S)\n(\S)/g, '$1 $2'),
      ),
    }
  }

    parserBlocks(lines:string[]): ASTNode[]{
        const blocks : ASTNode[] = []; // 存储最终结果
        let currentParagraph:string[] = []; // 存储正在处理的段落

        

        const finalizeContext = () => {
            if(currentParagraph.length > 0){
                blocks.push();
                currentParagraph = [];
            }
        }

        for(let i=0;i<lines.length;i++){
            const line = lines[i].trimEnd();

            if(line.startsWith('```')){  //代码段
                finalizeContext();
                const lang = line.slice(3); //开头三个```后是代码的语言，如c++,java等
                const codeLines = [];
                i++;

                while(i<lines.length && !lines[i].trim().startsWith('```')){
                    codeLines.push(lines[i]);
                    i++;
                }

                blocks.push({
                    type:'code',
                    language:lang,
                    value:codeLines.join('\n'),
                })
            }
        }

        return blocks;
    }

}