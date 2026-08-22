"""Dynamic view swap pipeline (spec section 3).

Specific views (home, favorites, downloads, settings) are bound by name to
an abstract routing engine. Swapping clears the active parent frame and
reconstructs the child layer via the view's factory - no view-state
configuration leaks into individual visual classes.

The router is deliberately display-agnostic: the parent container only
needs ``winfo_children()`` and each child a ``destroy()`` method, so the
pipeline is fully exercisable headlessly.
"""
from __future__ import annotations

from typing import Callable, Dict, Optional

ViewFactory = Callable[[object], object]

DEFAULT_VIEWS = ("home", "favorites", "downloads", "settings")


class ViewRouter:
    def __init__(self, parent, registry: Optional[Dict[str, ViewFactory]] = None):
        self._parent = parent
        self._registry: Dict[str, ViewFactory] = dict(registry or {})
        self._active_name: Optional[str] = None
        self._active_view = None

    @property
    def active(self) -> Optional[str]:
        return self._active_name

    @property
    def active_view(self):
        return self._active_view

    def register(self, name: str, factory: ViewFactory) -> None:
        self._registry[name] = factory

    def show(self, name: str):
        if name not in self._registry:
            raise KeyError(f"unregistered view: {name!r}")
        # clear the active parent frame
        for child in list(self._parent.winfo_children()):
            child.destroy()
        # reconstruct the child layer from scratch
        self._active_view = self._registry[name](self._parent)
        self._active_name = name
        return self._active_view
