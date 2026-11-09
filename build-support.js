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
 *   bmxsesh-support.html    ->  zenstonellc.com/bmxsesh-support
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
    // Einmalkaeufe statt Abos (Marcel 09.11.2026): eigener Kauf-Abschnitt
    kaeufe: `
        <h2 id="purchases">Purchases</h2>

        <h3>What can I buy?</h3>
        <p>A few questions are free. To unlock more you can buy <em>All-Access</em> (everything)
        or a single pack — Couples, Friends, Family or Party. Every purchase is one-time:
        there are no subscriptions and nothing renews.</p>

        <h3>How do I restore a purchase?</h3>
        <p>Use <em>Restore purchases</em> in the app, signed in with the same Apple ID or Google
        account you bought with. On a new device or after a reinstall your purchases come
        back this way.</p>

        <h3>How do I get a refund?</h3>
        <p>Refunds are handled entirely by the store. On Apple, use
        <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener">reportaproblem.apple.com</a>;
        on Android, use the Play Store order history. If something went wrong on our side,
        write to us first — we would rather fix it.</p>

        <h3>I was charged but the content is still locked</h3>
        <p>Tap <em>Restore purchases</em> first. If that does not help, send us the receipt from
        Apple or Google and we will sort it out.</p>`,
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
  },
  {
    datei: 'bmxsesh-support.html',
    name: 'BMX Sesh',
    voll: 'BMX Sesh: Bike Freestyle',
    kurzName: 'BMX Sesh',
    einleitung: `A freestyle BMX game: ride parks, link tricks, grinds and manuals into lines, and
        hit big dirt jumps. West Park is free; one purchase unlocks all other parks.`,
    datenKurz: `Scores, records, stickers, garage choices and settings are stored only on your
        device. The game has no account, no ads and no analytics.`,
    // Einmalkauf statt Abo: eigener Kauf-Abschnitt
    kaeufe: `
        <h2 id="purchases">Purchases</h2>

        <h3>What does "Unlock all parks" include?</h3>
        <p>A single one-time purchase that unlocks every park — Street, Arena, Dirt Hill and all
        parks added in future updates. It is not a subscription and never renews.</p>

        <h3>How do I restore my purchase?</h3>
        <p>Open <em>Play</em>, tap any locked park and choose <em>Restore purchases</em>, signed
        in with the same Apple ID or Google account you bought with. On a new device the unlock
        also comes back automatically when the game starts.</p>

        <h3>How do I get a refund?</h3>
        <p>Refunds are handled entirely by the store. On Apple, use
        <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener">reportaproblem.apple.com</a>;
        on Android, use the Play Store order history. If something went wrong on our side,
        write to us first — we would rather fix it.</p>

        <h3>I was charged but the parks are still locked</h3>
        <p>Tap <em>Restore purchases</em> first. If that does not help, send us the receipt from
        Apple or Google and we will sort it out.</p>`,
    faq: `
        <h3>How do I control the rider?</h3>
        <p>Open <em>Controls</em> in the main menu: it explains the phone controls, keyboard and
        game controller. With <em>Settings → Control hints</em> you can show the labels at the
        thumbs permanently, for the first minutes, or never.</p>

        <h3>Can I use a game controller?</h3>
        <p>Yes. Xbox and other standard controllers work on iPhone and Android.</p>

        <h3>My progress is gone</h3>
        <p>Progress lives on your device only. Deleting the app deletes it. A purchased unlock
        is never lost — use <em>Restore purchases</em>.</p>`
  }
];

// --- Seitengeruest -----------------------------------------------------------------------

function seite({ titel, ueberschrift, unterzeile, inhalt, beschreibung }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titel}</title>
    <meta name="description" content="${beschreibung || `Help and contact for ${ueberschrift}.`}">
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

// --- Nutzungsbedingungen -----------------------------------------------------------------
// Google Play (Haendlerstatus, Stand 09.11.2026) fragt je App nach einer URL zu den Nutzungs-
// bedingungen, die "speziell fuer diese App gilt". Darum eine Seite PRO App, aus einem
// gemeinsamen Geruest erzeugt: die Abschnitte, die sich bei Rechtsaenderungen aendern
// (Haftung, anwendbares Recht, Widerruf), stehen EINMAL hier.
// ACHTUNG: Entwurf ohne anwaltliche Pruefung. Anwendbares Recht = Wyoming (Sitz der LLC),
// zwingende Verbraucherrechte bleiben ausdruecklich unberuehrt.
const STAND_TERMS = 'November 9, 2026';

