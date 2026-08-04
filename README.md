# zenstonellc.com

Website, Datenschutzerklärung und Support-Seiten für die Apps von ZenStone LLC
(Calm Stoic Journal, KnowUs: Who Knows Who, Hairfit).

**Live: https://zenstonellc.com** — gehostet über GitHub Pages aus diesem Repo.
Push auf `main` geht nach etwa einer Minute live.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Startseite |
| `privacy.html` | Datenschutzerklärung, erreichbar unter `/privacy` |
| `build-support.js` | **Erzeugt die vier Support-Seiten.** Hier wird bearbeitet, nicht im HTML |
| `hairfit-support.html` | erzeugt → `/hairfit-support` |
| `calmstoic-support.html` | erzeugt → `/calmstoic-support` |
| `knowus-support.html` | erzeugt → `/knowus-support` |
| `support.html` | erzeugt → `/support`, nur eine Übersicht mit Links |
| `CNAME` | Custom Domain. **Nicht löschen** — ohne sie antwortet Pages auf der Domain mit 404 |
| `google…html`, `tiktok…txt` | Domain-Verifizierung für Google und TikTok. **Nicht löschen** |

## Support-Seiten (in den Store-Einträgen hinterlegt)

Diese URLs stehen bei Apple und Google als **Support-URL** der jeweiligen App.
Ändert sich hier ein Dateiname, müssen die Store-Einträge nachgezogen werden:

| App | Support-URL |
|---|---|
| Hairfit | `https://zenstonellc.com/hairfit-support` |
| Calm Stoic Journal | `https://zenstonellc.com/calmstoic-support` |
| KnowUs: Who Knows Who | `https://zenstonellc.com/knowus-support` |

**Jede App hat bewusst eine eigene Seite.** Die erste Fassung war eine Sammelseite mit
Sprungmarken (`/support#hairfit`) — dort sah ein Store-Prüfer für Hairfit auch CalmStoic
und KnowUs. Diese Anker gibt es nicht mehr.

### Ändern — nur über den Generator

Die vier HTML-Dateien sind **erzeugt**. Wer sie direkt bearbeitet, verliert die Änderung
beim nächsten Lauf:

```
node build-support.js
```

Grund für den Generator: Die Hälfte jeder Seite ist identisch (Käufe, Kündigen,
Planwechsel, Erstattung, Daten, Kontakt), und genau diese Abschnitte ändern sich am
häufigsten. Drei handgepflegte Kopien liefen binnen Monaten auseinander — und eine
veraltete Kündigungsanleitung fällt erst auf, wenn sich jemand beschwert.

Die erzeugten Dateien werden trotzdem **mit eingecheckt**: GitHub Pages liefert sie direkt
aus, es gibt keinen Build-Schritt beim Ausrollen. Also nach jeder Änderung erst
`node build-support.js`, dann committen.

## Ändern

Datei bearbeiten, committen, pushen. Fertig. Die Links nutzen saubere URLs
(`/`, `/privacy`, `/hairfit-support`), das löst GitHub Pages automatisch auf.

Die Datenschutzerklärung ist die Quelle für **alle** Apps — sie ist in den
Store-Einträgen hinterlegt. Kommt eine App dazu, gehört sie in Abschnitt 2
(welche Daten), Abschnitt 3 (SDKs), Abschnitt 4 (was wir nicht sammeln) und
Abschnitt 5 (Drittanbieter).

## Hosting-Historie

Vorher lief die Seite auf **Netlify**. Am 30.07.2026 sperrte Netlify alle Deploys
des Kontos (`403 — Account credit usage exceeded`), dadurch liess sich die
Datenschutzerklärung nicht mehr aktualisieren. Deshalb der Umzug hierher.

## ⚠️ Netlify noch nicht kündigen

Die Domain ist bei **Porkbun** registriert, aber die **DNS-Zone liegt weiterhin bei
Netlify** (Nameserver `*.nsone.net`). Nur die Einträge zeigen inzwischen auf GitHub:

```
zenstonellc.com      A      185.199.108.153
zenstonellc.com      A      185.199.109.153
zenstonellc.com      A      185.199.110.153
zenstonellc.com      A      185.199.111.153
www.zenstonellc.com  CNAME  zenstone-apps.github.io
```

In derselben Zone hängen die **MX-Records und der SPF-Eintrag für ImprovMX** —
darüber läuft `privacy@zenstonellc.com`, die Kontaktadresse aus der
Datenschutzerklärung.

**Die Netlify-Site `lighthearted-gecko-5a4334` darf nicht gelöscht werden**: die
DNS-Zone ist mit ihr verknüpft. Wird sie gelöscht, sind Domain **und** E-Mail weg.

Wer Netlify vollständig loswerden will, muss vorher bei Porkbun auf deren
Nameserver wechseln und dort alle sechs Einträge oben plus MX und SPF neu anlegen.
