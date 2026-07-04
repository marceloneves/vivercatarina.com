/* JS mínimo do hub Viver Catarina — substitui jQuery/bootstrap/main.js.
   Cobre: menu mobile, header sticky e acordeão do FAQ. Vanilla, sem deps. */
(function () {
	'use strict';
	var body = document.body;

	/* ---------- Menu mobile ---------- */
	document.querySelectorAll('.th-menu-toggle').forEach(function (btn) {
		btn.addEventListener('click', function () {
			body.classList.toggle('th-body-visible');
		});
	});

	document.querySelectorAll('.th-mobile-menu .menu-item-has-children').forEach(function (li) {
		li.classList.add('th-item-has-children');
		var expand = document.createElement('span');
		expand.className = 'th-mean-expand';
		var link = li.querySelector(':scope > a');
		if (link) {
			link.appendChild(expand);
		}
		expand.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			li.classList.toggle('th-active');
			var sub = li.querySelector(':scope > ul');
			if (sub) {
				sub.classList.toggle('th-open');
			}
		});
	});

	/* ---------- Header sticky ---------- */
	var sticky = document.querySelector('.sticky-wrapper');
	if (sticky) {
		window.addEventListener(
			'scroll',
			function () {
				if (window.scrollY > 500) {
					sticky.classList.add('sticky');
				} else {
					sticky.classList.remove('sticky');
				}
			},
			{ passive: true },
		);
	}

	/* ---------- Acordeão do FAQ (substitui bootstrap collapse) ---------- */
	document.querySelectorAll('.accordion .accordion-button').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var sel = btn.getAttribute('data-bs-target');
			if (!sel) {
				return;
			}
			var panel = document.querySelector(sel);
			if (!panel) {
				return;
			}
			var isOpen = panel.classList.contains('show');
			var parent = btn.closest('.accordion');
			if (parent) {
				parent.querySelectorAll('.accordion-collapse.show').forEach(function (p) {
					p.classList.remove('show');
				});
				parent.querySelectorAll('.accordion-button').forEach(function (b) {
					b.classList.add('collapsed');
					b.setAttribute('aria-expanded', 'false');
				});
			}
			if (!isOpen) {
				panel.classList.add('show');
				btn.classList.remove('collapsed');
				btn.setAttribute('aria-expanded', 'true');
			}
		});
	});

	/* Marca o item de menu ativo pela URL atual (chrome é estático). */
	var path = location.pathname.replace(/\/+$/, '') || '/';
	document.querySelectorAll('.main-menu a[href], .th-mobile-menu a[href]').forEach(function (a) {
		var hp = (a.getAttribute('href') || '').replace(/\/+$/, '') || '/';
		if (hp === path) {
			var li = a.closest('li');
			if (li) {
				li.classList.add('active');
			}
		}
	});

	/* data-bg-src -> background-image (formas decorativas do rodapé/erro). */
	document.querySelectorAll('[data-bg-src]').forEach(function (el) {
		var src = el.getAttribute('data-bg-src');
		if (src) {
			el.style.backgroundImage = 'url("' + src + '")';
			el.classList.add('background-image');
		}
	});

	/* Remove o seletor de tema legado do rodapé, se existir. */
	document.querySelectorAll('.color-scheme, .switchIcon').forEach(function (el) {
		el.remove();
	});
})();
