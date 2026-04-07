// State management
let tasks = JSON.parse(localStorage.getItem('stellar-tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const tabButtons = document.querySelectorAll('.tab-btn');
const dateDisplay = document.getElementById('current-date');
const editModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-task-input');
const saveEditBtn = document.getElementById('save-edit');
const cancelEditBtn = document.getElementById('cancel-edit');

// Initialize
function init() {
    updateDate();
    renderTasks();
    setInterval(updateDate, 60000); // Update date every minute
}

function updateDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<div class="glass" style="padding: 40px; text-align: center; color: var(--text-muted);">
            No tasks found in this category.
        </div>`;
        return;
    }

    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item glass ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;

        const dateAdded = new Date(task.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' });
        const dateCompleted = task.completedAt 
            ? new Date(task.completedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) 
            : null;

        taskItem.innerHTML = `
            <div class="custom-checkbox" onclick="toggleTask('${task.id}')"></div>
            <div class="task-content">
                <p class="task-text">${escapeHTML(task.text)}</p>
                <div class="task-meta">
                    <span>Added: ${dateAdded}</span>
                    ${task.completed ? `<span>Completed: ${dateCompleted}</span>` : ''}
                </div>
            </div>
            <div class="actions">
                <button class="action-btn" onclick="openEditModal('${task.id}')" title="Edit">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')" title="Delete">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// Add Task
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.unshift(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
}

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            const isNowCompleted = !task.completed;
            return {
                ...task,
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date().toISOString() : null
            };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(id) {
    const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
    taskItem.classList.add('removing');
    
    setTimeout(() => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }, 300);
}

// Edit Task Logic
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    editInput.value = task.text;
    editModal.style.display = 'flex';
    editInput.focus();
}

function closeEditModal() {
    editModal.style.display = 'none';
    editingTaskId = null;
}

function saveEdit() {
    const newText = editInput.value.trim();
    if (newText && editingTaskId) {
        tasks = tasks.map(task => 
            task.id === editingTaskId ? { ...task, text: newText } : task
        );
        saveTasks();
        renderTasks();
        closeEditModal();
    }
}

// Persistence
function saveTasks() {
    localStorage.setItem('stellar-tasks', JSON.stringify(tasks));
}

// Helpers
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.tab;
        renderTasks();
    });
});

saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

// Start app
init();
