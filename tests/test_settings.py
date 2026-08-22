import pytest

from libria.db import Database
from libria.settings import SettingsManager


@pytest.fixture
def manager(tmp_path):
    db = Database(tmp_path / "libria.db")
    yield SettingsManager(db)
    db.close()


def test_defaults_materialized_in_ledger(manager):
    stored = manager._db.all_settings()
    for key in ("download_directory", "audio_quality", "dark_mode"):
        assert key in stored
    assert manager.get("audio_quality") == "high"
    assert manager.get_bool("dark_mode") is False


def test_set_writes_ledger_then_broadcasts(manager):
    events = []
    observed_values = {}

    def listener(key, value):
        events.append(key)
        # the ledger must already contain the value when broadcast fires
        observed_values[key] = manager._db.get_setting(key)

    manager.register_listener(listener)
    manager.set("audio_quality", "lossless")
    assert events == ["audio_quality"]
    assert observed_values["audio_quality"] == "lossless"
    assert manager.get("audio_quality") == "lossless"


def test_bool_coercion(manager):
    manager.set("dark_mode", "true")
    assert manager.get_bool("dark_mode") is True
    manager.set("dark_mode", "false")
    assert manager.get_bool("dark_mode") is False


def test_broken_listener_does_not_break_ledger(manager):
    def bad(_k, _v):
        raise RuntimeError("consumer blew up")

    manager.register_listener(bad)
    manager.set("audio_quality", "standard")  # must not raise
    assert manager.get("audio_quality") == "standard"
