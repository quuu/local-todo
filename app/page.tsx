import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Todos</h1>
      <TodoList />
    </main>
  );
}
