"""Application shell: sidebar navigation + routed content area.

Thread isolation principle: Tk is only touched on the main thread. The
audio engine's telemetry callback and the archiver's completion signal are
marshalled onto the UI thread via ``after(0, ...)``; page handlers only
enqueue work, never block on network/disk.
"""
from __future__ import annotations

import customtkinter as ctk

from .pages import DownloadsPage, FavoritesPage, HomePage, SettingsPage
from .router import ViewRouter
from ..audio_controller import AudioState


class LibriaApp(ctk.CTk):
    def __init__(self, *, db, settings, audio_controller, download_manager):
        super().__init__()
        self.title("Libria")
        self.geometry("1024x640")
        self._db = db
        self._settings = settings
        self._audio = audio_controller
        self._manager = download_manager

        self._apply_theme(settings.get_bool("dark_mode"))
        settings.register_listener(self._on_setting_changed)

        # left navigation
        self._nav = ctk.CTkFrame(self, width=180, corner_radius=0)
        self._nav.pack(side="left", fill="y")
        self._content = ctk.CTkFrame(self)
        self._content.pack(side="left", fill="both", expand=True)

        self._router = ViewRouter(self._content)
        self._router.register(
            "home", lambda p: HomePage(p, db, self._on_track_activated))
        self._router.register(
            "favorites", lambda p: FavoritesPage(p, db, self._on_track_activated))
        self._router.register(
            "downloads", lambda p: DownloadsPage(p, db, self._on_track_activated))
        self._router.register(
            "settings", lambda p: SettingsPage(p, settings))

        for name in ("home", "favorites", "downloads", "settings"):
            ctk.CTkButton(
                self._nav, text=name.capitalize(),
                command=lambda n=name: self._router.show(n),
            ).pack(fill="x", padx=10, pady=4)

        # playback status strip
        self._status = ctk.CTkLabel(self, text="stopped", anchor="w")
        self._status.pack(side="bottom", fill="x")
        self._audio.set_ui_update_callback(self._on_audio_state)
        if self._manager is not None:
            self._manager._on_track_archived = self._signal_archived

        self._router.show("home")

    # -- UI-thread entry points (marshalled) ------------------------------
    def _on_track_activated(self, track: dict) -> None:
        # enqueue-only: audio starts from cache/URL instantly, the archival
        # pipeline runs on the persistent background worker
        if self._manager is not None:
            self._manager.request_track(track, play_now=True)

    def _on_audio_state(self, state: AudioState, track) -> None:
        title = track.get("title", "") if track else ""
        self.after(0, lambda: self._status.configure(
            text=f"{state.value}  {title}"))

    def _signal_archived(self, track_id: str, path: str) -> None:
        # flip cloud -> downloaded for the active view on the UI thread
        self.after(0, self._refresh_active_view)

    def _refresh_active_view(self) -> None:
        view = self._router.active_view
        if hasattr(view, "refresh"):
            view.refresh()

    def _on_setting_changed(self, key: str, value: str) -> None:
        if key == "dark_mode":
            self._apply_theme(value.lower() == "true")

    @staticmethod
    def _apply_theme(dark: bool) -> None:
        ctk.set_appearance_mode("dark" if dark else "light")
