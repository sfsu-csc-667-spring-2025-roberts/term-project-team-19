import { BaseView } from "./BaseView";
import { GameManager } from "../middleware/game";

export class LandingView extends BaseView {
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
    const user = this.gameManager.getUser();

    return {
      title: "Game Lobby",
      styles: ["/styles.css"],
      games: games,
      user: user,
    };
  }
}
