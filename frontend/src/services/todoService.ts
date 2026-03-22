import type { TodoFetch, TodoOut, TodoStatus } from "@/types/api";
import { request } from "./apiClient";

export async function fetchTodos(): Promise<TodoFetch> {
  return request<TodoFetch>({ path: "/api/todo/fetch", method: "GET" });
}

export async function createTodo(input: {
  description: string;
  catagory: string;
}): Promise<TodoOut> {
  return request<TodoOut>({
    path: "/api/todo/create",
    method: "POST",
    body: input,
  });
}

export async function updateTodoDescription(
  id: string,
  newDescription: string,
): Promise<TodoOut> {
  return request<TodoOut>({
    path: "/api/todo/update",
    method: "PUT",
    searchParams: { id, new_description: newDescription },
  });
}

export async function updateTodoStatus(
  id: string,
  newStatus: TodoStatus,
): Promise<TodoOut> {
  return request<TodoOut>({
    path: "/api/todo/updateStatus",
    method: "PUT",
    searchParams: { id, new_status: newStatus },
  });
}

export async function deleteTodo(id: string): Promise<{ msg: string }> {
  return request<{ msg: string }>({
    path: `/api/todo/delete/${id}`,
    method: "DELETE",
  });
}

export async function fetchTodosByStatus(status: string): Promise<TodoFetch> {
  return request<TodoFetch>({
    path: "/api/todo/fetchBystatus",
    method: "GET",
    searchParams: { status },
  });
}
