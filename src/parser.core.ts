import { ASTNode } from "./parser_type";
import { ParserBlock } from "./parser_block";

export class Parser {
    private blockParser:ParserBlock;

    constructor(){
        this.blockParser = new ParserBlock();
    }

    parserMarkdown(text:string):ASTNode[]{
        const lines = text.split('\n');
        return this.blockParser.parserBlocks(lines);
    }
}