import { addDoc, collection } from "firebase/firestore";
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { db } from './rinban-firestore';

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

  private async _regist() {
    console.log('regist');
    try {
      const docRef = await addDoc(collection(db, "rinban"), {
        first: "Ada",
        last: "Lovelace",
        born: 1815
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'regist': RinbanRegist;
  }
}
