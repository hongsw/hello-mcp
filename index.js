#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { setupClaudeConfig } from './src/claudeConfig.js';
import rc from "rc";
import { __, setLanguage, getCurrentLanguage, getAvailableLanguages } from './src/i18n.js';
import { restartClaudeDesktop } from './src/programLocator.js';


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
  
  try {
    // mcpManager 대신 직접 mcpServer.js 모듈 로드
    const mcpServerPath = path.join(__dirname, 'src', 'mcpServer.js');
    
    // 파일 존재 확인
    if (!fs.existsSync(mcpServerPath)) {
    throw new Error(__('MCP 서버 스크립트를 찾을 수 없습니다: {path}', { path: mcpServerPath }));
    }
    
    // mcpServer.js 모듈 직접 import 및 실행
    await import('./src/mcpServer.js');
  } catch (error) {
    console.error(chalk.red(__('MCP 서버 실행 중 오류가 발생했습니다: {error}', { error: error.message })));
  }
}

// CLI 모드 함수
async function startCliMode() {
  console.log(chalk.cyan.bold(__('\n🖥️ CLI 모드로 시작합니다...')));
  
  const command = args[1]; // 두 번째 인자는 명령어
  
  if (!command) {
    console.log(chalk.yellow(__('사용법: npx hi-garak cli [command] [options]')));
    console.log(chalk.cyan(__('가능한 명령어:')));
    console.log(__('  send-email [email] [body] - 이메일 전송'));
    console.log(__('  add [a] [b] - 두 숫자 더하기'));
    console.log(__('  troubleshoot [error-type] - 문제 해결 가이드 표시'));
    console.log(chalk.cyan(__('\n문제 해결 가이드 예시:')));
    console.log(__('  npx hello-mcp cli troubleshoot claude-service-disruption'));
    console.log(__('  npx hello-mcp cli troubleshoot email-error'));
    console.log(__('  npx hello-mcp cli troubleshoot website-invalid'));
    return;
  }
  
  try {
    // CLI 관련 모듈 동적 로드
    const cliManager = await import('./src/cliManager.js');
    await cliManager.executeCommand(command, args.slice(2));
  } catch (error) {
    console.error(chalk.red(__('CLI 명령 실행 중 오류가 발생했습니다: {error}', { error: error.message })));
    console.log(chalk.yellow(__('문제가 지속되면 help@garak.ai로 문의해주세요.')));
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
      configContent += `GARAK_API_KEY=${apiKey}\n`;
    }
  } else {
    // 새 설정 파일 생성
    configContent = `GARAK_API_KEY=${apiKey}\n`;
  }
  
  // 파일에 저장
  fs.writeFileSync(configFilePath, configContent, 'utf8');
  
  return true;
}

// 이메일 입력 처리 함수
async function processEmailInput(userInfo) {
  let spinner = ora(__('🔍 API 키를 생성하고 있어요...')).start();
  
  try {
    const apiKey = await garakClient.createApiKey(userInfo.email, userInfo.purpose);
    spinner.succeed(__('API 키가 생성되었어요.'));
    return { success: true, apiKey };
  } catch (error) {
    spinner.fail(__('API 키 생성 중 오류가 발생했습니다.'));
    console.error(chalk.red(error.message));
    
    // 이미 활성화된 API 키가 있는 이메일 오류 처리
    if (error.message.includes('이미 활성화된 API 키가 있는 이메일입니다')) {
      const choice = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: __('어떻게 진행할까요?'),
          choices: [
            { name: __('다른 이메일 주소로 시도하기'), value: 'retry' },
            { name: __('프로그램 종료하기'), value: 'exit' }
          ]
        }
      ]);
      
      return { success: false, action: choice.action };
    }
    
    return { success: false, action: 'error', message: error.message };
  }
}

/**
 * 언어 설정 관리 함수
 */
async function handleLanguageSettings() {
  const languages = getAvailableLanguages();
  const currentLang = getCurrentLanguage();
  
  const { selectedLang } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedLang',
      message: __('사용할 언어를 선택하세요:'),
      choices: languages.map(lang => ({
        name: lang === 'ko' ? '한국어' : 
              lang === 'en' ? 'English' : 
              lang === 'ja' ? '日本語' : 
              lang === 'zh' ? '中文' : 
              lang === 'es' ? 'Español' : 
              lang === 'fr' ? 'Français' : 
              lang === 'de' ? 'Deutsch' : 
              lang === 'ru' ? 'Русский' : 
              lang === 'pt' ? 'Português' : 
              lang === 'it' ? 'Italiano' : 
              lang === 'ar' ? 'العربية' : 
              lang === 'hi' ? 'हिन्दी' : 
              lang,
        value: lang,
        checked: lang === currentLang
      }))
    }
  ]);
  
  if (selectedLang !== currentLang) {
    setLanguage(selectedLang);
    console.log(chalk.green(__('언어가 변경되었습니다.')));
  }
}

