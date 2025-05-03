// Load tasks from localStorage when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

// Add a new task
function addTask(columnId) {
  const input = document.getElementById(`${columnId}-input`);
  const taskText = input.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    column: columnId,
  };

  // Save task to localStorage
  saveTask(task);

  // Add task to the DOM
  addTaskToDOM(task);

  // Clear input
  input.value = "";
}

// Add task to the DOM
function addTaskToDOM(task) {
  const taskList = document.querySelector(`#${task.column} .task-list`);
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.setAttribute("draggable", "true");
  taskElement.setAttribute("data-id", task.id);
  taskElement.innerHTML = `
        <span>${task.text}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `;

  // Add drag event listeners
  taskElement.addEventListener("dragstart", dragStart);
  taskElement.addEventListener("dragend", dragEnd);

  taskList.appendChild(taskElement);
}

// Save task to localStorage
function saveTask(task) {
  let tasks = getTasks();
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = getTasks();
  tasks.forEach((task) => addTaskToDOM(task));
}

// Get tasks from localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// Delete a task
function deleteTask(taskId) {
  let tasks = getTasks();
  tasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Remove from DOM
  const taskElement = document.querySelector(`[data-id="${taskId}"]`);
  taskElement.remove();
}

// Drag and Drop Functionality
function dragStart(event) {
  event.target.classList.add("dragging");
  event.dataTransfer.setData(
    "text/plain",
    event.target.getAttribute("data-id")
  );
}

function dragEnd(event) {
  event.target.classList.remove("dragging");
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, columnId) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.querySelector(`[data-id="${taskId}"]`);
  const taskList = document.querySelector(`#${columnId} .task-list`);

  // Update task column in localStorage
  let tasks = getTasks();
  const task = tasks.find((t) => t.id === parseInt(taskId));
  if (task) {
    task.column = columnId;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Move task to new column
  taskList.appendChild(taskElement);
}
