/**
 * One-time helper to get GOOGLE_OAUTH_REFRESH_TOKEN for My Drive folder 1IceTcwyPoV8qIgZmT7qDzWPDS5CT-PLp
 * Service Accounts have NO quota in My Drive -> we need OAuth as the owner (u7382361@gmail.com) to store there.
 * Run: npm run drive:auth
 * Steps:
 * 1. Go to https://console.cloud.google.com/apis/credentials -> Create Credentials -> OAuth client ID -> Web application
 *    Add http://localhost:8080 as Authorized redirect URI.
 * 2. Put that client ID/secret into .env as GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET
 *    (You can reuse VITE_GOOGLE_CLIENT_ID 956629357698-... if its project has Drive scope enabled)
 * 3. Run npm run drive:auth -> it opens browser, you log in as u7382361@gmail.com, approve Drive scope.
 * 4. Copy the refresh_token printed and put into .env as GOOGLE_OAUTH_REFRESH_TOKEN then restart server.
 * After that, uploads to 1Ice... will use your 15GB My Drive quota and appear as google_drive.
 */
import http from 'node:http';
import open from 'open';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = (process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
const CLIENT_SECRET = (process.env.GOOGLE_OAUTH_CLIENT_SECRET || '').trim();
const REDIRECT_URI = 'http://localhost:8080'.trim();

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET in .env');
  console.error('Create OAuth Web client at https://console.cloud.google.com/apis/credentials');
  console.error('Set redirect URI to http://localhost:8080');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];
const url = oauth2.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' });

console.log('\nOpen this URL in browser (auto-opening):\n', url, '\n');
await open(url);

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url || '', REDIRECT_URI);
  const code = urlObj.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing code. Try again.');
    return;
  }
  try {
    const { tokens } = await oauth2.getToken(code);
    console.log('\n=== SUCCESS ===');
    console.log('Refresh token (put in .env as GOOGLE_OAUTH_REFRESH_TOKEN):');
    console.log(tokens.refresh_token || '(no refresh_token, revoke access at https://myaccount.google.com/permissions and retry with prompt=consent)');
    console.log('\nAccess token (short-lived):', tokens.access_token?.slice(0, 20) + '...');
    console.log('\nAdd to server/.env:');
    console.log(`GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nThen restart: npm run dev');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success! Copy refresh_token from terminal, then close this tab and restart server.</h1>');
  } catch (e: any) {
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Failed: ' + e.message);
  } finally {
    server.close();
  }
});
server.listen(8080, () => console.log('Listening on http://localhost:8080 for OAuth callback...'));
