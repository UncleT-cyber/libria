"""customtkinter pages bound to the view router.

Imported only by the application entry point - tkinter/customtkinter are
GUI-time dependencies. All heavy work (downloads, network, tagging) is
owned by the background engine; page event handlers only enqueue requests,
read cached DB rows, or write the settings ledger, keeping every UI
operation well under the 16ms frame budget.
"""
from __future__ import annotations

from typing import Callable, Optional

import customtkinter as ctk

CLOUD_ICON = "☁"
ARCHIVED_ICON = "⬇"


class TrackListPage(ctk.CTkFrame):
    """Shared row-rendering contract for home / favorites / downloads."""

    def __init__(self, parent, title: str, track_loader: Callable[[], list],
                 on_track_activated: Callable[[dict], None]):
        super().__init__(parent)
        self._track_loader = track_loader
        self._on_track_activated = on_track_activated
        ctk.CTkLabel(self, text=title, font=("Inter", 20, "bold")).pack(
            anchor="w", padx=16, pady=(16, 8)
        )
        self._list = ctk.CTkScrollableFrame(self)
        self._list.pack(fill="both", expand=True, padx=8, pady=8)
        self.refresh()

    def refresh(self) -> None:
        for child in self._list.winfo_children():
            child.destroy()
        for track in self._track_loader():
            self._build_row(track)

    def _build_row(self, track: dict) -> None:
        row = ctk.CTkFrame(self._list)
        row.pack(fill="x", pady=2)
        archived = bool(track.get("local_file_path"))
        row.state_icon = ctk.CTkLabel(
            row, text=ARCHIVED_ICON if archived else CLOUD_ICON, width=28
        )
        row.state_icon.pack(side="left", padx=4)
        ctk.CTkButton(
            row,
            text=f"{track.get('artist', '')} — {track.get('title', '')}",
            anchor="w",
            command=lambda t=track: self._on_track_activated(t),
        ).pack(side="left", fill="x", expand=True, padx=4, pady=2)


class HomePage(TrackListPage):
    def __init__(self, parent, db, on_track_activated):
        super().__init__(parent, "Home", db.all_tracks, on_track_activated)


class FavoritesPage(TrackListPage):
    def __init__(self, parent, db, on_track_activated):
        super().__init__(parent, "Favorites", db.favorite_tracks, on_track_activated)


class DownloadsPage(TrackListPage):
    def __init__(self, parent, db, on_track_activated):
        def archived_only():
            return [t for t in db.all_tracks() if t.get("local_file_path")]

        super().__init__(parent, "Downloads", archived_only, on_track_activated)


class SettingsPage(ctk.CTkFrame):
    """Every interaction writes the app_settings ledger FIRST (via the
    SettingsManager), which then broadcasts to operational modules."""

    def __init__(self, parent, settings, on_browse: Optional[Callable[[], str]] = None):
        super().__init__(parent)
        self._settings = settings
        ctk.CTkLabel(self, text="Settings", font=("Inter", 20, "bold")).pack(
            anchor="w", padx=16, pady=(16, 8)
        )

        # download directory (text form + optional browse)
        dir_row = ctk.CTkFrame(self)
        dir_row.pack(fill="x", padx=16, pady=6)
        ctk.CTkLabel(dir_row, text="Download directory", width=160).pack(side="left")
        self._dir_entry = ctk.CTkEntry(dir_row)
        self._dir_entry.insert(0, settings.get("download_directory") or "")
        self._dir_entry.pack(side="left", fill="x", expand=True, padx=6)
        self._dir_entry.bind(
            "<FocusOut>",
            lambda _e: settings.set("download_directory", self._dir_entry.get()),
        )
        if on_browse is not None:
            ctk.CTkButton(dir_row, text="Browse", width=80,
                          command=self._browse).pack(side="left", padx=4)
        self._on_browse = on_browse

        # audio quality (segmented choice)
        q_row = ctk.CTkFrame(self)
        q_row.pack(fill="x", padx=16, pady=6)
        ctk.CTkLabel(q_row, text="Audio quality", width=160).pack(side="left")
        quality = ctk.CTkSegmentedButton(
            q_row, values=["standard", "high", "lossless"],
            command=lambda v: settings.set("audio_quality", v),
        )
        quality.set(settings.get("audio_quality") or "high")
        quality.pack(side="left", padx=6)

        # dark mode (toggle)
        self._dark = ctk.CTkSwitch(
            self, text="Dark mode",
            command=lambda: settings.set("dark_mode", "true" if self._dark.get() else "false"),
        )
        if settings.get_bool("dark_mode"):
            self._dark.select()
        self._dark.pack(anchor="w", padx=16, pady=8)

    def _browse(self) -> None:
        chosen = self._on_browse()
        if chosen:
            self._dir_entry.delete(0, "end")
            self._dir_entry.insert(0, chosen)
            self._settings.set("download_directory", chosen)
