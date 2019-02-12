import path from 'path';
import TelegramAPI from 'tg-cli-node';

export default new TelegramAPI({
  telegram_cli_path: process.env.TELEGRAM_CLI_PATH,
  telegram_cli_socket_path: path.join(__dirname, '../tmp/socket'),
  server_publickey_path: process.env.TELEGRAM_PUBLIC_KEY_PATH
});

