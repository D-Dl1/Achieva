// 游戏化学习任务管理应用 - 完全重构版本
class LearningHero {
    constructor() {
        this.tasks = [];
        
        // 角色系统
        this.character = {
            level: parseInt(localStorage.getItem('heroLevel')) || 1,
            experience: parseInt(localStorage.getItem('heroExp')) || 0,
            expToNext: this.calculateExpToNext(parseInt(localStorage.getItem('heroLevel')) || 1),
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            avatar: localStorage.getItem('heroAvatar') || 'warrior'
        };
        
        // 技能系统
        this.skills = {
            focus: parseInt(localStorage.getItem('skillFocus')) || 1,
            endurance: parseInt(localStorage.getItem('skillEndurance')) || 1,
            knowledge: parseInt(localStorage.getItem('skillKnowledge')) || 1,
            creativity: parseInt(localStorage.getItem('skillCreativity')) || 1
        };
        
        // 装备系统
        this.equipment = {
            weapon: localStorage.getItem('equipWeapon') || null,
            armor: localStorage.getItem('equipArmor') || null,
            accessory: localStorage.getItem('equipAccessory') || null
        };
        
        // 成就系统
        this.achievements = JSON.parse(localStorage.getItem('achievements')) || {};
        this.badges = JSON.parse(localStorage.getItem('badges')) || [];
        
        // 传统数据保持兼容
        this.totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
        this.streak = parseInt(localStorage.getItem('streak')) || 0;
        this.completedTasksCount = parseInt(localStorage.getItem('completedTasksCount')) || 0;
        this.pomodoroTimer = null;
        this.pomodoroTime = 25 * 60;
        this.isPomodoroRunning = false;
        this.isBreakTime = false;
        this.breakTime = 5 * 60;
        this.pomodoroSessions = parseInt(localStorage.getItem('pomodoroSessions')) || 0;
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
        
        // 游戏数据定义
        this.gameData = {
            equipmentList: [
                { id: 'sword_wooden', name: '木剑', type: 'weapon', effect: '经验值+10%', unlock: 'level_5' },
                { id: 'sword_steel', name: '钢剑', type: 'weapon', effect: '经验值+25%', unlock: 'level_15' },
                { id: 'sword_magic', name: '魔法剑', type: 'weapon', effect: '经验值+50%', unlock: 'level_30' },
                { id: 'armor_leather', name: '皮甲', type: 'armor', effect: '任务失败保护', unlock: 'level_8' },
                { id: 'armor_chain', name: '锁甲', type: 'armor', effect: '连击奖励+20%', unlock: 'level_20' },
                { id: 'ring_focus', name: '专注戒指', type: 'accessory', effect: '番茄钟效率+15%', unlock: 'skill_focus_10' }
            ],
            achievementList: [
                { id: 'first_task', name: '初出茅庐', desc: '完成第一个任务', reward: 'exp:50', icon: '🌟' },
                { id: 'streak_7', name: '七日修行', desc: '连续学习7天', reward: 'exp:200,equipment:ring_focus', icon: '🔥' },
                { id: 'task_master', name: '任务大师', desc: '完成100个任务', reward: 'exp:1000,equipment:sword_magic', icon: '⚔️' },
                { id: 'pomodoro_ninja', name: '番茄忍者', desc: '完成50个番茄钟', reward: 'exp:500,skill:focus+5', icon: '🍅' },
                { id: 'knowledge_seeker', name: '求知者', desc: '学习技能达到10级', reward: 'exp:800', icon: '📚' }
            ]
        };
        
        this.taskHoverHandler = () => this.playSound('hover');
        this.init();
    }

