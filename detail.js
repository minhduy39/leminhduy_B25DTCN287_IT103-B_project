function openModal(modalId) {
    console.log("Mở modal:", modalId);
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.classList.add('active');
    }
}

function closeModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.classList.remove('active');
    }
}
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

if (projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const currentProject = projects.find(p => p.id == projectId);

    if (currentProject) {
        console.log("Đang xem dự án:", currentProject.projectName);
    }
}

// window.onclick = function(event) {
//     if (event.target.classList.contains('modal-overlay')) {
//         event.target.classList.remove('active');
//     }
// };
