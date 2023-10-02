import { addDoc, collection } from 'firebase/firestore';
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
      <div>
        <label for="name">輪番名</label>
        <input id="name" type="text" />
      </div>
      <div>
        <label for="members">メンバー</label>
        <textarea id="members" rows="5" placeholder="メールアドレスをカンマ区切りで入力してください"></textarea>
      </div>
      <div>
        <label for="repeatNumber">繰り返す間隔</label>
        <input id="repeatNumber" type="number" value="1"/>
        <select id="repeatPeriod">
          <option value="day">日ごと</option>
          <option value="week" selected>週間ごと</option>
          <option value="month">か月ごと</option>
          <option value="year">年ごと</option>
        </select>
      </div>
      <button @click=${this._regist} part="button">
        登録
      </button>
    `;
  }

  private async _regist() {
    const name = this.shadowRoot?.getElementById('name') as HTMLInputElement;
    const membersString = this.shadowRoot?.getElementById(
      'members'
    ) as HTMLInputElement;
    const members = membersString.value.split(',');
    const repeatNumber = this.shadowRoot?.getElementById(
      'repeatNumber'
    ) as HTMLInputElement;
    const repeatPeriod = this.shadowRoot?.getElementById(
      'repeatPeriod'
    ) as HTMLInputElement;
    try {
      const docRef = await addDoc(collection(db, 'rinbans'), {
        name: name.value,
        members: members,
        repeatNumber: repeatNumber.value,
        repeatPeriod: repeatPeriod.value,
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    regist: RinbanRegist;
  }
}
