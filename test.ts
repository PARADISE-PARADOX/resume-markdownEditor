import { Parser } from "./src/parser.core";
import type { ASTNode, InlineToken } from "./src/parser_type";

// 初始化解析器
const parser = new Parser();

// 完整测试用例集
const testCases = [
  {
    name: "标题",
    markdown: "# 一级标题\n## 二级标题",
    expectedTypes: ["heading", "heading"],
    validate: (ast: ASTNode[]) => {
      if (ast[0].multilevel !== 1 || ast[1].multilevel !== 2) {
        throw new Error("标题级别解析错误");
      }
    },
  },
  {
    name: "段落与文本修饰",
    markdown: "这是**粗体**、*斜体*、~~删除线~~、_下划线_、==高亮==",
    expectedTypes: ["paragraph"],
    validate: (ast: ASTNode[]) => {
      const types = new Set(ast[0].nesting?.map((t) => t.type));
      if (
        !types.has("bold") ||
        !types.has("italic") ||
        !types.has("strikethrough")
      ) {
        throw new Error("文本修饰解析缺失");
      }
    },
  },
  {
    name: "列表",
    markdown: "- 无序列表\n1. 有序列表",
    expectedTypes: ["listItem", "listItem"],
    validate: (ast: ASTNode[]) => {
      if (ast[0].ordered || !ast[1].ordered) {
        throw new Error("列表类型解析错误");
      }
    },
  },
  {
    name: "代码块",
    markdown: "```js\nconsole.log('test');\n```",
    expectedTypes: ["code"],
    validate: (ast: ASTNode[]) => {
      const codeNode = ast[0] as { language?: string; value?: string };
      if (
        codeNode.language !== "js" ||
        !codeNode.value?.includes("console.log")
      ) {
        throw new Error("代码块解析错误");
      }
    },
  },
  {
    name: "表格",
    markdown: "| Header |\n| --- |\n| Cell |",
    expectedTypes: ["table"],
    validate: (ast: ASTNode[]) => {
      if (!ast[0].nesting || ast[0].nesting.length < 2) {
        throw new Error("表格结构不完整");
      }
    },
  },
  {
    name: "数学公式",
    markdown: "$$\nE = mc^2\n$$",
    expectedTypes: ["math"],
    validate: (ast: ASTNode[]) => {
      const mathNode = ast[0] as { value?: string };
      if (!mathNode.value?.includes("mc^2")) {
        throw new Error("数学公式内容解析错误");
      }
    },
  },
  {
    name: "上下标",
    markdown: "H~2~O 和 X^2^",
    expectedTypes: ["paragraph"],
    validate: (ast: ASTNode[]) => {
      const hasSub = ast[0].nesting?.some((t) => t.type === "subscript");
      const hasSup = ast[0].nesting?.some((t) => t.type === "superscript");
      if (!hasSub || !hasSup) throw new Error("上下标解析失败");
    },
  },
  {
    name: "媒体文件",
    markdown: "![图片](img.png)\n![音频](audio.mp3)",
    expectedTypes: ["paragraph", "paragraph"],
    validate: (ast: ASTNode[]) => {
      const mediaTypes = ast.flatMap(
        (node) => node.nesting?.map((t) => t.type) || []
      );
      if (!mediaTypes.includes("image") || !mediaTypes.includes("audio")) {
        throw new Error("媒体文件解析失败");
      }
    },
  },
];

// 测试运行器
function runTests() {
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase) => {
    try {
      console.log(`\n=== 测试: ${testCase.name} ===`);
      const ast = parser.parserMarkdown(testCase.markdown);

      // 基础类型验证
      if (ast.length !== testCase.expectedTypes.length) {
        throw new Error(
          `预期 ${testCase.expectedTypes.length} 个节点，实际得到 ${ast.length} 个`
        );
      }

      ast.forEach((node, index) => {
        if (node.type !== testCase.expectedTypes[index]) {
          throw new Error(
            `节点 ${index} 类型错误，预期 ${testCase.expectedTypes[index]}，实际 ${node.type}`
          );
        }
      });

      // 自定义验证
      if (testCase.validate) {
        testCase.validate(ast);
      }

      passed++;
      console.log(`✅ 通过: ${testCase.name}`);
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      console.error(`❌ 失败: ${testCase.name}\n`, errorMessage);
    }
  });

  console.log(`\n测试结果：${passed} 通过，${failed} 失败`);
}

// 复杂文档测试
function testComplexDocument() {
  const complexDoc = `
# 综合文档测试

## 混合格式
这是**粗体**、*斜体*、~~删除线~~的组合，包含^上标^和~下标~，还有==高亮==文本。

### 代码示例
\`\`\`python
print("Hello ${"World!"}")
\`\`\`

行内代码：\`const a = 1\`

### 表格与公式
| 项目   | 价格  |
|--------|-------|
| 苹果   | ¥5    |
| 香蕉   | ¥3    |

质能方程：$$ E = mc^2 $$

### 列表
- [ ] 待办事项
- [x] 已完成事项
  - 子项1
  - 子项2
`;

  console.log("\n=== 复杂文档测试 ===");
  const ast = parser.parserMarkdown(complexDoc);
  console.log(JSON.stringify(ast, null, 2));
  console.log("✅ 复杂文档解析完成");
}

// 执行测试
console.log("启动 Markdown 解析器测试...");
runTests();
testComplexDocument();
