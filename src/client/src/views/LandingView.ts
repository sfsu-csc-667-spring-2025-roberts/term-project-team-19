import { BaseView } from "./BaseView";
import { GameManager } from "../game/game";

export class LobbyView extends BaseView {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    super();
    this.gameManager = gameManager;
  }

  protected getTemplate(): string {
    return "landing";
  }

  protected async getData(): Promise<Record<string, any>> {
    const games = await this.gameManager.fetchGames();

    return {
      title: "Game Lobby",
      styles: ["/styles.css"],
      games: games,
    };
  }
}
