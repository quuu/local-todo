"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

type Todo = { id: string; text: string; done: boolean };

const STORAGE_KEY = "local-todo:todos";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(todos: Todo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {}
  listeners.forEach((l) => l());
}

export function TodoList() {
  // undefined on the server, so we can tell "not loaded yet" from "empty".
  const raw = useSyncExternalStore(subscribe, read, () => undefined);
  const loaded = raw !== undefined;
  const todos = useMemo<Todo[]>(() => {
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [raw]);
  const setTodos = write;
  const [text, setText] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: value, done: false }]);
    setText("");
  }

  const toggle = (id: string) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTodos(todos.filter((t) => t.id !== id));
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="w-full">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New todo"
          className="flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 font-medium text-background"
        >
          Add
        </button>
      </form>

      <ul className="mt-6 divide-y divide-black/10 dark:divide-white/10">
        {todos.map((todo) => (
          <li key={todo.id} className="group flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggle(todo.id)}
              aria-label={`Mark "${todo.text}" ${todo.done ? "not done" : "done"}`}
              className="size-4"
            />
            <span className={`flex-1 ${todo.done ? "text-zinc-400 line-through" : ""}`}>
              {todo.text}
            </span>
            <button
              onClick={() => remove(todo.id)}
              aria-label={`Delete "${todo.text}"`}
              className="text-zinc-400 opacity-0 hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {loaded && (
        <p className="mt-4 text-sm text-zinc-500">
          {todos.length === 0 ? "Nothing yet." : `${remaining} of ${todos.length} left`}
        </p>
      )}
    </div>
  );
}