async function main() {
  // console.clear();
  
  // 환영 메시지 출력
  console.log(chalk.cyan.bold(__('\n✨ Hello Garak에 오신 것을 환영합니다! ✨')));
  console.log(chalk.cyan(__('AI 에이전트를 위한 도구를 쉽게 설정해 드릴게요.\n')));

  // 언어 선택 옵션 제공
  const languages = getAvailableLanguages();
  const langNames = {
    'ko': '한국어', 
    'en': 'English', 
    'ja': '日本語', 
    'zh': '中文', 
    'es': 'Español', 
    'fr': 'Français', 
    'de': 'Deutsch', 
    'ru': 'Русский', 
    'pt': 'Português', 
    'it': 'Italiano', 
    'ar': 'العربية', 
    'hi': 'हिन्दी'
  };
  
  // 언어 선택 표시
  const currentLang = getCurrentLanguage();
  console.log(chalk.blue(__('현재 언어: {lang}', { lang: langNames[currentLang] || currentLang })));
  
  const { shouldChangeLang } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldChangeLang',
      message: __('언어를 변경하시겠습니까?'),
      default: false
    }
  ]);
  
  if (shouldChangeLang) {
    await handleLanguageSettings();
    // 언어가 변경된 후 환영 메시지 다시 표시
    console.log(chalk.cyan.bold(__('\n✨ Hello Garak에 오신 것을 환영합니다! ✨')));
    console.log(chalk.cyan(__('AI 에이전트를 위한 도구를 쉽게 설정해 드릴게요.\n')));
  }

  // Claude Desktop 설치 확인
  if (!utils.isClaudeDesktopInstalled()) {
    console.log(chalk.yellow(__('⚠️ Claude Desktop이 설치되어 있지 않은 것 같습니다.')));
    console.log(chalk.yellow(__('설치 후 다시 시도해주세요: https://claude.ai/download')));
    
    const shouldContinue = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: __('그래도 계속 진행할까요?'),
        default: false
      }
    ]);
    
    if (!shouldContinue.continue) {
      console.log(chalk.blue(__('설치 후 다시 실행해주세요. 감사합니다!')));
      return;
    }
  }
  
  // 이미 API 키가 설정되어 있는지 확인
  if (config && config.GARAK_API_KEY) {
    console.log(chalk.yellow(__('이미 설정된 API 키가 있습니다: {key}', { key: config.GARAK_API_KEY })));
    
    const resetConfig = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'reset',
        message: __('설정을 다시 하시겠습니까?'),
        default: false
      }
    ]);
    
    if (!resetConfig.reset) {
      console.log(chalk.green(__('기존 설정을 유지합니다. 감사합니다!')));
      return;
    }
  }

  try {
    // 대화형 설정 진행
    let userInfo = await conversation.startConversation();
    let apiKeyResult;
    
    // 이메일 처리 로직
    while (true) {
      apiKeyResult = await processEmailInput(userInfo);
      
      if (apiKeyResult.success) {
        break; // 성공하면 루프 종료
      } else if (apiKeyResult.action === 'exit') {
        console.log(chalk.blue(__('설정을 종료합니다. 감사합니다!')));
        return; // 프로그램 종료
      } else if (apiKeyResult.action === 'retry') {
        // 새 이메일 주소 입력 받기
        const emailPrompt = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: __('새 이메일 주소를 입력해주세요:'),
            validate: (input) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(input) ? true : __('유효한 이메일 주소를 입력해주세요');
            }
          }
        ]);
        
        userInfo.email = emailPrompt.email; // 이메일 업데이트
        continue; // 루프 계속
      } else {
        // 다른 오류 처리
        console.log(chalk.red(__('오류: {error}', { error: apiKeyResult.message || __('알 수 없는 오류가 발생했습니다') })));
        
        const retry = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldRetry',
            message: __('다시 설정을 시도할까요?'),
            default: true
          }
        ]);
        
        if (retry.shouldRetry) {
          userInfo = await conversation.startConversation(); // 처음부터 다시 시작
          continue;
        } else {
          console.log(chalk.yellow(__('문제가 지속되면 help@garak.ai로 문의해주세요.')));
          return;
        }
      }
    }
    
    const apiKey = apiKeyResult.apiKey;
    
    // 설정 파일 준비
    const spinner = ora(__('⏳ 설정 파일을 준비하고 있어요...')).start();
    
    // API 키 저장
    saveApiKey(apiKey);
    
    // MCP 서버 설정
    setupClaudeConfig(apiKey);
    
    spinner.succeed(__('설정 파일이 준비되었어요.'));
    
    // 완료 메시지
    console.log(chalk.green(__('\n✅ 모든 준비가 완료되었어요!\n')));
    console.log(__('당신의 Garak API 키: {key}', { key: chalk.yellow(apiKey) }));
    console.log(chalk.gray(__('(이 키는 일일 50회 요청으로 제한됩니다)')));

    // OpenTelemetry 정보 제공
    console.log(chalk.blue(__('\n📊 OpenTelemetry 정보:')));
    console.log(__('- 사용자 상호작용과 성능 데이터를 수집하여 서비스 품질을 개선합니다.'));
    console.log(__('- 수집된 데이터는 익명화되어 저장됩니다.'));
    console.log(__('- 언제든지 설정에서 비활성화할 수 있습니다.'));

    // 성공 메시지
    console.log(chalk.green.bold(__('\n🎉 축하합니다! Claude Desktop 설정이 완료되었습니다.')));
    console.log(__('\n✅ API 키가 안전하게 저장되었습니다'));


    console.log(chalk.cyan(__('✅ Claude Desktop 설정이 완료되었습니다')));
    console.log(__('✅ MCP 서버 설정이 완료되었습니다'));
    
    // Claude Desktop 재시작 시도
    try {
      const restarted = await restartClaudeDesktop();
      if (restarted.success) {
        console.log(__('✅ Claude Desktop이 재시작되었습니다'));
      } else {
        console.log(chalk.yellow(__('⚠️ Claude Desktop을 자동으로 재시작할 수 없습니다. 직접 재시작해주세요.')));
      }
    } catch (restartError) {
      console.log(chalk.yellow(__('⚠️ Claude Desktop 재시작 중 오류가 발생했습니다. 직접 재시작해주세요.')));
    }
    
    console.log(chalk.cyan(__('\n이제 Claude와 함께 다음을 시도해보세요:')));
    console.log(chalk.white(__('\n"{email} 로 \"1 add 1\" 결과를 메일보내줘."', { email: userInfo.email })));

    console.log(chalk.cyan(__('\n더 많은 예제와 팁을 보려면 브라우저에서 가이드를 확인하세요:')));
    console.log(chalk.blue(__('https://garak.ai/getting-started\n')));
    
    // // 웹사이트 열기
    // setTimeout(() => {
    //   open('https://garak.ai/getting-started');
    // }, 2000);
    
  } catch (error) {
    console.error(chalk.red(__('설정 중 오류가 발생했습니다: {error}', { error: error.message })));
    
    // 오류 발생 시 재시도 옵션
    const retry = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldRetry',
        message: __('다시 설정을 시도할까요?'),
        default: true
      }
    ]);
    
    if (retry.shouldRetry) {
      console.log(chalk.cyan(__('설정을 다시 시작합니다...')));
      return main(); // 재귀적으로 다시 시작
    } else {
      console.log(chalk.yellow(__('문제가 지속되면 help@garak.ai로 문의해주세요.')));
    }
  }
}

// 사용법 출력 함수
function printUsage() {
  console.log(`
${chalk.cyan('Hello MCP CLI')} - ${__('Model Context Protocol 가이드')}

${chalk.yellow(__('사용법:'))}
  npx hello-mcp [명령어]

${chalk.yellow(__('명령어:'))}
  setup     : ${__('초기 설정')}
  help      : ${__('도움말 표시')}
  version   : ${__('버전 정보 표시')}
  lang      : ${__('언어 설정')}
  
${chalk.yellow(__('예시:'))}
  npx hello-mcp setup
  npx hello-mcp lang
  `);
}

// 언어 설정 명령어 처리
if (mode === 'lang' || mode === 'language') {
  handleLanguageSettings();
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
      console.log(chalk.yellow(__(`알 수 없는 옵션: ${mode}`)));
      printUsage();
    } else {
      main(); // 기본값은 설정 모드
    }
    break;
}