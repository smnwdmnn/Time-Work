# Time@Work – Version 1.0.0

Eine iPhone-optimierte, offlinefähige Progressive Web App für Arbeitszeiten, Arbeitsorte, Überstunden, Urlaub und Abwesenheiten. Keine Anmeldung, keine Serverdatenbank.

## Veröffentlichung mit GitHub Pages

1. ZIP-Datei entpacken.
2. **Den Inhalt** des Ordners `timeatwork_v1` (insbesondere `index.html`, `app.js`, `model.js`, `style.css`, `sw.js`, `manifest.webmanifest`, beide PNG-Icons) in das Stammverzeichnis eines GitHub-Repositories hochladen. Nicht die ZIP-Datei selbst hochladen.
3. In GitHub unter **Settings → Pages** die Quelle **Deploy from a branch**, Branch `main`, Ordner `/ (root)` wählen.
4. Die veröffentlichte HTTPS-Adresse auf dem iPhone in Safari öffnen und über **Teilen → Zum Home-Bildschirm** hinzufügen.
5. Die App mindestens einmal mit Internet öffnen. Danach sind die Programmdateien über den Service Worker auch offline verfügbar.

## Erste Einrichtung

- **Einstellungen:** Erfassungsbeginn, Wochenstunden, Standardpause, Anfangssaldo, Standard-Arbeitsorte und vertraglichen Jahresurlaub (Standard 30 Tage) einstellen.
- **Urlaubskonto:** Tatsächlich verfügbaren Anspruch separat setzen (z. B. 8 Tage bei Beginn im Oktober). Bei negativem Konto wird eine Warnung gezeigt, Buchungen bleiben möglich.
- **Kalender:** Tag antippen für Bearbeitung; über „Mehrere Tage auswählen“ beliebige Abwesenheitstage gemeinsam buchen.
- **Daten:** In Einstellungen regelmäßig **Backup (JSON)** exportieren und die Datei manuell in iCloud Drive ablegen. Wiederherstellung führt Einträge zusammen, bei Überschneidungen gewinnt das Backup.

## Berechnungsregeln

- Nettoarbeitszeit = Ende − Beginn − gesamte Pause, minutengenau. Bei Arbeit über Mitternacht wird alles dem Startdatum zugeordnet.
- Standard-Soll Mo–Fr: Wochenstunden / 5. Wochenende: kein Soll, tatsächlich geleistete Arbeit zählt 150 % für den Zeitsaldo.
- NRW-Feiertage: Tagessoll erfüllt, tatsächlich geleistete Arbeit zusätzlich mit 150 % angerechnet; keine Multiplikation der Zuschläge.
- Urlaub, Sonderurlaub und unbezahlter Urlaub reduzieren dasselbe Urlaubskonto (nur Werktage Mo–Fr, Feiertage ausgenommen). Regulärer Urlaub und Sonderurlaub erfüllen das Tagessoll. Unbezahlter Urlaub setzt das Tagessoll auf 0.
- Elternzeit setzt das Tagessoll auf 0. Je vollem Kalendermonat mit als Elternzeit erfassten Tagen wird eine **rechnerische** Urlaubskürzung von 1/12 des vertraglichen Jahresanspruchs berücksichtigt. **Rechtlicher Hinweis:** Die tatsächliche Kürzung nach § 17 BEEG setzt eine Erklärung des Arbeitgebers voraus. Der automatisch angezeigte Betrag ist eine Planungsgröße; im Urlaubskonto kann der verfügbare Anspruch korrigiert werden.
- Krankheit erfüllt das Tagessoll ohne Urlaubstage zu verbrauchen.
- Für vergangene normale Arbeitstage ohne Eintrag wird die Sollzeit automatisch ergänzt; bei vergessenem Ausstempeln wird ebenfalls die Sollzeit angesetzt. Diese Tage werden im Kalender markiert. Der Hinweis beim nächsten Öffnen ist einmalig.
- Zukünftige Urlaubsbuchungen reduzieren das Urlaubskonto sofort, erzeugen aber erst am jeweiligen Tag eine Zeitgutschrift.

## Hinweise und Grenzen

- Daten liegen im **localStorage** der konkreten Browser-Installation. Safari und die zum Home-Bildschirm hinzugefügte App können getrennte Datenspeicher haben. Die App synchronisiert Daten nicht automatisch zwischen Geräten oder Installationen.
- Bei Löschung von Website-Daten, Browserwechsel oder Geräteverlust können Daten ohne JSON-Backup verloren gehen.
- Die App bietet keine rechtsverbindliche Arbeitszeitprüfung; sie zeigt lediglich Hinweise zu Pausenregeln. Abweichende Betriebsvereinbarungen sind nicht automatisch berücksichtigt.
- Änderungen an Programmdateien benötigen für ein Update eine neue Service-Worker-Cache-Version in `sw.js`.
- Für Elternzeit ist die automatische Urlaubskürzung eine vereinfachte Berechnung für **vollständig erfasste Kalendermonate**; Teilzeit während Elternzeit und arbeitsrechtliche Sonderfälle werden nicht automatisch berücksichtigt.

## Tests

Mit Node.js im Projektordner: `node test.js`. 15 automatisierte Modelltests decken Feiertage, Zeitkonten, 150%-Regeln, Abwesenheiten, Elternzeit, Urlaubsansprüche, Datumsregeln und Backup-Merge ab.
