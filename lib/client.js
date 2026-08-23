window.__ModuleLoader__.load({
	id: "dsh-knj-menu",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react = require("react");

		// 第三方菜单项统一注册点：其它插件注册到这里（而非直接注册 sidebar.footer.action），
		// 由本菜单管理器统一渲染成「常驻区 + ☰ 折叠菜单」，支持 📌 固定/取消固定。
		const MENU_SLOT = 'knj.menu.item';
		const STORAGE_KEY = 'knj.menu.pinned';

		function readPinned() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				return raw ? JSON.parse(raw) : null;
			} catch { return null; }
		}
		function writePinned(ids) {
			try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
		}

		const css = `
.knjm-root{display:flex;flex-direction:column;width:100%}
.knjm-item{position:relative;display:flex;align-items:center;width:100%}
.knjm-item .knj-newtask{margin:0}
.knjm-pin{position:absolute;right:2px;top:50%;transform:translateY(-50%);flex:none;box-sizing:border-box;cursor:pointer;width:20px;height:20px;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;font-size:11px;line-height:1;display:inline-flex;align-items:center;justify-content:center;opacity:0;transition:opacity .12s,color .12s,background .12s}
.knjm-item:hover .knjm-pin{opacity:1}
.knjm-pin:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.knjm-toggle{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:36px;color:var(--dsw-alias-label-secondary);background:transparent;border:none;border-radius:12px;flex:none;justify-content:flex-start;align-items:center;gap:6px;margin:6px -2px 2px;padding:0 10px 0 8px;font-family:inherit;font-size:13px;line-height:20px;display:flex;transition:background .15s,color .15s}
.knjm-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.knjm-chevron{flex:none;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);transition:transform .15s;font-size:12px}
.knjm-chevron.open{transform:rotate(90deg)}
.knjm-panel{display:flex;flex-direction:column;margin:2px 0 2px 8px;padding-left:6px;border-left:1px solid var(--dsw-alias-border-l2)}
.knjm-empty{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:4px 8px}
`;

		let styleInjected = false;
		function ensureStyle() {
			if (styleInjected) return;
			styleInjected = true;
			const s = document.createElement('style');
			s.textContent = css;
			document.head.appendChild(s);
		}

		class MenuManager extends react.Component {
			constructor(props) {
				super(props);
				this.state = { entries: [], pinned: readPinned(), open: false };
			}
			componentDidMount() {
				ensureStyle();
				this.refresh();
				this._unsub = this.props.subscribe(() => this.refresh());
			}
			componentWillUnmount() { if (this._unsub) this._unsub(); }
			refresh() { this.setState({ entries: this.props.entries() || [] }); }
			sort(list) {
				return [...list].sort((a, b) => (a.options.order || 0) - (b.options.order || 0));
			}
			// 默认常驻：order 最小的项（首次运行、localStorage 无 pinned 时）
			defaultPinnedId() {
				const sorted = this.sort(this.state.entries);
				return sorted[0] ? sorted[0].options.id : null;
			}
			isPinned(e) {
				if (this.state.pinned === null) return e.options.id === this.defaultPinnedId();
				return this.state.pinned.includes(e.options.id);
			}
			togglePin(id) {
				const cur = this.state.pinned === null
					? [this.defaultPinnedId()].filter(Boolean)
					: this.state.pinned;
				const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
				this.setState({ pinned: next });
				writePinned(next);
			}
			renderPin(e, pinned) {
				return react.createElement('button', {
					className: 'knjm-pin',
					title: pinned ? '取消固定（收进菜单）' : '固定（常驻显示）',
					onClick: (ev) => { ev.stopPropagation(); this.togglePin(e.options.id); },
				}, pinned ? '📌' : '⚲');
			}
			renderItem(e, pinned) {
				const C = e.component;
				return react.createElement('div', { key: e.options.id, className: 'knjm-item' },
					C ? react.createElement(C, {}) : null,
					this.renderPin(e, pinned),
				);
			}
			render() {
				const entries = this.state.entries;
				const pinnedItems = this.sort(entries.filter((e) => this.isPinned(e)));
				const foldedItems = this.sort(entries.filter((e) => !this.isPinned(e)));
				return react.createElement('div', { className: 'knjm-root' },
					pinnedItems.map((e) => this.renderItem(e, true)),
					// 只有存在折叠项时才展示「更多」
					foldedItems.length > 0
						? react.createElement('div', null,
							react.createElement('button', { className: 'knjm-toggle', title: '展开/收起更多', onClick: () => this.setState({ open: !this.state.open }) },
								react.createElement('span', { className: 'knjm-chevron' + (this.state.open ? ' open' : '') }, '▸'),
								react.createElement('span', null, '更多'),
							),
							this.state.open
								? react.createElement('div', { className: 'knjm-panel' },
									foldedItems.map((e) => this.renderItem(e, false)),
								)
								: null,
						)
						: null,
				);
			}
		}

		function apply(ctx) {
			const slots = ctx.get('slots');
			if (!slots) return;
			slots.inject('sidebar.footer.action', () => slots.register(
				{
					name: 'sidebar.footer.action',
					id: 'knj-menu',
					order: -30,
					locale: 'zh',
					// 声明 knj.menu.item 子 slot（list + root scope），其它插件才能注册菜单项进来
					children: {
						'knj.menu.item': { kind: 'list', scope: 'root' },
					},
				},
				(props) => react.createElement(MenuManager, {
					entries: () => slots.entries(MENU_SLOT),
					subscribe: (fn) => slots.subscribe(MENU_SLOT, fn),
				}),
			));
		}

		exports.apply = apply;
		exports.inject = ['slots'];
		return module.exports;
	}
});
