const { ipcRenderer } = require('electron');

const unfinishedList = document.getElementById('unfinishedList');
const finishedList = document.getElementById('finishedList');
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

let todos = [];

function renderTodos() {
    unfinishedList.innerHTML = '';
    finishedList.innerHTML = '';

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type='checkbox' data-index='${index}' ${todo.done ? 'checked' : ''} />
            <label>
                <span>${todo.title}</span>
            </label>
            <button class='deleteBtn' data-index='${index}'>Delete</button>
        `;

        if (todo.done) {
            // If the task is finished, append it to the finished list
            finishedList.appendChild(li);
        } else {
            // If the task is unfinished, append it to the unfinished list
            unfinishedList.appendChild(li);
        }
    });
}

function promptSave(){
    try {
        ipcRenderer.send('prompt-save', todos)
    } catch (error) {
        console.error(error);
    }
}

addBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if(todoInput.value.trim() !== ''){
        todos.push({
            title: todoInput.value.trim(),
            done: false
        });
        todoInput.value = '';
        renderTodos();
    }
});
unfinishedList.addEventListener('click', (event) => {
    if(event.target.classList.contains('deleteBtn')){
        const index = event.target.getAttribute('data-index');
        todos.splice(index, 1);
        renderTodos();
    }else if(event.target.tagName === 'INPUT'){
        const index = event.target.getAttribute('data-index');
        todos[index].done = event.target.checked;
        renderTodos();
    }
});

finishedList.addEventListener('click', (event) => {
    if(event.target.classList.contains('deleteBtn')){
        const index = event.target.getAttribute('data-index');
        todos.splice(index, 1);
        renderTodos();
    }else if(event.target.tagName === 'INPUT'){
        const index = event.target.getAttribute('data-index');
        todos[index].done = event.target.checked;
        renderTodos();
    }
});

saveBtn.addEventListener('click', () => {
    ipcRenderer.send('save-tasks', todos);
});

loadBtn.addEventListener('click', () => {
    ipcRenderer.send('load-tasks');
    /*if(todos.length > 0){
        promptSave();
    }else{
        
    }*/
});

ipcRenderer.on('tasks-loaded', (event, tasks) => {
    todos = tasks;
    renderTodos();
});

ipcRenderer.on('error', (event, errMsg) => {
    showErrBox(errMsg);
});

ipcRenderer.on('success', (event, sucMsg) => {
    showSucBox(sucMsg);
});

ipcRenderer.on('app-quit', () => {
    /*if (todos.length > 0) {
        promptSave();
    }*/
    console.log('App is quitting...');
});

function showErrBox(msg){
    const errBox = document.createElement('div');
    errBox.className = 'errBox';
    errBox.textContent = msg;

    document.body.appendChild(errBox);
    setTimeout(() => {
        errBox.remove();
    }, 5000); // Remove after 5 seconds. 1000 = 1 second
}

function showSucBox(msg){
    const sucBox = document.createElement('div');
    sucBox.className = 'sucBox';
    sucBox.textContent = msg;

    document.body.appendChild(sucBox);
    setTimeout(() => {
        sucBox.remove();
    }, 5000); // Remove after 5 seconds. 1000 = 1 second
}