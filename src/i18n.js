import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

// CommonJS 모듈 로드를 위한 require 함수 생성
const require = createRequire(import.meta.url);
const rc = require('rc');

// 현재 파일 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로케일 디렉토리 경로
const localesDir = path.join(__dirname, '..', 'locales');

// 사용 가능한 언어 목록
const availableLanguages = fs.readdirSync(localesDir)
  .filter(file => file.endsWith('.json'))
  .map(file => file.replace('.json', ''));

// 기본 언어 설정
const defaultLanguage = 'en';

// 시스템 언어 감지
function detectSystemLanguage() {
  const config = rc('garak');
  
  // 1. 환경 변수에서 언어 설정 확인 (LC_ALL을 우선시)
  if (process.env.LC_ALL) {
    const langCode = process.env.LC_ALL.split('_')[0].toLowerCase();
    if (availableLanguages.includes(langCode)) {
      return langCode;
    }
  }
  
  // 2. 설정 파일에서 언어 설정 확인
  if (config && config.language && availableLanguages.includes(config.language)) {
    return config.language;
  }
  
  // 3. 다른 환경 변수 확인
  const envLang = process.env.LANGUAGE || process.env.LANG || process.env.LC_MESSAGES;
  if (envLang) {
    const langCode = envLang.split('_')[0].toLowerCase();
    if (availableLanguages.includes(langCode)) {
      return langCode;
    }
  }
  
  // 4. 운영체제 언어 설정 확인 (OS 종속적)
  if (process.platform === 'darwin') {
    // macOS
    try {
      const { execSync } = require('child_process');
      const macLang = execSync('defaults read -g AppleLocale').toString().trim().split('_')[0];
      if (availableLanguages.includes(macLang)) {
        return macLang;
      }
    } catch (error) {
      // 무시
    }
  } else if (process.platform === 'win32') {
    // Windows
    try {
      const { execSync } = require('child_process');
      const winLang = execSync('powershell -command "[System.Globalization.CultureInfo]::CurrentCulture.Name"', { encoding: 'utf8' }).trim().split('-')[0];
      if (availableLanguages.includes(winLang)) {
        return winLang;
      }
    } catch (error) {
      // 무시
    }
  }
  
  // 기본 언어로 돌아가기
  return defaultLanguage;
}

// 현재 언어 설정
let currentLanguage = detectSystemLanguage();
let translations = {};

// 번역 로드
function loadTranslations(lang) {
  try {
    const filePath = path.join(localesDir, `${lang}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error.message);
    return {};
  }
}

// 초기 번역 로드
translations = loadTranslations(currentLanguage);

/**
 * 언어 변경 함수
 * @param {string} lang - 언어 코드
 * @returns {boolean} - 성공 여부
 */
export function setLanguage(lang) {
  if (!availableLanguages.includes(lang)) {
    return false;
  }
  
  currentLanguage = lang;
  translations = loadTranslations(lang);
  
  // 설정 파일에 언어 설정 저장 (INI 형식)
  const configPath = path.join(os.homedir(), '.garakrc');
  let configContent = '';
  
  try {
    if (fs.existsSync(configPath)) {
      configContent = fs.readFileSync(configPath, 'utf8');
      
      // language 설정이 이미 있는지 확인
      if (configContent.includes('language=')) {
        // 기존 language 설정 업데이트
        configContent = configContent.replace(/language=.*(\r?\n|$)/, `language=${lang}\n`);
      } else {
        // language 설정 추가
        configContent += `language=${lang}\n`;
      }
    } else {
      // 새 설정 파일 생성
      configContent = `language=${lang}\n`;
    }
  } catch (error) {
    // 오류 발생 시 새로운 설정 파일 생성
    configContent = `language=${lang}\n`;
  }
  
  fs.writeFileSync(configPath, configContent, 'utf8');
  
  return true;
}

/**
 * 번역 함수
 * @param {string} key - 번역 키
 * @param {Object} params - 치환 파라미터
 * @returns {string} - 번역된 문자열
 */
export function __(key, params = {}) {
  let text = translations[key] || key;
  
  // 파라미터 치환
  Object.entries(params).forEach(([paramKey, value]) => {
    text = text.replace(new RegExp(`{${paramKey}}`, 'g'), value);
  });
  
  return text;
}

/**
 * 현재 언어 코드 반환
 * @returns {string} - 현재 언어 코드
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 사용 가능한 언어 목록 반환
 * @returns {string[]} - 사용 가능한 언어 코드 배열
 */
export function getAvailableLanguages() {
  return [...availableLanguages];
} 