// Load tasks and initialize slideshow when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  setupDragAndDrop();
  initializeSlideshow();
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

  saveTask(task);
  addTaskToDOM(task);
  input.value = "";
}

// Add task to the DOM
function addTaskToDOM(task) {
  const taskList = document.querySelector(`#${task.column} .task-list`);
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.setAttribute("data-id", task.id);
  taskElement.innerHTML = `
        <span>${task.text}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `;
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
  console.log("Attempting to delete task with ID:", taskId);
  const taskElement = document.querySelector(`[data-id="${taskId}"]`);
  if (!taskElement) {
    console.error("Task element not found for ID:", taskId);
    alert("Task not found in DOM. Please refresh and try again.");
    return;
  }

  // Remove from localStorage
  let tasks = getTasks();
  tasks = tasks.filter((task) => task.id !== Number(taskId));
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Remove from DOM
  taskElement.remove();
  console.log("Task deleted successfully:", taskId);
}

// Setup Interact.js drag-and-drop
function setupDragAndDrop() {
  interact(".task").draggable({
    inertia: false,
    autoScroll: true,
    listeners: {
      start(event) {
        console.log("Drag started:", event.target.getAttribute("data-id"));
        event.target.classList.add("dragging");
      },
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      },
      end(event) {
        console.log("Drag ended:", event.target.getAttribute("data-id"));
        event.target.classList.remove("dragging");
        event.target.style.transform = "";
        event.target.removeAttribute("data-x");
        event.target.removeAttribute("data-y");
      },
    },
  });

  interact(".task-list").dropzone({
    accept: ".task",
    overlap: 0.1,
    listeners: {
      dragenter(event) {
        event.target.classList.add("drop-active");
      },
      dragleave(event) {
        event.target.classList.remove("drop-active");
      },
      drop(event) {
        const task = event.relatedTarget;
        const taskId = task.getAttribute("data-id");
        const taskList = event.target;
        const columnId = taskList.closest(".column").id;
        console.log(`Dropped task ${taskId} in column ${columnId}`);

        // Move task to new column in DOM
        taskList.appendChild(task);
        task.style.transform = "";
        task.removeAttribute("data-x");
        task.removeAttribute("data-y");
        taskList.classList.remove("drop-active");

        // Update task column in localStorage
        let tasks = getTasks();
        const taskData = tasks.find((t) => t.id === Number(taskId));
        if (taskData) {
          taskData.column = columnId;
          localStorage.setItem("tasks", JSON.stringify(tasks));
        }
      },
    },
  });
}

// Slideshow Functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;

function initializeSlideshow() {
  // Show the first slide
  slides[0].classList.add("active");
  // Auto-cycle every 5 seconds
  setInterval(() => {
    changeSlide(1);
  }, 5000);
}

function showSlide(index) {
  // Normalize index
  if (index >= totalSlides) index = 0;
  else if (index < 0) index = totalSlides - 1;

  // Remove active class from current slide
  slides[currentSlide].classList.remove("active");

  // Update current slide
  currentSlide = index;
  slides[currentSlide].classList.add("active");
}

function changeSlide(direction) {
  showSlide(currentSlide + direction);
}
