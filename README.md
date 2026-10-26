# Time@Work – Version 1.1.0

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
- **Kalender:** Tag antippen und Arbeitsort mit einem Tippen ändern, ohne Sollzeit oder Zeitsaldo zu verändern. Für mehrere Tage „Von“/„Bis“ auswählen, „Zeitraum auswählen“ drücken und „Arbeitsort ändern“ wählen. Abwesenheiten können weiterhin gesammelt gebucht werden.
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

## Neu in 1.1.0

- Mobile Layout-Breite korrigiert, iPhone-Zeitfelder innerhalb des Containers.
- Tages-Schnelländerung des Arbeitsorts; automatisch ergänzte Sollzeiten bleiben erhalten.
- Zeitraum-Auswahl für Massenänderung des Arbeitsorts (Wochenenden, Feiertage und Abwesenheiten werden übersprungen).
- Zeitvorschlag aus Tages-Soll + Pause statt fest 09:00–17:00.
- Pausenkurzwahl 60 / 30 / frei bei Tageskorrektur und Ausstempeln.
- Bestehende Daten bleiben beim Update erhalten; localStorage-Schlüssel unverändert.

## Hinweise und Grenzen

- Daten liegen im **localStorage** der konkreten Browser-Installation. Safari und die zum Home-Bildschirm hinzugefügte App können getrennte Datenspeicher haben. Die App synchronisiert Daten nicht automatisch zwischen Geräten oder Installationen.
- Bei Löschung von Website-Daten, Browserwechsel oder Geräteverlust können Daten ohne JSON-Backup verloren gehen.
- Die App bietet keine rechtsverbindliche Arbeitszeitprüfung; sie zeigt lediglich Hinweise zu Pausenregeln. Abweichende Betriebsvereinbarungen sind nicht automatisch berücksichtigt.
- Änderungen an Programmdateien benötigen für ein Update eine neue Service-Worker-Cache-Version in `sw.js`.
- Für Elternzeit ist die automatische Urlaubskürzung eine vereinfachte Berechnung für **vollständig erfasste Kalendermonate**; Teilzeit während Elternzeit und arbeitsrechtliche Sonderfälle werden nicht automatisch berücksichtigt.

## Tests

Mit Node.js im Projektordner: `node test.js`. 15 automatisierte Modelltests decken Feiertage, Zeitkonten, 150%-Regeln, Abwesenheiten, Elternzeit, Urlaubsansprüche, Datumsregeln und Backup-Merge ab.

## Version 1.2
- Die Einstempelzeit lässt sich während eines laufenden Arbeitstags unmittelbar auf der Startseite korrigieren.
- Einträge werden bei jedem Speichern in localStorage zurückgelesen; Fehler werden sichtbar angezeigt.
- Beim Zurückkehren in die App wird die Zeitanzeige aktualisiert.
- Der Timer muss nicht im Hintergrund laufen: Die Anzeige berechnet sich aus der gespeicherten Startzeit.
- Achtung: iOS kann Daten einer installierten Web-App löschen, insbesondere bei Website-Datenlöschung, Privatmodus, Speicherproblemen oder Änderungen der App-URL. Ein JSON-Backup bleibt wichtig.

## Version 1.3
Kalendertage farblich hervorgehoben: Arbeitszeit (gedecktes Grün), Krankheit (Rot), Urlaubsarten und Elternzeit (Blau). Automatische Tage behalten ihre Punktmarkierung.

## Version 1.4.0 (24.10.2026)
- Monatskalender zeigt Arbeitsort statt „Auto“; goldener Punkt bleibt erhalten.
- Wochenansicht entfernt.
- Wochenend-/Feiertagsarbeit wird standardmäßig zu 100 % angerechnet; 150 %, 200 % oder freie Eingabe beim Einstempeln und in der Tageskorrektur.
- Ausstempeln, Massenbuchungen und Tageskorrektur als Dialoge; Kalenderaktionen und Einstellungen einklappbar.
- Backup vor dem Update empfohlen. Speicherschlüssel bleibt unverändert.


