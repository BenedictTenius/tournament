//

import server from './server.js';

const PORT = parseInt(process.env.PORT ?? '3000');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
