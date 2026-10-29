# 0oz design

A calm, neutral dark layout for the [Herdr](https://herdr.dev) app, in the spirit of shadcn's `dashboard-01` and coss ui.

![0oz design](preview.png)

- One rounded, thinly bordered card holds the whole work area, inset into the window.
- A single terminal sits flush in the card. Several terminals are divided by a 1px hairline, and the focused one shows in its header, not in a bright ring.
- Dashboard-style sidebar: a solid **New space** button, rows with initial tiles, nested worktrees, Settings and an account chip at the bottom.
- Tabs in a segmented pill, and flat Files and Changes panels.

The sidebar names in the screenshot are blurred.

## Install

Tested on Herdr 0.1.7. Copy the files into your Herdr home, then switch to the layout:

```sh
git clone https://github.com/0OZ/0oz-design && cd 0oz-design
cp layouts/0oz-design.json ~/.config/herdr-app/layouts/
cp themes/0oz.json ~/.config/herdr-app/themes/
cp -R mods/oz-* ~/.config/herdr-app/mods/
herdr-app do layout.switch '{"name":"0oz-design"}'
```

`ctrl-shift-l` switches back to your previous layout, and deleting the copied files removes this one.

`oz-spaces` runs `git` and `hc machine ls` to show branches and machines. Nothing here makes network requests.

## More

[`RECIPE.md`](RECIPE.md) describes the layout region by region, how it behaves, and how it is built, so an agent can rebuild it from scratch.
