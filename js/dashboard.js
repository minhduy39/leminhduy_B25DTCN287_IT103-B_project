let currentPage = 1;
const rowsPerPage = 5;
let isEditing = false;
let editingId = null;

const projectModal = document.getElementById('projectModal');
const nameInput = document.getElementById('projectName');
const descInput = document.getElementById('projectDesc');
const nameError = document.getElementById('nameError');
const descError = document.getElementById('descError');

function renderProjects() {
    const projectList = document.getElementById('projectList');
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (!currentUser) return;

    let filtered = projects.filter(p =>
        p.members?.some(m => m.userId === currentUser.id && m.role === "Project owner") &&
        p.projectName.toLowerCase().includes(searchTerm)
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    projectList.innerHTML = "";

    if (paginatedItems.length === 0) {
        projectList.innerHTML = `<tr><td colspan="3" style="text-align:center;">Không tìm thấy dự án nào</td></tr>`;
    }

    paginatedItems.forEach(project => {
        const row = `
            <tr>
                <td>${project.id}</td>
                <td>${project.projectName}</td>
                <td>
                    <button class="btn-yellow" onclick="openEditModal(${project.id})">Sửa</button> 
                    <button class="btn-red" onclick="openDeleteModal(${project.id})">Xóa</button>
                    <button class="btn-blue" onclick="goToDetail(${project.id})">Chi tiết</button>
                </td>
            </tr>`;
        projectList.innerHTML += row;
    });

    renderPagination(filtered.length);
}

// Sửa
function openEditModal(id) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === id);

    if (project) {
        isEditing = true;
        editingId = id;

        document.getElementById('projectName').value = project.projectName;
        document.getElementById('projectDesc').value = project.description;
        document.getElementById('modalTitle').innerText = "Sửa dự án";

        projectModal.classList.add('active');
        resetAllErrors();
    }
}

// Thêm
document.getElementById('saveProjectBtn').onclick = function () {
    const nameValue = nameInput.value.trim();
    const descValue = descInput.value.trim();
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    resetAllErrors();
    let isValid = true;

    if (!nameValue) {
        triggerError(nameInput, nameError, "Tên dự án không được để trống");
        isValid = false;
    } else if (nameValue.length < 5) {
        triggerError(nameInput, nameError, "Tên dự án phải từ 5 ký tự trở lên");
        isValid = false;
    } else if (projects.some(p => p.projectName.toLowerCase() === nameValue.toLowerCase() && p.id !== editingId)) {
        triggerError(nameInput, nameError, "Tên dự án đã tồn tại");
        isValid = false;
    }

    if (!descValue) {
        triggerError(descInput, descError, "Mô tả không được để trống");
        isValid = false;
    } else if (descValue.length < 10) {
        triggerError(descInput, descError, "Mô tả phải ít nhất 10 ký tự");
        isValid = false;
    }

    if (!isValid) return;

    if (isEditing) {
        const index = projects.findIndex(p => p.id === editingId);
        if (index !== -1) {
            projects[index].projectName = nameValue;
            projects[index].description = descValue;
        }
    } else {
        const newProject = {
            id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            projectName: nameValue,
            description: descValue,
            members: [{ userId: currentUser.id, role: "Project owner" }]
        };
        projects.push(newProject);
    }

    localStorage.setItem('projects', JSON.stringify(projects));
    closeProjectModal();
    renderProjects();
    alert(isEditing ? "Cập nhật dự án thành công!" : "Thêm dự án mới thành công!");

    isEditing = false;
    editingId = null;
};

// Tìm kiếm
document.getElementById('searchInput').oninput = function () {
    currentPage = 1; 
    renderProjects();
};

// Phân trang
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    // if (totalPages <= 1) return; // Không hiện phân trang nếu chỉ có 1 trang

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => {
            currentPage = i;
            renderProjects();
        };
        paginationContainer.appendChild(btn);
    }
}

function openAddModal() {
    isEditing = false;
    editingId = null;
    document.getElementById('projectForm').reset();
    document.getElementById('modalTitle').innerText = "Thêm dự án";
    projectModal.classList.add('active');
    resetAllErrors();
}

function closeProjectModal() {
    projectModal.classList.remove('active');
}

function triggerError(input, errorLabel, msg) {
    input.classList.add('input-error');
    errorLabel.innerText = msg;
    errorLabel.style.display = 'block';
}

function resetAllErrors() {
    nameInput.classList.remove('input-error');
    descInput.classList.remove('input-error');
    nameError.style.display = 'none';
    descError.style.display = 'none';
}

// Xóa lỗi khi gõ
nameInput.addEventListener('input', () => {
    nameInput.classList.remove('input-error');
    nameError.style.display = 'none';
});
descInput.addEventListener('input', () => {
    descInput.classList.remove('input-error');
    descError.style.display = 'none';
});

function goToDetail(id) {
    window.location.href = `../pages/detail.html?id=${id}`;
}

let deleteId = null;
function openDeleteModal(id) {
    deleteId = id;
    document.getElementById('deleteConfirmModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').classList.remove('active');
}

document.getElementById('confirmDeleteBtn').onclick = function () {
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects = projects.filter(p => p.id !== deleteId);
    localStorage.setItem('projects', JSON.stringify(projects));
    closeDeleteModal();
    renderProjects();
};

// Đăng xuất
document.getElementById('logoutBtn').onclick = function (e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.replace('../pages/login.html'); 
};

document.getElementById('openAddModal').onclick = openAddModal;

renderProjects();