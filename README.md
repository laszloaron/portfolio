# Laszlo Aron - Fullstack Portfolio

Ez a repó egy modern, fullstack portfólió webalkalmazás forráskódját tartalmazza monorepo struktúrában. A projekt elsődleges célja a fejlesztői tudás, korábbi munkák és referenciák letisztult, profi formában történő bemutatása. A rendszer frontendje React 18 és Vite 5 alapokon működik, míg a robusztus backendért Python 3.12 és FastAPI felel PostgreSQL adatbázissal, mindez teljes mértékben Dockerizált környezetbe csomagolva a könnyű fejleszthetőség és üzemeltetés érdekében.

## Lokális futtatás (Fejlesztői környezet)

A projekt futtatásához telepített [Docker](https://www.docker.com/) és Docker Compose szükséges.

1. **Repó klónozása:**
   ```bash
   git clone https://github.com/laszloaron/portfolio.git
   cd portfolio
   ```

2. **Környezeti változók beállítása:**
   A gyökérkönyvtárban található `.env.example` fájlt másold le `.env` néven:
   ```bash
   cp .env.example .env
   ```

3. **A projekt elindítása:**
   A Docker Compose segítségével egyetlen paranccsal elindítható a frontend, a backend és az adatbázis:
   ```bash
   docker compose up --build
   ```

4. **Elérhetőségek az indulás után:**
   * **Frontend (React):** [http://localhost:80](http://localhost:80) (vagy az alapértelmezett Nginx portodon)
   * **Backend API (Swagger Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)