### Version 1.4.1
- Pausenänderungen in der Tageskorrektur verändern nicht mehr das Arbeitsende. Die Nettoarbeitszeit wird aus festen Beginn-/Endzeiten abzüglich Pause berechnet.


## Version 1.4.3
Statistikdiagramm zeigt nun Tagessalden statt kumulierter Salden: grün positiv, rot negativ, gelb exakt 0. Jeder Kalendertag hat einen eigenen Balken; lange Zeiträume sind horizontal scrollbar. Die Gesamtsaldo-Kennzahl bleibt erhalten.


## Version 1.4.4 – Überstundenabbau
Im Kalender als Abwesenheit auswählbar, in Blau wie Urlaub dargestellt. Reguläres Tagessoll wird als negativer Tagessaldo vom Überstundenkonto abgezogen, ohne das Urlaubskonto zu belasten. Für Wochenenden mit Tagessoll 0 erfolgt kein Abzug.

## Version 1.5.0 – Kalender-Redesign
- Monatskalender mit Piktogrammen statt abgeschnittener Arbeitsort- und Abwesenheitsbezeichnungen.
- Büro = Gebäude, Home Office = Haus, Dienstreise = Auto, Krankheit = Krankenhaus, alle Urlaubsarten inklusive Elternzeit und Überstundenabbau = Palme.
- Einzelauswahl durch Antippen; Zeitraum durch Start- und Enddatum im Kalender auswählen; Aktionen in kompakter Leiste.
- Tageskorrektur weiter über direktes Antippen ohne Auswahlmodus.
- Redundante Gesamtsaldo-Kachel auf Startseite entfernt.
- Bestehende Daten und Speicherformat bleiben unverändert.

## Version 1.5.1 – Arbeitsorttage für Steuerübersicht
Die Statistik zählt Büro-, Home-Office- und Dienstreisetage nur an regulären Arbeitstagen (Mo–Fr, kein NRW-Feiertag) sowie bei Wochenend- oder Feiertagsarbeit mit genau 150 % Anrechnungsfaktor. Freiwillige Wochenend-/Feiertagsarbeit mit 100 % bleibt in den tatsächlich geleisteten Stunden und im Zeitkonto enthalten, zählt aber nicht als Arbeitsorttag. Andere frei gewählte Faktoren gelten nicht automatisch als genehmigte Mehrarbeit. Diese Zählung ist eine Übersicht, keine automatische Prüfung steuerrechtlicher Anspruchsvoraussetzungen.

## Version 1.5.2
- Beim Einstempeln geplante Pause (60/30/individuell, auch 0) auswählen.
- Während der laufenden Erfassung geplante Pause ändern und Endzeit neu berechnen.
- Tatsächliche Pause erst beim Ausstempeln erfassen.

## Version 1.5.3 – Update-Verhalten
- Beinhaltet die Pausenplanung von 1.5.2 (vorausgefüllte geplante Pause beim Ausstempeln).
- Service Worker: Network-first für HTML, CSS und JavaScript, Cache als Offline-Fallback.
- Service-Worker-Update bei App-Start, Rückkehr in den Vordergrund und manuell unter Einstellungen.
- Hinweis bei neuer Version mit „Jetzt aktualisieren“ und „Später“. Keine automatische Neuladung während der Eingabe.
- Lokaler Datenspeicher und Backup-Format unverändert.
- Bei Migration von 1.5.2 oder älter kann ein vollständiges Schließen und erneutes Öffnen nötig sein, bis die neue Version sichtbar wird.

## Version 1.5.4
Monatliche Backup-Erinnerung ab erstem regulären NRW-Arbeitstag (Mo–Fr ohne NRW-Feiertag). Nutzer tippt auf „Teilen öffnen“ (iOS-Sicherheitsanforderung), speichert in Dateien/iCloud Drive und bestätigt anschließend ausdrücklich. Erinnern am Folgetag möglich. Keine automatische Löschung von Daten.