    // 计算升级所需经验值
    calculateExpToNext(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    init() {
        this.updateStats();
        this.updateCharacterDisplay();
        this.updateAchievementsList();
        this.refreshQuote();
        this.loadTasks();
        this.setupEventListeners();
        this.checkStreak();
        this.setupSoundEffects();
        this.createBackgroundParticles();
        this.checkAchievements();
    }

    setupEventListeners() {
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.importTasks();
            }
            if (e.key === 'Enter' && document.activeElement.id === 'quickTaskInput') {
                this.addQuickTask();
            }
        });
    }

    setupSoundEffects() {
        // 为所有按钮添加悬停音效
        const buttons = document.querySelectorAll('button, .task-item');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });

        // 为卡片添加悬停音效
        const cards = document.querySelectorAll('.prompt-card, .import-card, .motivation-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                setTimeout(() => this.playSound('hover'), 100);
            });
        });
    }

    // 创建背景粒子效果
    createBackgroundParticles() {
        const container = document.getElementById('particlesContainer');
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(container);
        }
        
        // 定期添加新粒子
        setInterval(() => {
            this.createParticle(container);
        }, 3000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = Math.random() > 0.5 ? 'particle star' : 'particle bubble';
        
        // 随机位置和大小
        const size = Math.random() * 6 + 2; // 2-8px
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 10 + 15; // 15-25秒
        
        particle.style.cssText = `
            left: ${startX}px;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        container.appendChild(particle);
        
        // 动画结束后移除粒子
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, (duration + 5) * 1000);
    }

    // 创建庆祝粒子效果
    createCelebrationParticles() {
        const colors = ['#ff6b6b', '#4facfe', '#ffd700', '#00b894', '#a29bfe', '#fd79a8'];
        const container = document.body;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -10px;
                    width: ${Math.random() * 8 + 4}px;
                    height: ${Math.random() * 8 + 4}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    pointer-events: none;
                    z-index: 10000;
                    border-radius: 50%;
                    animation: confetti 3s linear forwards;
                `;
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    if (container.contains(particle)) {
                        container.removeChild(particle);
                    }
                }, 3000);
            }, i * 50);
        }
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
        
        // 重新绑定音效到新创建的任务项
        this.bindTaskItemSounds();
    }

    // 为任务项绑定音效
    bindTaskItemSounds() {
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            item.removeEventListener('mouseenter', this.taskHoverHandler);
            item.addEventListener('mouseenter', this.taskHoverHandler);
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

    // 切换任务状态 - 重构版本
    toggleTask(groupId, taskId) {
        const group = this.tasks.find(g => g.id === groupId);
        const task = group.tasks.find(t => t.id === taskId);
        
        if (task.completed) return; // 已完成的任务不能取消
        
        // 添加完成动画
        const taskElement = document.querySelector(`[onclick="learningHero.toggleTask('${groupId}', '${taskId}')"]`);
        if (taskElement) {
            taskElement.style.animation = 'completePulse 0.8s ease-out';
            taskElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                taskElement.style.animation = '';
                taskElement.style.transform = '';
            }, 800);
        }
        
        task.completed = true;
        this.completedTasksCount++;
        
        // 智能技能点分配
        this.awardSkillPoints(task, group);
        
        // 播放成功音效
        this.playSound('success');
        
        // 创建庆祝粒子效果
        this.createTaskCompleteEffect(taskElement);
        
        // 动画更新统计数据
        this.animateStatUpdate();
        
        // 显示成就弹窗 - 包含技能提升信息
        const skillGained = this.getSkillGainedFromTask(task, group);
        const achievementText = skillGained ? 
            `${task.text}\n+${skillGained.skill} 技能` : 
            task.text;
        
        this.showAchievement(achievementText, task.points);
        
        // 更新连击数
        this.updateStreak();
        
        // 更新UI
        this.saveTasks();
        this.saveStats();
        this.updateStats();
        this.renderTasks();
        
        // 检查是否完成了整个任务组
        const completedTasks = group.tasks.filter(t => t.completed).length;
        if (completedTasks === group.tasks.length) {
            setTimeout(() => {
                this.createFireworks();
                this.showGroupCompleteReward(group);
            }, 1000);
        }
        
        // 更新连续学习天数
        this.updateStreak();
    }
    
    // 智能技能点分配
    awardSkillPoints(task, group) {
        const taskText = (task.text + ' ' + group.title).toLowerCase();
        let skillsGained = {};
        
        // 基于任务内容的智能分析
        if (taskText.includes('阅读') || taskText.includes('看书') || taskText.includes('学习') || taskText.includes('理解')) {
            skillsGained.knowledge = 1;
        }
        
        if (taskText.includes('练习') || taskText.includes('做题') || taskText.includes('实践') || taskText.includes('应用')) {
            skillsGained.focus = 1;
        }
        
        if (taskText.includes('创作') || taskText.includes('设计') || taskText.includes('写作') || taskText.includes('创新')) {
            skillsGained.creativity = 1;
        }
        
        if (taskText.includes('坚持') || taskText.includes('连续') || taskText.includes('每天') || taskText.includes('规律')) {
            skillsGained.endurance = 1;
        }
        
        // 如果没有匹配到特定技能，随机奖励一个技能点
        if (Object.keys(skillsGained).length === 0) {
            const skills = ['focus', 'endurance', 'knowledge', 'creativity'];
            const randomSkill = skills[Math.floor(Math.random() * skills.length)];
            skillsGained[randomSkill] = 1;
        }
        
        // 应用技能点
        Object.keys(skillsGained).forEach(skill => {
            this.skills[skill] += skillsGained[skill];
            this.showSkillGainEffect(skill, skillsGained[skill]);
        });
        
        task.skillsGained = skillsGained; // 记录获得的技能
    }
    
    // 获取任务获得的技能信息
    getSkillGainedFromTask(task, group) {
        if (task.skillsGained) {
            const skillNames = {
                focus: '专注',
                endurance: '耐力', 
                knowledge: '知识',
                creativity: '创造'
            };
            
            const skills = Object.keys(task.skillsGained).map(skill => 
                `${skillNames[skill]} +${task.skillsGained[skill]}`
            ).join(', ');
            
            return { skill: skills };
        }
        return null;
    }
    
    // 显示技能获得特效
    showSkillGainEffect(skillType, amount) {
        const skillIcons = {
            focus: '🎯',
            endurance: '💪',
            knowledge: '🧠',
            creativity: '✨'
        };
        
        const skillNames = {
            focus: '专注',
            endurance: '耐力',
            knowledge: '知识',
            creativity: '创造'
        };
        
        const effect = document.createElement('div');
        effect.className = 'skill-gain-effect';
        effect.innerHTML = `
            <div class="skill-icon">${skillIcons[skillType]}</div>
            <div class="skill-gain-text">+${amount} ${skillNames[skillType]}</div>
        `;
        
        effect.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            opacity: 0;
            animation: skillGainFloat 2s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }
    
    // 创建任务完成特效
    createTaskCompleteEffect(taskElement) {
        if (!taskElement) return;
        
        // 创建经验值飞行效果
        const expOrb = document.createElement('div');
        expOrb.className = 'exp-orb';
        expOrb.textContent = '+EXP';
        
        const rect = taskElement.getBoundingClientRect();
        expOrb.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width/2}px;
            top: ${rect.top + rect.height/2}px;
            background: linear-gradient(45deg, #ffd700, #ffed4a);
            color: #333;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 2px 10px rgba(255, 215, 0, 0.5);
            animation: expFly 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(expOrb);
        setTimeout(() => expOrb.remove(), 1500);
        
        // 原有的庆祝粒子效果
        this.createCelebrationParticles();
    }
    
    // 显示任务组完成奖励
    showGroupCompleteReward(group) {
        // 任务组完成额外奖励
        const bonusExp = 50;
        const bonusSkillPoints = 2;
        
        // 随机提升一个技能
        const skills = ['focus', 'endurance', 'knowledge', 'creativity'];
        const randomSkill = skills[Math.floor(Math.random() * skills.length)];
        this.skills[randomSkill] += bonusSkillPoints;
        
        this.createFireworks();
        this.showAchievement(`🎉 任务组完成：${group.title}\n+${bonusSkillPoints} ${randomSkill} 技能点`, bonusExp);
        this.playSound('levelup');
        
        // 显示特殊完成特效
        this.createGroupCompleteEffect();
    }
    
    // 任务组完成特效
    createGroupCompleteEffect() {
        const effect = document.createElement('div');
        effect.className = 'group-complete-effect';
        effect.innerHTML = `
            <div class="complete-text">MISSION COMPLETE!</div>
            <div class="complete-subtitle">任务组完成</div>
        `;
        
        effect.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            z-index: 10000;
            text-align: center;
            pointer-events: none;
            animation: groupCompleteShow 3s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 3000);
    }

    // 动画更新统计数据
    animateStatUpdate() {
        const pointsElement = document.getElementById('totalPoints');
        const streakElement = document.getElementById('streak');
        
        [pointsElement, streakElement].forEach(element => {
            element.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        });
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
        
        if (!this.isBreakTime) {
            // 完成工作番茄钟，开始休息
            this.pomodoroSessions++;
            localStorage.setItem('pomodoroSessions', this.pomodoroSessions.toString());
            
            this.showAchievement('🍅 番茄钟完成！', 25);
            this.totalPoints += 25;
            this.saveStats();
            this.updateStats();
            this.playSound('levelup');
            this.createCelebrationParticles();
            
            // 自动开始休息时间
            this.startBreakTime();
        } else {
            // 休息时间结束
            this.showNotification('🎯 休息结束！准备好开始新的番茄钟了吗？', 'info');
            this.resetPomodoro();
        }
    }

    startBreakTime() {
        this.isBreakTime = true;
        this.pomodoroTime = this.breakTime;
        this.isPomodoroRunning = true;
        
        const btn = document.getElementById('pomodoroBtn');
        btn.innerHTML = '<i class="fas fa-coffee"></i> <span id="pomodoroTime">05:00</span>';
        btn.style.background = 'linear-gradient(45deg, #00b894, #55a3ff)';
        
        this.pomodoroTimer = setInterval(() => {
            this.pomodoroTime--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoroTime <= 0) {
                this.completePomodoroSession();
            }
        }, 1000);
        
        this.showNotification('☕ 休息时间开始！放松5分钟', 'success');
        this.updatePomodoroDisplay();
    }

    resetPomodoro() {
        this.isBreakTime = false;
        this.isPomodoroRunning = false;
        this.pomodoroTime = 25 * 60;
        
        const btn = document.getElementById('pomodoroBtn');
        btn.innerHTML = '<i class="fas fa-clock"></i> <span id="pomodoroTime">25:00</span>';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroTime / 60);
        const seconds = this.pomodoroTime % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('pomodoroTime').textContent = timeStr;
    }

    // 快速任务功能
    addQuickTask() {
        const input = document.getElementById('quickTaskInput');
        const taskText = input.value.trim();
        
        if (!taskText) {
            this.showNotification('请输入任务内容！', 'warning');
            return;
        }
        
        // 创建快速任务
        const quickTask = {
            id: Date.now(),
            title: '快速任务',
            subtasks: [{
                id: Date.now() + 1,
                text: taskText,
                completed: false,
                points: 15
            }]
        };
        
        this.tasks.push(quickTask);
        this.saveTasks();
        this.displayTasks();
        
        // 清空输入框并添加视觉反馈
        input.value = '';
        this.showNotification(`✨ 快速任务"${taskText}"已创建！`, 'success');
        this.playSound('success');
        
        // 显示任务区域
        const tasksSection = document.getElementById('tasksSection');
        tasksSection.style.display = 'block';
        
        // 滚动到任务区域
        tasksSection.scrollIntoView({ behavior: 'smooth' });
    }

    setQuickTask(taskText) {
        const input = document.getElementById('quickTaskInput');
        input.value = taskText;
        input.focus();
        
        // 添加输入动画
        input.style.background = 'rgba(255, 193, 7, 0.2)';
        setTimeout(() => {
            input.style.background = 'rgba(255, 255, 255, 0.1)';
        }, 300);
    }

    // 更新统计数据
    updateStats() {
        document.getElementById('totalPoints').textContent = this.totalPoints;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('completedTasks').textContent = this.completedTasksCount;
        
        // 更新角色数据显示
        this.updateCharacterDisplay();
        this.saveGameData();
    }
    
    // 更新角色显示
    updateCharacterDisplay() {
        // 更新等级和经验条
        const levelElement = document.getElementById('heroLevel');
        const expElement = document.getElementById('heroExp');
        const expBarElement = document.getElementById('expBar');
        
        if (levelElement) levelElement.textContent = this.character.level;
        if (expElement) expElement.textContent = `${this.character.experience}/${this.character.expToNext}`;
        if (expBarElement) {
            const percentage = (this.character.experience / this.character.expToNext) * 100;
            expBarElement.style.width = `${Math.min(percentage, 100)}%`;
        }
        
        // 更新技能显示
        Object.keys(this.skills).forEach(skill => {
            const skillElement = document.getElementById(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`);
            if (skillElement) skillElement.textContent = this.skills[skill];
        });
    }
    
    // 添加经验值
    addExperience(amount) {
        const bonusMultiplier = this.getEquipmentBonus('exp');
        const finalAmount = Math.floor(amount * bonusMultiplier);
        
        this.character.experience += finalAmount;
        this.totalPoints += finalAmount;
        
        // 检查升级
        while (this.character.experience >= this.character.expToNext) {
            this.levelUp();
        }
        
        this.updateCharacterDisplay();
    }
    
    // 角色升级
    levelUp() {
        this.character.experience -= this.character.expToNext;
        this.character.level++;
        this.character.expToNext = this.calculateExpToNext(this.character.level);
        
        // 升级奖励
        this.character.maxHealth += 10;
        this.character.health = this.character.maxHealth;
        this.character.maxMana += 5;
        this.character.mana = this.character.maxMana;
        
        // 显示升级通知
        this.showLevelUpNotification();
        
        // 解锁新装备和技能
        this.checkUnlocks();
    }
    
    // 显示升级通知
    showLevelUpNotification() {
        this.showAchievement(`恭喜！等级提升到 ${this.character.level} 级！`, 0, 'level');
        this.createLevelUpEffect();
    }
    
    // 获取装备加成
    getEquipmentBonus(type) {
        let bonus = 1.0;
        
        Object.values(this.equipment).forEach(equipId => {
            if (equipId) {
                const equip = this.gameData.equipmentList.find(e => e.id === equipId);
                if (equip && equip.effect.includes(type)) {
                    const match = equip.effect.match(/(\d+)%/);
                    if (match) {
                        bonus += parseInt(match[1]) / 100;
                    }
                }
            }
        });
        
        return bonus;
    }
    
    // 保存游戏数据
    saveGameData() {
        localStorage.setItem('heroLevel', this.character.level);
        localStorage.setItem('heroExp', this.character.experience);
        localStorage.setItem('heroAvatar', this.character.avatar);
        
        Object.keys(this.skills).forEach(skill => {
            localStorage.setItem(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`, this.skills[skill]);
        });
        
        Object.keys(this.equipment).forEach(type => {
            localStorage.setItem(`equip${type.charAt(0).toUpperCase() + type.slice(1)}`, this.equipment[type] || '');
        });
        
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
        localStorage.setItem('badges', JSON.stringify(this.badges));
        localStorage.setItem('totalPoints', this.totalPoints);
        localStorage.setItem('streak', this.streak);
        localStorage.setItem('completedTasksCount', this.completedTasksCount);
        localStorage.setItem('pomodoroSessions', this.pomodoroSessions);
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

    // 显示成就弹窗 - 重构版本
    showAchievement(title, points, type = 'task') {
        const modal = document.getElementById('achievementModal');
        if (!modal) return;
        
        // 防止界面闪烁
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        
        // 设置内容
        document.getElementById('achievementTitle').textContent = type === 'level' ? '等级提升！' : '任务完成！';
        document.getElementById('achievementMessage').textContent = title;
        
        // 添加到角色经验值
        this.addExperience(points);
        
        // 显示模态框
        requestAnimationFrame(() => {
            modal.classList.add('show');
            modal.style.opacity = '1';
        });
        
        // 动画显示点数
        this.animatePoints(points);
        
        // 创建烟花效果和庆祝粒子
        this.createFireworks();
        this.createCelebrationParticles();
        
        // 播放成就音效
        this.playSound('achievement');
        
        // 检查是否达成新成就
        setTimeout(() => this.checkAchievements(), 500);
    }

    // 动画显示点数
    animatePoints(targetPoints) {
        const pointsElement = document.getElementById('achievementPoints');
        const duration = 1000; // 1秒
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentPoints = Math.floor(targetPoints * easeOut);
            
            pointsElement.textContent = currentPoints;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                pointsElement.textContent = targetPoints;
                // 添加闪烁效果
                pointsElement.style.animation = 'pulse 0.5s ease-in-out 3';
            }
        };
        
        animate();
    }

    // 检查成就系统
    checkAchievements() {
        this.gameData.achievementList.forEach(achievement => {
            if (this.achievements[achievement.id]) return; // 已获得
            
            let unlocked = false;
            
            switch (achievement.id) {
                case 'first_task':
                    unlocked = this.completedTasksCount >= 1;
                    break;
                case 'streak_7':
                    unlocked = this.streak >= 7;
                    break;
                case 'task_master':
                    unlocked = this.completedTasksCount >= 100;
                    break;
                case 'pomodoro_ninja':
                    unlocked = this.pomodoroSessions >= 50;
                    break;
                case 'knowledge_seeker':
                    unlocked = Object.values(this.skills).some(skill => skill >= 10);
                    break;
            }
            
            if (unlocked) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    // 解锁成就
    unlockAchievement(achievement) {
        this.achievements[achievement.id] = {
            name: achievement.name,
            desc: achievement.desc,
            icon: achievement.icon,
            unlockedAt: Date.now()
        };
        
        // 处理奖励
        if (achievement.reward) {
            const rewards = achievement.reward.split(',');
            rewards.forEach(reward => {
                const [type, value] = reward.split(':');
                if (type === 'exp') {
                    this.addExperience(parseInt(value));
                } else if (type === 'equipment') {
                    this.unlockEquipment(value);
                } else if (type === 'skill') {
                    const [skillName, amount] = value.split('+');
                    this.skills[skillName] += parseInt(amount);
                }
            });
        }
        
        // 显示成就通知
        this.showAchievementUnlock(achievement);
    }
    
    // 显示成就解锁通知
    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 动画显示
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        
        this.playSound('achievement');
        
        // 更新成就列表显示
        this.updateAchievementsList();
    }
    
    // 更新成就列表显示
    updateAchievementsList() {
        const achievementsList = document.getElementById('achievementsList');
        if (!achievementsList) return;
        
        // 清空现有内容
        achievementsList.innerHTML = '';
        
        // 获取最近的3个成就
        const recentAchievements = Object.values(this.achievements)
            .sort((a, b) => b.unlockedAt - a.unlockedAt)
            .slice(0, 3);
        
        if (recentAchievements.length === 0) {
            achievementsList.innerHTML = '<div class="achievement-badge">🎯 开始你的冒险</div>';
            return;
        }
        
        recentAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.innerHTML = `${achievement.icon} ${achievement.name}`;
            badge.title = achievement.desc;
            achievementsList.appendChild(badge);
        });
    }
    
    // 检查解锁
    checkUnlocks() {
        this.gameData.equipmentList.forEach(equipment => {
            const [unlockType, unlockValue] = equipment.unlock.split('_');
            let canUnlock = false;
            
            if (unlockType === 'level') {
                canUnlock = this.character.level >= parseInt(unlockValue);
            } else if (unlockType === 'skill') {
                const [skillName, level] = unlockValue.split('_');
                canUnlock = this.skills[skillName] >= parseInt(level);
            }
            
            if (canUnlock && !this.hasEquipment(equipment.id)) {
                this.unlockEquipment(equipment.id);
            }
        });
    }
    
    // 解锁装备
    unlockEquipment(equipmentId) {
        const equipment = this.gameData.equipmentList.find(e => e.id === equipmentId);
        if (equipment) {
            this.showEquipmentUnlock(equipment);
        }
    }
    
    // 显示装备解锁通知
    showEquipmentUnlock(equipment) {
        const notification = document.createElement('div');
        notification.className = 'equipment-notification';
        notification.innerHTML = `
            <div class="equipment-icon">⚔️</div>
            <div class="equipment-info">
                <div class="equipment-name">新装备解锁：${equipment.name}</div>
                <div class="equipment-effect">${equipment.effect}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
        
        this.playSound('unlock');
    }
    
    // 创建升级特效
    createLevelUpEffect() {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.innerHTML = `
            <div class="level-up-text">LEVEL UP!</div>
            <div class="level-up-number">${this.character.level}</div>
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.classList.add('show'), 100);
        setTimeout(() => {
            effect.classList.remove('show');
            setTimeout(() => effect.remove(), 1000);
        }, 2000);
        
        // 创建升级光芒效果
        this.createLevelUpRays();
    }
    
    // 创建升级光芒
    createLevelUpRays() {
        const rays = document.createElement('div');
        rays.className = 'level-up-rays';
        document.body.appendChild(rays);
        
        for (let i = 0; i < 8; i++) {
            const ray = document.createElement('div');
            ray.className = 'ray';
            ray.style.transform = `rotate(${i * 45}deg)`;
            rays.appendChild(ray);
        }
        
        setTimeout(() => rays.remove(), 2000);
    }
    
    // 检查是否拥有装备
    hasEquipment(equipmentId) {
        return Object.values(this.equipment).includes(equipmentId);
    }

    // 关闭成就弹窗 - 修复点击失效问题
    closeAchievement() {
        const modal = document.getElementById('achievementModal');
        if (!modal) return;
        
        // 确保移除显示类
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.playSound('success');
        
        // 添加庆祝粒子效果
        this.createCelebrationParticles();
        
        // 防止事件冒泡
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // 重新聚焦到主界面
        setTimeout(() => {
            document.body.focus();
        }, 100);
    }

    // 创建庆祝粒子效果
    createCelebrationParticles() {
        const colors = ['#ffd700', '#ff6b6b', '#4facfe', '#00b894', '#a29bfe'];
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '10000';
                
                const angle = (i / 8) * 2 * Math.PI;
                const distance = 100 + Math.random() * 50;
                const endX = Math.cos(angle) * distance;
                const endY = Math.sin(angle) * distance;
                
                particle.style.transform = `translate(-50%, -50%)`;
                document.body.appendChild(particle);
                
                particle.animate([
                    { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
                    { transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0)`, opacity: 0 }
                ], {
                    duration: 600,
                    easing: 'ease-out'
                }).onfinish = () => particle.remove();
            }, i * 50);
        }
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
            // 创建音频上下文
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 根据音效类型播放不同的音频
            switch (type) {
                case 'success':
                    this.playSuccessChord(audioContext);
                    break;
                case 'levelup':
                    this.playLevelUpMelody(audioContext);
                    break;
                case 'copy':
                    this.playClickSound(audioContext);
                    break;
                case 'refresh':
                    this.playRefreshSound(audioContext);
                    break;
                case 'start':
                    this.playStartFanfare(audioContext);
                    break;
                case 'achievement':
                    this.playAchievementSound(audioContext);
                    break;
                case 'unlock':
                    this.playUnlockSound(audioContext);
                    break;
                case 'levelup':
                    this.playLevelUpSound(audioContext);
                    break;
                case 'hover':
                    this.playHoverSound(audioContext);
                    break;
                default:
                    this.playDefaultSound(audioContext);
            }
        } catch (error) {
            // 音频播放失败时静默处理
            console.log('Audio not supported');
        }
    }

    // 成功和弦音效
    playSuccessChord(audioContext) {
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - 大三和弦
        const duration = 0.4;
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + duration);
        });
    }

    // 升级旋律音效
    playLevelUpMelody(audioContext) {
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99]; // C5-D5-E5-F5-G5
        const noteDuration = 0.15;
        
        melody.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'square';
            
            const startTime = audioContext.currentTime + index * noteDuration;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration);
        });
    }

    // 点击音效
    playClickSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // 刷新音效
    playRefreshSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(350, audioContext.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    // 开始音效
    playStartFanfare(audioContext) {
        const notes = [
            { freq: 392, time: 0, duration: 0.2 },      // G4
            { freq: 523.25, time: 0.1, duration: 0.2 }, // C5
            { freq: 659.25, time: 0.2, duration: 0.3 }  // E5
        ];
        
        notes.forEach(note => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
            oscillator.type = 'triangle';
            
            const startTime = audioContext.currentTime + note.time;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);
        });
    }

    // 成就音效
    playAchievementSound(audioContext) {
        // 播放更华丽的成就音效
        const chord1 = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const chord2 = [587.33, 739.99, 880, 1174.66];   // D5, F#5, A5, D6
        
        [chord1, chord2].forEach((chord, chordIndex) => {
            chord.forEach((freq, noteIndex) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'triangle';
                
                const startTime = audioContext.currentTime + chordIndex * 0.3;
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.8);
            });
        });
    }

    playUnlockSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 解锁音效：神秘的音调
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    playLevelUpSound(audioContext) {
        // 升级音效：华丽的和弦
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + index * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1 + index * 0.1);
            
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + 1 + index * 0.1);
        });
    }

    // 悬停音效
    playHoverSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(550, audioContext.currentTime + 0.05);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }

    // 默认音效
    playDefaultSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
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
        localStorage.setItem('completedTasksCount', this.completedTasksCount.toString());
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

function addQuickTask() {
    learningHero.addQuickTask();
}

function setQuickTask(taskText) {
    learningHero.setQuickTask(taskText);
}

function closeAchievement() {
    learningHero.closeAchievement();
}

// 添加新的游戏系统方法到全局作用域
window.learningHeroMethods = {
    checkAchievements: function() {
        if (learningHero) learningHero.checkAchievements();
    },
    createLevelUpEffect: function() {
        if (learningHero) learningHero.createLevelUpEffect();
    },
    checkUnlocks: function() {
        if (learningHero) learningHero.checkUnlocks();
    }
};

function togglePromptSection() {
    const promptCard = document.getElementById('promptCard');
    const toggleBtn = document.getElementById('promptToggleBtn');
    
    promptCard.classList.toggle('collapsed');
    toggleBtn.classList.toggle('rotated');
    
    // 播放切换音效
    learningHero.playSound('refresh');
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