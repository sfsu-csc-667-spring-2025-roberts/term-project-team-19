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

    return {
      title: "Landing",
      styles: ["/styles.css"],
      games: games,
    };
  }
}
