import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa();
const router = new Router();

// Define a typed route
router.get('/', async (ctx: Koa.Context) => {
  ctx.body = {
    message: 'Welcome to Koa2 with TypeScript!',
    status: 'success'
  };
});

// Register routes
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
