const habitInput = document.getElementById("habitInput");
const addBtn = document.getElementById("addBtn");
const habitList = document.getElementById("habitList");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const toggleIcon = document.getElementById("toggleIcon");
const modeToggle = document.querySelector(".mode-toggle");
const filterButtons = document.querySelectorAll(".filters button");

const API_URL = "https://habit-tracker-app-a35n.onrender.com/habits";

let habits = [];
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

/* ------------------ FETCH HABITS ------------------ */
async function fetchHabits() {
  try {
    const res = await fetch(API_URL);
    habits = await res.json();
    renderHabits();
  } catch (err) { console.error("Error fetching habits:", err); }
}

/* ------------------ ADD HABIT ------------------ */
async function addHabit() {
  const text = habitInput.value.trim();
  if (!text) return;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newHabit = await res.json();
    habits.unshift(newHabit);
    renderHabits();
    habitInput.value = "";
  } catch (err) { console.error("Error adding habit:", err); }
}

addBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keypress", e => { if (e.key === "Enter") addHabit(); });

/* ------------------ TOGGLE & DELETE ------------------ */
habitList.addEventListener("click", async e => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      habits = habits.filter(h => h._id !== id);
      renderHabits();
    } catch (err) { console.error("Error deleting habit:", err); }
  } else {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "PUT" });
      const updatedHabit = await res.json();
      habits = habits.map(h => (h._id === id ? updatedHabit : h));
      renderHabits();
    } catch (err) { console.error("Error toggling habit:", err); }
  }
});

/* ------------------ FILTERS ------------------ */
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderHabits();
  });
});

/* ------------------ RENDER ------------------ */
function renderHabits() {
  habitList.innerHTML = "";
  const filtered = habits.filter(h => {
    if (currentFilter === "completed") return h.completed;
    if (currentFilter === "pending") return !h.completed;
    return true;
  });

  filtered.forEach(h => {
    const li = document.createElement("li");
    li.dataset.id = h._id;
    if (h.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = h.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    li.append(span, deleteBtn);
    habitList.appendChild(li);
  });

  updateProgress();
}

/* ------------------ PROGRESS ------------------ */
function updateProgress() {
  if (!habits.length) {
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
fetchHabits();

