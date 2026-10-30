// New space dialog: pick the folder, the agent and, optionally, a branch.
// With a branch it hands over to the worktree dialog (which creates the
// checkout and then the space); without one it runs space.new directly.

import { View, div } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { run, props, closeOverlay, openOverlay, theme, spaces, panes, home, knownAgents, pickFolder } from "herdr";

const field = (input, focused, t) => Input.new(input).h(32).px(10).items_center().rounded(6).border(1)
  .border_color(focused ? t.accent : t.input).bg(t.background).text_color(t.foreground);

export default class OzNewSpace extends View {
  init(_props, cx) {
    const on = spaces().find(s => s.active)?.machine ?? null;
    this.on = on;
    this.agents = [];
    this.agent = null; // null: a plain terminal
    this.focus = "folder";
    this.error = "";
    this.handle = cx.focus_handle();

    const start = (!on && panes().find(p => p.focused)?.cwd) || (on ? "" : home());
    this.folder = InputState.new({ value: start, placeholder: "folder" });
    this.branch = InputState.new({ value: "", placeholder: "branch (optional, new or existing)" });
    for (const [name, input] of [["folder", this.folder], ["branch", this.branch]]) {
      input.on("focus", (_e, cx) => { this.focus = name; cx.notify(); });
      input.on("change", (_e, cx) => { this.error = ""; cx.notify(); });
      input.on("submit", (_e, cx) => this.go(cx));
    }
    this.folder.focus();

    cx.spawn(async cx => {
      try { this.agents = (await knownAgents({ on })).filter(a => a.installed); }
      catch { this.failed = true; }
      cx.notify();
    });
  }

  async browse(cx) {
    const picked = await pickFolder({ prompt: "Folder for the new space" });
    if (picked) { this.folder.set_value(picked); this.error = ""; }
    cx.notify();
  }

  go(cx) {
    const folder = this.folder.value().trim();
    const branch = this.branch.value().trim();
    if (!folder && !this.on) { this.error = "Choose a folder."; cx.notify(); return; }
    const argv = this.agent?.run;
    closeOverlay(props().overlay);
    if (branch) {
      openOverlay({ mod: "worktree", kind: "dialog", width: 460, height: 280,
        props: { folder, machine: this.on ?? undefined, branch, argv } });
    } else {
      run("space.new", { ...(folder && { folder }), ...(this.on && { machine: this.on }), ...(argv && { argv }) });
    }
  }

  chip(id, label, selected, onClick, t) {
    return div().id(id).h(28).px(10).flex().items_center().rounded(6).cursor_pointer().flex_none()
      .border(1).border_color(selected ? t.accent : t.input)
      .bg(selected ? t.selected : t.background).text_color(selected ? t.foreground : t.muted)
      .hover(s => s.bg(t.hover)).on_click(onClick).child(label);
  }

  render(cx) {
    const t = theme();
    const label = text => div().text_size(11).text_color(t.dim).child(text);
    return v_flex().id("oz-new-space").track_focus(this.handle).size_full().p(16).gap(8).bg(t.popover).text_size(13)
      .on_key_down(e => {
        if (e.key === "tab") { (this.focus === "folder" ? this.branch : this.folder).focus(); }
      })
      .child(div().font_semibold().text_color(t.foreground).child("New space"))
      .child(label("Folder"))
      .child(h_flex().gap(6)
        .child(div().flex_1().child(field(this.folder, this.focus === "folder", t)))
        .when(!this.on, el => el.child(this.chip("browse", "Browse…", false, (_e, cx) => this.browse(cx), t))))
      .child(label("Agent"))
      .child(h_flex().gap(6).flex_wrap()
        .child(this.chip("agent-none", "Terminal", this.agent === null, (_e, cx) => { this.agent = null; cx.notify(); }, t))
        .children(this.agents.map(a => this.chip(`agent-${a.key}`, a.name, this.agent?.key === a.key,
          (_e, cx) => { this.agent = a; cx.notify(); }, t)))
        .when(this.failed, el => el.child(div().text_color(t.dim).child("Could not load agents"))))
      .child(label("Branch"))
      .child(field(this.branch, this.focus === "branch", t))
      .when(Boolean(this.error), el => el.child(div().text_color(t.blocked).child(this.error)))
      .child(div().flex_1())
      .child(h_flex().justify_between().items_center()
        .child(div().text_size(11).text_color(t.dim).child("Tab switch field · ↵ create · esc cancel"))
        .child(div().id("create").h(30).px(14).flex().items_center().rounded(7).cursor_pointer()
          .bg(t.solid).text_color(t.solid_foreground).font_medium().hover(s => s.bg(t.foreground))
          .on_click((_e, cx) => this.go(cx)).child("Create")));
  }
}
