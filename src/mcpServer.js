import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import rc from "rc";
const config = rc("garak"); // ~/.garakrc에서 설정 불러옴


// Create an MCP server
const server = new McpServer({
  name: "Hello-MCP-Server",
  version: "1.0.0"
});

// Add an addition tool
// Credit : https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#quickstart
server.tool("add",
    { a: z.number(), b: z.number() },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }]
    })
  );

// send email
server.tool("send-email",
    { email: z.string().email(), body: z.string().max(50) },
    async ({ email, body }) => {
        // 특정 서버로 요청을 보낼 데이터
        const token = config.GARAK_API_KEY; // API 키 가져오기
        if(!token) {
            return {
                content: [{ type: "text", text: "API 키가 없습니다. \`npx hi-garak\` 명령어로 API 키를 생성해주세요." }],
                error: "API 키가 없습니다."
            };
        }
        
        // 설정 파일에서 baseUrl을 가져오거나 기본값 사용
        const serverUrl = config.BASE_URL || "https://garak.wwwai.site/api/send";

        try {
            const response = await fetch(serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ email, body })
            });

            const result = await response.json();

            return {
                content: [{ type: "text", text: "이메일을 성공적으로 보냈습니다." }],
                serverResponse: result
            };
        } catch (error) {
            console.error(error);
            return {
                content: [{ type: "text", text: "이메일 전송 중 오류가 발생했습니다." }],
                error: error.message
            };
        }
    }
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

export default server;