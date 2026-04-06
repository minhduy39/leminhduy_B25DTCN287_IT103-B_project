function initData() {
    if (!localStorage.getItem('projects')) {
        const projects = [
            {
                id: 1,
                projectName: "Xây dựng website thương mại điện tử",
                description: "Dự án phát triển nền tảng bán hàng trực tuyến.",
                members: [
                    { userId: 1, role: "Project owner" },
                    { userId: 2, role: "Frontend developer" }
                ]
            }
        ];
        localStorage.setItem('projects', JSON.stringify(projects));
    }
}

// Hiển thị
function renderProjects() {
    const projectList = document.getElementById('projectList');
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) return; 

    projectList.innerHTML = "";

    const filteredProjects = projects.filter(project =>
        project.members && project.members.some(m => m.userId === currentUser.id && m.role === "Project owner")
    );

    filteredProjects.forEach(project => {
        const row = `
            <tr>
                <td>${project.id}</td>
                <td>${project.projectName}</td>
                <td>
                    <button class="btn-yellow">Sửa</button> 
                    <button class="btn-red" onclick="openDeleteModal(${project.id})">Xóa</button>
                    <button class="btn-blue" onclick="goToDetail(${project.id})">Chi tiết</button>
                </td>
            </tr>`;
        projectList.innerHTML += row;
    });
}

// Thêm
const projectModal = document.getElementById('projectModal');
const nameInput = document.getElementById('projectName');
const descInput = document.getElementById('projectDesc');
const errorMsg = document.getElementById('nameError');

function openProjectModal() {
    projectModal.classList.add('active');
    resetError();
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.getElementById('projectForm').reset();
    resetError();
}

function resetError() {
    nameInput.classList.remove('input-error');
    errorMsg.style.display = 'none';
}

function showError(msg) {
    nameInput.classList.add('input-error');
    errorMsg.innerText = msg;
    errorMsg.style.display = 'block';
}

nameInput.addEventListener('input', resetError);

document.getElementById('saveProjectBtn').onclick = function () {
    const nameValue = nameInput.value.trim();
    const descValue = descInput.value.trim();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!nameValue || !descValue) {
        showError("Tên và mô tả dự án không được để trống");
        return;
    }

    if (nameValue.length < 5 || descValue.length < 10) {
        showError("Tên >= 5 ký tự, mô tả >= 10 ký tự");
        return;
    }

    const isDuplicate = projects.some(p => p.projectName.toLowerCase() === nameValue.toLowerCase());
    if (isDuplicate) {
        showError("Tên dự án đã tồn tại");
        return;
    }

    const newProject = {
        id: projects.length > 0 ? projects[projects.length - 1].id + 1 : 1,
        projectName: nameValue,
        description: descValue,
        members: [{ userId: currentUser.id, role: "Project owner" }]
    };

    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));

    closeProjectModal();
    renderProjects();
    alert("Đã thêm dự án mới thành công!");
};

// Xóa
let deleteId = null;
const deleteModal = document.getElementById('deleteConfirmModal');

function openDeleteModal(id) {
    deleteId = id;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
}

function goToDetail(id) {
    window.location.href = `../pages/detail.html?id=${id}`;
}

document.getElementById('confirmDeleteBtn').onclick = function () {
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects = projects.filter(p => p.id !== deleteId);

    localStorage.setItem('projects', JSON.stringify(projects));
    closeDeleteModal();
    renderProjects();
};

//Đăng xuất
(function protectPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.replace('../pages/login.html');
    }
})();

document.getElementById('logoutBtn').onclick = function (e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.replace('../pages/login.html');
};

document.getElementById('openAddModal').onclick = openProjectModal;

initData();
renderProjects();