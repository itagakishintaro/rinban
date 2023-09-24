import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * 登録画面
 *
 * @fires rinban-created - 輪番が作成されたときに発火する
 */
@customElement('rinban-regist')
export class RinbanRegist extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

  override render() {
    return html`
      <h1>輪番登録</h1>
      <label for="name">輪番名</label>
      <input id="name" type="text" />
      <label for="members">メンバー</label>
      <input id="members" type="text" />
      <label for="period">周期</label>
      <input id="period" type="text" />
      <button @click=${this._regist} part="button">
        登録
      </button>
    `;
  }

  private _regist() {
    console.log('regist');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'regist': RinbanRegist;
  }
}
