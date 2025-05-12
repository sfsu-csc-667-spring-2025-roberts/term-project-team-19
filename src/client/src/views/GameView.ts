import { BaseView } from "./BaseView";

export class GameView extends BaseView {
  protected getTemplate(): string {
    return "game";
  }

  protected getData(): Record<string, any> {
    return {
      title: "Game",
      styles: ["/styles.css"],
    };
  }
}
