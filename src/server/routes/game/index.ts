import { Router } from 'express';
import createGameHandler from './handlers/create';
import joinGameHandler from './handlers/join';
import startGameHandler from './handlers/start';
import initializeGameCardsHandler from './handlers/initialize_cards';

const gameRouter = Router();
const router = Router();

gameRouter.post('/create', createGameHandler);
gameRouter.post('/join', joinGameHandler);
gameRouter.post('/start', startGameHandler);
gameRouter.post('/initialize-cards', initializeGameCardsHandler);

router.use('/game', gameRouter);

export default router;