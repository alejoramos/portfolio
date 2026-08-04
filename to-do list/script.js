const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const personInput = document.getElementById('person-input');
const dateInput = document.getElementById('date-input');
const priorityInput = document.getElementById('priority-input');
const categoryInput = document.getElementById('category-input');
const notesInput = document.getElementById('notes-input');
const taskList = document.getElementById('task-list');
const clearAllButton = document.getElementById('clear-all-btn');
const clearCompletedButton = document.getElementById('clear-completed-btn');
const printButton = document.getElementById('print-btn');
const shareButton = document.getElementById('share-btn');
const taskCounter = document.getElementById('task-counter');
const totalCount = document.getElementById('total-count');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const overdueCount = document.getElementById('overdue-count');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const sortSelect = document.getElementById('sort-select');
const emptyState = document.getElementById('empty-state');

const storageKey = 'advancedTodoTasks';
const priorityRank = {
    low: 1,
    medium: 2,
    high: 3
};

let tasks = loadTasks();

function createTaskId() {
    if(window.crypto && typeof window.crypto.randomUUID === 'function'){
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
    const savedTasks = localStorage.getItem(storageKey);

    if(savedTasks === null){
        return [];
    }

    try {
        return JSON.parse(savedTasks);
    } catch(error) {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function formatDate(dateValue) {
    if(dateValue === ''){
        return 'No date';
    }

    const date = new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getCalendarDate(dateValue) {
    return dateValue.split('-').join('');
}

function getNextDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    date.setDate(date.getDate() + 1);

    return date.toISOString().split('T')[0];
}

function isOverdue(task) {
    if(task.completed || task.date === ''){
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(`${task.date}T00:00:00`);

    return dueDate < today;
}

function createCalendarLink(service, task) {
    const title = task.person === '' ? task.title : `${task.title} - ${task.person}`;
    const details = `Task: ${task.title}${task.person === '' ? '' : `\nPerson: ${task.person}`}\nPriority: ${task.priority}\nCategory: ${task.category}${task.notes === '' ? '' : `\nNotes: ${task.notes}`}`;
    const calendarDate = getCalendarDate(task.date);
    const calendarEndDate = getCalendarDate(getNextDate(task.date));
    const outlookEndDate = getNextDate(task.date);

    if(service === 'google'){
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&dates=${calendarDate}/${calendarEndDate}`;
    }

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(details)}&startdt=${task.date}&enddt=${outlookEndDate}&allday=true`;
}

function createCalendarButton(text, service, task) {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = createCalendarLink(service, task);
    link.target = '_blank';
    link.rel = 'noopener';
    link.classList.add('calendar-link');

    return link;
}

function getVisibleTasks() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    return tasks
        .filter(function(task){
            const searchableText = `${task.title} ${task.person} ${task.category} ${task.notes}`.toLowerCase();
            const matchesSearch = searchableText.includes(searchText);
            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            let matchesStatus = true;

            if(selectedStatus === 'pending'){
                matchesStatus = !task.completed;
            } else if(selectedStatus === 'completed'){
                matchesStatus = task.completed;
            } else if(selectedStatus === 'overdue'){
                matchesStatus = isOverdue(task);
            }

            return matchesSearch && matchesPriority && matchesStatus;
        })
        .sort(function(taskA, taskB){
            if(sortSelect.value === 'date-asc'){
                return (taskA.date || '9999-12-31').localeCompare(taskB.date || '9999-12-31');
            }

            if(sortSelect.value === 'priority-desc'){
                return priorityRank[taskB.priority] - priorityRank[taskA.priority];
            }

            if(sortSelect.value === 'name-asc'){
                return taskA.title.localeCompare(taskB.title);
            }

            return taskB.createdAt - taskA.createdAt;
        });
}

function updateOverview() {
    const completedTasks = tasks.filter(function(task){
        return task.completed;
    }).length;
    const overdueTasks = tasks.filter(isOverdue).length;
    const pendingTasks = tasks.length - completedTasks;
    const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
    const taskWord = tasks.length === 1 ? 'task' : 'tasks';

    taskCounter.textContent = `${tasks.length} ${taskWord}`;
    totalCount.textContent = tasks.length;
    pendingCount.textContent = pendingTasks;
    completedCount.textContent = completedTasks;
    overdueCount.textContent = overdueTasks;
    progressText.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;
}

function createMetaItem(text, className) {
    const item = document.createElement('span');
    item.textContent = text;
    item.classList.add('meta-pill');

    if(className){
        item.classList.add(className);
    }

    return item;
}

function renderTasks() {
    const visibleTasks = getVisibleTasks();
    taskList.innerHTML = '';

    visibleTasks.forEach(function(task){
        const li = document.createElement('li');
        li.classList.add(`priority-${task.priority}`);

        if(task.completed){
            li.classList.add('completed');
        }

        if(isOverdue(task)){
            li.classList.add('overdue');
        }

        const taskInfo = document.createElement('div');
        taskInfo.classList.add('task-info');

        const titleRow = document.createElement('div');
        titleRow.classList.add('task-title-row');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
        checkbox.addEventListener('change', function(){
            toggleTask(task.id);
        });

        const title = document.createElement('span');
        title.textContent = task.title;
        title.classList.add('task-title');

        titleRow.appendChild(checkbox);
        titleRow.appendChild(title);

        const details = document.createElement('div');
        details.classList.add('task-details');
        details.appendChild(createMetaItem(task.person === '' ? 'No person' : task.person));
        details.appendChild(createMetaItem(formatDate(task.date), isOverdue(task) ? 'danger' : ''));
        details.appendChild(createMetaItem(task.category));
        details.appendChild(createMetaItem(`${task.priority} priority`, task.priority));

        taskInfo.appendChild(titleRow);
        taskInfo.appendChild(details);

        if(task.notes !== ''){
            const notes = document.createElement('p');
            notes.classList.add('task-notes');
            notes.textContent = task.notes;
            taskInfo.appendChild(notes);
        }

        const taskActions = document.createElement('div');
        taskActions.classList.add('task-actions');

        if(task.date !== ''){
            taskActions.appendChild(createCalendarButton('Google', 'google', task));
            taskActions.appendChild(createCalendarButton('Outlook', 'outlook', task));
        }

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('secondary-action');
        editButton.type = 'button';
        editButton.addEventListener('click', function(){
            editTask(task.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('danger-action');
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', function(){
            deleteTask(task.id);
        });

        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);
        li.appendChild(taskInfo);
        li.appendChild(taskActions);
        taskList.appendChild(li);
    });

    emptyState.textContent = tasks.length === 0 ? 'No tasks yet. Add one above to start planning.' : 'No tasks match your filters.';
    emptyState.hidden = visibleTasks.length > 0;
    updateOverview();
}

function resetForm() {
    taskInput.value = '';
    personInput.value = '';
    dateInput.value = '';
    priorityInput.value = 'medium';
    categoryInput.value = 'Personal';
    notesInput.value = '';
    taskInput.focus();
}

function addTask(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if(taskText === ''){
        return;
    }

    tasks.push({
        id: createTaskId(),
        title: taskText,
        person: personInput.value.trim(),
        date: dateInput.value,
        priority: priorityInput.value,
        category: categoryInput.value,
        notes: notesInput.value.trim(),
        completed: false,
        createdAt: Date.now()
    });

    saveTasks();
    renderTasks();
    resetForm();
}

function toggleTask(taskId) {
    tasks = tasks.map(function(task){
        if(task.id === taskId){
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(function(task){
        return task.id !== taskId;
    });

    saveTasks();
    renderTasks();
}

function editTask(taskId) {
    const task = tasks.find(function(currentTask){
        return currentTask.id === taskId;
    });

    if(!task){
        return;
    }

    const updatedTitle = prompt('Edit task title:', task.title);

    if(updatedTitle === null || updatedTitle.trim() === ''){
        return;
    }

    const updatedNotes = prompt('Edit notes:', task.notes);

    tasks = tasks.map(function(currentTask){
        if(currentTask.id === taskId){
            return {
                ...currentTask,
                title: updatedTitle.trim(),
                notes: updatedNotes === null ? currentTask.notes : updatedNotes.trim()
            };
        }

        return currentTask;
    });

    saveTasks();
    renderTasks();
}

function getTaskSummary() {
    if(tasks.length === 0){
        return 'My To-Do List is empty.';
    }

    return tasks.map(function(task, index){
        const status = task.completed ? 'Done' : isOverdue(task) ? 'Overdue' : 'Pending';
        const person = task.person === '' ? 'No person' : task.person;
        const date = formatDate(task.date);

        return `${index + 1}. ${task.title} | ${person} | ${date} | ${task.category} | ${task.priority} | ${status}`;
    }).join('\n');
}

taskForm.addEventListener('submit', addTask);

clearAllButton.addEventListener('click', function(){
    if(tasks.length === 0 || !confirm('Clear all tasks?')){
        return;
    }

    tasks = [];
    saveTasks();
    renderTasks();
});

clearCompletedButton.addEventListener('click', function(){
    tasks = tasks.filter(function(task){
        return !task.completed;
    });

    saveTasks();
    renderTasks();
});

printButton.addEventListener('click', function(){
    window.print();
});

shareButton.addEventListener('click', async function(){
    const text = getTaskSummary();

    try {
        if(navigator.share){
            await navigator.share({
                title: 'My To-Do List',
                text: text
            });
            return;
        }

        if(navigator.clipboard){
            await navigator.clipboard.writeText(text);
            alert('Task list copied to clipboard.');
            return;
        }
    } catch(error) {
        console.log('Share was cancelled or blocked.');
    }

    prompt('Copy your task list:', text);
});

[searchInput, statusFilter, priorityFilter, sortSelect].forEach(function(control){
    control.addEventListener('input', renderTasks);
    control.addEventListener('change', renderTasks);
});

renderTasks();
