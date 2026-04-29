import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const port = Number(process.env.PORT) || 3010;

export const app = createApp();

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running at http://localhost:${port}`);
  });
}
