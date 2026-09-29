import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

export const routers = [
  { path: "/", name: "home", element: <Index /> },
  { path: "/auth", name: "auth", element: <Auth /> },
  { path: "*", name: "404", element: <NotFound /> },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
