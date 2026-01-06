const STORAGE_KEY = 'focus-timer-data';

// 기본 더미 데이터
const defaultData = {
    tasks: [
        { id: crypto.randomUUID(), title: '기획서 작성', duration: 300, status: 'pending' },
        { id: crypto.randomUUID(), title: '코드 리뷰', duration: 600, status: 'pending' },
        { id: crypto.randomUUID(), title: '이메일 정리', duration: 180, status: 'pending' }
    ],
    currentIndex: 0
};

// localStorage에서 불러오기
export function loadTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // 초기 데이터 저장 후 반환
    saveTasks(defaultData);
    return defaultData;
}

// localStorage에 저장
export function saveTasks(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 작업 추가
export function addTask(title, minutes) {
    const data = loadTasks();
    const newTask = {
        id: crypto.randomUUID(),
        title,
        duration: minutes * 60,
        status: 'pending'
    };
    data.tasks.push(newTask);
    saveTasks(data);
    return newTask;
}

// 작업 삭제
export function deleteTask(id) {
    const data = loadTasks();
    const index = data.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        data.tasks.splice(index, 1);
        // currentIndex 조정
        if (data.currentIndex >= data.tasks.length) {
            data.currentIndex = Math.max(0, data.tasks.length - 1);
        }
        saveTasks(data);
    }
    return data;
}

// 상태 변경
export function updateTaskStatus(id, status) {
    const data = loadTasks();
    const task = data.tasks.find(task => task.id === id);
    if (task) {
        task.status = status;
        saveTasks(data);
    }
    return data;
}

// 현재 작업 반환
export function getCurrentTask() {
    const data = loadTasks();
    return data.tasks[data.currentIndex] || null;
}

// 다음 작업 반환
export function getNextTask() {
    const data = loadTasks();
    const nextIndex = data.currentIndex + 1;
    return data.tasks[nextIndex] || null;
}

// 다음 작업으로 이동
export function moveToNextTask() {
    const data = loadTasks();
    if (data.currentIndex < data.tasks.length - 1) {
        data.currentIndex++;
        saveTasks(data);
    }
    return getCurrentTask();
}

// 현재 인덱스 설정
export function setCurrentIndex(index) {
    const data = loadTasks();
    if (index >= 0 && index < data.tasks.length) {
        data.currentIndex = index;
        saveTasks(data);
    }
    return data;
}

// 데이터 초기화 (테스트용)
export function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    return loadTasks();
}
