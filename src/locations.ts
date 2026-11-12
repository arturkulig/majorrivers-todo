import { BehaviorSubject } from "rxjs";

export const hash$ = new BehaviorSubject(window.location.hash);

hash$.subscribe({
  next: (value) => {
    if (window.location.hash !== value) {
      const url = new URL("/");
      url.hash = value;
      window.history.pushState(null, "", url);
    }
  },
});

window.addEventListener("popstate", () => {
  hash$.next(window.location.hash);
});
