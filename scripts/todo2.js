class TodoList {
    constructor() {
        // 初始化 DOM 元素
        this.newTaskInput = document.getElementById("new-task");
        this.taskList = document.getElementById("task-list");
        this.taskCount = document.getElementById("task-count");
        this.filters = document.querySelector(".filters");
        this.clearCompletedButton = document.getElementById("clear_completed");
        this.allCompleteButton = document.getElementById("all_complete");
        this.box1 = document.querySelector(".box1");
        this.box2 = document.querySelector(".box2");
        this.todoFooter = document.querySelector(".todo-footer");

        // 初始化数据状态
        this.tasks = [];
        this.currentFilter = "all";

        // 绑定事件监听
        this.bindEvents();
        this.render();
    }

    // 事件绑定方法
    bindEvents() {
        this.newTaskInput.addEventListener("keydown", this.handleAddTask.bind(this));
        this.taskList.addEventListener("click", this.handleTaskActions.bind(this));
        this.filters.addEventListener("click", this.handleFilterChange.bind(this));
        this.clearCompletedButton.addEventListener("click", this.clearCompleted.bind(this));
        this.allCompleteButton.addEventListener("click", this.toggleAllComplete.bind(this));
    }

    // 核心业务方法
    addTask(text) {
        if (text.trim()) {
            this.tasks.push({
                text: text.trim(),
                completed: false,
            });
            this.render();
        }
    }

    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.render();
    }

    toggleTaskCompletion(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.render();
    }

    updateTaskText(index, newText) {
        if (newText.trim()) {
            this.tasks[index].text = newText.trim();
            this.render();
        }
    }

    clearCompleted() {
        this.tasks = this.tasks.filter((task) => !task.completed);
        this.render();
    }

    toggleAllComplete() {
        const allCompleted = this.tasks.every((task) => task.completed);
        this.tasks.forEach((task) => (task.completed = !allCompleted));
        this.render();
    }

    // 视图渲染方法
    render() {
        this.taskList.innerHTML = "";
        const filteredTasks = this.getFilteredTasks();

        // 渲染任务项
        filteredTasks.reverse().forEach((task, index) => {
            const li = this.createTaskElement(task, index);
            this.taskList.appendChild(li);
        });

        // 更新界面状态
        this.updateCounter();
        this.updateFilterButtons();
        this.updateFooterVisibility();
        this.updateAllCompleteButton();
    }

    // 辅助方法
    getFilteredTasks() {
        switch (this.currentFilter) {
            case "active":
                return this.tasks.filter((task) => !task.completed);
            case "completed":
                return this.tasks.filter((task) => task.completed);
            default:
                return [...this.tasks];
        }
    }

    createTaskElement(task, index) {
        const li = document.createElement("li");
        li.innerHTML = `
      <label class="custom-checkbox">
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               data-index="${index}" class="toggle-complete">
        <span></span>
      </label>
      <span class="${task.completed ? "completed" : ""}">${task.text}</span>
      <button class="delete-task" data-index="${index}">×</button>
    `;

        // 添加双击编辑功能
        const textSpan = li.querySelector('span:not([class="custom-checkbox"] span)');
        textSpan.addEventListener("dblclick", () => this.startEditing(textSpan, task, index));

        return li;
    }

    startEditing(spanElement, task, index) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        input.className = "edit-input";

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                this.updateTaskText(index, newText);
            } else {
                input.replaceWith(spanElement);
            }
        };

        spanElement.replaceWith(input);
        input.focus();

        input.addEventListener("keypress", (e) => e.key === "Enter" && saveEdit());
        input.addEventListener("blur", saveEdit);
    }

    // 状态更新方法
    updateCounter() {
        const activeCount = this.tasks.filter((task) => !task.completed).length;
        this.taskCount.textContent = `${activeCount} item${activeCount !== 1 ? "s" : ""} left`;
    }

    updateFilterButtons() {
        document.querySelectorAll(".filters button").forEach((button) => {
            button.classList.toggle("selected", button.id === this.currentFilter);
        });
    }

    updateFooterVisibility() {
        const hasTasks = this.tasks.length > 0;
        const hasCompleted = this.tasks.some((task) => task.completed);

        this.todoFooter.style.display = hasTasks ? "flex" : "none";
        this.box1.style.display = hasTasks ? "block" : "none";
        this.box2.style.display = hasTasks ? "block" : "none";
        this.clearCompletedButton.style.display = hasCompleted ? "inline-block" : "none";
    }

    updateAllCompleteButton() {
        const allCompleted = this.tasks.every((task) => task.completed);
        this.allCompleteButton.classList.toggle("all-completed", allCompleted && this.tasks.length > 0);
    }

    // 事件处理方法
    handleAddTask(event) {
        if (event.key === "Enter") {
            this.addTask(this.newTaskInput.value);
            this.newTaskInput.value = "";
        }
    }

    handleTaskActions(event) {
        const index = event.target.dataset?.index;

        if (event.target.classList.contains("toggle-complete")) {
            this.toggleTaskCompletion(index);
        }

        if (event.target.classList.contains("delete-task")) {
            this.deleteTask(index);
        }
    }

    handleFilterChange(event) {
        if (event.target.tagName === "BUTTON" && event.target.id !== "clear_completed") {
            this.currentFilter = event.target.id;
            this.render();
        }
    }
}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
    new TodoList();
});