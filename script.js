// 游戏化学习任务管理应用
class LearningHero {
    constructor() {
        this.tasks = [];
        this.totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
        this.streak = parseInt(localStorage.getItem('streak')) || 0;
        this.pomodoroTimer = null;
        this.pomodoroTime = 25 * 60; // 25分钟
        this.isPomodoroRunning = false;
        this.motivationalQuotes = [
            "每一步都是进步，每一刻都在成长！",
            "学习就像升级，每一天都在变强！",
            "困难只是成长路上的经验包！",
            "坚持就是最大的天赋！",
            "今天的努力，就是明天的实力！",
            "学习不是负担，是通往梦想的阶梯！",
            "每完成一个任务，你就离目标更近一步！",
            "失败是成功的垫脚石，继续前进！",
            "你的潜力无限，只需要不断挖掘！",
            "休息是为了走更远的路！",
            "学习让你成为更好的自己！",
            "积少成多，聚沙成塔！",
            "专注当下，未来可期！",
            "勇敢面对挑战，收获成长！",
            "每一次学习都是对自己的投资！"
        ];
        
        this.init();
    }

    init() {
        this.updateStats();
        this.refreshQuote();
        this.loadTasks();
        this.setupEventListeners();
        this.checkStreak();
    }

    setupEventListeners() {
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.importTasks();
            }
        });
    }

    // 复制AI提示词
    copyPrompt() {
        const promptText = document.getElementById('promptText').textContent;
        
        navigator.clipboard.writeText(promptText).then(() => {
            this.showNotification('提示词已复制到剪贴板！', 'success');
            this.playSound('copy');
            
            // 添加复制成功动画
            const copyBtn = document.querySelector('.copy-btn');
            copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制！';
            copyBtn.style.background = 'linear-gradient(45deg, #00b894, #00cec9)';
            
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制提示词';
                copyBtn.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)';
            }, 2000);
        }).catch(() => {
            this.showNotification('复制失败，请手动选择文本复制', 'error');
        });
    }

    // 导入AI生成的任务
    importTasks() {
        const importText = document.getElementById('importText').value.trim();
        
        if (!importText) {
            this.showNotification('请先粘贴AI生成的任务列表！', 'warning');
            return;
        }

        try {
            this.tasks = this.parseTasksFromText(importText);
            this.saveTasks();
            this.renderTasks();
            this.showTasksSection();
            this.showNotification(`成功导入 ${this.tasks.length} 个任务组！开始你的学习冒险吧！`, 'success');
            this.playSound('success');
            
            // 清空输入框
            document.getElementById('importText').value = '';
            
            // 滚动到任务区域
            document.getElementById('tasksSection').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } catch (error) {
            this.showNotification('任务格式解析失败，请检查格式是否正确', 'error');
            console.error('Parse error:', error);
        }
    }

    // 解析任务文本
    parseTasksFromText(text) {
        const tasks = [];
        const sections = text.split('----').map(s => s.trim()).filter(s => s);
        
        sections.forEach((section, groupIndex) => {
            const lines = section.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) return;
            
            const groupTitle = lines[0];
            const subtasks = lines.slice(1)
                .filter(line => line.startsWith('-') || line.startsWith('•'))
                .map((line, index) => ({
                    id: `task_${groupIndex}_${index}`,
                    text: line.replace(/^[-•]\s*/, ''),
                    completed: false,
                    points: Math.floor(Math.random() * 15) + 10 // 10-24分随机分数
                }));
            
            if (subtasks.length > 0) {
                tasks.push({
                    id: `group_${groupIndex}`,
                    title: groupTitle,
                    tasks: subtasks,
                    progress: 0
                });
            }
        });
        
        return tasks;
    }

    // 渲染任务列表
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        container.innerHTML = '';
        
        this.tasks.forEach(group => {
            const groupElement = this.createTaskGroupElement(group);
            container.appendChild(groupElement);
        });
    }

    // 创建任务组元素
    createTaskGroupElement(group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'task-group';
        groupDiv.style.animationDelay = `${Math.random() * 0.3}s`;
        
        const completedTasks = group.tasks.filter(task => task.completed).length;
        const progress = (completedTasks / group.tasks.length) * 100;
        
        groupDiv.innerHTML = `
            <h3>
                <i class="fas fa-flag"></i>
                ${group.title}
                <span style="font-size: 0.8em; color: #666; margin-left: 1rem;">
                    (${completedTasks}/${group.tasks.length})
                </span>
            </h3>
            <div class="task-progress">
                <div class="task-progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="tasks-list">
                ${group.tasks.map(task => this.createTaskItemHTML(task, group.id)).join('')}
            </div>
        `;
        
        return groupDiv;
    }

    // 创建单个任务HTML
    createTaskItemHTML(task, groupId) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" 
                 onclick="learningHero.toggleTask('${groupId}', '${task.id}')">
                <div class="task-checkbox ${task.completed ? 'completed' : ''}"></div>
                <div class="task-text">${task.text}</div>
                <div class="task-points">
                    <i class="fas fa-star"></i>
                    ${task.points}
                </div>
            </div>
        `;
    }

    // 切换任务状态
    toggleTask(groupId, taskId) {
        const group = this.tasks.find(g => g.id === groupId);
        const task = group.tasks.find(t => t.id === taskId);
        
        if (task.completed) return; // 已完成的任务不能取消
        
        task.completed = true;
        this.totalPoints += task.points;
        
        // 播放成功音效
        this.playSound('success');
        
        // 显示成就弹窗
        this.showAchievement(task.text, task.points);
        
        // 更新UI
        this.saveTasks();
        this.saveStats();
        this.updateStats();
        this.renderTasks();
        
        // 检查是否完成了整个任务组
        const completedTasks = group.tasks.filter(t => t.completed).length;
        if (completedTasks === group.tasks.length) {
            setTimeout(() => {
                this.showAchievement(`🎉 恭喜完成任务组：${group.title}`, 50);
                this.playSound('levelup');
            }, 1000);
        }
        
        // 更新连续学习天数
        this.updateStreak();
    }

    // 显示任务区域
    showTasksSection() {
        const tasksSection = document.getElementById('tasksSection');
        tasksSection.style.display = 'block';
        setTimeout(() => {
            tasksSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    // 番茄钟功能
    togglePomodoro() {
        if (this.isPomodoroRunning) {
            this.stopPomodoro();
        } else {
            this.startPomodoro();
        }
    }

    startPomodoro() {
        this.isPomodoroRunning = true;
        const btn = document.getElementById('pomodoroBtn');
        btn.innerHTML = '<i class="fas fa-pause"></i> <span id="pomodoroTime">25:00</span>';
        btn.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
        
        this.pomodoroTimer = setInterval(() => {
            this.pomodoroTime--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoroTime <= 0) {
                this.completePomodoroSession();
            }
        }, 1000);
        
        this.showNotification('🍅 番茄钟开始！专注学习25分钟', 'info');
        this.playSound('start');
    }

    stopPomodoro() {
        this.isPomodoroRunning = false;
        clearInterval(this.pomodoroTimer);
        this.pomodoroTime = 25 * 60;
        
        const btn = document.getElementById('pomodoroBtn');
        btn.innerHTML = '<i class="fas fa-clock"></i> <span id="pomodoroTime">25:00</span>';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        
        this.updatePomodoroDisplay();
        this.showNotification('番茄钟已停止', 'info');
    }

    completePomodoroSession() {
        this.isPomodoroRunning = false;
        clearInterval(this.pomodoroTimer);
        this.pomodoroTime = 25 * 60;
        
        const btn = document.getElementById('pomodoroBtn');
        btn.innerHTML = '<i class="fas fa-clock"></i> <span id="pomodoroTime">25:00</span>';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        
        this.updatePomodoroDisplay();
        this.showAchievement('🍅 番茄钟完成！', 25);
        this.totalPoints += 25;
        this.saveStats();
        this.updateStats();
        this.playSound('levelup');
        
        this.showNotification('🎉 恭喜完成一个番茄钟！休息5分钟吧~', 'success');
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroTime / 60);
        const seconds = this.pomodoroTime % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('pomodoroTime').textContent = timeStr;
    }

    // 更新统计数据
    updateStats() {
        document.getElementById('totalPoints').textContent = this.totalPoints;
        document.getElementById('streak').textContent = this.streak;
    }

    // 更新连续学习天数
    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('lastActiveDate');
        
        if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastActive === yesterday.toDateString()) {
                this.streak++;
            } else {
                this.streak = 1;
            }
            
            localStorage.setItem('lastActiveDate', today);
            localStorage.setItem('streak', this.streak.toString());
            this.updateStats();
        }
    }

    // 检查连续学习天数
    checkStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('lastActiveDate');
        
        if (lastActive && lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastActive !== yesterday.toDateString()) {
                // 连续天数中断
                this.streak = 0;
                localStorage.setItem('streak', '0');
                this.updateStats();
            }
        }
    }

    // 刷新励志文案
    refreshQuote() {
        const quoteElement = document.getElementById('motivationText');
        const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.textContent = randomQuote;
            quoteElement.style.opacity = '1';
        }, 300);
        
        this.playSound('refresh');
    }

    // 显示成就弹窗
    showAchievement(title, points) {
        const modal = document.getElementById('achievementModal');
        document.getElementById('achievementTitle').textContent = '任务完成！';
        document.getElementById('achievementMessage').textContent = title;
        document.getElementById('achievementPoints').textContent = points;
        
        modal.classList.add('show');
        
        // 创建烟花效果
        this.createFireworks();
    }

    // 关闭成就弹窗
    closeAchievement() {
        const modal = document.getElementById('achievementModal');
        modal.classList.remove('show');
    }

    // 创建烟花效果
    createFireworks() {
        const colors = ['#ff6b6b', '#4facfe', '#ffd700', '#00b894', '#a29bfe'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.style.position = 'fixed';
                firework.style.left = Math.random() * window.innerWidth + 'px';
                firework.style.top = Math.random() * window.innerHeight + 'px';
                firework.style.width = '4px';
                firework.style.height = '4px';
                firework.style.background = colors[Math.floor(Math.random() * colors.length)];
                firework.style.borderRadius = '50%';
                firework.style.pointerEvents = 'none';
                firework.style.zIndex = '9999';
                firework.style.animation = 'firework 1s ease-out forwards';
                
                document.body.appendChild(firework);
                
                setTimeout(() => {
                    document.body.removeChild(firework);
                }, 1000);
            }, i * 100);
        }
        
        // 添加烟花动画CSS
        if (!document.querySelector('#firework-styles')) {
            const style = document.createElement('style');
            style.id = 'firework-styles';
            style.textContent = `
                @keyframes firework {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(20);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 播放音效
    playSound(type) {
        try {
            // 创建简单的音频提示
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency;
            let duration;
            
            switch (type) {
                case 'success':
                    frequency = 523.25; // C5
                    duration = 0.3;
                    break;
                case 'levelup':
                    frequency = 659.25; // E5
                    duration = 0.5;
                    break;
                case 'copy':
                    frequency = 440; // A4
                    duration = 0.2;
                    break;
                case 'refresh':
                    frequency = 349.23; // F4
                    duration = 0.15;
                    break;
                case 'start':
                    frequency = 392; // G4
                    duration = 0.25;
                    break;
                default:
                    frequency = 261.63; // C4
                    duration = 0.2;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            // 音频播放失败时静默处理
            console.log('Audio not supported');
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // 添加通知动画CSS
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 保存任务到本地存储
    saveTasks() {
        localStorage.setItem('learningTasks', JSON.stringify(this.tasks));
    }

    // 从本地存储加载任务
    loadTasks() {
        const saved = localStorage.getItem('learningTasks');
        if (saved) {
            try {
                this.tasks = JSON.parse(saved);
                if (this.tasks.length > 0) {
                    this.renderTasks();
                    this.showTasksSection();
                }
            } catch (error) {
                console.error('Failed to load tasks:', error);
                this.tasks = [];
            }
        }
    }

    // 保存统计数据
    saveStats() {
        localStorage.setItem('totalPoints', this.totalPoints.toString());
        localStorage.setItem('streak', this.streak.toString());
    }

    // 清除所有数据（重置功能）
    clearAllData() {
        if (confirm('确定要清除所有学习数据吗？这将重置你的进度。')) {
            localStorage.clear();
            this.tasks = [];
            this.totalPoints = 0;
            this.streak = 0;
            this.updateStats();
            document.getElementById('tasksContainer').innerHTML = '';
            document.getElementById('tasksSection').style.display = 'none';
            document.getElementById('importText').value = '';
            this.showNotification('所有数据已清除，开始新的学习旅程吧！', 'info');
        }
    }
}

// 全局函数（供HTML调用）
function copyPrompt() {
    learningHero.copyPrompt();
}

function importTasks() {
    learningHero.importTasks();
}

function refreshQuote() {
    learningHero.refreshQuote();
}

function togglePomodoro() {
    learningHero.togglePomodoro();
}

function closeAchievement() {
    learningHero.closeAchievement();
}

// 初始化应用
let learningHero;

document.addEventListener('DOMContentLoaded', () => {
    learningHero = new LearningHero();
    
    // 添加键盘快捷键说明
    const helpText = document.createElement('div');
    helpText.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 10px;
        font-size: 0.8rem;
        opacity: 0.7;
        backdrop-filter: blur(10px);
    `;
    helpText.innerHTML = '💡 快捷键：Ctrl+Enter 快速导入任务';
    document.body.appendChild(helpText);
    
    // 3秒后隐藏提示
    setTimeout(() => {
        helpText.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(helpText)) {
                document.body.removeChild(helpText);
            }
        }, 1000);
    }, 3000);
});

// 添加双击清除数据功能（开发用）
let clickCount = 0;
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
        clickCount++;
        if (clickCount >= 3) {
            clickCount = 0;
            learningHero.clearAllData();
        }
        setTimeout(() => { clickCount = 0; }, 2000);
    }
});

// 导出供外部使用
window.LearningHero = LearningHero;