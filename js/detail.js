let isEditingTask = false;
let editingTaskId = null;
const urlParams = new URLSearchParams(window.location.search);
const projectId = parseInt(urlParams.get('id')) || 1;

function getUserDisplayName(user) {
    if (!user) return "N/A";

    if (user.fullName && user.fullName !== "undefined") return user.fullName;
    if (user.name && user.name !== "undefined") return user.name;
    if (user.username && user.username !== "undefined") return user.username;

    if (user.email && user.email !== "undefined") return user.email.split('@')[0];
    return "User " + user.id;
}

function initDetailData() {
    if (!localStorage.getItem('tasks')) {
        const tasks = [
            { id: 101, taskName: "Soạn thảo đề cương dự án", assigneeId: 1, projectId: 1, asignDate: "2025-02-24", dueDate: "2025-02-27", priority: "Thấp", progress: "Đúng tiến độ", status: "To do" }
        ];
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Hiển thị chi tiết dự án
function renderProjectDetail() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const currentProject = projects.find(p => String(p.id) === String(projectId));

    if (currentProject) {
        document.getElementById('displayProjectName').innerText = currentProject.projectName;
        document.getElementById('displayProjectDesc').innerText = currentProject.description;

        const taskAssigneeSelect = document.getElementById('taskAssignee');
        if (taskAssigneeSelect) {
            taskAssigneeSelect.innerHTML = '<option value="">Chọn người phụ trách</option>';

            const members = currentProject.members || [];
            members.forEach(member => {
                const user = users.find(u => String(u.id) === String(member.userId));
                if (user) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.text = getUserDisplayName(user);
                    taskAssigneeSelect.appendChild(option);
                }
            });
        }

        renderMembers(currentProject.members || [], users);
        const projectTasks = tasks.filter(t => String(t.projectId) === String(projectId));
        renderTasks(projectTasks, users);
    }
}

function openAddTaskModal() {
    isEditingTask = false;
    editingTaskId = null;

    document.getElementById('taskModalTitle').innerText = "Thêm nhiệm vụ";

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const assigneeSelect = document.getElementById('taskAssignee');

    if (currentUser && assigneeSelect) {
        assigneeSelect.value = currentUser.id;
    }

    openModal('taskModal');
}

