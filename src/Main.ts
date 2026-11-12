import { html, stateless } from "majorrivers";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { Item } from "./Item";
import { Tasks } from "./Model";
import { hash$ } from "./locations";

type Modes = "all" | "active" | "completed";

export const Main = stateless((props: { tasks$: BehaviorSubject<Tasks> }) => {
  const visibleTasks$ = combineLatest<[Modes, Record<Modes, Tasks>]>([
    hash$.pipe(
      map((hash) => {
        switch (hash) {
          case "#/":
            return "all" as const;
          case "#/active":
            return "active" as const;
          case "#/completed":
            return "completed" as const;
          default:
            return "all" as const;
        }
      }),
    ),
    props.tasks$.pipe(
      map((tasks) => ({
        all: tasks,
        active: tasks.filter((task) => !task.completed),
        completed: tasks.filter((task) => task.completed),
      })),
    ),
  ]).pipe(map(([mode, selections]) => selections[mode]));

  return html.main(
    {
      className: "main",
    },
    [
      html.div.key`toggle`(
        {
          className: "toggle-all-container",
        },
        [
          html.input({
            className: "toggle-all",
            props: {
              type: "checkbox",
              id: "toggle-all",
              checked: visibleTasks$.pipe(
                map((visibleTasks) =>
                  visibleTasks.every((todo) => todo.completed),
                ),
              ),
            },
            on: {
              change() {
                const tasks = props.tasks$.value;
                props.tasks$.next(
                  tasks.map((task) => ({
                    ...task,
                    completed: !tasks.some((task) => task.completed),
                  })),
                );
              },
            },
          }),
          html.label(
            {
              className: "toggle-all-label",
            },
            ["Toggle All Input"],
          ),
        ],
      ),
      html.ul(
        {
          className: "todo-list",
        },
        visibleTasks$.pipe(
          map((visibleTasks) =>
            visibleTasks.map((task) =>
              Item({
                task,
                onRemove(tasksToRemove) {
                  props.tasks$.next(
                    props.tasks$.value.filter((task) => task !== tasksToRemove),
                  );
                },
                onToggle(taskToToggle) {
                  props.tasks$.next(
                    props.tasks$.value.map((task) =>
                      task === taskToToggle
                        ? { ...task, completed: !task.completed }
                        : task,
                    ),
                  );
                },
                onUpdate(taskToRename, title) {
                  props.tasks$.next(
                    props.tasks$.value.map((task) =>
                      task === taskToRename ? { ...task, title } : task,
                    ),
                  );
                },
              }),
            ),
          ),
        ),
      ),
    ],
  );
});
