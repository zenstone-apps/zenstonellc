#!/usr/bin/env node
'use strict';

/**
 * Erzeugt die Support-Seiten: eine pro App, plus eine kleine Uebersicht.
 *
 *   node build-support.js
 *
 * WARUM EIN GENERATOR und nicht drei von Hand gepflegte Dateien:
 * Jede App-Seite soll fuer sich stehen - wer wegen Hairfit kommt, soll nichts von CalmStoic
 * oder KnowUs sehen. Gleichzeitig sind die Haelfte aller Abschnitte identisch (Kaeufe,
 * Kuendigen, Erstattung, Daten, Kontakt), und genau die aendern sich am haeufigsten. Von Hand
 * gepflegt wuerden drei Kopien binnen weniger Monate auseinanderlaufen - und die falsche
 * Kuendigungsanleitung faellt erst auf, wenn sich jemand beschwert.
 *
 * Also: gemeinsame Texte stehen hier EINMAL, die Seiten werden daraus erzeugt.
 * Nach jeder Aenderung neu erzeugen und die HTML-Dateien mit committen (sie werden von
 * GitHub Pages direkt ausgeliefert, es gibt keinen Build-Schritt beim Deployen).
 *
 * Erzeugte Dateien - NICHT von Hand bearbeiten, Aenderungen gingen verloren:
 *   hairfit-support.html    ->  zenstonellc.com/hairfit-support
 *   calmstoic-support.html  ->  zenstonellc.com/calmstoic-support
 *   knowus-support.html     ->  zenstonellc.com/knowus-support
 *   support.html            ->  zenstonellc.com/support   (Uebersicht, verlinkt die drei)
 */

const fs = require('fs');
const path = require('path');

const MAIL_SUPPORT = 'hello.zenstone@gmail.com';
const MAIL_PRIVACY = 'privacy@zenstonellc.com';
const STAND = 'August 4, 2026';

// --- Aussehen ----------------------------------------------------------------------------
// Bewusst dieselbe Formsprache wie privacy.html und die Startseite. Wer von der App auf
// diese Seite kommt, soll nicht das Gefuehl haben, woanders gelandet zu sein.
const CSS = `
:root {
  --primary: #0f3d2e; --primary-light: #1a5540; --secondary: #d4a574;
  --text-dark: #1a1a1a; --text-medium: #4a4a4a; --text-light: #6b6b6b;
  --bg-cream: #fdfbf7; --bg-light: #f8f6f1; --white: #ffffff;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; color: var(--text-dark); line-height: 1.7; background: var(--bg-cream); }
h1, h2, h3 { font-family: 'Cormorant Garamond', serif; font-weight: 600; letter-spacing: -0.02em; }
header {
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 1.5rem 5%;
  position: sticky; top: 0; z-index: 100; border-bottom: 1px solid rgba(212,165,116,0.15);
}
header::after {
  content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--secondary), transparent); opacity: 0.3;
}
nav { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 700; color: var(--primary); text-decoration: none; }
.logo span { color: var(--secondary); }
nav a.back-link { text-decoration: none; color: var(--text-medium); font-weight: 500; font-size: 0.95rem; transition: color 0.3s; }
nav a.back-link:hover { color: var(--primary); }
.hero-small { background: linear-gradient(135deg, #f8f6f1 0%, #fdfbf7 100%); padding: 6rem 5% 4rem; position: relative; }
.hero-small h1 { font-size: 3.5rem; color: var(--primary); max-width: 1400px; margin: 0 auto; }
.hero-small p { max-width: 1400px; margin: 1rem auto 0; color: var(--text-light); font-size: 1rem; }
.content { max-width: 860px; margin: 0 auto; padding: 4rem 5% 6rem; }
.content h2 { font-size: 1.9rem; color: var(--primary); margin: 3rem 0 1rem; scroll-margin-top: 6rem; }
.content h2:first-child { margin-top: 0; }
.content h3 { font-size: 1.3rem; color: var(--primary-light); margin: 2rem 0 0.5rem; }
.content p { color: var(--text-medium); margin-bottom: 1.2rem; font-size: 1rem; line-height: 1.85; }
.content ul { margin: 0.5rem 0 1.2rem 1.5rem; color: var(--text-medium); }
.content ul li { margin-bottom: 0.5rem; line-height: 1.7; }
.content a { color: var(--secondary); }
.info-box {
  background: linear-gradient(135deg, var(--white) 0%, var(--bg-light) 100%);
  border-left: 4px solid var(--secondary); border-radius: 12px; padding: 1.5rem 2rem;
  margin: 1.5rem 0; box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}
.info-box p:last-child { margin-bottom: 0; }
.divider { border: none; border-top: 1px solid rgba(212,165,116,0.2); margin: 2.5rem 0; }
.app-jump { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 2rem 0 0; }
.app-jump a {
  display: inline-block; padding: 0.6rem 1.2rem; border: 1px solid rgba(212,165,116,0.45);
  border-radius: 999px; text-decoration: none; color: var(--primary); font-size: 0.95rem;
  font-weight: 500; background: var(--white); transition: background 0.3s, border-color 0.3s;
}
.app-jump a:hover { background: var(--bg-light); border-color: var(--secondary); }
footer {
  background: linear-gradient(135deg, var(--primary) 0%, #0a2f23 100%); color: var(--white);
  padding: 3.5rem 5%; text-align: center; position: relative;
}
footer::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--secondary), transparent);
}
footer p { opacity: 0.85; font-weight: 300; letter-spacing: 0.3px; }
@media (max-width: 640px) {
  .hero-small h1 { font-size: 2.2rem; }
  .content { padding: 3rem 5% 5rem; }
}`;

