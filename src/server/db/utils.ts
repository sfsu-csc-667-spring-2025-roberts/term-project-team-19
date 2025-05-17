import { Game } from "./schema";
import { GameStatus } from "../enum/enums";
import { Op } from "sequelize";
import { GameInstance } from "../types";

export const getActiveGameForUser = async (
  userId: number,
): Promise<GameInstance | null> => {
  const game = (await Game.findOne({
    where: {
      [Op.or]: [
        { host_id: userId },
        { member_2_id: userId },
        { member_3_id: userId },
        { member_4_id: userId },
      ],
      status: {
        [Op.or]: [GameStatus.WAITING, GameStatus.PLAYING],
      },
    },
  })) as GameInstance | null;

  return game;
};
