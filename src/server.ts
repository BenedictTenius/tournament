import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { TournamentService } from './services/tournamentService.js';
import swaggerUi from 'swagger-ui-dist';

const service = new TournamentService();
const swaggerDistPath = swaggerUi.getAbsoluteFSPath();

const openApiPath = path.join(process.cwd(), 'openapi.json');
let openApiSpec: any = {};
if (fs.existsSync(openApiPath)) {
  openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
} else {
  console.warn('⚠️ OpenAPI file not found at', openApiPath);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url!, true);
  const { pathname, query } = parsedUrl;

  try {
    if (pathname === '/docs' || pathname === '/docs/') {
      let indexHtml = fs.readFileSync(path.join(swaggerDistPath, 'index.html'), 'utf-8');
      indexHtml = indexHtml.replace('https://petstore.swagger.io/v2/swagger.json', `http://localhost/openapi.json`);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(indexHtml);
    }

    if (pathname?.startsWith('/docs/')) {
      const filePath = path.join(swaggerDistPath, pathname.replace('/docs/', ''));
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const contentType =
          ext === '.css'
            ? 'text/css'
            : ext === '.js'
              ? 'application/javascript'
              : ext === '.png'
                ? 'image/png'
                : 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        return fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }
    }

    if (pathname === '/openapi.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(openApiSpec));
    }

    // -----------------
    // API endpoints
    // -----------------
    res.setHeader('Content-Type', 'application/json');

    if (pathname === '/user' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { name, email } = JSON.parse(body);
      const user = await service.createUser(name, email);
      return res.end(JSON.stringify(user));
    }

    if (pathname === '/tournament' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { name, startAt } = JSON.parse(body);
      const tournament = await service.createTournament(name, new Date(startAt));
      return res.end(JSON.stringify(tournament));
    }

    if (pathname === '/tournament/add-user' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { tournamentId, userId } = JSON.parse(body);
      const participant = await service.addUserToTournament(userId, tournamentId);
      return res.end(JSON.stringify(participant));
    }

    if (pathname === '/tournament/generate-matches' && req.method === 'POST') {
      const { tournamentId } = query;
      if (!tournamentId) throw new Error('tournamentId is required');
      const matches = await service.generateMatches(Number(tournamentId));
      return res.end(JSON.stringify(matches));
    }

    if (pathname === '/match/play' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { matchId } = JSON.parse(body);
      const result = await service.playMatch(matchId);
      return res.end(JSON.stringify(result));
    }

    if (pathname === '/tournament/leaderboard' && req.method === 'GET') {
      const { tournamentId } = query;
      if (!tournamentId) throw new Error('tournamentId is required');
      const leaderboard = await service.getLeaderboard(Number(tournamentId));
      return res.end(JSON.stringify(leaderboard));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err: any) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: err.message }));
  }
});

export default server;
