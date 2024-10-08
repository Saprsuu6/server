import express from 'express';

import { neededBitcoinNameArray, neededCoins } from '../../controllers/index.ts';
import { CoinInfo, PingResponse } from '../../interfaces/interfaces.ts';
import { coinsInfo, ping } from '../../services/cryptoService.ts';

const cryptosRouter = express.Router();

cryptosRouter.route('/cryptoPing').get(async (_, res) => {
  const response: Promise<PingResponse> = ping();

  // to send only string
  // res.send((await response).gecko_says);

  response.then((data) => {
    res.send(data);
  });
});

cryptosRouter.route('/getCryptoInfo').get(async (_, res) => {
  if (neededCoins.length <= 0) {
    let array: any = undefined;

    try {
      array = await coinsInfo();
    } catch (error) {
      res.status(500).send({
        message: 'We are sorry, something went wrong'
      });
      return;
    }

    const allNeededCoins = array.filter((coin: any) => neededBitcoinNameArray.includes(coin.name));

    const newArrayWithConcreteFields: CoinInfo[] = allNeededCoins.map((coin: any) => ({
      name: coin.name,
      usd: coin.current_price,
      usd_24h_change: coin.price_change_percentage_1h_in_currency
    }));

    neededCoins.push(...newArrayWithConcreteFields);
    setInterval(() => {
      neededCoins.length = 0;
    }, 1 * 60 * 1000);
  }

  res.send(neededCoins);
});

export default cryptosRouter;
