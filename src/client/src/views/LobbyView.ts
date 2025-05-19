import { BaseView } from "./BaseView";
import { GameManager } from "../middleware/game";
import { SocketManager } from "../middleware/socket";

export class LobbyView extends BaseView {
  private gameManager: GameManager;
  private game_id: number;

  constructor(gameManager: GameManager, game_id: number) {
    super();
    this.gameManager = gameManager;
    this.game_id = game_id;
  }

  protected getTemplate(): string {
    return "lobby";
  }

  protected async getData(): Promise<Record<string, any>> {
    const user = this.gameManager.getUser();
    return {
      title: "Game Lobby",
      styles: ["/styles.css"],
      game_id: this.game_id,
      user: user,
    };
  }
}