// Hiển thị danh sách nhiệm vụ
function renderTasks(projectTasks, users) {
    const taskBody = document.getElementById('taskBody');
    if (!taskBody) return;
    taskBody.innerHTML = '';
    const statuses = ["To do", "In Progress", "Pending", "Done"];

    statuses.forEach(status => {
        const groupRow = document.createElement('tr');
        groupRow.className = 'group-row';
        groupRow.innerHTML = `<td colspan="7">▼ ${status}</td>`;
        taskBody.appendChild(groupRow);

        const filtered = projectTasks.filter(t => t.status === status);
        filtered.forEach(task => {
            const user = users.find(u => String(u.id) === String(task.assigneeId));
            const displayName = getUserDisplayName(user);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="task-name-cell">${task.taskName}</td>
                <td class="text-center">${displayName}</td>
                <td class="text-center"><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
                <td class="text-center date-cell">${formatDate(task.asignDate)}</td>
                <td class="text-center date-cell text-blue">${formatDate(task.dueDate)}</td>
                <td class="text-center"><span class="badge ${getProgressClass(task.progress)}">${task.progress}</span></td>
                <td class="text-center">
                    <button class="btn-yellow" onclick="openEditTaskModal(${task.id})">Sửa</button>
                    <button class="btn-red" onclick="openDeleteTaskModal(${task.id})">Xóa</button>
                </td>`;
            taskBody.appendChild(row);
        });
    });
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${m} - ${day}`;
}

function getPriorityClass(p) {
    if (p === "Cao") return "priority-high";
    if (p === "Trung bình") return "priority-medium";
    return "priority-low";
}

function getProgressClass(p) {
    if (p === "Đúng tiến độ") return "status-good";
    if (p === "Có rủi ro") return "status-risk";
    return "status-late";
}

// Xử lý Lưu (Thêm/Sửa)
const saveTaskBtn = document.getElementById('saveTaskBtn');
if (saveTaskBtn) {
    saveTaskBtn.onclick = function () {
        const taskName = document.getElementById('taskNameInput').value.trim();
        const assigneeId = document.getElementById('taskAssignee').value;
        const status = document.getElementById('taskStatus').value;
        const asignDate = document.getElementById('taskStartDate').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        const progress = document.getElementById('taskProgress').value;

        document.querySelectorAll('.dynamic-error').forEach(el => el.remove());
        let isValid = true;
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        const showError = (elementId, message) => {
            const inputEl = document.getElementById(elementId);
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-text dynamic-error';
            errorSpan.style.color = 'red';
            errorSpan.style.fontSize = '12px';
            errorSpan.style.display = 'block';
            errorSpan.style.marginTop = '4px';
            errorSpan.innerText = message;
            inputEl.parentNode.appendChild(errorSpan);
            isValid = false;
        };

        if (!taskName) showError('taskNameInput', 'Tên nhiệm vụ không được để trống.');
        if (!assigneeId) showError('taskAssignee', 'Vui lòng chọn người phụ trách.');
        if (!asignDate) showError('taskStartDate', 'Vui lòng chọn ngày bắt đầu.');
        if (!dueDate) showError('taskDueDate', 'Vui lòng chọn hạn chót.');

        if (!isValid) return;

        if (isEditingTask) {
            const idx = tasks.findIndex(t => String(t.id) === String(editingTaskId));
            if (idx !== -1) {
                tasks[idx] = { ...tasks[idx], taskName, assigneeId: assigneeId, status, asignDate, dueDate, priority, progress };
            }
        } else {
            const newTask = {
                id: Date.now(),
                taskName, assigneeId: assigneeId, projectId: projectId,
                status, asignDate, dueDate, priority, progress
            };
            tasks.push(newTask);
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
        closeModal('taskModal');
        renderProjectDetail();
    };
}

function openEditTaskModal(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
        isEditingTask = true;
        editingTaskId = id;
        document.getElementById('taskModalTitle').innerText = "Sửa nhiệm vụ";

        document.getElementById('taskNameInput').value = task.taskName;
        document.getElementById('taskAssignee').value = task.assigneeId;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskStartDate').value = task.asignDate;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskProgress').value = task.progress;

        openModal('taskModal');
    }
}

function renderMembers(projectMembers, allUsers) {
    const memberList = document.getElementById('memberList');
    if (!memberList) return;
    const btnMore = memberList.querySelector('.btn-more');
    memberList.querySelectorAll('.member-item').forEach(el => el.remove());

    projectMembers.forEach(mem => {
        const user = allUsers.find(u => String(u.id) === String(mem.userId));
        if (user) {
            const div = document.createElement('div');
            div.className = 'member-item';
            const nameToUse = getUserDisplayName(user);
            const initial = nameToUse !== "N/A" ? nameToUse.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "U";
            const avatarColor = (user.id || 1) % 2 === 0 ? 'purple' : 'blue';

            div.innerHTML = `
                <div class="avatar-circle ${avatarColor}">${initial}</div>
                <div class="member-text">
                    <span class="name">${nameToUse}</span>
                    <span class="role">${mem.role}</span>
                </div>`;
            memberList.insertBefore(div, btnMore);
        }
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove('active');

    if (id === 'taskModal') {
        isEditingTask = false;
        editingTaskId = null;
        document.getElementById('taskNameInput').value = "";
        document.getElementById('taskAssignee').value = "";
        document.querySelectorAll('.dynamic-error').forEach(el => el.remove());
    }
}

let deleteId = null;
function openDeleteTaskModal(id) {
    deleteId = id;
    openModal('deleteConfirmModal');
}

const confirmDeleteTaskBtn = document.getElementById('confirmDeleteTaskBtn');
if (confirmDeleteTaskBtn) {
    confirmDeleteTaskBtn.onclick = function () {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(t => String(t.id) !== String(deleteId));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        closeModal('deleteConfirmModal');
        renderProjectDetail();
    };
}

initDetailData();
renderProjectDetail();