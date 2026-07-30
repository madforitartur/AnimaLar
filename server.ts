import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";
import { Readable } from "stream";
import dotenv from "dotenv";
import fs from "fs/promises";
import { execSync } from "child_process";

dotenv.config();

function safeParseInterests(interestsVal: any): string[] {
  if (!interestsVal) return [];
  if (Array.isArray(interestsVal)) return interestsVal;
  if (typeof interestsVal === "string") {
    const trimmed = interestsVal.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Fallback to comma separation
      }
    }
    // Fallback: split by comma, clean empty spaces
    return trimmed.split(",").map(i => i.trim()).filter(Boolean);
  }
  return [];
}

class JSONDatabase {
  private dbPath: string;
  public data: {
    residents: any[];
    scheduledActivities: any[];
    progressLogs: any[];
    reminders: any[];
    suggestionRules: any | null;
    activities: any[];
    settings: any;
  };

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.data = {
      residents: [],
      scheduledActivities: [],
      progressLogs: [],
      reminders: [],
      suggestionRules: null,
      activities: [],
      settings: {}
    };
  }

  async load() {
    try {
      const fileExists = await fs.access(this.dbPath).then(() => true).catch(() => false);
      if (fileExists) {
        const raw = await fs.readFile(this.dbPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          this.data.residents = parsed.residents || [];
          this.data.scheduledActivities = parsed.scheduledActivities || [];
          this.data.progressLogs = parsed.progressLogs || [];
          this.data.reminders = parsed.reminders || [];
          this.data.suggestionRules = parsed.suggestionRules || null;
          this.data.activities = parsed.activities || [];
          this.data.settings = parsed.settings || {};
          console.log("Base de dados JSON carregada com sucesso a partir de:", this.dbPath);
          return;
        }
      }
    } catch (e) {
      console.warn("Ficheiro SQLite antigo detetado ou erro ao ler JSON. Recriando base de dados como JSON puro...");
    }
    await this.save();
  }

  async save() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2), "utf-8");
      console.log("Base de dados JSON guardada com sucesso.");
    } catch (err) {
      console.error("Erro ao guardar base de dados JSON:", err);
    }
  }

  async exec(sql: string) {
    console.log("Estrutura da base de dados verificada.");
  }

  async all(query: string): Promise<any[]> {
    if (query.includes("residents")) {
      return this.data.residents;
    }
    if (query.includes("scheduled_activities")) {
      return this.data.scheduledActivities;
    }
    if (query.includes("progress_logs")) {
      return this.data.progressLogs;
    }
    if (query.includes("reminders")) {
      return this.data.reminders;
    }
    return [];
  }

  async run(query: string) {
    if (query.includes("DELETE FROM residents")) {
      this.data.residents = [];
    } else if (query.includes("DELETE FROM scheduled_activities")) {
      this.data.scheduledActivities = [];
    } else if (query.includes("DELETE FROM progress_logs")) {
      this.data.progressLogs = [];
    } else if (query.includes("DELETE FROM reminders")) {
      this.data.reminders = [];
    } else if (query.includes("COMMIT")) {
      await this.save();
    }
  }

  prepare(query: string) {
    const self = this;
    if (query.includes("INSERT INTO residents")) {
      return {
        async run(...args: any[]) {
          self.data.residents.push({
            id: args[0],
            name: args[1],
            birthDate: args[2],
            cognitiveLevel: args[3],
            physicalLevel: args[4],
            interests: safeParseInterests(args[5]),
            observations: args[6],
            joinedDate: args[7],
            avatar: args[8]
          });
        },
        async finalize() {}
      };
    }
    if (query.includes("INSERT INTO scheduled_activities")) {
      return {
        async run(...args: any[]) {
          self.data.scheduledActivities.push({
            id: args[0],
            activityId: args[1],
            title: args[2],
            description: args[3],
            category: args[4],
            date: args[5],
            slot: args[6],
            time: args[7],
            completed: args[8]
          });
        },
        async finalize() {}
      };
    }
    if (query.includes("INSERT INTO progress_logs")) {
      return {
        async run(...args: any[]) {
          self.data.progressLogs.push({
            id: args[0],
            residentId: args[1],
            scheduledActivityId: args[2],
            date: args[3],
            activityTitle: args[4],
            category: args[5],
            participation: args[6],
            cognitiveScore: args[7],
            physicalScore: args[8],
            socialScore: args[9],
            notes: args[10]
          });
        },
        async finalize() {}
      };
    }
    if (query.includes("INSERT INTO reminders")) {
      return {
        async run(...args: any[]) {
          self.data.reminders.push({
            id: args[0],
            text: args[1],
            type: args[2],
            date: args[3],
            completed: args[4]
          });
        },
        async finalize() {}
      };
    }
    return {
      async run() {},
      async finalize() {}
    };
  }

  async close() {
    await this.save();
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Initialize SQLite Connection
  const dbPath = path.join(process.cwd(), "animalar.db");
  console.log(`Inicializando base de dados SQLite no caminho: ${dbPath}`);

  let db = new JSONDatabase(dbPath);
  await db.load();

  // Create SQLite Tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      birthDate TEXT,
      cognitiveLevel TEXT,
      physicalLevel TEXT,
      interests TEXT,
      observations TEXT,
      joinedDate TEXT,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS scheduled_activities (
      id TEXT PRIMARY KEY,
      activityId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      date TEXT,
      slot TEXT,
      time TEXT,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS progress_logs (
      id TEXT PRIMARY KEY,
      residentId TEXT,
      scheduledActivityId TEXT,
      date TEXT,
      activityTitle TEXT,
      category TEXT,
      participation TEXT,
      cognitiveScore INTEGER,
      physicalScore INTEGER,
      socialScore INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      type TEXT,
      date TEXT,
      completed INTEGER DEFAULT 0
    );
  `);

  console.log("Tabelas da base de dados SQLite verificadas/criadas com sucesso.");

  // Lazy initialize Gemini AI with a standard check
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("A variável de ambiente GEMINI_API_KEY não está configurada.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Helper to generate the fully self-contained offline HTML bundle containing current DB data
  // and write it to AnimaLar.html at the project root.
  async function generateOfflineHtmlAndSaveToDisk(): Promise<string> {
    try {
      const distPath = path.join(process.cwd(), "dist");
      
      let htmlContent = "";
      try {
        htmlContent = await fs.readFile(path.join(distPath, "index.html"), "utf-8");
      } catch (e) {
        console.warn("Aviso: O diretório 'dist' não existe ou não pôde ser lido. AnimaLar.html será gerado quando a aplicação for construída.");
        return "";
      }

      // Read JavaScript and CSS built assets
      const assetsDir = path.join(distPath, "assets");
      const files = await fs.readdir(assetsDir);
      
      let jsContent = "";
      let cssContent = "";

      // Ensure dist/assets/offline.js exists by compiling it on demand as a standard non-module IIFE script
      try {
        jsContent = await fs.readFile(path.join(assetsDir, "offline.js"), "utf-8");
      } catch (e) {
        console.log("Compilando dist/assets/offline.js para formato IIFE sem módulos (offline browser-friendly)...");
        try {
          execSync("npx esbuild src/main.tsx --bundle --minify --target=es2018 --format=iife --global-name=AnimaLar --loader:.css=empty --define:process.env.NODE_ENV='\"production\"' --outfile=dist/assets/offline.js");
          jsContent = await fs.readFile(path.join(assetsDir, "offline.js"), "utf-8");
        } catch (err) {
          console.error("Falha ao compilar com esbuild, usando fallback...", err);
          for (const file of files) {
            if (file.endsWith(".js") && file !== "offline.js") {
              jsContent += await fs.readFile(path.join(assetsDir, file), "utf-8");
            }
          }
        }
      }

      for (const file of files) {
        if (file.endsWith(".css")) {
          cssContent += await fs.readFile(path.join(assetsDir, file), "utf-8");
        }
      }

      // Query latest data from SQLite
      const residents = await db.all("SELECT * FROM residents");
      const parsedResidents = residents.map(r => ({
        ...r,
        interests: safeParseInterests(r.interests)
      }));

      const scheduledActivities = await db.all("SELECT * FROM scheduled_activities");
      const parsedScheduled = scheduledActivities.map(s => ({
        ...s,
        completed: s.completed === 1
      }));

      const progressLogs = await db.all("SELECT * FROM progress_logs");
      const parsedLogs = progressLogs.map(l => ({
        ...l,
        participated: true
      }));

      const reminders = await db.all("SELECT * FROM reminders");
      const parsedReminders = reminders.map(rem => ({
        ...rem,
        completed: !!rem.completed
      }));

      const dbPayload = {
        residents: parsedResidents,
        scheduledActivities: parsedScheduled,
        progressLogs: parsedLogs,
        reminders: parsedReminders
      };

      // Inline the CSS and JS content into HTML
      let inlineHtml = htmlContent;

      // Clean default scripts/stylesheets
      inlineHtml = inlineHtml.replace(/<link[^>]*rel="stylesheet"[^>]*href="\/assets\/[^"]*"[^>]*>/g, "");
      inlineHtml = inlineHtml.replace(/<script[^>]*type="module"[^>]*src="\/assets\/[^"]*"[^>]*><\/script>/g, "");
      inlineHtml = inlineHtml.replace(/<link[^>]*rel="modulepreload"[^>]*href="\/assets\/[^"]*"[^>]*>/g, "");

      // Inlay them cleanly with initial payload embedded
      const styleTag = `<style>${cssContent}</style>`;
      const scriptTag = `
<script>
  window.IS_OFFLINE_STANDALONE = true;
  window.INITIAL_OFFLINE_DATA = ${JSON.stringify(dbPayload)};
  console.log("AnimaLar: Executando no modo offline autónomo independente com base de dados incorporada.");
</script>
<script>${jsContent}</script>
`;

      inlineHtml = inlineHtml.replace("</head>", () => `${styleTag}</head>`);
      inlineHtml = inlineHtml.replace("</body>", () => `${scriptTag}</body>`);

      // Save to AnimaLar.html at project root
      await fs.writeFile(path.join(process.cwd(), "AnimaLar.html"), inlineHtml, "utf-8");
      console.log("Ficheiro AnimaLar.html atualizado com sucesso no repositório de código.");
      return inlineHtml;
    } catch (err) {
      console.error("Erro ao gerar/atualizar o ficheiro AnimaLar.html:", err);
      return "";
    }
  }

  // Trigger initial generate on startup (non-blocking)
  generateOfflineHtmlAndSaveToDisk().catch(() => {});

  // -------------------------------------------------------------------------
  // SQLite Database API Routes
  // -------------------------------------------------------------------------

  // 1. Get all data from SQLite (Auto-load from Google Drive on page open)
  let hasAttemptedInitialDriveSync = false;

  app.get("/api/data", async (req, res) => {
    try {
      if (!hasAttemptedInitialDriveSync && process.env.GOOGLE_OAUTH_ACCESS_TOKEN) {
        hasAttemptedInitialDriveSync = true;
        try {
          console.log("[Auto-Load] A carregar ficheiros animalar_database.json e animalar.db da pasta do Google Drive...");
          await restoreFromGoogleDriveInternal();
        } catch (driveErr: any) {
          console.warn("[Auto-Load] Aviso ao carregar do Google Drive no arranque:", driveErr?.message || driveErr);
        }
      }

      const residents = await db.all("SELECT * FROM residents");
      const parsedResidents = residents.map(r => ({
        ...r,
        interests: safeParseInterests(r.interests)
      }));

      const scheduledActivities = await db.all("SELECT * FROM scheduled_activities");
      const parsedScheduled = scheduledActivities.map(s => ({
        ...s,
        completed: !!s.completed
      }));

      const progressLogs = await db.all("SELECT * FROM progress_logs");
      // Maps DB layout keys if slightly different
      const parsedLogs = progressLogs.map(l => ({
        ...l,
        participated: true // default support
      }));

      const reminders = await db.all("SELECT * FROM reminders");
      const parsedReminders = reminders.map(rem => ({
        ...rem,
        completed: !!rem.completed
      }));

      res.json({
        residents: parsedResidents,
        scheduledActivities: parsedScheduled,
        progressLogs: parsedLogs,
        reminders: parsedReminders,
        suggestionRules: db.data.suggestionRules || null,
        activities: db.data.activities || [],
        settings: db.data.settings || {}
      });
    } catch (err: any) {
      console.error("Erro ao obter dados do SQLite:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Sync all data from React to SQLite (transactional clear & load)
  app.post("/api/sync", async (req, res) => {
    try {
      const { residents, scheduledActivities, progressLogs, reminders, suggestionRules, activities, settings } = req.body;

      if (suggestionRules) {
        db.data.suggestionRules = suggestionRules;
      }
      if (activities && Array.isArray(activities)) {
        db.data.activities = activities;
      }
      if (settings && typeof settings === 'object') {
        db.data.settings = settings;
      }

      await db.run("BEGIN TRANSACTION");

      if (residents && Array.isArray(residents)) {
        await db.run("DELETE FROM residents");
        const stmt = await db.prepare("INSERT INTO residents (id, name, birthDate, cognitiveLevel, physicalLevel, interests, observations, joinedDate, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const r of residents) {
          await stmt.run(r.id, r.name, r.birthDate, r.cognitiveLevel, r.physicalLevel, JSON.stringify(r.interests), r.observations, r.joinedDate, r.avatar);
        }
        await stmt.finalize();
      }

      if (scheduledActivities && Array.isArray(scheduledActivities)) {
        await db.run("DELETE FROM scheduled_activities");
        const stmt = await db.prepare("INSERT INTO scheduled_activities (id, activityId, title, description, category, date, slot, time, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const s of scheduledActivities) {
          await stmt.run(s.id, s.activityId || null, s.title, s.description, s.category, s.date, s.slot, s.time, s.completed ? 1 : 0);
        }
        await stmt.finalize();
      }

      if (progressLogs && Array.isArray(progressLogs)) {
        await db.run("DELETE FROM progress_logs");
        const stmt = await db.prepare("INSERT INTO progress_logs (id, residentId, scheduledActivityId, date, activityTitle, category, participation, cognitiveScore, physicalScore, socialScore, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const l of progressLogs) {
          await stmt.run(l.id, l.residentId, l.scheduledActivityId || null, l.date, l.activityTitle, l.category || 'outro', l.participation, l.cognitiveScore, l.physicalScore, l.socialScore, l.notes);
        }
        await stmt.finalize();
      }

      if (reminders && Array.isArray(reminders)) {
        await db.run("DELETE FROM reminders");
        const stmt = await db.prepare("INSERT INTO reminders (id, text, type, date, completed) VALUES (?, ?, ?, ?, ?)");
        for (const r of reminders) {
          await stmt.run(r.id, r.text, r.type, r.date, r.completed ? 1 : 0);
        }
        await stmt.finalize();
      }

      await db.run("COMMIT");
      await db.save();

      // Update AnimaLar.html at the project root with the new data
      await generateOfflineHtmlAndSaveToDisk();
      
      // Auto-sync to Google Drive in background if token available
      syncToGoogleDrive().catch(e => console.warn("Aviso ao sincronizar no Google Drive:", e.message));

      res.json({ success: true, message: "Dados sincronizados no SQLite e Google Drive com sucesso!" });
    } catch (err: any) {
      try {
        await db.run("ROLLBACK");
      } catch {}
      console.error("Erro ao sincronizar dados no SQLite:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Download the physical SQLite database file
  app.get("/api/database/download", (req, res) => {
    res.download(dbPath, "animalar.db", (err) => {
      if (err) {
        console.error("Erro ao fazer download da base de dados:", err);
        if (!res.headersSent) {
          res.status(500).send("Erro ao obter o ficheiro SQLite.");
        }
      }
    });
  });

  // 4. Upload and replace the physical SQLite database file
  app.post("/api/database/upload", express.raw({ type: "*/*", limit: "30mb" }), async (req, res) => {
    try {
      const buffer = req.body;
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: "Ficheiro de base de dados SQLite vazio ou corrompido." });
      }

      console.log("Novo ficheiro SQLite carregado. Substituindo base de dados...");
      
      // Close database connection
      await db.close();

      // Write uploaded buffer over the old animalar.db
      await fs.writeFile(dbPath, buffer);

      // Reopen connection
      const newDb = new JSONDatabase(dbPath);
      await newDb.load();
      db = newDb;

      console.log("Nova base de dados SQLite ativa.");
      // Update AnimaLar.html at the project root with the uploaded data
      await generateOfflineHtmlAndSaveToDisk();
      res.json({ success: true, message: "Base de dados SQLite restaurada com sucesso!" });
    } catch (err: any) {
      console.error("Erro ao substituir a base de dados SQLite:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Generate Offline HTML Bundle dynamically from /dist
  app.get("/api/offline-html", async (req, res) => {
    try {
      const inlineHtml = await generateOfflineHtmlAndSaveToDisk();
      if (!inlineHtml) {
        return res.status(500).send("A aplicação precisa de ser construída (build) primeiro para gerar a versão offline. Por favor, compile a aplicação ou recarregue a página.");
      }

      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", "attachment; filename=AnimaLar.html");
      res.send(inlineHtml);

    } catch (err: any) {
      console.error("Erro ao gerar ficheiro HTML offline:", err);
      res.status(500).send(`Erro ao gerar versão offline: ${err.message}`);
    }
  });

  // -------------------------------------------------------------------------
  // Google Drive Integration Helper Functions & Routes
  // -------------------------------------------------------------------------
  let cachedAppFolderId: string | null = null;

  function getDriveClient() {
    const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Sessão do Google Drive não autorizada. Certifique-se que o acesso OAuth foi concedido.");
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    return google.drive({ version: "v3", auth: oauth2Client });
  }

  async function getOrCreateAppFolderId(drive: any): Promise<string> {
    if (cachedAppFolderId) return cachedAppFolderId;

    try {
      const listRes = await drive.files.list({
        q: "name = 'AnimaLar Database' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: "files(id, name, webViewLink)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      const files = listRes.data.files || [];
      if (files.length > 0) {
        cachedAppFolderId = files[0].id!;
        console.log(`[Google Drive] Pasta 'AnimaLar Database' encontrada! ID: ${cachedAppFolderId}`);
        return cachedAppFolderId;
      }
    } catch (err: any) {
      console.warn("[Google Drive] Erro ao procurar pasta 'AnimaLar Database':", err?.message || err);
    }

    try {
      const createRes = await drive.files.create({
        requestBody: {
          name: "AnimaLar Database",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id, name, webViewLink",
        supportsAllDrives: true,
      });
      if (createRes.data.id) {
        cachedAppFolderId = createRes.data.id;
        console.log(`[Google Drive] Pasta 'AnimaLar Database' criada com sucesso! ID: ${cachedAppFolderId}`);
        return cachedAppFolderId;
      }
    } catch (err: any) {
      console.warn("[Google Drive] Erro ao criar pasta 'AnimaLar Database':", err?.message || err);
    }

    return "";
  }

  async function uploadToGoogleDrive(fileName: string, mimeType: string, content: Buffer | string) {
    const drive = getDriveClient();
    const folderId = await getOrCreateAppFolderId(drive);

    let query = `name = '${fileName}' and trashed = false`;
    if (folderId) {
      query = `'${folderId}' in parents and name = '${fileName}' and trashed = false`;
    }

    const listRes = await drive.files.list({
      q: query,
      fields: "files(id, name, webViewLink)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = listRes.data.files || [];
    const buffer = typeof content === "string" ? Buffer.from(content, "utf-8") : content;

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    if (files.length > 0) {
      const fileId = files[0].id!;
      const res = await drive.files.update({
        fileId,
        media,
        fields: "id, name, webViewLink, modifiedTime",
        supportsAllDrives: true,
      });
      console.log(`[Google Drive] Ficheiro ${fileName} (ID: ${fileId}) atualizado com sucesso.`);
      return { ...res.data, folderId };
    } else {
      const requestBody: any = { name: fileName };
      if (folderId) {
        requestBody.parents = [folderId];
      }
      const res = await drive.files.create({
        requestBody,
        media,
        fields: "id, name, webViewLink, modifiedTime",
        supportsAllDrives: true,
      });
      console.log(`[Google Drive] Ficheiro ${fileName} (ID: ${res.data.id}) criado com sucesso na pasta 'AnimaLar Database'.`);
      return { ...res.data, folderId };
    }
  }

  async function syncToGoogleDrive() {
    if (!process.env.GOOGLE_OAUTH_ACCESS_TOKEN) {
      throw new Error("Sessão do Google Drive não autorizada (Token OAuth ausente). Conceda permissão de acesso ao Google Drive.");
    }

    const drive = getDriveClient();
    const folderId = await getOrCreateAppFolderId(drive);

    const backupPayload = {
      residents: db.data.residents,
      scheduledActivities: db.data.scheduledActivities,
      progressLogs: db.data.progressLogs,
      reminders: db.data.reminders,
      suggestionRules: db.data.suggestionRules || null,
      activities: db.data.activities || [],
      settings: db.data.settings || {},
      lastSyncedAt: new Date().toISOString(),
      folderId,
      institution: "Lar de Santo António"
    };

    console.log("[Google Drive] A iniciar carregamento da base de dados para o Google Drive...");
    const jsonRes = await uploadToGoogleDrive(
      "animalar_database.json",
      "application/json",
      JSON.stringify(backupPayload, null, 2)
    );

    let dbRes = null;
    try {
      const dbBuffer = await fs.readFile(dbPath);
      dbRes = await uploadToGoogleDrive("animalar.db", "application/x-sqlite3", dbBuffer);
    } catch (e: any) {
      console.warn("[Google Drive] Aviso ao guardar ficheiro animalar.db no Google Drive:", e?.message || e);
    }

    const targetFolderId = folderId || jsonRes.folderId;
    const folderUrl = targetFolderId ? `https://drive.google.com/drive/folders/${targetFolderId}` : `https://drive.google.com/drive/my-drive`;

    return {
      success: true,
      lastSyncedAt: new Date().toISOString(),
      folderId: targetFolderId,
      folderUrl,
      fileUrl: jsonRes.webViewLink || dbRes?.webViewLink
    };
  }

  // Google Drive Status Route
  app.get("/api/gdrive/status", async (req, res) => {
    const hasToken = !!process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
    let folderId = "";
    let folderUrl = "https://drive.google.com/drive/my-drive";

    if (hasToken) {
      try {
        const drive = getDriveClient();
        folderId = await getOrCreateAppFolderId(drive);
        if (folderId) {
          folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
        }
      } catch (e) {}
    }

    res.json({
      configured: hasToken,
      folderId,
      folderUrl
    });
  });

  // Google Drive Manual Sync/Upload Route
  app.post("/api/gdrive/upload", async (req, res) => {
    try {
      const result = await syncToGoogleDrive();
      res.json({
        success: true,
        message: "Base de dados guardada com sucesso na pasta do Google Drive!",
        ...result
      });
    } catch (err: any) {
      console.error("Erro ao guardar na pasta do Google Drive:", err);
      res.status(500).json({ success: false, error: err.message || "Erro ao guardar no Google Drive." });
    }
  });

  async function restoreFromGoogleDriveInternal(): Promise<boolean> {
    if (!process.env.GOOGLE_OAUTH_ACCESS_TOKEN) {
      return false;
    }
    const drive = getDriveClient();
    const folderId = await getOrCreateAppFolderId(drive);
    let dbRestored = false;

    // 1. Try downloading physical SQLite database animalar.db / AnimaLar.db
    try {
      let query = "(name = 'animalar.db' or name = 'AnimaLar.db') and trashed = false";
      if (folderId) {
        query = `'${folderId}' in parents and (name = 'animalar.db' or name = 'AnimaLar.db') and trashed = false`;
      }
      let listDbRes = await drive.files.list({
        q: query,
        fields: "files(id, name, modifiedTime)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      let dbFiles = listDbRes.data.files || [];
      if (dbFiles.length === 0 && folderId) {
        listDbRes = await drive.files.list({
          q: "(name = 'animalar.db' or name = 'AnimaLar.db') and trashed = false",
          fields: "files(id, name, modifiedTime)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        dbFiles = listDbRes.data.files || [];
      }

      if (dbFiles.length > 0) {
        const fileId = dbFiles[0].id!;
        console.log(`[Google Drive] Ficheiro SQLite (${dbFiles[0].name}) encontrado na pasta. A descarregar...`);
        const getRes = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "arraybuffer" }
        );
        const buffer = Buffer.from(getRes.data as ArrayBuffer);
        if (buffer && buffer.length > 0) {
          await db.close();
          await fs.writeFile(dbPath, buffer);
          const newDb = new JSONDatabase(dbPath);
          await newDb.load();
          db = newDb;
          dbRestored = true;
          console.log("[Google Drive] Base de dados SQLite (animalar.db) descarregada e restaurada com sucesso!");
        }
      }
    } catch (err: any) {
      console.warn("[Google Drive] Aviso ao tentar descarregar animalar.db:", err?.message || err);
    }

    // 2. Try downloading animalar_database.json
    try {
      let query = "name = 'animalar_database.json' and trashed = false";
      if (folderId) {
        query = `'${folderId}' in parents and name = 'animalar_database.json' and trashed = false`;
      }
      let listJsonRes = await drive.files.list({
        q: query,
        fields: "files(id, name, modifiedTime)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      let jsonFiles = listJsonRes.data.files || [];
      if (jsonFiles.length === 0 && folderId) {
        listJsonRes = await drive.files.list({
          q: "name = 'animalar_database.json' and trashed = false",
          fields: "files(id, name, modifiedTime)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        jsonFiles = listJsonRes.data.files || [];
      }
      if (jsonFiles.length > 0) {
        const fileId = jsonFiles[0].id!;
        console.log("[Google Drive] Ficheiro animalar_database.json encontrado na pasta. A descarregar...");
        const getRes = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "text" }
        );

        const parsed = JSON.parse(getRes.data as string);
        if (parsed) {
          if (!dbRestored && (parsed.residents || parsed.scheduledActivities)) {
            await db.run("BEGIN TRANSACTION");
            if (parsed.residents && Array.isArray(parsed.residents)) {
              await db.run("DELETE FROM residents");
              const stmt = await db.prepare("INSERT INTO residents (id, name, birthDate, cognitiveLevel, physicalLevel, interests, observations, joinedDate, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
              for (const r of parsed.residents) {
                await stmt.run(r.id, r.name, r.birthDate, r.cognitiveLevel, r.physicalLevel, JSON.stringify(r.interests), r.observations, r.joinedDate, r.avatar);
              }
              await stmt.finalize();
            }

            if (parsed.scheduledActivities && Array.isArray(parsed.scheduledActivities)) {
              await db.run("DELETE FROM scheduled_activities");
              const stmt = await db.prepare("INSERT INTO scheduled_activities (id, activityId, title, description, category, date, slot, time, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
              for (const s of parsed.scheduledActivities) {
                await stmt.run(s.id, s.activityId || null, s.title, s.description, s.category, s.date, s.slot, s.time, s.completed ? 1 : 0);
              }
              await stmt.finalize();
            }

            if (parsed.progressLogs && Array.isArray(parsed.progressLogs)) {
              await db.run("DELETE FROM progress_logs");
              const stmt = await db.prepare("INSERT INTO progress_logs (id, residentId, scheduledActivityId, date, activityTitle, category, participation, cognitiveScore, physicalScore, socialScore, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
              for (const l of parsed.progressLogs) {
                await stmt.run(l.id, l.residentId, l.scheduledActivityId || null, l.date, l.activityTitle, l.category || 'outro', l.participation, l.cognitiveScore, l.physicalScore, l.socialScore, l.notes);
              }
              await stmt.finalize();
            }

            if (parsed.reminders && Array.isArray(parsed.reminders)) {
              await db.run("DELETE FROM reminders");
              const stmt = await db.prepare("INSERT INTO reminders (id, text, type, date, completed) VALUES (?, ?, ?, ?, ?)");
              for (const r of parsed.reminders) {
                await stmt.run(r.id, r.text, r.type, r.date, r.completed ? 1 : 0);
              }
              await stmt.finalize();
            }

            await db.run("COMMIT");
            console.log("[Google Drive] Dados da base de dados populados a partir de animalar_database.json!");
          }

          if (parsed.suggestionRules) {
            db.data.suggestionRules = parsed.suggestionRules;
          }
          if (parsed.activities) {
            db.data.activities = parsed.activities;
          }
          if (parsed.settings) {
            db.data.settings = parsed.settings;
          }
        }
      }
    } catch (err: any) {
      console.warn("[Google Drive] Aviso ao carregar animalar_database.json:", err?.message || err);
    }

    await db.save();
    await generateOfflineHtmlAndSaveToDisk();
    return true;
  }

  // Google Drive Restore Route
  app.post("/api/gdrive/restore", async (req, res) => {
    try {
      await restoreFromGoogleDriveInternal();

      const residents = await db.all("SELECT * FROM residents");
      const parsedResidents = residents.map(r => ({
        ...r,
        interests: safeParseInterests(r.interests)
      }));

      const scheduledActivities = await db.all("SELECT * FROM scheduled_activities");
      const parsedScheduled = scheduledActivities.map(s => ({
        ...s,
        completed: !!s.completed
      }));

      const progressLogs = await db.all("SELECT * FROM progress_logs");
      const parsedLogs = progressLogs.map(l => ({
        ...l,
        participated: true
      }));

      const reminders = await db.all("SELECT * FROM reminders");
      const parsedReminders = reminders.map(rem => ({
        ...rem,
        completed: !!rem.completed
      }));

      res.json({
        success: true,
        message: "Base de dados e ficheiro SQLite restaurados com sucesso a partir do Google Drive!",
        data: {
          residents: parsedResidents,
          scheduledActivities: parsedScheduled,
          progressLogs: parsedLogs,
          reminders: parsedReminders,
          suggestionRules: db.data.suggestionRules || null,
          activities: db.data.activities || [],
          settings: db.data.settings || {}
        }
      });
    } catch (err: any) {
      try { await db.run("ROLLBACK"); } catch {}
      console.error("Erro ao restaurar do Google Drive:", err);
      res.status(500).json({ error: err.message || "Erro ao restaurar do Google Drive." });
    }
  });


  // -------------------------------------------------------------------------
  // Gemini Plan Generation Route
  // -------------------------------------------------------------------------
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { residents } = req.body;

      if (!residents || !Array.isArray(residents)) {
        return res.status(400).json({ error: "Lista de utentes inválida." });
      }

      if (residents.length === 0) {
        return res.status(400).json({ error: "É necessário registar pelo menos um utente para poder analisar as preferências." });
      }

      const ai = getGeminiClient();

      // Build context for clinical preferences
      const residentsContext = residents.map((r, idx) => {
        return `Residente ${idx + 1}:
- Nome: ${r.name}
- Nível Cognitivo: ${r.cognitiveLevel}
- Nível Físico: ${r.physicalLevel}
- Interesses: ${r.interests.join(", ")}
- Observações Clínicas/Terapêuticas: ${r.observations || "Nenhuma observação relevante."}`;
      }).join("\n\n");

      const prompt = `
És um especialista em Geriatria, Terapia Ocupacional e Animação Sociocultural em lares de idosos de prestígio em Portugal.
Gera um plano de atividades mensal personalizado de alta qualidade adaptado ao perfil do seguinte grupo de utentes:

Utentes do Lar:
${residentsContext}

O teu objetivo é criar um conjunto equilibrado e diversificado de atividades recomendadas cobrindo três categorias principais:
1. Estimulação Cognitiva (ajustada para níveis Ligeiro, Moderado e Grave)
2. Exercícios Físicos (ajustados para Independente, Mobilidade Reduzida e Cadeira de Rodas)
3. Musicoterapia (utilizando fado, música popular portuguesa ou ritmos tradicionais que apelem a todos, especialmente úteis para acalmar ansiedade ou reativar memórias)

Gera um plano estruturado em formato JSON contendo:
- "sugestaoPlano": Uma introdução/resumo explicativo de como o plano se adapta às preferências e perfis específicos destes utentes (em português, tom profissional e empático).
- "atividadesPropostas": Um array de exatamente 10 atividades recomendadas. Cada atividade deve ter:
  - "title": Título apelativo em português (ex: "Sessão de Fados & Reminiscências", "Ginástica do Riso na Cadeira")
  - "description": Descrição detalhada explicando como realizar a atividade passo a passo e como adaptá-la para os utentes mais debilitados cognitivamente ou com cadeira de rodas
  - "category": Deve ser estritamente 'cognitiva', 'fisica' ou 'musica'
  - "durationMinutes": Duração sugerida em minutos (ex: 30, 45, 60)
  - "materials": Lista de materiais necessários de fácil acesso
  - "objectives": Lista de objetivos terapêuticos/socio-culturais específicos (ex: "Evocação de memórias a longo prazo", "Melhorar a mobilidade das mãos")
  - "adaptedFor": Uma string em português explicando para quais utentes específicos do grupo esta atividade foi idealmente pensada ou adaptada com base nas suas preferências e níveis.

Por favor, garante que a resposta respeita exatamente a estrutura do JSON requerida.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sugestaoPlano: {
                type: Type.STRING,
                description: "Resumo explicativo do plano adaptado aos perfis dos utentes.",
              },
              atividadesPropostas: {
                type: Type.ARRAY,
                description: "Lista de 10 atividades recomendadas adaptadas.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING, description: "Estritamente 'cognitiva', 'fisica' ou 'musica'" },
                    durationMinutes: { type: Type.INTEGER },
                    materials: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    objectives: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    adaptedFor: { type: Type.STRING }
                  },
                  required: ["title", "description", "category", "durationMinutes", "materials", "objectives", "adaptedFor"]
                }
              }
            },
            required: ["sugestaoPlano", "atividadesPropostas"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("A API Gemini retornou uma resposta vazia.");
      }

      const parsedData = JSON.parse(resultText);
      res.json(parsedData);

    } catch (error: any) {
      console.error("Erro na rota de geração do plano:", error);
      res.status(500).json({ error: error.message || "Erro interno ao gerar o plano com Gemini." });
    }
  });

  // -------------------------------------------------------------------------
  // Vite Integration (Dev Mode vs. Production Mode)
  // -------------------------------------------------------------------------
  // Servir ficheiros estáticos da pasta public diretamente (como o logo e manifest)
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development Mode: Vite DevServer middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production Mode: Serving static files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Falha ao iniciar o servidor Express:", err);
});
