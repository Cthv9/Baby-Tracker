# Baby Tracker 👶

**[Apri l'app → https://cthv9.github.io/Baby-Tracker/](https://cthv9.github.io/Baby-Tracker/)**

App PWA per tracciare le attività del neonato: poppate, nanna, pannolini, visite mediche e molto altro — tutto salvato localmente sul dispositivo.

## Funzionalità

| Schermata | Descrizione |
|---|---|
| 🏠 **Dashboard** | Panoramica del giorno: ultima poppata/ninna/pannolino con tempo trascorso, contatori e accesso rapido |
| 🤱 **Poppata** | Timer con toggle lato sinistra/destra per allattamento, oppure input ml con preset per biberon |
| 😴 **Ninna** | Timer start/stop con durata della sessione di sonno |
| 💧 **Pannolino** | Registrazione rapida: Bagnato / Sporco / Misto |
| 🏥 **Archivio Medico** | Storico visite pediatra con checklist azioni post-visita, misurazioni (peso, altezza, cc), prossimo appuntamento e registro vaccini |
| 📊 **Statistiche** | Grafici degli ultimi 7 giorni: frequenza poppate, ore di sonno, pannolini al giorno |
| ⚙️ **Impostazioni** | Toggle italiano/inglese, esporta/importa backup JSON, storico completo |

**I dati sono salvati solo sul dispositivo** — nessun cloud, nessun account. Si consiglia il backup periodico tramite la funzione Esporta.

## Stack

- [Vite 5](https://vitejs.dev/) — bundler e dev server
- [Tailwind CSS 3](https://tailwindcss.com/) — stili utility-first
- [Dexie.js 4](https://dexie.org/) — wrapper IndexedDB
- [Chart.js 4](https://www.chartjs.org/) — grafici statistiche
- i18n custom (IT/EN) — senza librerie esterne
- PWA con Workbox service worker (via `vite-plugin-pwa`)

## Sviluppo

```bash
cd vite-project
npm install
npm run dev      # dev server → http://localhost:5173
npm run build    # build produzione → dist/
npm run preview  # anteprima del build
```

## Deploy

L'app è pubblicata su **GitHub Pages**: [https://cthv9.github.io/Baby-Tracker/](https://cthv9.github.io/Baby-Tracker/)

Il build di produzione viene generato direttamente nella **root del repo** (configurato in `vite.config.js`). La `base` è impostata su `/Baby-Tracker/` per compatibilità con GitHub Pages.

**Configurazione GitHub Pages:** nel repo seleziona **Settings → Pages → Branch → `main`** e cartella **`/ (root)`**.

Per rigenerare il build dopo modifiche:

```bash
cd vite-project
npm run build   # sovrascrive index.html e assets/ nella root
```

Poi commit e push.

## Migrazione

Al primo avvio la app migra automaticamente i dati del vecchio formato (`localStorage → eventiBimbo`) nel nuovo database IndexedDB.

---

Made with ❤️ by DF
