const STORAGE_KEY = "todos.v1";

/**
 * App State
 */
let todos = [];
let activeFilter = "all"; // all | active | completed

/**
 * DOM Refs
 */
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const listEl = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = Array.from(document.querySelectorAll(".filter"));

/**
 * Utils
 */
const uid = () => Math.random().toString(36).slice(2, 10);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
const load = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(data)) return data;
  } catch (_) {}
  return [];
};

const getFiltered = () => {
  if (activeFilter === "active") return todos.filter(t => !t.completed);
  if (activeFilter === "completed") return todos.filter(t => t.completed);
  return todos;
};

const updateItemsLeft = () => {
  const count = todos.filter(t => !t.completed).length;
  itemsLeftEl.textContent = `${count} item${count === 1 ? "" : "s"} left`;
};

/**
 * Rendering
 */
function render() {
  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (const todo of getFiltered()) {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toggle";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "Toggle completed");

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = todo.title;
    title.tabIndex = 0;
    title.setAttribute("role", "textbox");
    title.setAttribute("aria-label", "Edit task title");

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete task");

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(del);

    fragment.appendChild(li);
  }
  listEl.appendChild(fragment);
  updateItemsLeft();
}

/**
 * Event Handlers
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  todos.unshift({ id: uid(), title, completed: false, createdAt: Date.now() });
  input.value = "";
  save();
  render();
});

listEl.addEventListener("click", (e) => {
  const target = e.target;
  const li = target.closest(".todo-item");
  if (!li) return;
  const id = li.dataset.id;

  if (target.classList.contains("delete")) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }
});

listEl.addEventListener("change", (e) => {
  const target = e.target;
  if (target.classList.contains("toggle")) {
    const li = target.closest(".todo-item");
    const id = li.dataset.id;
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = target.checked;
      save();
      render();
    }
  }
});

// Inline edit on Enter / blur
listEl.addEventListener("keydown", (e) => {
  const target = e.target;
  if (target.classList.contains("title") && e.key === "Enter") {
    e.preventDefault();
    target.blur();
  }
});

listEl.addEventListener("blur", (e) => {
  const target = e.target;
  if (target.classList.contains("title")) {
    const li = target.closest(".todo-item");
    const id = li.dataset.id;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newTitle = target.textContent.trim();
    if (!newTitle) {
      // If cleared, delete the task
      todos = todos.filter(t => t.id !== id);
    } else {
      todo.title = newTitle;
    }
    save();
    render();
  }
}, true);

// Filters
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter;
    filterButtons.forEach(b => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-selected", String(b === btn));
    });
    render();
  });
});

// Clear completed
clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  save();
  render();
});

// Initialize
todos = load();
render();

