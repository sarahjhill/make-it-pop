/*----------------------------------------------

[Main JavaScript — vanilla, no dependencies]

Rebuilt to replace ~20 vendor libraries (jQuery,
Bootstrap JS, GSAP, anime.js, Swiper, Shuffle,
Lightbox, Typed.js, ProgressBar.js, lax.js, etc.)
with a single small script that reproduces the
same visual behaviour the site actually uses.

Content:
1. Mobile nav toggle
2. Smooth-scroll for in-page links
3. Typed text effect
4. Scroll reveal (animated underline / zzz divider / data-aos)
5. Animated stat counters
6. Portfolio filter
7. Magnetic button effect
8. Custom cursor
9. Side widgets on scroll
10. Mailto confirmation toast
11. Contact form submission (Formspree)
12. Archive lightbox (replaces GLightbox)

----------------------------------------------*/

/*
Set this to the form endpoint from your Formspree account
(formspree.io) — create a form there and it gives you a URL like
"https://formspree.io/f/xxxxxxxx". Until this is a real endpoint,
the contact form will show the error state when submitted.
*/
var FORM_ENDPOINT = 'https://formspree.io/f/xojgkvlk';

/*
True when the visitor has "reduce motion" set at the OS level.
custom.css handles the CSS-driven animations/transitions for this;
the magnetic button follow and the custom cursor are both driven by
JS on every mousemove rather than a CSS transition, so they need
their own check here to actually stop moving rather than just
animating faster.
*/
var REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function () {

	/* 1. Mobile nav toggle ------------------------------------------------ */

	var toggler = document.querySelector('.navbar-toggler');
	var navCollapse = document.getElementById('navbar-items');

	if (toggler && navCollapse) {
		toggler.addEventListener('click', function () {
			var isOpen = navCollapse.classList.toggle('show');
			toggler.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
		});

		// Close menu after tapping a link (mobile)
		navCollapse.querySelectorAll('.nav-link').forEach(function (link) {
			link.addEventListener('click', function () {
				navCollapse.classList.remove('show');
			});
		});
	}

	/* 2. Smooth-scroll for in-page links ----------------------------------- */

	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		var targetId = link.getAttribute('href');
		if (targetId.length < 2) return;

		link.addEventListener('click', function (e) {
			var target = document.querySelector(targetId);
			if (!target) return;
			e.preventDefault();
			var headerOffset = 90;
			var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
			window.scrollTo({ top: top, behavior: 'smooth' });
		});
	});

	/* 3. Typed text effect -------------------------------------------------- */

	var typedTarget = document.querySelector('.typed-text');
	var typedSource = document.getElementById('typed-strings');

	if (typedTarget && typedSource) {
		var strings = Array.prototype.map.call(
			typedSource.querySelectorAll('span'),
			function (el) { return el.textContent.trim(); }
		);

		var strIndex = 0, charIndex = 0, deleting = false;

		function tick() {
			var current = strings[strIndex];

			if (!deleting) {
				charIndex++;
				typedTarget.textContent = current.slice(0, charIndex);

				if (charIndex === current.length) {
					deleting = true;
					setTimeout(tick, 2000);
					return;
				}
				setTimeout(tick, 60);

			} else {
				charIndex--;
				typedTarget.textContent = current.slice(0, charIndex);

				if (charIndex === 0) {
					deleting = false;
					strIndex = (strIndex + 1) % strings.length;
					setTimeout(tick, 300);
					return;
				}
				setTimeout(tick, 30);
			}
		}

		setTimeout(tick, 300);
	}

	/* 4. Scroll reveal ------------------------------------------------------- */

	var revealObserver = new IntersectionObserver(function (entries, obs) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('active', 'in-view');
				obs.unobserve(entry.target);
			}
		});
	}, { threshold: 0.25 });

	document.querySelectorAll('.animated-underline, .zzz, [data-aos]').forEach(function (el) {
		revealObserver.observe(el);
	});

	/* 5. Animated stat counters ---------------------------------------------- */

	var counterObserver = new IntersectionObserver(function (entries, obs) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) return;

			var el = entry.target;
			var end = parseInt(el.getAttribute('data-value'), 10) || 0;
			var symbol = el.getAttribute('data-symbol') || '';
			var duration = parseInt(el.getAttribute('data-duration'), 10) || 1500;
			var start = null;

			function step(timestamp) {
				if (!start) start = timestamp;
				var progress = Math.min((timestamp - start) / duration, 1);
				var value = Math.round(progress * end);
				el.textContent = value + symbol;
				if (progress < 1) window.requestAnimationFrame(step);
			}

			window.requestAnimationFrame(step);
			obs.unobserve(el);
		});
	}, { threshold: 0.4 });

	document.querySelectorAll('.stat-counter .value').forEach(function (el) {
		counterObserver.observe(el);
	});

	/* 6. Portfolio filter ------------------------------------------------------ */

	var filterButtons = document.querySelectorAll('.shuffle-button');
	var filterItems = document.querySelectorAll('.shuffle-item');

	filterButtons.forEach(function (button) {
		button.addEventListener('click', function () {
			filterButtons.forEach(function (b) { b.classList.remove('active'); });
			button.classList.add('active');

			var value = button.getAttribute('data-value');

			filterItems.forEach(function (item) {
				var groups = item.getAttribute('data-groups') || '[]';
				var show = value === 'All' || groups.indexOf('"' + value + '"') !== -1;
				item.style.display = show ? '' : 'none';
			});
		});
	});

	/* 7. Magnetic button effect -------------------------------------------------- */

	if (!REDUCED_MOTION) {
	document.querySelectorAll('.magnetic-effect').forEach(function (el) {
		el.addEventListener('mousemove', function (e) {
			var rect = el.getBoundingClientRect();
			var x = e.clientX - rect.left - rect.width / 2;
			var y = e.clientY - rect.top - rect.height / 2;
			el.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
		});

		el.addEventListener('mouseleave', function () {
			el.style.transform = 'translate(0, 0)';
		});
	});
	}

	/* 8. Custom cursor ------------------------------------------------------------ */

	var cursor = document.querySelector('.cursor-effect');

	if (cursor && !REDUCED_MOTION && matchMedia('(any-pointer: fine)').matches) {
		var cx = 0, cy = 0, tx = 0, ty = 0;
		var shown = false;

		document.addEventListener('mousemove', function (e) {
			tx = e.clientX;
			ty = e.clientY;
			if (!shown) {
				cursor.style.opacity = '1';
				shown = true;
			}
		});

		document.addEventListener('mouseleave', function () {
			cursor.style.opacity = '0';
			shown = false;
		});

		var hoverTargets = 'a, button, .magnetic-effect, .shuffle-button';
		document.addEventListener('mouseover', function (e) {
			if (e.target.closest(hoverTargets)) cursor.classList.add('is-active');
		});
		document.addEventListener('mouseout', function (e) {
			if (e.target.closest(hoverTargets)) cursor.classList.remove('is-active');
		});

		(function render() {
			cx += (tx - cx) * 0.18;
			cy += (ty - cy) * 0.18;
			cursor.style.transform = 'translate(' + (cx - 110) + 'px,' + (cy - 110) + 'px)';
			window.requestAnimationFrame(render);
		})();
	}

	/* 9. Side widgets on scroll ----------------------------------------------------- */

	var widgets = document.querySelectorAll('.side-widget');

	function toggleWidgets() {
		var scrolled = window.scrollY > window.innerHeight * 0.6;
		widgets.forEach(function (widget) {
			widget.classList.toggle('show', scrolled);
		});
	}

	window.addEventListener('scroll', toggleWidgets, { passive: true });
	toggleWidgets();

	var scrollTopLink = document.querySelector('.side-widget.to-right .link');
	if (scrollTopLink) {
		scrollTopLink.addEventListener('click', function (e) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	/* 10. Mailto confirmation toast ------------------------------------------------- */

	/*
	A mailto: link only hands off to the visitor's email app — there's
	no way for the page to know whether they actually hit send
	afterward. This shows a friendly confirmation the moment they
	click, so the button still feels responsive, without claiming
	something the site can't actually verify.
	*/

	var toast = document.getElementById('mail-toast');
	var toastTimer = null;

	if (toast) {
		document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
			link.addEventListener('click', function () {
				toast.classList.add('show');

				clearTimeout(toastTimer);
				toastTimer = setTimeout(function () {
					toast.classList.remove('show');
				}, 4000);
			});
		});
	}

	/* 11. Contact form submission (Formspree)
12. Archive lightbox (replaces GLightbox) --------------------------------------- */

	var contactForm = document.getElementById('contact-form');

	if (contactForm) {
		var submitButton = contactForm.querySelector('.contact-submit');
		var submitText = submitButton ? submitButton.querySelector('.button-text') : null;
		var successAlert = contactForm.querySelector('.form-alert.success');
		var errorAlert = contactForm.querySelector('.form-alert.error');

		contactForm.addEventListener('submit', function (e) {
			e.preventDefault();

			if (successAlert) successAlert.classList.remove('show');
			if (errorAlert) errorAlert.classList.remove('show');

			if (!contactForm.checkValidity()) {
				contactForm.classList.add('was-validated');
				return;
			}

			contactForm.classList.add('was-validated', 'sending');
			if (submitButton) submitButton.disabled = true;
			if (submitText) submitText.textContent = 'Sending...';

			fetch(FORM_ENDPOINT, {
				method: 'POST',
				headers: { 'Accept': 'application/json' },
				body: new FormData(contactForm)
			})
				.then(function (response) {
					if (response.ok) {
						if (successAlert) successAlert.classList.add('show');
						contactForm.reset();
						contactForm.classList.remove('was-validated');
					} else {
						if (errorAlert) errorAlert.classList.add('show');
					}
				})
				.catch(function () {
					if (errorAlert) errorAlert.classList.add('show');
				})
				.finally(function () {
					contactForm.classList.remove('sending');
					if (submitButton) submitButton.disabled = false;
					if (submitText) submitText.textContent = 'Say Hello';
				});
		});
	}

	/* 12. Archive lightbox (replaces GLightbox) ---------------------------------

	   The theme shipped GLightbox at 49KB. This does the part we need in a
	   fraction of that: open, step through, close.

	   Navigation follows what is VISIBLE, not the full set — if someone has
	   filtered down to Logos, "next" should stay inside Logos rather than
	   wandering off into email campaigns. So the list is rebuilt on open.     */

	var lightbox = document.getElementById('sjh-lightbox');

	if (lightbox) {
		var lbImage = lightbox.querySelector('.sjh-lb-image');
		var lbText = lightbox.querySelector('.sjh-lb-text');
		var lbCount = lightbox.querySelector('.sjh-lb-count');
		var lbClose = lightbox.querySelector('.sjh-lb-close');
		var lbPrev = lightbox.querySelector('.sjh-lb-prev');
		var lbNext = lightbox.querySelector('.sjh-lb-next');

		var lbItems = [];
		var lbAt = 0;
		var lbOpener = null;

		function lbVisibleTiles() {
			return Array.prototype.filter.call(
				document.querySelectorAll('.sjh-tile'),
				function (tile) {
					var holder = tile.closest('.shuffle-item');
					return !holder || holder.style.display !== 'none';
				}
			);
		}

		function lbShow(index) {
			if (!lbItems.length) return;
			/* Wrap around, so the ends are never dead. */
			lbAt = (index + lbItems.length) % lbItems.length;

			var tile = lbItems[lbAt];
			var img = tile.querySelector('img');
			var caption = tile.getAttribute('data-caption') || '';

			lbImage.src = img.getAttribute('src');
			lbImage.alt = img.getAttribute('alt') || caption;
			lbText.textContent = caption;
			lbCount.textContent = (lbAt + 1) + ' of ' + lbItems.length;

			/* Warm the neighbours so stepping through does not flash white. */
			[lbAt - 1, lbAt + 1].forEach(function (i) {
				var n = lbItems[(i + lbItems.length) % lbItems.length];
				if (!n) return;
				var pre = new Image();
				pre.src = n.querySelector('img').getAttribute('src');
			});
		}

		function lbOpen(tile) {
			lbItems = lbVisibleTiles();
			var start = lbItems.indexOf(tile);
			if (start === -1) return;

			lbOpener = tile;
			lightbox.hidden = false;
			document.body.classList.add('sjh-lb-open');
			lbShow(start);
			lbClose.focus();
		}

		function lbHide() {
			lightbox.hidden = true;
			document.body.classList.remove('sjh-lb-open');
			lbImage.src = '';
			/* Put focus back where it came from, or the page jumps to the top. */
			if (lbOpener) { lbOpener.focus(); lbOpener = null; }
		}

		document.querySelectorAll('.sjh-tile').forEach(function (tile) {
			tile.addEventListener('click', function () { lbOpen(tile); });
		});

		lbClose.addEventListener('click', lbHide);
		lbPrev.addEventListener('click', function () { lbShow(lbAt - 1); });
		lbNext.addEventListener('click', function () { lbShow(lbAt + 1); });

		/* Clicking the backdrop closes; clicking the picture does not. */
		lightbox.addEventListener('click', function (e) {
			if (e.target === lightbox) lbHide();
		});

		document.addEventListener('keydown', function (e) {
			if (lightbox.hidden) return;
			if (e.key === 'Escape') { lbHide(); }
			else if (e.key === 'ArrowLeft') { lbShow(lbAt - 1); }
			else if (e.key === 'ArrowRight') { lbShow(lbAt + 1); }
			else if (e.key === 'Tab') {
				/* Keep Tab inside the dialog while it is open. */
				var focusable = [lbClose, lbPrev, lbNext];
				var i = focusable.indexOf(document.activeElement);
				e.preventDefault();
				focusable[(i + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
			}
		});

		/* Swipe on touch. 40px of travel, and only if the gesture is more
		   horizontal than vertical, so it does not fight with scrolling. */
		var touchX = 0, touchY = 0;
		lightbox.addEventListener('touchstart', function (e) {
			touchX = e.changedTouches[0].clientX;
			touchY = e.changedTouches[0].clientY;
		}, { passive: true });

		lightbox.addEventListener('touchend', function (e) {
			var dx = e.changedTouches[0].clientX - touchX;
			var dy = e.changedTouches[0].clientY - touchY;
			if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
				lbShow(dx < 0 ? lbAt + 1 : lbAt - 1);
			}
		}, { passive: true });
	}


	/* 13. Process rail ---------------------------------------------------------
	   Six steps in one column. It plays through on its own so the whole
	   process is visible without anyone realising it is interactive, pauses
	   on hover or focus, and steps aside for good once someone actually
	   chooses a step. The bodies start open in the HTML and are only
	   collapsed once this runs, so without JavaScript nothing is hidden. */
	var rail = document.querySelector('.sjh-hello .sjh-rail');

	if (rail) {
		var railSteps = Array.prototype.slice.call(rail.querySelectorAll('.sjh-rail-step'));
		var railBtns = railSteps.map(function (s) { return s.querySelector('.sjh-rail-btn'); });
		var railFill = rail.querySelector('.sjh-rail-fill');
		var DWELL = 4500;
		var railAt = 0, railTimer = null, railPaused = false;
		var railAuto = !(window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches);

		rail.setAttribute('data-js', 'on');

		function railShow(i) {
			railAt = (i + railSteps.length) % railSteps.length;
			railSteps.forEach(function (step, n) {
				var on = n === railAt;
				step.classList.toggle('is-on', on);
				step.classList.toggle('is-done', n < railAt);
				if (railBtns[n]) { railBtns[n].setAttribute('aria-expanded', on ? 'true' : 'false'); }
			});
			trackFill();
		}

		/* The dot only reaches its final position once the previous step has
		   finished collapsing, so a single measurement taken now lands about
		   a body-height too low. Follow it for the length of the transition
		   instead: the CSS eases each correction, so it still reads as one
		   smooth movement. */
		function measureFill() {
			if (!railFill) { return; }
			var dot = railSteps[railAt].querySelector('.sjh-rail-dot');
			var dr = dot.getBoundingClientRect();
			var rr = rail.getBoundingClientRect();
			railFill.style.height = Math.max(0, (dr.top - rr.top) + (dr.height / 2) - 22) + 'px';
		}

		var trackRaf = 0;
		function trackFill() {
			if (trackRaf) { window.cancelAnimationFrame(trackRaf); }
			var until = (window.performance ? performance.now() : Date.now()) + 700;
			(function step() {
				measureFill();
				var now = window.performance ? performance.now() : Date.now();
				trackRaf = now < until ? window.requestAnimationFrame(step) : 0;
			})();
		}

		function railNext() {
			railShow(railAt + 1);
			railTimer = window.setTimeout(railNext, DWELL);
		}

		function railStart() {
			if (!railAuto || railPaused || railTimer) { return; }
			railTimer = window.setTimeout(railNext, DWELL);
		}

		function railStop(permanent) {
			if (railTimer) { window.clearTimeout(railTimer); railTimer = null; }
			if (permanent) { railAuto = false; }
		}

		railBtns.forEach(function (btn, i) {
			if (!btn) { return; }
			btn.addEventListener('click', function () { railStop(true); railShow(i); });
			btn.addEventListener('keydown', function (e) {
				var k = e.key, to = null;
				if (k === 'ArrowDown' || k === 'ArrowRight') { to = i + 1; }
				else if (k === 'ArrowUp' || k === 'ArrowLeft') { to = i - 1; }
				else if (k === 'Home') { to = 0; }
				else if (k === 'End') { to = railSteps.length - 1; }
				if (to === null) { return; }
				e.preventDefault();
				railStop(true);
				railShow(to);
				railBtns[railAt].focus();
			});
		});

		rail.addEventListener('mouseenter', function () { railPaused = true; railStop(false); });
		rail.addEventListener('mouseleave', function () { railPaused = false; railStart(); });
		rail.addEventListener('focusin', function () { railPaused = true; railStop(false); });
		rail.addEventListener('focusout', function () { railPaused = false; railStart(); });

		document.addEventListener('visibilitychange', function () {
			if (document.hidden) { railStop(false); } else { railStart(); }
		});

		window.addEventListener('resize', function () { measureFill(); });

		railShow(0);

		if ('IntersectionObserver' in window) {
			new IntersectionObserver(function (entries) {
				if (entries[0].isIntersecting) { railStart(); } else { railStop(false); }
			}, { threshold: 0.2 }).observe(rail);
		} else {
			railStart();
		}
	}


});
