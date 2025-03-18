import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';

// CommonJS 모듈 로드를 위한 require 함수 생성
const require = createRequire(import.meta.url);
const rc = require('rc');

// Claude Desktop 설정 경로
function getClaudeConfigPath() {
  const homedir = os.homedir();
  
  if (process.platform === 'darwin') { // macOS
    return path.join(homedir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'win32') { // Windows
    return path.join(homedir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else { // Linux
    return path.join(homedir, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

// MCP 서버 설정 생성
function createMcpServerConfig(apiKey) {
  return {
    "garak": {
      command: "npx",
      args: [
        "hi-garak",
        "mcp-server"
      ],
      env: {
        GARAK_API_KEY: apiKey || process.env.GARAK_API_KEY,
        GARAK_API_BASE: "http://localhost:3000",
      }
    }
  };
}

// Claude 설정 파일 생성/업데이트
async function setupClaudeConfig(GARAK_API_KEY) {
  var appCfg = rc('garakrc', { GARAK_API_KEY })

  try {
    const configPath = getClaudeConfigPath();
    const configDir = path.dirname(configPath);
    
    // 디렉토리 생성
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // 기존 설정 읽기 또는 새로 생성
    let claudeConfig = {};
    if (fs.existsSync(configPath)) {
      // 백업 파일 생성
      const backupPath = `${configPath}.backup-${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
      console.log(`\n백업 파일이 생성되었습니다: ${backupPath}`);
      
      // 기존 설정 파일 읽기
      const configContent = fs.readFileSync(configPath, 'utf8');
      try {
        claudeConfig = JSON.parse(configContent);
      } catch (e) {
        console.error('설정 파일 파싱 오류, 새 설정을 생성합니다:', e);
        claudeConfig = {};
      }
    }
    
    // mcpServers 객체가 없으면 생성
    if (!claudeConfig.mcpServers) {
      claudeConfig.mcpServers = {};
    }
    
    // 기존 garak-mcp-manager 설정 제거 (있는 경우)
    if (claudeConfig.mcpServers["garak"]) {
      delete claudeConfig.mcpServers["garak"];
    }
    
    // 새 MCP 서버 설정 추가
    const mcpConfig = createMcpServerConfig(GARAK_API_KEY);
    claudeConfig.mcpServers = {
      ...claudeConfig.mcpServers,
      ...mcpConfig
    };
    
    // 설정 파일 저장
    fs.writeFileSync(configPath, JSON.stringify(claudeConfig, null, 2), 'utf8');
    console.log('Claude 설정이 업데이트되었습니다.');
    
    // API 키는 이미 saveApiKey 함수에서 저장되므로 여기서는 생략
    
    return true;
  } catch (error) {
    console.error('Claude 설정 파일 생성 중 오류:', error);
    throw new Error('Claude Desktop 설정을 생성할 수 없습니다.');
  }
}

export {
  setupClaudeConfig,
  getClaudeConfigPath
};