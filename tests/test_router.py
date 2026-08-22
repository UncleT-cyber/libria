import pytest

from libria.ui.router import ViewRouter


class FakeChild:
    """A Tk-like widget: destroy() unregisters it from its parent."""

    def __init__(self, parent):
        self._parent = parent
        self.destroyed = False

    def destroy(self):
        self.destroyed = True
        self._parent.children.remove(self)


class FakeParent:
    """Minimal container contract used by the swap pipeline."""

    def __init__(self):
        self.children = []

    def winfo_children(self):
        return list(self.children)


def make_view(parent):
    child = FakeChild(parent)
    parent.children.append(child)
    return child


def test_swap_clears_parent_and_reconstructs():
    parent = FakeParent()
    router = ViewRouter(parent)
    router.register("home", make_view)
    router.register("favorites", make_view)

    first = router.show("home")
    assert router.active == "home"
    assert len(parent.winfo_children()) == 1

    second = router.show("favorites")
    assert router.active == "favorites"
    assert first.destroyed                       # old layer cleared
    assert second is router.active_view          # fresh layer built
    assert len(parent.winfo_children()) == 1
    assert parent.winfo_children()[0] is second


def test_unknown_view_raises():
    router = ViewRouter(FakeParent())
    with pytest.raises(KeyError):
        router.show("settings")


def test_router_has_no_view_state_coupling():
    # the registry contract is the whole API: name -> factory(parent)
    parent = FakeParent()
    router = ViewRouter(parent, {"downloads": make_view})
    view = router.show("downloads")
    assert router.active == "downloads" and view is router.active_view
