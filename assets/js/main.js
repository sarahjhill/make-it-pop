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

	/* 11. Contact form submission (Formspree) --------------------------------------- */

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
});
