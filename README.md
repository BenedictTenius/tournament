- Node.js + TypeScript — backend на чистом Node.js  
- Prisma ORM — работа с PostgreSQL  
- Docker / Docker Compose — контейнеризация приложения и базы  
- Husky — pre-commit хуки (линт, форматирование, тесты)  
- ESLint + Prettier — единый кодстайл и автоформатирование  

#пока не используйте
npm install
npm run dev


npm run build   # tsc -> build/
npm run start   # node build/main.js


Все ключи/пароли лежат в .env

Docker Compose прокидывает переменные окружения в контейнеры

Документация
Swagger UI доступен по адресу:

http://localhost:3000/docs -> http://localhost/openapi.json
