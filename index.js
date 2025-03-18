#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { setupClaudeConfig } from './src/claudeConfig.js';
// CommonJS 모듈 로드를 위한 require 함수 생성
const require = createRequire(import.meta.url);
const rc = require('rc');

// 모듈 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 상대 경로로 모듈 가져오기
import * as conversation from './src/conversation.js';
import * as garakClient from './src/garakClient.js';
import * as utils from './src/utils.js';

// 설정 로드
const config = rc('garak');

// 설정 파일 경로
const configFilePath = path.join(process.env.HOME || process.env.USERPROFILE, '.garakrc');

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const mode = args[0] || 'setup'; // 기본값은 setup 모드

// MCP 서버 시작 함수
async function startMcpServer() {
  // console.error(chalk.cyan.bold('\n🚀 MCP 서버 모드로 시작합니다...'));
  
  try {
    // MCP 서버 관련 모듈 동적 로드
    const mcpManager = await import('./src/mcpManager.js');
    await mcpManager.startServer();
  } catch (error) {
    console.error(chalk.red('MCP 서버 실행 중 오류가 발생했습니다:', error.message));
  }
}

// CLI 모드 함수
async function startCliMode() {
  console.log(chalk.cyan.bold('\n🖥️ CLI 모드로 시작합니다...'));
  
  const command = args[1]; // 두 번째 인자는 명령어
  
  if (!command) {
    console.log(chalk.yellow('사용법: npx hi-garak cli [command] [options]'));
    console.log(chalk.cyan('가능한 명령어:'));
    console.log('  send-email [email] [body] - 이메일 전송');
    console.log('  add [a] [b] - 두 숫자 더하기');
    return;
  }
  
  try {
    // CLI 관련 모듈 동적 로드
    const cliManager = await import('./src/cliManager.js');
    await cliManager.executeCommand(command, args.slice(2));
  } catch (error) {
    console.error(chalk.red('CLI 명령 실행 중 오류가 발생했습니다:', error.message));
    console.log(chalk.yellow('문제가 지속되면 help@garak.ai로 문의해주세요.'));
  }
}

// 설정 파일에 API 키 저장
function saveApiKey(apiKey) {
  let configContent = '';
  
  // 기존 설정 파일이 있으면 읽기
  if (fs.existsSync(configFilePath)) {
    configContent = fs.readFileSync(configFilePath, 'utf8');
    
    // API 키 업데이트
    if (configContent.includes('GARAK_API_KEY=')) {
      configContent = configContent.replace(/GARAK_API_KEY=.*(\r?\n|$)/, `GARAK_API_KEY=${apiKey}\n`);
    } else {
      configContent += `\nGARAK_API_KEY=${apiKey}\n`;
    }
  } else {
    // 새 설정 파일 생성
    configContent = `GARAK_API_KEY=${apiKey}\n`;
  }
  
  // 파일에 저장
  fs.writeFileSync(configFilePath, configContent, 'utf8');
  
  return true;
}


