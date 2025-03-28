import { checkProgramInstallation } from './programLocator.js';

// Claude 설치 확인 테스트
console.log('Claude 설치 확인 테스트 시작...\n');

const result = checkProgramInstallation('Claude');

if (result.error) {
  console.log(`오류 발생: ${result.error}`);
} else {
  console.log('결과:');
  console.log(`- 설치됨: ${result.installed ? '예' : '아니오'}`);
  if (result.installed) {
    console.log(`- 설치 위치: ${result.location}`);
    if (result.version) {
      console.log(`- 버전: ${result.version}`);
    }
  }
}

// Windows와 macOS에서 Claude의 일반적인 설치 경로 출력
console.log('\n일반적인 Claude 설치 경로:');
if (process.platform === 'win32') {
  console.log('Windows:');
  console.log('- C:\\Program Files\\Claude\\Claude.exe');
  console.log('- C:\\Program Files (x86)\\Claude\\Claude.exe');
} else if (process.platform === 'darwin') {
  console.log('macOS:');
  console.log('- /Applications/Claude.app');
  console.log(`- ${process.env.HOME}/Applications/Claude.app`);
} 