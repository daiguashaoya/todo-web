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
    let NowButtonId = "all"; // 用于存储当前选中的按钮的id


    // 监听输入框的键盘事件，按下 "Enter" 键时添加新任务
    newTaskInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && newTaskInput.value.trim() !== "") {
            const taskText = newTaskInput.value.trim(); // 获取输入的任务文本
            const timeMatch = taskText.match(/(\d{1,2}:\d{2})/); // 使用正则表达式查找时间（24小时制）

            const task = {
                text: taskText,
                completed: false,
                time: timeMatch ? timeMatch[0] : null // 如果找到时间，保存时间，否则为 null
            };

            tasks.push(task); // 将新任务添加到任务数组
            newTaskInput.value = ""; // 清空输入框

            // 按照规则排序任务数组
            sortTasks();

            // 重新渲染任务列表
            renderTasks(NowButtonId);
        }
    });

    // 按照规则排序任务数组
    function sortTasks() {
        // 将任务分为两类：包含时间的任务和不包含时间的任务
        const tasksWithTime = tasks.filter(task => task.time);
        const tasksWithoutTime = tasks.filter(task => !task.time);

        // 按时间降序对包含时间的任务进行排序
        tasksWithTime.sort((a, b) => {
            const [hourA, minuteA] = a.time.split(':').map(Number);
            const [hourB, minuteB] = b.time.split(':').map(Number);
            return (hourB - hourA) || (minuteB - minuteA); // 先按小时降序，小时相同再按分钟降序
        });

        // 合并排序后的任务列表
        tasks = [...tasksWithoutTime, ...tasksWithTime];
    }

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
            li.classList.add("task-item"); // 添加统一的 class

            li.innerHTML = `
                <label class="custom-checkbox">
                <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${i}" class="toggle-complete">
                <span></span> <!-- 这里用于绘制自定义圆圈 -->
                </label>
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="drag-handle">⠿</button> <!-- 新增拖拽按钮 -->
                <button class="delete-task" data-index="${i}">×</button>
                `;

            // 添加双击事件监听
            const textSpan = li.querySelector('span:not([class="custom-checkbox"] span)');
            textSpan.addEventListener('dblclick', function () {
                startEditing(textSpan, task);
            });

            // 改为绑定到拖拽按钮：
            const dragHandle = li.querySelector('.drag-handle');
            dragHandle.addEventListener('mousedown', startDrag);
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

        // 根据是否有任务去显示折叠的部分和todolist页脚
        if (tasks.length === 0) {
            AllCompleteButton.classList.add("custom-button-style");
            todoFooter.style.display = "none";
            box1.style.display = "none";
            box2.style.display = "none"
        }
        else {
            // 移除按钮的样式，恢复初始样式
            AllCompleteButton.classList.remove("custom-button-style");
            todoFooter.style.display = "flex";
            box1.style.display = "block";
            box2.style.display = "block";
        }

        if (allTasksCompleted && tasks.length !== 0) {
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
            renderTasks(NowButtonId);  // 重新渲染任务列表
        }

        // 处理任务删除
        if (event.target.classList.contains("delete-task")) {
            const index = event.target.dataset.index; // 获取任务索引
            tasks.splice(index, 1); // 从任务数组中删除该任务
            renderTasks(NowButtonId);  // 重新渲染任务列表
        }
    });

    // 监听过滤按钮的点击事件，切换任务显示状态
    filters.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            if (event.target.id !== "clear_completed")
                NowButtonId = event.target.id;  // 更新当前选中的按钮的id
            renderTasks(NowButtonId);  // 重新渲染任务，并根据按钮 ID 进行过滤
        }
    });

    // 监听 "Clear completed" 按钮的点击事件，删除所有已完成的任务
    clearCompletedButton.addEventListener("click", function () {
        tasks = tasks.filter(task => !task.completed); // 删除所有已完成的任务
        renderTasks(NowButtonId);  // 重新渲染任务列表
    });

    // 监听 "AllComplete" 按钮的点击事件，切换所有任务的状态
    AllCompleteButton.addEventListener("click", function () {
        // 判断是否所有任务都已完成
        let is_all_completed = tasks.every(task => task.completed); // 使用 `every` 方法检查是否所有任务都完成

        // 根据当前的状态，设置所有任务的 completed 状态
        tasks.forEach(task => {
            task.completed = !is_all_completed; // 如果任务已全部完成，则将它们设为未完成；否则，将它们设为已完成
        });

        renderTasks(NowButtonId); // 重新渲染任务列表
    });


    // 新增编辑功能函数
    function startEditing(spanElement, task) {
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'edit-input';

        // 替换span为输入框
        spanElement.replaceWith(input);
        input.focus();

        // 保存修改
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                // 更新任务文本并重新解析时间
                task.text = newText;
                const timeMatch = newText.match(/(\d{1,2}:\d{2})/);
                task.time = timeMatch ? timeMatch[0] : null;

                sortTasks(); // 重新排序
                renderTasks(NowButtonId); // 重新渲染
            } else {
                input.replaceWith(spanElement);
            }
        };

        // 监听回车键
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });

        // 监听失去焦点事件
        input.addEventListener('blur', saveEdit);
    }

    // 创建占位符（用于指示放置位置）
    let placeholder = document.createElement('li');
    placeholder.classList.add('placeholder'); // 给占位符添加 CSS 类
    let draggedItem = null;
    const sortableList = taskList; // 未将 taskList 赋值给 sortableList

    function startDrag(e) {
        // 获取实际拖动的 li 元素
        const textSpan = e.currentTarget;
        draggedItem = textSpan.closest('li');
        draggedItem.classList.add('dragging');

        // 关键修正：获取 li 元素的绝对位置
        const rect = draggedItem.getBoundingClientRect();

        // 正确计算鼠标在 li 元素内的相对位置
        draggedItem.offsetX = e.clientX - rect.left;
        draggedItem.offsetY = e.clientY - rect.top;

        // 设置元素定位参数
        draggedItem.style.position = 'absolute';
        draggedItem.style.width = `${rect.width}px`;
        draggedItem.style.left = `${rect.left}px`;
        draggedItem.style.top = `${rect.top}px`;

        // 插入占位符
        sortableList.insertBefore(placeholder, draggedItem.nextSibling);

        // 事件监听保持
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
    }

    function onDrag(e) {
        if (!draggedItem) return;

        // 使用修正后的偏移量计算
        draggedItem.style.left = `${e.clientX - draggedItem.offsetX}px`;
        draggedItem.style.top = `${e.clientY - draggedItem.offsetY}px`;

        // 计算鼠标当前位置，找到最接近的元素（用于更新占位符位置）
        const closestItem = [...sortableList.children]
            .filter(item => item !== draggedItem && item !== placeholder) // 过滤掉当前拖拽元素和占位符
            .reduce((closest, item) => {
                const box = item.getBoundingClientRect(); // 获取元素的边界信息
                const offset = e.clientY - box.top - box.height / 2; // 计算鼠标位置与元素中心的偏移量
                return offset < 0 && offset > closest.offset ? { offset, element: item } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element; // 默认 offset 设为负无穷，确保最小值被更新

        // 如果找到了合适的目标元素，则调整占位符位置
        if (closestItem) {
            sortableList.insertBefore(placeholder, closestItem);
        } else {
            // 如果没有合适的位置，则将占位符放在列表末尾
            sortableList.appendChild(placeholder);
        }
    }

    // 处理拖拽结束的逻辑
    function endDrag() {
        if (draggedItem) {
            // 移除拖拽样式
            draggedItem.classList.remove('dragging');

            // 还原拖拽元素的定位样式
            draggedItem.style.position = '';
            draggedItem.style.left = '';
            draggedItem.style.top = '';
            draggedItem.style.width = '';

            // 将拖拽的元素放入最终位置（即占位符的位置）
            sortableList.insertBefore(draggedItem, placeholder);

            // 移除占位符
            placeholder.remove();

            // 清空当前拖拽的元素
            draggedItem = null;
        }

        // 移除事件监听器，避免影响后续拖拽操作
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        // 新增：同步tasks数组顺序（仅在all过滤时生效）
        if (NowButtonId === "all") {
            // 获取当前所有li元素（排除占位符）
            const currentItems = [...sortableList.children]
                .filter(item => item !== placeholder);

            // ★ 关键修正：DOM顺序是逆序渲染，需要反转得到原始顺序
            const renderedOrder = currentItems.reverse(); // 反转DOM顺序

            // 创建映射表：原索引 → 任务对象
            const indexMap = new Map();
            tasks.forEach((task, index) => indexMap.set(index, task));

            // ★ 获取原始tasks的索引顺序（需反转DOM元素顺序）
            const newOrder = renderedOrder.map(item =>
                parseInt(item.querySelector('.toggle-complete').dataset.index)
            );

            // 按拖动后的顺序重建tasks数组
            tasks = newOrder.map(oldIndex => indexMap.get(oldIndex));
        }

        // 触发重新渲染（保持filter状态）
        renderTasks(NowButtonId);
    }

    renderTasks(NowButtonId);  // 页面加载时，默认渲染所有任务
});
