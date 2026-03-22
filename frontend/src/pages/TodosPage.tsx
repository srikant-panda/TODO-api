import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ApiError } from "@/services/apiClient";
import * as todoService from "@/services/todoService";
import type { Todo, TodoStatus } from "@/types/api";
import styles from "./TodosPage.module.css";

const STATUS_OPTIONS: TodoStatus[] = ["todo", "in-progress", "done"];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TodosPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [catagory, setCatagory] = useState("general");
  const [filter, setFilter] = useState<"all" | TodoStatus>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      if (filter === "all") {
        try {
          const data = await todoService.fetchTodos();
          setTodos(data.fetched_todos);
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            setTodos([]);
          } else {
            throw e;
          }
        }
      } else {
        try {
          const data = await todoService.fetchTodosByStatus(filter);
          setTodos(data.fetched_todos);
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            setTodos([]);
          } else {
            throw e;
          }
        }
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    if (loading) prevLoadingRef.current = true;
  }, [loading]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-dash-intro]", {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;
    const root = rootRef.current;
    if (!root) return;

    const justFinishedLoad = prevLoadingRef.current;
    prevLoadingRef.current = false;
    if (!justFinishedLoad) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (todos.length > 0) {
        gsap.from("[data-todo-card]", {
          y: 32,
          opacity: 0,
          scale: 0.97,
          duration: 0.5,
          stagger: { each: 0.06, from: "start" },
          ease: "power3.out",
        });
      } else {
        gsap.from("[data-empty-state]", {
          opacity: 0,
          y: 20,
          duration: 0.55,
          ease: "power3.out",
        });
      }
    }, root);

    return () => ctx.revert();
  }, [loading, todos, filter]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await todoService.createTodo({ description, catagory });
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create task.");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await todoService.deleteTodo(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
    }
  }

  async function onStatusChange(id: string, status: TodoStatus) {
    setError(null);
    try {
      await todoService.updateTodoStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status.");
    }
  }

  async function onSaveDescription(id: string, next: string) {
    setError(null);
    try {
      await todoService.updateTodoDescription(id, next);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update task.");
    }
  }

  return (
    <div ref={rootRef} className={styles.page}>
      <div className={styles.backdrop} aria-hidden />
      <div className={styles.gridBg} aria-hidden />

      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <p className={styles.eyebrow} data-dash-intro>
          Workspace
        </p>
        <h1 className={styles.heading} data-dash-intro>
          Your tasks
        </h1>
        <p className={styles.lead} data-dash-intro>
          Create, filter, and ship — synced with TODO-API in real time.
        </p>
      </header>

      <section className={styles.composer} data-dash-intro>
        <div className={styles.composerInner}>
          <span className={styles.composerLabel}>New task</span>
          <form className={styles.create} onSubmit={onCreate}>
            <input
              className={styles.input}
              placeholder="What needs doing?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              className={styles.input}
              placeholder="Category"
              value={catagory}
              onChange={(e) => setCatagory(e.target.value)}
              required
            />
            <button className={styles.primary} type="submit">
              <span className={styles.primaryGlow} aria-hidden />
              Add task
            </button>
          </form>
        </div>
      </section>

      <div className={styles.filterBar} data-dash-intro>
        <span className={styles.filterLabel}>View</span>
        <div className={styles.filterTrack}>
          <button
            type="button"
            className={filter === "all" ? styles.filterActive : styles.filterBtn}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={filter === s ? styles.filterActive : styles.filterBtn}
              onClick={() => setFilter(s)}
            >
              {labelStatus(s)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      ) : null}

      <div className={styles.listSection}>
        {loading ? (
          <div className={styles.skeletonWrap} aria-busy="true" aria-label="Loading tasks">
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLine} style={{ width: "72%" }} />
                <div className={styles.skeletonLine} style={{ width: "40%" }} />
              </div>
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div className={styles.empty} data-empty-state>
            <div className={styles.emptyIcon} aria-hidden>
              <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                <circle cx="32" cy="32" r="28" stroke="url(#e1)" strokeWidth="2" opacity="0.5" />
                <path
                  d="M22 30h20M22 38h14"
                  stroke="url(#e1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <defs>
                  <linearGradient id="e1" x1="8" y1="8" x2="56" y2="56">
                    <stop stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>Nothing here yet</h2>
            <p className={styles.emptyText}>
              Add your first task above — it will show up instantly after you save.
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {todos.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onSaveDescription={onSaveDescription}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function labelStatus(s: TodoStatus): string {
  if (s === "in-progress") return "In progress";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function TodoRow({
  todo,
  onDelete,
  onStatusChange,
  onSaveDescription,
}: {
  todo: Todo;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, s: TodoStatus) => void;
  onSaveDescription: (id: string, next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.description);

  useEffect(() => {
    setDraft(todo.description);
  }, [todo.description]);

  const statusClass =
    todo.status === "done"
      ? styles.cardDone
      : todo.status === "in-progress"
        ? styles.cardProgress
        : styles.cardTodo;

  return (
    <li className={`${styles.item} ${statusClass}`} data-todo-card>
      <div className={styles.itemAccent} aria-hidden />
      <div className={styles.itemMain}>
        {editing ? (
          <div className={styles.editRow}>
            <input
              className={styles.input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                void onSaveDescription(todo.id, draft);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button type="button" className={styles.ghost} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className={styles.titleRow}>
            <p className={styles.desc}>{todo.description}</p>
            <button type="button" className={styles.linkish} onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.pill}>{todo.catagory}</span>
        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            value={todo.status as TodoStatus}
            onChange={(e) => onStatusChange(todo.id, e.target.value as TodoStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {labelStatus(s)}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.danger} onClick={() => onDelete(todo.id)}>
          Remove
        </button>
      </div>
    </li>
  );
}
