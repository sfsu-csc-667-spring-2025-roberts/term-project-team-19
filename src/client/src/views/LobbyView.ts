import { BaseView } from "./BaseView";
import { GameManager } from "../game/game";

export class LobbyView extends BaseView {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    super();
    this.gameManager = gameManager;
  }

  protected getTemplate(): string {
    return "lobby";
  }

  protected async getData(): Promise<Record<string, any>> {
    const games = await this.gameManager.fetchGames();
    console.log(games);

    return {
      title: "Game Lobby",
      styles: ["/styles.css"],
      games: games,
    };
  }
}
