const {
    ipcRenderer
} = require('electron');
const todoList = document.getElementById('todoList')
const todoInput = document.getElementById('todoInput')
const addBtn = document.getElementById('addBtn')
const saveBtn = document.getElementById('saveBtn')
const loadBtn = document.getElementById('loadBtn')

let todos = []

function renderTodos() {
    todoList.innerHTML = ''
    todos.forEach((todo, index) => {
        const li = document.createElement('li')
        li.innerHTML = `
        <input type="checkbox" data-index="${index}" ${todo.done ? 'checked' : ''} />
        <label>
            <span>${todo.title}</span>
        </label>
        <button class="deleteBtn" data-index="${index}">Delete</button>
        `
        todoList.appendChild(li)
    })
}

addBtn.addEventListener('click', (event) => {
    event.preventDefault()
    if (todoInput.value.trim() !== '') {
        todos.push({ title: todoInput.value.trim(), done: false })
        todoInput.value = ''
        renderTodos()
    }
})

todoList.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteBtn')) {
        const index = event.target.getAttribute('data-index')
        todos.splice(index, 1)
        renderTodos()
    } else if (event.target.tagName === 'INPUT') {
        const index = event.target.getAttribute('data-index')
        todos[index].done = event.target.checked
        renderTodos()
    }
})

saveBtn.addEventListener('click', () => {
    ipcRenderer.send('save-tasks', todos);
});

loadBtn.addEventListener('click', () => {
    ipcRenderer.send('load-tasks');
});

ipcRenderer.on('tasks-loaded', (event, tasks) => {
    todos = tasks;
    renderTodos();
});

ipcRenderer.on('app-quit', () => {
    console.log('App quit event received!')
})