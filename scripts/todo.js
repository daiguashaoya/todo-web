document.addEventListener("DOMContentLoaded", function () {
    // 获取页面中的相关元素
    const newTaskInput = document.getElementById("new-task"); // 输入框
    const taskList = document.getElementById("task-list"); // 任务列表
    const taskCount = document.getElementById("task-count"); // 任务计数文本
    const filters = document.querySelector(".filters"); // 过滤任务的按钮组
    const clearCompletedButton = document.getElementById("clear_completed"); // 清除已完成任务按钮
    const AllCompleteButton = document.getElementById("all_complete"); // 清除已完成任务按钮

    const box1 = document.querySelector(".box1");
    const box2 = document.querySelector(".box2");

    // **隐藏 todo-footer 当任务列表为空**
    const todoFooter = document.querySelector(".todo-footer");

    let tasks = []; // 存储任务的数组

    // 监听输入框的键盘事件，按下 "Enter" 键时添加新任务
    newTaskInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && newTaskInput.value.trim() !== "") {
            const task = {
                text: newTaskInput.value.trim(), // 任务文本（去除前后空格）
                completed: false // 任务初始状态为未完成
            };
            tasks.push(task); // 将新任务添加到任务数组
            newTaskInput.value = ""; // 清空输入框
            renderTasks(); // 重新渲染任务列表
        }
    });

    // 渲染任务列表
    function renderTasks(filter = "all") {
        taskList.innerHTML = "";  // 清空任务列表，以防止重复渲染

        let filteredTasks = tasks; // 默认显示所有任务

        // 处理按钮的高亮状态，确保选中的过滤按钮有 `selected` 类
        document.querySelectorAll(".filters button").forEach(button => {
            button.classList.remove("selected"); // 先移除所有按钮的 `selected` 样式
            if (button.id === filter) {
                button.classList.add("selected"); // 给当前点击的按钮添加 `selected` 样式
            }
        });

        // 根据过滤条件筛选任务
        if (filter === "active") {
            filteredTasks = tasks.filter(task => !task.completed); // 仅显示未完成的任务
        } else if (filter === "completed") {
            filteredTasks = tasks.filter(task => task.completed); // 仅显示已完成的任务
        }

        // 遍历筛选后的任务列表，并添加到 `ul` 元素中,反向遍历确保了新添加的任务在上面
        for (let i = filteredTasks.length - 1; i >= 0; i--) {
            const task = filteredTasks[i]; // 获取任务
            const li = document.createElement("li"); // 创建 `<li>` 元素
            li.innerHTML = `
                <label class="custom-checkbox">
                <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${i}" class="toggle-complete">
                <span></span> <!-- 这里用于绘制自定义圆圈 -->
                </label>
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-task" data-index="${i}">×</button>
                `;
            taskList.appendChild(li); // 将任务项追加到任务列表
        }

        // 计算并更新未完成任务的数量
        const activeCount = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeCount} item${activeCount !== 1 ? "s" : ""} left`; // 更新计数文本

        // 判断是否需要显示 "Clear completed" 按钮
        const hasCompletedTasks = tasks.some(task => task.completed); // 判断是否有已完成任务
        if (hasCompletedTasks) {
            clearCompletedButton.style.display = "inline-block"; // 显示 "Clear completed" 按钮
        } else {
            clearCompletedButton.style.display = "none"; // 隐藏 "Clear completed" 按钮
        }

        // 处理 "AllComplete" 按钮的样式
        const AllCompleteButton = document.getElementById("all_complete");
        const allTasksCompleted = tasks.every(task => task.completed);  // 检查是否所有任务完成

        // 根据是否有任务去显示折叠的部分
        if (tasks.length === 0) {
            AllCompleteButton.style.color = "white";
            todoFooter.style.display = "none";
            box1.style.display = "none";
            box2.style.display = "none"
        }
        else {
            AllCompleteButton.style.color = " #757575";
            AllCompleteButton.style.display = "block";
            todoFooter.style.display = "flex";
            box1.style.display = "block";
            box2.style.display = "block";
        }

        if (allTasksCompleted) {
            AllCompleteButton.classList.add("all-completed");  // 添加样式类，改变文字颜色
        } else {
            AllCompleteButton.classList.remove("all-completed");  // 移除样式类，恢复原样
        }
    }

    // 监听任务列表的点击事件，处理任务完成/删除操作
    taskList.addEventListener("click", function (event) {
        // 处理任务完成/未完成
        if (event.target.classList.contains("toggle-complete")) {
            const index = event.target.dataset.index; // 获取任务索引
            tasks[index].completed = event.target.checked; // 更新任务的完成状态
            renderTasks();  // 重新渲染任务列表
        }

        // 处理任务删除
        if (event.target.classList.contains("delete-task")) {
            const index = event.target.dataset.index; // 获取任务索引
            tasks.splice(index, 1); // 从任务数组中删除该任务
            renderTasks();  // 重新渲染任务列表
        }
    });

    // 监听过滤按钮的点击事件，切换任务显示状态
    filters.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            renderTasks(event.target.id);  // 重新渲染任务，并根据按钮 ID 进行过滤
        }
    });

    // 监听 "Clear completed" 按钮的点击事件，删除所有已完成的任务
    clearCompletedButton.addEventListener("click", function () {
        tasks = tasks.filter(task => !task.completed); // 删除所有已完成的任务
        renderTasks();  // 重新渲染任务列表
    });

    // 监听 "AllComplete" 按钮的点击事件，切换所有任务的状态
    AllCompleteButton.addEventListener("click", function () {
        // 判断是否所有任务都已完成
        let is_all_completed = tasks.every(task => task.completed); // 使用 `every` 方法检查是否所有任务都完成

        // 根据当前的状态，设置所有任务的 completed 状态
        tasks.forEach(task => {
            task.completed = !is_all_completed; // 如果任务已全部完成，则将它们设为未完成；否则，将它们设为已完成
        });

        renderTasks(); // 重新渲染任务列表
    });

    renderTasks();  // 页面加载时，默认渲染所有任务
});
