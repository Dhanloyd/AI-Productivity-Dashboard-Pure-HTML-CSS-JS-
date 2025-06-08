// State and data
let tasks = [];
let tasksCompleted = 0;
let aiSuggestionsMade = 0;
let timeSaved = 0; // in minutes

// DOM references
const taskList = document.getElementById('taskList');
const tasksCompletedCount = document.getElementById('tasksCompletedCount');
const aiSuggestionsCount = document.getElementById('aiSuggestionsCount');
const timeSavedCount = document.getElementById('timeSavedCount');
const btnAddTask = document.getElementById('btnAddTask');
const addTaskForm = document.getElementById('addTaskForm');
const newTaskInput = document.getElementById('newTaskInput');
const btnCancelAdd = document.getElementById('btnCancelAdd');
const productivityChart = document.getElementById('productivityChart');
const ctx = productivityChart.getContext('2d');

// Utility: Generate a simple AI productivity suggestion for a task
function generateAISuggestion(taskTitle) {
  const suggestions = [
    `Try breaking "${taskTitle}" into smaller steps.`,
    `Use AI to automate parts of "${taskTitle}".`,
    `Schedule focused time to complete "${taskTitle}".`,
    `Consider delegating "${taskTitle}" to speed up workflow.`,
    `Review previous data to improve "${taskTitle}".`,
    `Apply AI-generated templates for "${taskTitle}".`
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// Render the tasks list UI with AI suggestions
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const header = document.createElement('div');
    header.className = 'task-header';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    const doneToggle = document.createElement('div');
    doneToggle.className = 'task-done';
    doneToggle.setAttribute('role', 'button');
    doneToggle.setAttribute('tabindex', '0');
    doneToggle.setAttribute('aria-pressed', task.done);
    doneToggle.title = task.done ? 'Mark task as not done' : 'Mark task as done';
    doneToggle.innerHTML = task.done ? '&#10003;' : '&#9633;';

    doneToggle.onclick = () => toggleTaskDone(idx);
    doneToggle.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTaskDone(idx);
      }
    };

    header.appendChild(title);
    header.appendChild(doneToggle);
    li.appendChild(header);

    if (task.aiSuggestion && !task.done) {
      const suggestion = document.createElement('div');
      suggestion.className = 'task-ai';
      suggestion.textContent = `💡 AI Suggestion: ${task.aiSuggestion}`;
      li.appendChild(suggestion);
    }

    taskList.appendChild(li);
  });
}

// Toggle a task's done status and update stats
function toggleTaskDone(index) {
  const task = tasks[index];
  if (!task.done) {
    task.done = true;
    tasksCompleted++;
    // Each completed task adds estimated 5-10 minutes saved for demo
    timeSaved += Math.floor(Math.random() * 6) + 5;
  } else {
    // Undo done
    task.done = false;
    tasksCompleted--;
    timeSaved -= Math.min(timeSaved, Math.floor(Math.random() * 6) + 5);
  }
  updateStats();
  renderTasks();
  updateChart();
}

// Add new task logic including AI suggestion
function addNewTask(title) {
  const aiSuggestion = generateAISuggestion(title);
  tasks.push({ title, done: false, aiSuggestion });
  aiSuggestionsMade++;
  updateStats();
  renderTasks();
  updateChart();
}

// Update summary statistics
function updateStats() {
  tasksCompletedCount.textContent = tasksCompleted.toString();
  aiSuggestionsCount.textContent = aiSuggestionsMade.toString();
  timeSavedCount.textContent = timeSaved.toString();
}

// Simple line chart for tasks completion trend last 7 days
let chartData = [0, 0, 1, 2, 3, 5, tasksCompleted];

function updateChart() {
  // Push current tasksCompleted into data and shift oldest
  chartData.shift();
  chartData.push(tasksCompleted);

  // Clear canvas
  ctx.clearRect(0, 0, productivityChart.width, productivityChart.height);

  // Setup dimensions
  const padding = 40;
  const width = productivityChart.width;
  const height = productivityChart.height;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value for scaling
  const maxVal = Math.max(...chartData, 5);

  // Draw axes
  ctx.strokeStyle = '#dcd6f7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // y-axis
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  // x-axis
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Draw y-axis labels and horizontal grid lines
  ctx.fillStyle = '#bfbfff';
  ctx.font = '12px Poppins, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 5)) {
    const y = height - padding - (i / maxVal) * chartHeight;
    ctx.fillText(i, padding - 8, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Draw x-axis labels (last 7 days)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const dayLabels = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
  for (let i = 0; i < 7; i++) {
    const x = padding + (i * chartWidth) / 6;
    ctx.fillText(dayLabels[i], x, height - padding + 8);
  }

  // Draw line
  ctx.strokeStyle = '#6c63ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  chartData.forEach((val, i) => {
    const x = padding + (i * chartWidth) / 6;
    const y = height - padding - (val / maxVal) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw data points
  ctx.fillStyle = '#fff';
  chartData.forEach((val, i) => {
    const x = padding + (i * chartWidth) / 6;
    const y = height - padding - (val / maxVal) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Event handlers for add task form toggling
btnAddTask.addEventListener('click', () => {
  if (addTaskForm.classList.contains('active')) {
    hideAddTaskForm();
  } else {
    showAddTaskForm();
  }
});

btnCancelAdd.addEventListener('click', (e) => {
  e.preventDefault();
  hideAddTaskForm();
});

addTaskForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = newTaskInput.value.trim();
  if (val.length > 0) {
    addNewTask(val);
    newTaskInput.value = '';
    hideAddTaskForm();
  }
});

function showAddTaskForm() {
  addTaskForm.classList.add('active');
  addTaskForm.setAttribute('aria-hidden', 'false');
  btnAddTask.setAttribute('aria-expanded', 'true');
  newTaskInput.focus();
}
function hideAddTaskForm() {
  addTaskForm.classList.remove('active');
  addTaskForm.setAttribute('aria-hidden', 'true');
  btnAddTask.setAttribute('aria-expanded', 'false');
  btnAddTask.focus();
}

// Initialize dashboard with demo tasks
function initializeDemo() {
  const initialTasks = [
    "Complete project report",
    "Review AI-powered emails",
    "Schedule team meeting",
    "Optimize workflow with AI automation",
    "Analyze data with AI assistant"
  ];
  initialTasks.forEach(t => addNewTask(t));
  // Manually mark some completed for demo
  tasks[1].done = true;
  tasks[3].done = true;
  tasksCompleted = 2;
  timeSaved = 15;
  updateStats();
  renderTasks();
  updateChart();
}

initializeDemo();
