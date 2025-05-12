import { BaseView } from "./BaseView";

export class LoginView extends BaseView {
  protected getTemplate(): string {
    return "login";
  }

  protected getData(): Record<string, any> {
    return {
      title: "Login",
      styles: ["/styles.css"],
    };
  }
}