// --- Gemeinsame Abschnitte ---------------------------------------------------------------
// Stehen auf JEDER App-Seite, damit sie fuer sich allein steht. Hier gepflegt, nicht dort.

const kontaktKasten = `
        <div class="info-box">
          <p><strong>Need help? Write to us.</strong><br>
          Email: <a href="mailto:${MAIL_SUPPORT}">${MAIL_SUPPORT}</a><br>
          We usually reply within two business days. Please tell us your device (for example
          iPhone 14, iOS 18) and what happened — that lets us help you in the first reply
          instead of the third.</p>
        </div>`;

const kaeufeAbschnitt = (app) => `
        <h2 id="purchases">Purchases &amp; subscriptions</h2>

        <h3>How do I restore a purchase?</h3>
        <p>Open the app's settings and tap <em>Restore purchases</em>, signed in with the same
        Apple ID or Google account you bought with. This restores active subscriptions.</p>

        <h3>How do I cancel a subscription?</h3>
        <p>Subscriptions are managed by the store, not by us — we cannot cancel one for you:</p>
        <ul>
          <li><strong>iPhone / iPad:</strong> Settings → tap your name → Subscriptions →
          choose ${app} → Cancel Subscription.</li>
          <li><strong>Android:</strong> Play Store → your profile picture → Payments &amp;
          subscriptions → Subscriptions → choose ${app} → Cancel.</li>
        </ul>
        <p>Cancelling stops the next renewal. You keep access until the end of the period you
        have already paid for.</p>

        <h3>How do I change my plan?</h3>
        <p>Switching between the monthly and yearly plan happens in your store account, at the
        same place you cancel. The change takes effect at the end of the period you have
        already paid for, so nothing is lost.</p>

        <h3>How do I get a refund?</h3>
        <p>Refunds are handled entirely by the store. On Apple, use
        <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener">reportaproblem.apple.com</a>;
        on Android, use the Play Store order history. If something went wrong on our side,
        write to us first — we would rather fix it.</p>

        <h3>I was charged but did not get anything</h3>
        <p>Send us the receipt from Apple or Google and tell us which package — we will sort
        it out.</p>`;

const datenAbschnitt = (kurz) => `
        <h2 id="your-data">Your data</h2>
        <p>${kurz}</p>
        <p>The full details are in our <a href="/privacy">Privacy Policy</a>. To request
        deletion of any data, or to ask a question about privacy, write to
        <a href="mailto:${MAIL_PRIVACY}">${MAIL_PRIVACY}</a>.</p>`;

const kontaktAbschnitt = `
        <h2 id="contact">Contact</h2>
        <div class="info-box">
          <p><strong>ZenStone LLC</strong><br>
          30 N Gould St, Ste R, Sheridan, WY 82801, USA<br>
          Support: <a href="mailto:${MAIL_SUPPORT}">${MAIL_SUPPORT}</a><br>
          Privacy: <a href="mailto:${MAIL_PRIVACY}">${MAIL_PRIVACY}</a></p>
        </div>`;

