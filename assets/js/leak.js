/*----------------------------------------------

[The leak]

For the audit page. A bucket takes a steady stream of visitors in at the top
and loses most of them through a crack in its side — which is the whole point
of the section: the loss is silent, continuous, and you never see it happen.

The level inside never rises. That is deliberate. However much pours in, the
crack takes it, so the bucket stays stubbornly half full.

No libraries. Stops when it scrolls out of view or the tab is hidden, and
prefers-reduced-motion gets a single still frame instead.

----------------------------------------------*/

(function () {
	'use strict';

	var canvas = document.querySelector('.sjh-leak-canvas');
	if (!canvas || !canvas.getContext) { return; }

	var ctx = canvas.getContext('2d');
	var reduced = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* Tuned for a light card. The bright brand teal is only about 2.3:1 on
	   white — fine as a body of water, too weak for small falling drops — so
	   the drops use the darkened accent teal and the pooled water keeps the
	   bright one. */
	var TEAL = '7,190,184';
	var TEAL_DEEP = '8,128,124';
	var PINK = '214,10,118';
	var INK = '26,26,32';

	var W = 0, H = 0, dpr = 1;
	var drops = [];      /* falling in */
	var leaks = [];      /* escaping through the crack */
	var splashes = [];
	var t = 0;

	/* Bucket geometry, recomputed on resize. All of it derives from one box so
	   the whole picture scales cleanly to whatever column it lands in. */
	var B = {};

	function layout() {
		var box = canvas.parentNode.getBoundingClientRect();
		if (!box.width) { return; }
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		W = Math.round(box.width);
		H = Math.round(box.height);
		canvas.width = W * dpr;
		canvas.height = H * dpr;
		canvas.style.width = W + 'px';
		canvas.style.height = H + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		var bw = Math.min(W * 0.46, H * 0.52);
		B.topY = H * 0.34;
		B.botY = H * 0.78;
		B.cx = W * 0.44;
		B.topHalf = bw / 2;
		B.botHalf = bw / 2 * 0.68;          /* tapered, like a real bucket */
		B.level = B.topY + (B.botY - B.topY) * 0.46;
		B.crackY = B.topY + (B.botY - B.topY) * 0.60;
		B.crackX = B.cx + halfAt(B.crackY);
	}

	/* Half-width of the bucket at a given height. */
	function halfAt(y) {
		var k = (y - B.topY) / (B.botY - B.topY);
		return B.topHalf + (B.botHalf - B.topHalf) * Math.max(0, Math.min(1, k));
	}

	function spawn() {
		if (drops.length < 26) {
			drops.push({
				x: B.cx + (Math.random() - 0.5) * B.topHalf * 0.7,
				y: -10 - Math.random() * 40,
				v: 2.2 + Math.random() * 1.4,
				r: 1.6 + Math.random() * 1.8
			});
		}
	}

	function leak() {
		leaks.push({
			x: B.crackX,
			y: B.crackY + (Math.random() - 0.5) * 6,
			vx: 1.5 + Math.random() * 1.3,
			vy: -0.5 + Math.random() * 0.6,
			r: 1.5 + Math.random() * 1.7,
			life: 1
		});
	}

	function step(dt) {
		t += dt;

		if (Math.random() < 0.55) { spawn(); }
		if (Math.random() < 0.5) { leak(); }

		for (var i = drops.length - 1; i >= 0; i--) {
			var d = drops[i];
			d.y += d.v;
			d.v += 0.16;
			if (d.y >= B.level) {
				splashes.push({ x: d.x, y: B.level, r: 2, life: 1 });
				drops.splice(i, 1);
			}
		}

		for (var j = leaks.length - 1; j >= 0; j--) {
			var l = leaks[j];
			l.x += l.vx;
			l.y += l.vy;
			l.vy += 0.19;
			l.life -= 0.011;
			if (l.life <= 0 || l.y > H + 20 || l.x > W + 20) { leaks.splice(j, 1); }
		}

		for (var k = splashes.length - 1; k >= 0; k--) {
			var s = splashes[k];
			s.r += 0.7;
			s.life -= 0.05;
			if (s.life <= 0) { splashes.splice(k, 1); }
		}
	}

	function bucketPath() {
		ctx.beginPath();
		ctx.moveTo(B.cx - B.topHalf, B.topY);
		ctx.lineTo(B.cx - B.botHalf, B.botY);
		ctx.quadraticCurveTo(B.cx, B.botY + 10, B.cx + B.botHalf, B.botY);
		ctx.lineTo(B.cx + B.topHalf, B.topY);
	}

	function draw() {
		if (!W) { return; }
		ctx.clearRect(0, 0, W, H);

		/* incoming stream, above the bucket */
		ctx.fillStyle = 'rgba(' + TEAL_DEEP + ',0.9)';
		for (var i = 0; i < drops.length; i++) {
			var d = drops[i];
			ctx.beginPath();
			ctx.ellipse(d.x, d.y, d.r * 0.75, d.r * 1.5, 0, 0, Math.PI * 2);
			ctx.fill();
		}

		/* water inside, clipped to the bucket so it can never spill */
		ctx.save();
		bucketPath();
		ctx.clip();

		var grad = ctx.createLinearGradient(0, B.level, 0, B.botY);
		grad.addColorStop(0, 'rgba(' + TEAL + ',0.75)');
		grad.addColorStop(1, 'rgba(' + TEAL + ',0.42)');
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.moveTo(B.cx - B.topHalf, B.level + 6);
		/* a gently moving surface, so it reads as liquid rather than a block */
		for (var x = B.cx - B.topHalf; x <= B.cx + B.topHalf; x += 6) {
			var wob = Math.sin((x * 0.045) + t * 2.2) * 2.4 +
					  Math.sin((x * 0.021) - t * 1.4) * 1.6;
			ctx.lineTo(x, B.level + wob);
		}
		ctx.lineTo(B.cx + B.topHalf, B.botY + 14);
		ctx.lineTo(B.cx - B.topHalf, B.botY + 14);
		ctx.closePath();
		ctx.fill();

		ctx.strokeStyle = 'rgba(' + TEAL_DEEP + ',0.95)';
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		for (var x2 = B.cx - B.topHalf, first = true; x2 <= B.cx + B.topHalf; x2 += 6) {
			var w2 = Math.sin((x2 * 0.045) + t * 2.2) * 2.4 +
					 Math.sin((x2 * 0.021) - t * 1.4) * 1.6;
			if (first) { ctx.moveTo(x2, B.level + w2); first = false; }
			else { ctx.lineTo(x2, B.level + w2); }
		}
		ctx.stroke();

		for (var s = 0; s < splashes.length; s++) {
			var sp = splashes[s];
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
			ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 * sp.life) + ')';
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		ctx.restore();

		/* the bucket itself */
		bucketPath();
		ctx.strokeStyle = 'rgba(' + INK + ',0.42)';
		ctx.lineWidth = 2.4;
		ctx.lineJoin = 'round';
		ctx.stroke();

		/* rim */
		ctx.beginPath();
		ctx.ellipse(B.cx, B.topY, B.topHalf, B.topHalf * 0.16, 0, 0, Math.PI * 2);
		ctx.strokeStyle = 'rgba(' + INK + ',0.5)';
		ctx.lineWidth = 2.4;
		ctx.stroke();

		/* the crack — a torn notch, lit pink so the eye goes straight to it */
		ctx.beginPath();
		ctx.moveTo(B.crackX - 9, B.crackY - 9);
		ctx.lineTo(B.crackX + 1, B.crackY - 3);
		ctx.lineTo(B.crackX - 5, B.crackY + 2);
		ctx.lineTo(B.crackX + 2, B.crackY + 9);
		ctx.strokeStyle = 'rgba(' + PINK + ',1)';
		ctx.lineWidth = 2.6;
		ctx.lineCap = 'round';
		ctx.stroke();

		var halo = ctx.createRadialGradient(B.crackX, B.crackY, 0, B.crackX, B.crackY, 26);
		halo.addColorStop(0, 'rgba(' + PINK + ',0.20)');
		halo.addColorStop(1, 'rgba(' + PINK + ',0)');
		ctx.fillStyle = halo;
		ctx.beginPath();
		ctx.arc(B.crackX, B.crackY, 26, 0, Math.PI * 2);
		ctx.fill();

		/* what escapes */
		for (var l = 0; l < leaks.length; l++) {
			var lk = leaks[l];
			ctx.beginPath();
			ctx.ellipse(lk.x, lk.y, lk.r * 0.8, lk.r * 1.35, 0.5, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(' + PINK + ',' + (0.9 * lk.life) + ')';
			ctx.fill();
		}
	}

	/* ---- loop ---------------------------------------------------------- */
	var running = false, raf = 0, last = 0, onScreen = false;

	function frame(now) {
		if (!running) { return; }
		var dt = Math.min(0.05, (now - last) / 1000 || 0);
		last = now;
		step(dt);
		draw();
		raf = window.requestAnimationFrame(frame);
	}

	function start() {
		if (running || reduced) { return; }
		running = true;
		last = window.performance ? performance.now() : Date.now();
		raf = window.requestAnimationFrame(frame);
	}

	function stop() {
		running = false;
		if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
	}

	layout();
	/* Seed a few frames so the still (and the first painted frame) already has
	   water in the bucket and drops in the air, rather than an empty vessel. */
	for (var w = 0; w < 90; w++) { step(0.016); }
	draw();

	var rt;
	window.addEventListener('resize', function () {
		clearTimeout(rt);
		rt = setTimeout(function () { layout(); draw(); }, 150);
	});

	document.addEventListener('visibilitychange', function () {
		if (document.hidden) { stop(); } else if (onScreen) { start(); }
	});

	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			onScreen = entries[0].isIntersecting;
			if (onScreen && !document.hidden) { start(); } else { stop(); }
		}, { rootMargin: '100px' }).observe(canvas);
	} else {
		onScreen = true;
		start();
	}
})();
