// obtenemos el input donde el usuario escribe la tarea
const taskInput = document.getElementById('task-input');

// obtenemos el botón que agrega la tarea
const addTaskButton = document.getElementById('add-task-btn');

// obtenemos la lista donde aparecerán las tareas
const taskList = document.getElementById('task-list');

// obtenemos el botón para limpiar todas las tareas
const clearAllButton = document.getElementById('clear-all-btn');

// obtenemos el contador de tareas
const taskCounter = document.getElementById('task-counter');

// función para actualizar el contador de tareas
function updateCounter() {
    const totalTasks = taskList.children.length;
    taskCounter.textContent = `Tasks: ${totalTasks}`;
}


// cuando se hace click en el botón
addTaskButton.addEventListener('click', function(){

    // tomamos el texto del input y quitamos espacios al inicio y final
    const taskText = taskInput.value.trim();

    // verificamos que la tarea no esté vacía
    if(taskText !== ''){

        // creamos un elemento <li> para la nueva tarea
        const li = document.createElement('li');

        // ponemos el texto de la tarea dentro del <li>
        li.textContent = taskText;


        // cuando hacemos click en la tarea se marca como completada
        li.addEventListener('click', function(){
            li.classList.toggle('completed'); // agrega o quita la clase completed
        });


        // creamos el botón de eliminar
        const deleteButton = document.createElement('button');

        // texto del botón
        deleteButton.textContent = 'Delete';


        // cuando se hace click en delete se elimina la tarea
        deleteButton.addEventListener('click', function(event){

            // evita que también se active el click del <li>
            event.stopPropagation();

            // elimina la tarea
            li.remove();
            // actualizamos el contador de tareas
            updateCounter()
        });


        // ponemos el botón dentro del <li>
        li.appendChild(deleteButton);

        // agregamos el <li> a la lista
        taskList.appendChild(li);
        // actualizamos el contador de tareas
        updateCounter();

        // limpiamos el input después de agregar la tarea
        taskInput.value = '';

    }

});


// detecta cuando el usuario presiona una tecla en el input
taskInput.addEventListener('keydown', function(event){

    // si la tecla es Enter
    if(event.key === 'Enter'){

        // simulamos un click en el botón
        addTaskButton.click();
    }

});

// cuando se hace click en el botón de limpiar todo
clearAllButton.addEventListener('click', function(){
    taskList.innerHTML = '';
    updateCounter();
});