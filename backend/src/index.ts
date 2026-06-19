import Koa from 'koa';
import Router from 'koa-router';
import { query } from './db';

const app = new Koa();
const router = new Router();

router.get('/', async (ctx: Koa.Context) => {
  ctx.body = {
    message: 'Welcome to Koa2 with TypeScript!',
    status: 'success'
  };
});

router.get('/health', async (ctx: Koa.Context) => {
  try {
    const result = await query('SELECT NOW()');
    ctx.body = { status: 'ok', db: result.rows[0] };
  } catch (err) {
    ctx.status = 503;
    ctx.body = { status: 'error', message: 'Database unavailable' };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