const TERMS = [
  {
    datei: 'calmstoic-terms.html',
    name: 'Calm Stoic Journal',
    voll: 'Calm Stoic Journal',
    was: `Calm Stoic Journal is a daily journal built around Stoic practice, with prompts,
        streaks, reminders and an optional AI conversation partner styled after Marcus
        Aurelius.`,
    kaeufe: `
        <p>The app is free to start. Some features require a paid plan (<em>Premium</em> or
        <em>Premium Plus</em>), offered as a monthly or yearly subscription. Where a free trial
        is offered, the app shows the trial length and the price that applies afterwards before
        you confirm; the yearly plan, for example, is free for 7 days and then renews at the
        yearly price shown.</p>
        <ul>
          <li><strong>Billing:</strong> Purchases are processed by Apple (App Store) or Google
          (Google Play), not by us. Payment is charged to your store account.</li>
          <li><strong>Automatic renewal:</strong> Subscriptions renew automatically for the same
          period and price unless you cancel at least 24 hours before the end of the current
          period (or trial).</li>
          <li><strong>Cancelling:</strong> Manage or cancel in your store account settings. Deleting
          the app does not cancel a subscription. Cancelling stops the next renewal; you keep
          access until the end of the period you have paid for.</li>
          <li><strong>Refunds:</strong> Handled by Apple or Google under their policies. See our
          <a href="/calmstoic-support#purchases">support page</a> for how to request one.</li>
        </ul>`,
    ki: `The Marcus Aurelius conversation is generated by an AI language model. It is not
        Marcus Aurelius, can be wrong, and has a monthly message allowance. Messages you send
        are processed to produce a reply and are not stored on our servers; see the
        <a href="/privacy">Privacy Policy</a>.`,
    hinweis: `Calm Stoic Journal is a tool for reflection and personal growth. It is not
        medical, psychological or therapeutic advice and not a substitute for professional help.
        If you are in crisis or worried about your safety, contact local emergency services or
        a qualified professional.`,
    inhalt: `Your journal entries, streaks and settings are stored on your device. We cannot
        read or recover them. Uninstalling the app deletes them, so export what you want to
        keep.`
  },
  {
    datei: 'hairfit-terms.html',
    name: 'Hairfit',
    voll: 'Hairfit: AI Hairstyle Try On',
    was: `Hairfit shows an AI-generated preview of how a hairstyle or hair colour might look on
        a photo you provide.`,
    kaeufe: `
        <p>Your first image is free. Further images use credits, which you can buy as one-off
        packs or receive through a monthly or yearly subscription.</p>
        <ul>
          <li><strong>Billing:</strong> Purchases are processed by Apple or Google, not by us.</li>
          <li><strong>Credits:</strong> Credits you buy outright do not expire. Credits that come
          with a subscription are available while the subscription runs and expire when it ends.</li>
          <li><strong>Subscriptions</strong> renew automatically unless cancelled at least 24 hours
          before the end of the current period. Manage or cancel in your store account settings.</li>
          <li><strong>Refunds:</strong> Handled by Apple or Google under their policies.</li>
        </ul>`,
    ki: `Previews are generated by AI image models and are approximate. Results may not
        reflect how a real hairstyle or colour will turn out. You may only upload photos of
        yourself or of people who have agreed to it. Do not upload photos of children or
        anyone else without permission. Your photo is processed only to create the preview; see
        the <a href="/privacy">Privacy Policy</a>.`,
    hinweis: `Hairfit is for entertainment and inspiration. A preview is not a promise of a
        result at a salon.`,
    inhalt: `Your photo and generated images are kept on your device. Each new image is held
        briefly on our server so it can still reach you if your connection drops, then deleted
        automatically.`
  },
  {
    datei: 'knowus-terms.html',
    name: 'KnowUs',
    voll: 'KnowUs: Who Knows Who',
    was: `KnowUs is a party game about how well a group knows each other, with an optional
        online mode for playing together in a room.`,
    kaeufe: `
        <p>A small preview of questions is free. Further content is unlocked with optional
        <strong>one-time purchases</strong>: either <em>All-Access</em>, which unlocks everything,
        or an individual pack for one area (Couples, Friends, Family or Party). Online play is
        available for the areas you have unlocked.</p>
        <ul>
          <li><strong>No subscriptions:</strong> Every purchase is a one-time payment. Nothing
          renews automatically.</li>
          <li><strong>Billing:</strong> Purchases are processed by Apple (App Store) or Google
          (Google Play), not by us.</li>
          <li><strong>Restoring:</strong> You can restore your purchases on the same store account
          from within the app, for example after a reinstall or on a new device.</li>
          <li><strong>Refunds:</strong> Handled by Apple or Google under their policies. See our
          <a href="/knowus-support#purchases">support page</a>.</li>
        </ul>`,
    ki: null,
    hinweis: `In online rooms other players can see the names you enter. Choose a name you are
        comfortable sharing and be respectful: do not use names or answers that are abusive,
        hateful or unlawful.`,
    inhalt: `Player names, answers and scores exist only while a session runs and are deleted
        automatically when it ends.`
  },
  {
    datei: 'bmxsesh-terms.html',
    name: 'BMX Sesh',
    voll: 'BMX Sesh: Bike Freestyle',
    was: `BMX Sesh is a freestyle BMX game: ride parks, link tricks, grinds and manuals into
        lines, and hit dirt jumps. Some modes can be played online with friends in a private room,
        joined with a room code.`,
    kaeufe: `
        <p>West Park is free. One optional one-time purchase (<em>Unlock all parks</em>) unlocks
        all other parks, including parks added in future updates. It is not a subscription and
        never renews.</p>
        <ul>
          <li><strong>Billing:</strong> Purchases are processed by Apple or Google, not by us.</li>
          <li><strong>Restoring:</strong> You can restore the purchase on the same store account
          from the game's menu.</li>
          <li><strong>Refunds:</strong> Handled by Apple or Google under their policies. See our
          <a href="/bmxsesh-support#purchases">support page</a>.</li>
        </ul>`,
    ki: null,
    hinweis: `BMX Sesh is a game. Riding a real BMX bike is dangerous. Nothing in the game is
        instruction or a safe way to learn tricks; always wear protective gear and ride within
        your ability.
        In online rooms other players see your rider and a player label (such as P1 or P2). Be
        respectful: do not harass other players or try to disrupt a session.`,
    inhalt: `Scores, records, stickers, garage choices and settings are stored on your device.
        For online rooms the game connects through an anonymous session of a third-party
        multiplayer service (Unity Gaming Services); no account or name is required, and the
        room and connection data exist only while the room is open.`
  },
  {
    datei: 'seventytwo-terms.html',
    name: 'Seventy-Two',
    voll: 'Seventy-Two – Life Simulator',
    was: `Seventy-Two is a life-simulation story game: you make choices across a whole life, and
        they come back later. It includes short mini games.`,
    kaeufe: `
        <p>The first life is free. One optional one-time purchase (<em>Full Game</em>) unlocks
        unlimited lives and all mini games. It is not a subscription and never renews.</p>
        <ul>
          <li><strong>Billing:</strong> Purchases are processed by Apple or Google, not by us.</li>
          <li><strong>Restoring:</strong> Use <em>Restore purchase</em> in the app with the same
          store account you bought with.</li>
          <li><strong>Refunds:</strong> Handled by Apple or Google under their policies.</li>
        </ul>`,
    ki: null,
    hinweis: `Seventy-Two is a work of fiction and entertainment. It is not financial, legal,
        medical or life advice, and the outcomes in the game are simplified and invented.`,
    inhalt: `Your progress and settings are stored on your device. If you allow statistics, we
        receive anonymous usage and purchase information as described in the
        <a href="/privacy">Privacy Policy</a>.`
  }
];

