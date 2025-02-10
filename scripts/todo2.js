class TodoList {
    constructor() {
        // 初始化方法
        this.initElements();
        // 初始化状态
        this.initState();

        // 绑定事件监听
        this.bindEvents();

        // 渲染
        this.render();

    }

    // 初始化 DOM 元素
    initElements() {
        this.dom = {
            newTaskInput: document.getElementById("new-task"),
            taskList: document.getElementById("task-list"),
            taskCount: document.getElementById("task-count"),
            filters: document.querySelector(".filters"),
            clearCompleted: document.getElementById("clear_completed"),
            allComplete: document.getElementById("all_complete"),
            todoFooter: document.querySelector(".todo-footer"),
            box1: document.querySelector(".box1"),
            box2: document.querySelector(".box2")
        };
    }

    // 初始化状态
    initState() {
        this.tasks = [];
        this.currentFilter = "all";
        this.draggedItem = null;
        this.placeholder = this.createPlaceholder();
    }

    // 创建拖拽占位符
    createPlaceholder() {
        const li = document.createElement('li');
        li.classList.add('placeholder');
        return li;
    }

    // 绑定事件监听
    bindEvents() {
        // 输入框事件
        this.dom.newTaskInput.addEventListener('keydown', e => this.handleInputKeydown(e));

        // 任务列表事件（事件委托）
        this.dom.taskList.addEventListener('click', e => this.handleTaskListClick(e));

        // 过滤按钮
        this.dom.filters.addEventListener('click', e => this.handleFilterClick(e));

        // 清除已完成
        this.dom.clearCompleted.addEventListener('click', () => this.clearCompleted());

        // 全选/反选
        this.dom.allComplete.addEventListener('click', () => this.toggleAllComplete());
    }


    // 核心业务逻辑方法
    addTask(text) {
        const timeMatch = text.match(/(\d{1,2}:\d{2})/);
        this.tasks.push({
            text: text.trim(),
            completed: false,
            time: timeMatch?.[0] || null
        });
        this.sortTasks();
    }

    sortTasks() {
        const [withTime, withoutTime] = this.partitionTasks();
        withTime.sort((a, b) => this.compareTimes(b.time, a.time));
        this.tasks = [...withoutTime, ...withTime];
    }

    partitionTasks() {
        return this.tasks.reduce((acc, task) => {
            acc[task.time ? 0 : 1].push(task);
            return acc;
        }, [[], []]);
    }

    compareTimes(a, b) {
        const [hA, mA] = a.split(':').map(Number);
        const [hB, mB] = b.split(':').map(Number);
        return (hA - hB) || (mA - mB);
    }

    // 渲染相关方法render() {
    render() {
        this.dom.taskList.innerHTML = '';
        const filteredTasks = this.getFilteredTasks();

        // 关键修改：逆序遍历原始数组索引
        for (let i = filteredTasks.length - 1; i >= 0; i--) {
            const task = filteredTasks[i];
            const li = this.createTaskElement(task, i); // 使用原始索引
            this.dom.taskList.appendChild(li);
        }

        this.updateUIState();
    }

    createTaskElement(task, originalIndex) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.innerHTML = this.getTaskHTML(task, originalIndex); // 传递原始索引
        this.bindTaskEvents(li, task);
        return li;
    }

    getTaskHTML(task, originalIndex) {
        return `
      <label class="custom-checkbox">
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               data-index="${originalIndex}" class="toggle-complete">
        <span></span>
      </label>
      <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
      <button class="drag-handle">⠿</button>
      <button class="delete-task" data-index="${originalIndex}">×</button>
    `;
    }

    bindTaskEvents(li, task) {
        const textSpan = li.querySelector('span:not(.custom-checkbox span)');
        textSpan.addEventListener('dblclick', () => this.startEditing(textSpan, task));
    }

    // 状态更新方法
    updateUIState() {
        this.updateCounter();
        this.updateClearButton();
        this.updateFooterVisibility();
        this.updateAllCompleteState();
        this.updateFilterButtons();
    }
    updateCounter() {
        const activeCount = this.tasks.filter(t => !t.completed).length;
        this.dom.taskCount.textContent =
            `${activeCount} item${activeCount !== 1 ? "s" : ""} left`;
    }

    updateClearButton() {
        this.dom.clearCompleted.style.display =
            this.tasks.some(t => t.completed) ? 'inline-block' : 'none';
    }

    updateFooterVisibility() {
        const hasTasks = this.tasks.length > 0;
        this.dom.todoFooter.style.display = hasTasks ? 'flex' : 'none';
        this.dom.box1.style.display = hasTasks ? 'block' : 'none';
        this.dom.box2.style.display = hasTasks ? 'block' : 'none';
    }

    updateAllCompleteState() {
        const allCompleted = this.tasks.every(t => t.completed);
        this.dom.allComplete.classList.toggle('all-completed', allCompleted);
        this.dom.allComplete.classList.toggle(
            'custom-button-style',
            this.tasks.length === 0
        );
    }

    updateFilterButtons() {
        document.querySelectorAll('.filters button').forEach(btn => {
            btn.classList.toggle('selected', btn.id === this.currentFilter);
        });
    }

    startEditing(spanElement, task) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'edit-input';

        spanElement.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                task.text = newText;
                const timeMatch = newText.match(/(\d{1,2}:\d{2})/);
                task.time = timeMatch?.[0] || null;
                this.sortTasks();
                this.render();
            } else {
                input.replaceWith(spanElement);
            }
        };

        input.addEventListener('keypress', e => e.key === 'Enter' && saveEdit());
        input.addEventListener('blur', saveEdit);
    }
    // 事件处理方法
    handleInputKeydown(e) {
        if (e.key === 'Enter' && this.dom.newTaskInput.value.trim()) {
            this.addTask(this.dom.newTaskInput.value);
            this.dom.newTaskInput.value = '';
            this.render();
        }
    }

    handleTaskListClick(e) {
        if (e.target.classList.contains('toggle-complete')) {
            this.toggleTaskComplete(e.target.dataset.index);
        } else if (e.target.classList.contains('delete-task')) {
            this.deleteTask(e.target.dataset.index);
        }
    }

    handleFilterClick(e) {
        if (e.target.tagName === 'BUTTON' && e.target.id !== 'clear_completed') {
            this.currentFilter = e.target.id;
            this.render();
        }
    }

    // 获取过滤后的任务列表
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return [...this.tasks]; // 返回副本避免直接修改
        }
    }

    // 切换单个任务状态
    toggleTaskComplete(index) {
        const task = this.tasks[index];
        if (task) {
            task.completed = !task.completed;
            this.render();
        }
    }

    // 删除单个任务
    deleteTask(index) {
        if (index >= 0 && index < this.tasks.length) {
            this.tasks.splice(index, 1);
            this.render();
        }
    }

    // 全选/反选所有任务
    toggleAllComplete() {
        const hasUncompleted = this.tasks.some(task => !task.completed);
        this.tasks.forEach(task => task.completed = hasUncompleted);
        this.render();
    }

    // 清除已完成任务
    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.render();
    }
}

// 使用示例
document.addEventListener("DOMContentLoaded", () => {
    new TodoList();
});