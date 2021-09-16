const http = require('http');
const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const serve = require('koa-static');
const Router = require('koa-router');
const cors = require('koa-cors');
const uuid = require('uuid');

const app = new Koa();
const router = new Router();

const publicDirPath = path.join(__dirname, '/public');

app.use(
  cors({
    origin: '*',
  }),
);

app.use(
  koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }),
);

const notes = [
  { id: '1', content: 'Вы нажимаете на крестик на одной из карточек' },
  {
    id: '2',
    content:
      'Выполняется http-запрос DELETE на адрес http://localhost:7777/notes/{id} (где id - это идентификатор заметки)',
  },
];

router
  .get('/notes', async (ctx, next) => {
    ctx.body = notes;
    return await next();
  })

  .post('/notes', async (ctx, next) => {
    const content = ctx.request.body;
    if (typeof content !== 'string') {
      ctx.status = 400;
      return await next();
    }
    const newNote = { content, id: uuid.v4() };
    notes.push(newNote);

    ctx.body = newNote;
    return await next();
  })

  .del('/notes/:id', async (ctx, next) => {
    const { id } = ctx.params;
    const index = notes.findIndex((note) => note.id === id);
    notes.splice(index, 1);

    ctx.status = 204;
    return await next();
  });

app.use(router.routes()).use(router.allowedMethods());
app.use(serve(publicDirPath));

const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port);
