import inquirer from 'inquirer';
import chalk from 'chalk';
import * as emoji from 'node-emoji'

async function startConversation() {
  console.log(chalk.cyan(emoji.emojify(':wave: 안녕하세요! 제 이름은 :smiley: 가락이에요. 함께 설정을 진행할게요.')));
  
  // 목적 질문
  const purposeResponse = await inquirer.prompt([
    {
      type: 'input',
      name: 'purpose',
      message: emoji.emojify(':question: 어떤 목적으로 AI 도구를 사용하실 계획인가요?'),
      default: '개인 프로젝트 코딩 도움'
    }
  ]);
  
  // 목적에 대한 응답
  let purposeCategory = 'coding';
  if (purposeResponse.purpose.includes('코딩') || 
      purposeResponse.purpose.includes('개발') || 
      purposeResponse.purpose.includes('프로그래밍')) {
    console.log(chalk.green(`코딩 프로젝트에 도움이 필요하시군요! 좋습니다.`));
    purposeCategory = 'coding';
  } else if (purposeResponse.purpose.includes('연구') || 
             purposeResponse.purpose.includes('학습') || 
             purposeResponse.purpose.includes('공부')) {
    console.log(chalk.green(`연구와 학습을 위해 사용하시는군요! 좋은 선택입니다.`));
    purposeCategory = 'research';
  } else {
    console.log(chalk.green(`AI 도구를 활용하는 좋은 목적이네요!`));
    purposeCategory = 'general';
  }
  
  // 이메일 질문
  const emailResponse = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: '이메일 주소를 알려주시겠어요? 진행 상황을 저장하고 업데이트를 알려드리기 위해 필요해요.\n',
      validate: function(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(input)) {
          return true;
        }
        return '유효한 이메일 주소를 입력해주세요.';
      }
    }
  ]);
  
  return {
    purpose: purposeCategory,
    email: emailResponse.email
  };
}

export {
  startConversation
};