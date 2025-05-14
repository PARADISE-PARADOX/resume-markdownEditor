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
        const header = headerLine.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()); 
        if(header.length===0){
            return null;
        }


        const content = separatorLine.replace(/^\||\|$/g, '').split('|').map((cell)=>{
            cell = cell.trim();
            if (cell.startsWith(':')  && cell.endsWith(':'))  return 'center';
            if(cell.startsWith(':')) return 'left';
            return 'right';
        });
        if(content.length!==content.length){
            return null;
        }

        const rows:string[][] = [];
        let currentIndex = startIndex+2;

        while(currentIndex < lines.length &&
            lines[currentIndex].trim().startsWith('|') &&
            lines[currentIndex].trim().endsWith('|')){
                const rowLine = lines[currentIndex].trim(); 
                const cells = rowLine.replace(/^\||\|$/g, '').split('|').map(cell=>cell.trim());

                if(cells.length === header.length){
                    rows.push(cells);
                }

                currentIndex++;
        }

        const headerCells = header.map(h=>({
            type:'tableCell' as const,
            tableHeader:true,
            nesting:this.inLineParser.parseInline(h),
        }))

        const headerRow = {
            type:'tableRow' as const,
            nesting:headerCells,
        }

        const bodyRows = rows.map(row=>({
            type:'tableRow' as const,
            nesting:row.map(cell=>({
                type: 'tableCell' as const,
                isHeader: false,
                nesting: this.inLineParser.parseInline(cell),
            })),
        }))

        return {
            type: 'table',
            alignment:content,
            nesting: [headerRow, ...bodyRows],
          }
       
    }

    //行内元素处理
    parserInline(text:string):ASTNode[]{
        const curText = text;
        const processText = (str: string): ASTNode[] => {
            const matches = [
                { match: str.match(rules.markdown.bold), type: 'bold' },
                { match: str.match(rules.markdown.italic), type: 'italic' },
                { match: str.match(rules.markdown.link), type: 'link' },
                { match: str.match(rules.markdown.image), type: 'image' },
                { match: str.match(rules.markdown.inlineCode), type: 'inlineCode' },
            ].filter((m) => m.match)

            if(matches.length==0){ //没有匹配上述的元素，返回text即可
                if(str){
                    return [{type:'text',value:str}];
                }
                
                return [];
            }

            const preMatch = matches.reduce((prev,cur)=>{
                return cur.match!.index! < prev.match!.index!?cur:prev;
            })

            const {match,type} = preMatch;
            const before = str.slice(0,match!.index);
            const after = str.slice(match!.index! + match![0].length);

            const result:ASTNode[] = [];
            if(before) result.push({type:'text',value:before});

            switch(type){
                case 'link':
                    result.push({
                        type:'link',
                        url:match![2],
                        nesting:[{
                            type:'text',
                            value:match![1],
                        }]
                    });
                    break;
                case 'image':
                    result.push({
                        type: 'image',
                        url: match![2],
                        alt: match![1],
                    });
                    break;
                default:
                    result.push({
                        type: type as 'bold' | 'italic' | 'inlineCode',
                        value: match![1],
                    })
            }

            result.push(...processText(after));

            return result;

        }

        return processText(curText);
    }

    private handleBlcokquote(
        line:string,
        index:number,
        lines:string[],
        blocks:ASTNode[],
    ):number{
        if (!rules.markdown.blockquote.test(line)) {
            return 0;
        }

        const quotes:string[] = [];
        let curIndex = index;
        
        while (
            curIndex < lines.length &&
            rules.markdown.blockquote.test(lines[curIndex])
          ) {
            const [, content] = lines[curIndex].match(rules.markdown.blockquote) || [];
            quotes.push(content);
            curIndex++;
          }

          blocks.push({
            type: 'blockquote',
            nesting: this.inLineParser.parseInline(quotes.join('\n')),
          })
      
          return curIndex - index;
    }

    parserBlocks(lines:string[]): ASTNode[]{
        const blocks: ASTNode[] = []; // 存储最终结果
        let currentParagraph:string[] = []; // 存储正在处理的段落

        const finalizeContext = () => {
            if(currentParagraph.length > 0){ //当前段落不为空，将其加入blocks元素中
                blocks.push(this.createParagraph(currentParagraph));
                currentParagraph = [];
            }

            if(this.currentList){ 
                blocks.push(this.currentList); //将当前列表加入blocks元素中
                this.currentList = null; //重置当前列表
            }
        }

        for(let i=0;i<lines.length;i++){
            const line = lines[i].trimEnd();

            const blockquoteCount = this.handleBlcokquote(line, i, lines, blocks); // ✅ 直接传 line
            if(blockquoteCount > 0){
                i += blockquoteCount - 1;//跳过引用的行
                finalizeContext();

            }


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
                const tableData = this.parserTable(lines,i);
                if(tableData && tableData.nesting){
                    blocks.push(tableData);
                    i += tableData.nesting.length - 1+1;
                    
                }
                    
            }

            //处理引用
            if(rules.markdown.blockquote.test(line)){
                finalizeContext();
                const [,content] = line.match(rules.markdown.blockquote) || [];
                blocks.push({
                    type:'blockquote',
                    nesting:this.inLineParser.parseInline(content),
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