import { Response } from "express";
import path from "path";

export abstract class BaseView {
  protected abstract getTemplate(): string;
  protected abstract getData():
    | Promise<Record<string, any>>
    | Record<string, any>;

  public async render(res: Response): Promise<void> {
    const template = this.getTemplate();
    const data = await this.getData();

    // Add default data that should be available in all templates
    const templateData = {
      ...data,
      styles: data.styles || ["/styles.css"],
    };

    res.render(template, templateData);
  }
}