// --- Die Apps ----------------------------------------------------------------------------

const APPS = [
  {
    datei: 'hairfit-support.html',
    name: 'Hairfit',
    voll: 'Hairfit: AI Hairstyle Try On',
    kurzName: 'Hairfit',
    einleitung: `Hairfit shows you what a new haircut or hair colour would look like on your
        own photo, before you sit down in the chair.`,
    datenKurz: `Your photo is sent to our server only for the moment it takes to generate the
        image and is discarded immediately afterwards — we never keep a copy. Your photo and
        the generated images stay on your device.`,
    faq: `
        <h3>How do credits work?</h3>
        <p>One credit produces one image. Your first image is free. After that you either buy
        credits outright or subscribe:</p>
        <ul>
          <li><strong>Single image</strong> — 1 credit.</li>
          <li><strong>10 credits</strong> — a one-off pack.</li>
          <li><strong>Monthly subscription</strong> — 8 credits every month.</li>
          <li><strong>Yearly subscription</strong> — 8 credits every month, plus 10 extra
          credits when you start.</li>
        </ul>
        <p><strong>Credits you buy outright never expire.</strong> Credits that come from a
        subscription stay available for as long as the subscription runs and expire when it
        ends. If you have both kinds, the app always spends the subscription credits first,
        so your purchased ones are the last to go.</p>

        <h3>Where are my images stored?</h3>
        <p>On your device, and nowhere else. Your photo is sent to our server only for the
        moment it takes to generate the image, and is discarded immediately afterwards — we
        never keep a copy. That also means the app cannot recover images for you: use the
        three-dot menu on a result to save it to your photo library or share it.</p>

        <h3>My credits disappeared after reinstalling</h3>
        <p>Credits are stored on your device. The app keeps a backup outside itself, so a
        reinstall on the same device normally brings them back. Moving to a new phone does
        not carry them over yet. An active <strong>subscription</strong> can always be brought
        back with <em>Restore purchases</em> in the settings. If purchased credits are missing,
        write to us with your receipt from Apple or Google and we will restore them.</p>

        <h3>The result does not look like me</h3>
        <p>The AI works best with a well-lit photo taken straight on, with your whole head in
        frame and your hair not covered by a hat or hood. Very dark photos, strong side
        angles and sunglasses all make the result less reliable. If a result is poor, use the
        thumbs-down button — that feedback goes to us and is what we use to improve the app.
        No photo is ever included with it.</p>

        <h3>Why did I get a style I did not pick?</h3>
        <p>The recommendation on the home screen is chosen by the AI from both the women's and
        the men's catalogue, based on your photo — independently of which catalogue you are
        browsing in the Looks tab. If you would rather choose yourself, pick any style from
        the Looks tab directly.</p>`
  },
  {
    datei: 'calmstoic-support.html',
    name: 'Calm Stoic Journal',
    voll: 'Calm Stoic Journal',
    kurzName: 'Calm Stoic Journal',
    einleitung: `A daily journal built around Stoic practice, with prompts, streaks and
        reminders.`,
    datenKurz: `Your journal entries, streaks and settings are stored only on your device. We
        have no access to them and cannot read or recover them.`,
    faq: `
        <h3>Where are my entries stored?</h3>
        <p>Entirely on your device. We have no access to them and cannot read, recover or
        transfer them. Uninstalling the app deletes them permanently, so export anything you
        want to keep before you remove it.</p>

        <h3>My reminder does not arrive</h3>
        <p>Check that notifications are allowed for the app in your device settings, and that
        a reminder time is set inside the app. On Android, battery optimisation can also
        suppress reminders — excluding the app from it usually fixes this.</p>

        <h3>The Marcus Aurelius chat has stopped responding</h3>
        <p>The AI chat has a monthly message allowance that resets on its own. If you have
        used it up, the app will say so. Messages are processed and then discarded; nothing
        you write in the chat is stored on our servers.</p>

        <h3>My streak disappeared</h3>
        <p>Streaks are counted on your device using its own clock and time zone. Travelling
        across time zones or changing the date manually can therefore affect them. If a streak
        was lost without any of that, write to us and describe what happened.</p>`
  },
  {
    datei: 'knowus-support.html',
    name: 'KnowUs',
    voll: 'KnowUs: Who Knows Who',
    kurzName: 'KnowUs',
    einleitung: `A party game about how well your group really knows each other.`,
    datenKurz: `Player names, answers and scores exist only while a session is running and are
        deleted automatically when it ends.`,
    faq: `
        <h3>We cannot join the same room</h3>
        <p>Everyone needs an internet connection and the same room code, and the room has to
        still be open — rooms close when the session ends. If a code is not accepted, have the
        host create a new room and share the fresh code.</p>

        <h3>Is the game data kept?</h3>
        <p>No. Player names, answers and scores exist only while the session is running and
        are deleted automatically when it ends.</p>

        <h3>A player dropped out mid-game</h3>
        <p>Rejoining with the same room code puts them back in. If the host leaves, the room
        closes for everyone — start a new one.</p>`
  }
];

