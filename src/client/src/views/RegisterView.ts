import { BaseView } from "./BaseView";

export class RegisterView extends BaseView {
  protected getTemplate(): string {
    return "register";
  }

  protected getData(): Record<string, any> {
    return {
      title: "Register",
      styles: ["/styles.css"],
    };
  }
}
