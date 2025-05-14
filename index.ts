import { Parser } from "./src/parser.core";
import { ASTNode } from "./src/parser_type";

// 创建解析器实例
const parser = new Parser();

// 测试用例
const testCases = [
  {
    name: "标题",
    markdown: "# 一级标题\n## 二级标题\n### 三级标题",
    expectedTypes: ["heading", "heading", "heading"]
  },
  {
    name: "段落",
    markdown: "这是一个段落\n\n这是另一个段落",
    expectedTypes: ["paragraph", "paragraph"]
  },
  {
    name: "粗体和斜体",
    markdown: "这是**粗体**和*斜体*文本",
    expectedTypes: ["paragraph"]
  },
  {
    name: "无序列表",
    markdown: "- 项目1\n- 项目2\n- 项目3",
    expectedTypes: ["listItem", "listItem", "listItem"]
  },
  {
    name: "有序列表",
    markdown: "1. 第一项\n2. 第二项\n3. 第三项",
    expectedTypes: ["listItem", "listItem", "listItem"]
  },
  {
    name: "代码块",
    markdown: "```javascript\nconsole.log('Hello');\n```",
    expectedTypes: ["code"]
  },
  {
    name: "行内代码",
    markdown: "这是`行内代码`的例子",
    expectedTypes: ["paragraph"]
  },
  {
    name: "链接和图片",
    markdown: "[链接](https://example.com)\n![图片](image.png)",
    expectedTypes: ["paragraph", "paragraph"]
  },
  {
    name: "表格",
    markdown: "| Header1 | Header2 |\n| --- | --- |\n| Cell1 | Cell2 |",
    expectedTypes: ["table"]
  },
  {
    name: "引用",
    markdown: "> 这是一个引用\n> 多行引用",
    expectedTypes: ["blockquote"]
  },
  {
    name: "分割线",
    markdown: "---",
    expectedTypes: ["hr"]
  }
];

// 运行测试
function runTests() {
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase) => {
    try {
      console.log(`\n=== 测试: ${testCase.name} ===`);
      console.log("Markdown:\n", testCase.markdown);

      // 解析Markdown
      const ast = parser.parserMarkdown(testCase.markdown);
      console.log("AST:", JSON.stringify(ast, null, 2));

      // 检查结果
      if (ast.length !== testCase.expectedTypes.length) {
        throw new Error(
          `预期 ${testCase.expectedTypes.length} 个节点，实际得到 ${ast.length} 个`
        );
      }

      ast.forEach((node, index) => {
        if (node.type !== testCase.expectedTypes[index]) {
          throw new Error(
            `节点 ${index} 预期类型为 ${testCase.expectedTypes[index]}，实际为 ${node.type}`
          );
        }
      });

      // 检查特定类型的属性
      switch (testCase.name) {
        case "标题":
          if (ast[0].multilevel !== 1 || ast[1].multilevel !== 2) {
            throw new Error("标题级别不正确");
          }
          break;
        case "代码块":
          if (ast[0].language !== "javascript") {
            throw new Error("代码块语言不正确");
          }
          break;
        case "表格":
          if (!ast[0].alignment || !ast[0].nesting) {
            throw new Error("表格缺少必要属性");
          }
          break;
      }

      console.log(`✅ 通过: ${testCase.name}`);
      passed++;
    } catch (error) {
      console.error(`❌ 失败: ${testCase.name}`);
      console.error(error.message);
      failed++;
    }
  });

  console.log(`\n测试结果: ${passed} 通过, ${failed} 失败`);
}

// 运行测试
runTests();

// 额外的详细测试函数
function testSpecificFeatures() {
  console.log("\n=== 详细功能测试 ===");
  
  // 测试嵌套元素
  const nestedMarkdown = "这是**粗体和*斜体*的组合**";
  console.log("\n测试嵌套元素:", nestedMarkdown);
  const nestedAST = parser.parserMarkdown(nestedMarkdown);
  console.log("嵌套AST:", JSON.stringify(nestedAST, null, 2));
  
  // 测试表格详细结构
  const tableMarkdown = "| 姓名 | 年龄 |\n| :--- | ---: |\n| 张三 | 25 |\n| 李四 | 30 |";
  console.log("\n测试表格详细结构:", tableMarkdown);
  const tableAST = parser.parserMarkdown(tableMarkdown);
  console.log("表格AST:", JSON.stringify(tableAST, null, 2));
  
  // 测试列表嵌套
  const listMarkdown = "- 第一项\n  - 子项1\n  - 子项2\n- 第二项";
  console.log("\n测试列表嵌套:", listMarkdown);
  const listAST = parser.parserMarkdown(listMarkdown);
  console.log("列表AST:", JSON.stringify(listAST, null, 2));
}

// 运行详细测试
testSpecificFeatures();