const termsAbschnitte = (t) => `
        <p class="info-box" style="padding:1.2rem 1.5rem;">These terms apply to
        <strong>${t.voll}</strong>, published by ZenStone LLC. By downloading or using the app
        you agree to them. If you do not agree, please do not use the app.</p>

        <h2 id="who">1. Who we are</h2>
        <p>The app is provided by <strong>ZenStone LLC</strong>, 30 N Gould St, Ste R, Sheridan,
        WY 82801, USA ("we", "us"). Contact: <a href="mailto:${MAIL_SUPPORT}">${MAIL_SUPPORT}</a>.</p>

        <h2 id="app">2. The app</h2>
        <p>${t.was}</p>
        <p>${t.hinweis}</p>

        <h2 id="licence">3. Licence and acceptable use</h2>
        <p>We grant you a personal, non-exclusive, non-transferable, revocable licence to use
        the app on your own devices for personal, non-commercial purposes, subject to these
        terms and the terms of the store you downloaded it from.</p>
        <p>You agree not to: copy, modify, reverse-engineer or resell the app or its content;
        circumvent purchase or access controls; interfere with our servers or other users; or use
        the app for anything unlawful.</p>

        <h2 id="purchases">4. Purchases</h2>
${t.kaeufe}
        <p><strong>Right of withdrawal (EU / UK).</strong> If you are a consumer in the European
        Economic Area or the United Kingdom, you may have a statutory right to withdraw from a
        distance purchase within 14 days. For digital content and services, this right generally
        ends once performance has begun with your consent. Purchases are made through Apple or
        Google, whose refund and withdrawal procedures apply.</p>
${t.ki ? `
        <h2 id="ai">5. AI features</h2>
        <p>${t.ki}</p>` : ''}

        <h2 id="data">${t.ki ? '6' : '5'}. Your data</h2>
        <p>${t.inhalt}</p>
        <p>How we handle personal data is described in our <a href="/privacy">Privacy
        Policy</a>.</p>

        <h2 id="changes">${t.ki ? '7' : '6'}. Availability and changes to the app</h2>
        <p>We may update, change or discontinue features, or the app itself, at any time, for
        example for technical, legal or business reasons. Where you have paid for something that
        we then withdraw, we will refund you or offer a fair alternative as required by law.</p>

        <h2 id="liability">${t.ki ? '8' : '7'}. Disclaimers and liability</h2>
        <p>The app is provided "as is" and "as available". To the extent permitted by law, we
        do not guarantee that it will be uninterrupted or error-free, and we are not liable for
        indirect or consequential losses. Our total liability for any claim relating to the app
        is limited to the amount you paid for it in the twelve months before the claim.</p>
        <p><strong>Nothing in these terms limits liability that cannot be limited by law</strong>
        (for example for intent, gross negligence, injury to life, body or health, or mandatory
        consumer-protection rights where you live).</p>

        <h2 id="termination">${t.ki ? '9' : '8'}. Termination</h2>
        <p>You can stop using the app at any time by deleting it. We may suspend or end your
        access if you seriously or repeatedly breach these terms. Deleting the app does not cancel
        a subscription; cancel it in your store account.</p>

        <h2 id="law">${t.ki ? '10' : '9'}. Governing law</h2>
        <p>These terms are governed by the laws of the State of Wyoming, USA, without regard to
        its conflict-of-law rules. If you are a consumer, this does not take away the protection
        of mandatory consumer laws of the country where you live, and you may bring claims in the
        courts of your country of residence where the law gives you that right.</p>

        <h2 id="terms-changes">${t.ki ? '11' : '10'}. Changes to these terms</h2>
        <p>We may update these terms, for example when the app changes. The date at the top shows
        the latest version. Continued use after a change means you accept the updated terms; if
        you do not, stop using the app.</p>

        <h2 id="contact">${t.ki ? '12' : '11'}. Contact</h2>
        <div class="info-box">
          <p><strong>ZenStone LLC</strong><br>
          30 N Gould St, Ste R, Sheridan, WY 82801, USA<br>
          Support: <a href="mailto:${MAIL_SUPPORT}">${MAIL_SUPPORT}</a><br>
          Privacy: <a href="mailto:${MAIL_PRIVACY}">${MAIL_PRIVACY}</a></p>
        </div>`;

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
    app.kaeufe || kaeufeAbschnitt(app.kurzName),
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

for (const t of TERMS) {
  fs.writeFileSync(path.join(ziel, t.datei), seite({
    titel: `${t.name} Terms of Use – ZenStone LLC`,
    ueberschrift: `${t.voll} — Terms of Use`,
    unterzeile: `Last updated: ${STAND_TERMS}`,
    beschreibung: `Terms of Use for ${t.voll}, published by ZenStone LLC.`,
    inhalt: termsAbschnitte(t)
  }));
  gebaut.push(t.datei);
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
