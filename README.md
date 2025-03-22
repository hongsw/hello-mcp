# 🚀 Hello MCP(Model Context Protocol)
### "Tour and Guide Tool for Setting Up Claude Desktop MCP Config Manager"

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org/en/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

한국어 버전은 아래 링크에서 확인할 수 있습니다.
[한국어 버전](https://github.com/hongsw/hello-mcp/blob/main/README.ko.md)

English Version is available at the following link.
[English Version](https://github.com/hongsw/hello-mcp/blob/main/README.en.md)

## ✨ Overview

Hello-MCP is a helpful utility tool that enables Claude Desktop to interact with external tools via the Model Context Protocol (MCP). It simplifies the setup process and provides a seamless integration between Claude AI and your custom tools.

(English) Hello, Welcome!
(Korean) 안녕하세요, 환영합니다!

## 🛠️ Features

- **Easy Setup**: Simple one-command setup for Claude Desktop MCP integration
- **Multiple Modes**: Run as a setup wizard, MCP server, or CLI tool
- **Built-in Sample Tools**: Pre-configured tools like email sending and simple calculations
- **Extensible**: Easily add your own MCP tools
- **Internationalization**: Supports multiple languages (Korean and English)

## 📋 Requirements

- Node.js 14+ [Download](https://nodejs.org/en/download/)
- Claude Desktop installed ([Download here](https://claude.ai/download))
- Internet connection for Email Sending GARAK API key generation

## 🚀 Quick Start

You can run Hello-MCP without installation using npx:

```bash
npx hello-mcp
```

This will start the setup wizard that guides you through the entire configuration process.

## 🎮 Usage

Hi-Garak can be used in three different modes:

### 1️⃣ Setup Mode (Default)

```bash
npx hello-mcp
# or
npx hello-mcp setup
```

This interactive mode will:
- Check if Claude Desktop is installed
- Ask for your email and purpose
- Generate an API key
- Configure Claude Desktop for MCP
- Restart Claude Desktop automatically (when possible)

### 2️⃣ MCP Server Mode

```bash
npx hello-mcp mcp-server
```

This starts Hello-MCP as an MCP server that Claude Desktop can connect to. The server provides tools that Claude can use to perform actions.

## 🔑 API Keys

Your API key is stored in `~/.garakrc` and has a daily limit of 50 requests. The key is automatically configured for use with Claude Desktop.

## 📊 Telemetry

Hello-MCP collects anonymous usage data to improve the service:
- User interactions and performance metrics
- All data is anonymized
- You can disable telemetry in the configuration

## 🌟 Tips for Using with Claude

After setup, you can try these prompts with Claude:
1. "1 add 1" (Simple calculation)
2. "Send an email to [your-email] with the result of 1 add 1"

## 🤝 Support

If you encounter any issues, please contact us at help@garak.ai

## 📚 Documentation

For more examples and tips, visit our getting started guide:
[Getting Started Guide](GETTING_STARTED.md)

You can also browse our interactive documentation:
- Run locally: `npx docsify-cli serve docs`
- View in your browser: http://localhost:3000

## 🚧 TODO

- If you encounter any problems or have suggestions, please create an issue on a suitable issue tracking system (e.g., GitHub Issues). Provide a detailed description of the issue and steps to reproduce it. https://github.com/hongsw/hello-mcp/issues
- Windows support is currently under testing.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