async function main() {
  console.clear();
  
  // 환영 메시지 출력
  console.log(chalk.cyan.bold('\n✨ Hello Garak에 오신 것을 환영합니다! ✨'));
  console.log(chalk.cyan('AI 에이전트를 위한 도구를 쉽게 설정해 드릴게요.\n'));

  // Claude Desktop 설치 확인
  if (!utils.isClaudeDesktopInstalled()) {
    console.log(chalk.yellow('⚠️ Claude Desktop이 설치되어 있지 않은 것 같습니다.'));
    console.log(chalk.yellow('설치 후 다시 시도해주세요: https://claude.ai/download'));
    
    const shouldContinue = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: '그래도 계속 진행할까요?',
        default: false
      }
    ]);
    
    if (!shouldContinue.continue) {
      console.log(chalk.blue('설치 후 다시 실행해주세요. 감사합니다!'));
      return;
    }
  }
  
  // 이미 API 키가 설정되어 있는지 확인
  if (config && config.GARAK_API_KEY) {
    console.log(chalk.yellow('이미 설정된 API 키가 있습니다:', config.GARAK_API_KEY));
    
    const resetConfig = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'reset',
        message: '설정을 다시 하시겠습니까?',
        default: false
      }
    ]);
    
    if (!resetConfig.reset) {
      console.log(chalk.green('기존 설정을 유지합니다. 감사합니다!'));
      return;
    }
  }

  try {
    // 대화형 설정 진행
    const userInfo = await conversation.startConversation();
    
    // API 키 생성
    const spinner = ora('🔍 API 키를 생성하고 있어요...').start();
    const apiKey = await garakClient.createApiKey(userInfo.email, userInfo.purpose);
    spinner.succeed('API 키가 생성되었어요.');
    
    // 설정 파일 준비
    spinner.text = '⏳ 설정 파일을 준비하고 있어요...';
    spinner.start();
    
    // API 키 저장
    saveApiKey(apiKey);
    
    // MCP 서버 설정
    setupClaudeConfig(apiKey);
    
    spinner.succeed('설정 파일이 준비되었어요.');
    
    // 완료 메시지
    console.log(chalk.green('\n✅ 모든 준비가 완료되었어요!\n'));
    console.log(`당신의 Garak API 키: ${chalk.yellow(apiKey)}`);
    console.log(chalk.gray('(이 키는 일일 50회 요청으로 제한됩니다)'));

    // OpenTelemetry 정보 제공
    console.log(chalk.blue('\n📊 OpenTelemetry 정보:'));
    console.log('- 사용자 상호작용과 성능 데이터를 수집하여 서비스 품질을 개선합니다.');
    console.log('- 수집된 데이터는 익명화되어 저장됩니다.');
    console.log('- 언제든지 설정에서 비활성화할 수 있습니다.');

    // 성공 메시지
    console.log(chalk.green.bold('\n🎉 축하합니다! Claude Desktop 설정이 완료되었습니다.'));
    console.log('\n✅ API 키가 안전하게 저장되었습니다');


    console.log(chalk.cyan('✅ Claude Desktop 설정이 완료되었습니다'));
    console.log('✅ MCP 서버 설정이 완료되었습니다');
    
    // Claude Desktop 재시작 시도
    try {
      const restarted = await utils.restartClaudeDesktop();
      if (restarted) {
        console.log('✅ Claude Desktop이 재시작되었습니다');
      } else {
        console.log(chalk.yellow('⚠️ Claude Desktop을 자동으로 재시작할 수 없습니다. 직접 재시작해주세요.'));
      }
    } catch (restartError) {
      console.log(chalk.yellow('⚠️ Claude Desktop 재시작 중 오류가 발생했습니다. 직접 재시작해주세요.'));
    }
    
    console.log(chalk.cyan('\n이제 Claude와 함께 다음을 시도해보세요:'));
    console.log(chalk.white(`\n"${userInfo.email} 로 "1 add 1" 결과를 메일보내줘."`));

    console.log(chalk.cyan('\n더 많은 예제와 팁을 보려면 브라우저에서 가이드를 확인하세요:'));
    console.log(chalk.blue('https://garak.ai/getting-started\n'));
    
    // // 웹사이트 열기
    // setTimeout(() => {
    //   open('https://garak.ai/getting-started');
    // }, 2000);
    
  } catch (error) {
    console.error(chalk.red('설정 중 오류가 발생했습니다:', error.message));
    
    // 오류 발생 시 재시도 옵션
    const retry = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldRetry',
        message: '다시 설정을 시도할까요?',
        default: true
      }
    ]);
    
    if (retry.shouldRetry) {
      console.log(chalk.cyan('설정을 다시 시작합니다...'));
      return main(); // 재귀적으로 다시 시작
    } else {
      console.log(chalk.yellow('문제가 지속되면 help@garak.ai로 문의해주세요.'));
    }
  }
}

// 사용법 출력 함수
function printUsage() {
  console.log(chalk.cyan.bold('\n📚 Hi-Garak 사용법:'));
  console.log(chalk.white('npx hi-garak [mode] [options]'));
  console.log(chalk.cyan('\n사용 가능한 모드:'));
  console.log(chalk.white('  <빈 값> 또는 setup - 설정 도우미를 실행합니다'));
  console.log(chalk.white('  mcp-server - MCP 서버 모드로 실행합니다'));
  console.log(chalk.white('  cli - CLI 모드로 실행합니다'));
  console.log(chalk.white('  help - 도움말을 출력합니다'));
  console.log(chalk.cyan('\n예시:'));
  console.log(chalk.white('  npx hi-garak'));
  console.log(chalk.white('  npx hi-garak mcp-server'));
  console.log(chalk.white('  npx hi-garak cli add 3 5'));
  console.log(chalk.white('  npx hi-garak cli send-email user@example.com "안녕하세요"\n'));
}

// 모드에 따라 적절한 함수 실행
switch (mode) {
  case 'mcp-server':
    startMcpServer();
    break;
  case 'cli':
    startCliMode();
    break;
  case 'setup':
    main();
    break;
  case 'help':
    printUsage();
    break;
  default:
    if (mode.startsWith('-')) {
      console.log(chalk.yellow(`알 수 없는 옵션: ${mode}`));
      printUsage();
    } else {
      main(); // 기본값은 설정 모드
    }
    break;
}