// --- Seitengeruest -----------------------------------------------------------------------

function seite({ titel, ueberschrift, unterzeile, inhalt }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titel}</title>
    <meta name="description" content="Help and contact for ${ueberschrift}.">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>${CSS}
    </style>
</head>
<body>

    <header>
        <nav>
            <a href="/" class="logo">Zen<span>Stone</span></a>
            <a href="/" class="back-link">← Back to Home</a>
        </nav>
    </header>

    <div class="hero-small">
        <h1>${ueberschrift}</h1>
        <p>${unterzeile}</p>
    </div>

    <div class="content">
${inhalt}
    </div>

    <footer>
        <p>© 2026 ZenStone LLC · Sheridan, WY, USA</p>
        <p style="margin-top:0.75rem;font-size:0.9rem;opacity:0.6;">
            <a href="/" style="color:var(--secondary);text-decoration:none;">← Back to Home</a>
            &nbsp;·&nbsp;
            <a href="/privacy" style="color:var(--secondary);text-decoration:none;">Privacy Policy</a>
        </p>
    </footer>

</body>
</html>
`;
}

// --- Erzeugen ----------------------------------------------------------------------------

const ziel = __dirname;
let gebaut = [];

for (const app of APPS) {
  const inhalt = [
    kontaktKasten,
    `\n        <hr class="divider">\n`,
    `        <h2 id="about">About ${app.name}</h2>`,
    `        <p>${app.einleitung}</p>`,
    app.faq,
    `\n        <hr class="divider">\n`,
    kaeufeAbschnitt(app.kurzName),
    `\n        <hr class="divider">\n`,
    datenAbschnitt(app.datenKurz),
    `\n        <hr class="divider">\n`,
    kontaktAbschnitt
  ].join('\n');

  fs.writeFileSync(path.join(ziel, app.datei), seite({
    titel: `${app.name} Support – ZenStone LLC`,
    ueberschrift: `${app.voll} — Support`,
    unterzeile: `Help and contact · Last updated: ${STAND}`,
    inhalt
  }));
  gebaut.push(app.datei);
}

// Uebersicht. Enthaelt bewusst KEINE App-Inhalte, nur die Wege dorthin - jede App-Seite
// steht fuer sich, damit ein Store-Pruefer nur die App sieht, um die es geht.
const hubInhalt = [
  `        <p>Pick the app you need help with. Each app has its own support page.</p>`,
  `        <div class="app-jump">`,
  APPS.map(a => `          <a href="/${a.datei.replace(/\.html$/, '')}">${a.voll}</a>`).join('\n'),
  `        </div>`,
  `\n        <hr class="divider">\n`,
  kontaktKasten,
  `\n        <hr class="divider">\n`,
  kontaktAbschnitt
].join('\n');

fs.writeFileSync(path.join(ziel, 'support.html'), seite({
  titel: 'Support – ZenStone LLC',
  ueberschrift: 'Support',
  unterzeile: `Help and contact for ZenStone LLC apps · Last updated: ${STAND}`,
  inhalt: hubInhalt
}));
gebaut.push('support.html');

console.log('Erzeugt:');
for (const d of gebaut) {
  console.log('  ' + d + '  ->  /' + d.replace(/\.html$/, ''));
}
