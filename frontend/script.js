const habitInput = document.getElementById("habitInput");
const addBtn = document.getElementById("addBtn");
const habitList = document.getElementById("habitList");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const toggleIcon = document.getElementById("toggleIcon");
const modeToggle = document.querySelector(".mode-toggle");
const filterButtons = document.querySelectorAll(".filters button");

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
let currentFilter = "all";

/* ------------------ THEME ------------------ */
if (darkMode) {
  document.body.classList.add("dark");
  toggleIcon.textContent = "🌙";
}

modeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark");
  toggleIcon.textContent = darkMode ? "🌙" : "☀️";
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
});

/* ------------------ STORAGE ------------------ */
function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

/* ------------------ RENDER ------------------ */
function renderHabits() {
  habitList.innerHTML = "";

  const filteredHabits = habits.filter(habit => {
    if (currentFilter === "completed") return habit.completed;
    if (currentFilter === "pending") return !habit.completed;
    return true;
  });

  filteredHabits.forEach(habit => {
    const li = document.createElement("li");
    li.dataset.id = habit.id;
    if (habit.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = habit.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete habit");

    li.append(span, deleteBtn);
    habitList.appendChild(li);
  });

  updateProgress();
}

/* ------------------ EVENTS ------------------ */
habitList.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    habits = habits.filter(h => h.id !== id);
  } else {
    habits = habits.map(h =>
      h.id === id ? { ...h, completed: !h.completed } : h
    );
  }

  saveHabits();
  renderHabits();
});

/* ------------------ ADD HABIT ------------------ */
addBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addHabit();
});

function addHabit() {
  const text = habitInput.value.trim();
  if (!text) return;

  habits.push({
    id: Date.now(),
    text,
    completed: false
  });

  habitInput.value = "";
  saveHabits();
  renderHabits();
}

/* ------------------ FILTERS ------------------ */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderHabits();
  });
});

/* ------------------ PROGRESS ------------------ */
function updateProgress() {
  if (habits.length === 0) {
    progressBar.style.width = "0%";
    progressText.textContent = "0% Completed";
    return;
  }

  const completed = habits.filter(h => h.completed).length;
  const percent = Math.round((completed / habits.length) * 100);

  progressBar.style.width = percent + "%";
  progressText.textContent = `${percent}% Completed`;
}

/* ------------------ INIT ------------------ */
renderHabits();
