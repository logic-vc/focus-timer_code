import { Timer } from './timer.js';

const tasks = [
    { id: 1, name: '프로젝트 기획', duration: 25 },
    { id: 2, name: '코드 리뷰', duration: 15 },
    { id: 3, name: '문서 작성', duration: 30 }
];

console.log('앱 시작됨');

// 타이머 테스트 (5초)
const timer = new Timer(5);

timer.onTick = (remainingSeconds, percentage) => {
    console.log(`남은 시간: ${remainingSeconds}초 (${percentage.toFixed(0)}%)`);
};

timer.onComplete = () => {
    console.log('완료!');
};

timer.start();
