import '@material/web/button/filled-button.js';
import '@material/web/divider/divider.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/outlined-text-field';
import '@material/web/textfield/outlined-text-field.js';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {commonStyles} from './rinban-common-styles';
import {db} from './rinban-firestore';

/**
 * 登録画面
 *
 * @fires rinban-created - 輪番が作成されたときに発火する
 */
@customElement('rinban-regist')
export class RinbanRegist extends LitElement {
  static override styles = [
    commonStyles,
    css`
      .width-100 {
        width: 100%;
        margin: 1em 0;
      }
      .width-50 {
        width: calc(50% - 4px);
        margin: 1em 0;
      }
    `,
  ];
  @property({type: String})
  mode: Mode;
  @property({type: Object})
  rinban: Rinban;

  override render() {
    return html`
      <h1>輪番登録</h1>
      <md-outlined-text-field
        id="name"
        class="width-100"
        label="輪番名"
        @blur="${this._toggleButton}"
        value="${this.mode === 'edit' ? this.rinban.name : ''}"
        required
      ></md-outlined-text-field>
      <md-outlined-text-field
        id="members"
        class="width-100"
        label="メンバー"
        supporting-text="メールアドレスを入力してください"
        type="email"
        multiple="true"
        @blur="${this._toggleButton}"
        value="${this.mode === 'edit' ? this.rinban.members.join(',') : ''}"
        required
      ></md-outlined-text-field>
      <md-outlined-text-field
        id="repeatNumber"
        class="width-50"
        label="繰り返す間隔"
        value="1"
        min="1"
        type="number"
        @blur="${this._toggleButton}"
        value="${this.mode === 'edit' ? this.rinban.repeatNumber : ''}"
        required
      ></md-outlined-text-field>
      <md-outlined-select
        id="repeatPeriod"
        class="width-50"
        @blur="${this._toggleButton}"
        value="${this.mode === 'edit' ? this.rinban.repeatPeriod : ''}"
        required
      >
        <md-select-option value="day"
          ><div slot="headline">日ごと</div></md-select-option
        >
        <md-select-option value="week" selected
          ><div slot="headline">週間ごと</div></md-select-option
        >
        <md-select-option value="month"
          ><div slot="headline">か月ごと</div></md-select-option
        >
        <md-select-option value="year"
          ><div slot="headline">年ごと</div></md-select-option
        >
      </md-outlined-select>

      ${this.mode === 'edit'
        ? html`<md-filled-button id="submitButton" @click=${this._update}>
            更新
          </md-filled-button>`
        : html`<md-filled-button
            id="submitButton"
            @click=${this._regist}
            disabled
          >
            登録
          </md-filled-button>`}
    `;
  }

  constructor() {
    super();
    // クエリパラメータからIDを取得
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    this.mode = 'regist';
    this.rinban = {} as Rinban;
    if (id) {
      this.mode = 'edit';
      this._fetchRinban(id);
    }
  }
  private async _fetchRinban(id: string) {
    // Google Cloud Firestore からデータを取得
    const docRef = doc(db, 'rinbans', id);
    const docSnap = await getDoc(docRef);
    this.rinban = {...docSnap.data(), ...{id}} as Rinban;
    console.log(this.rinban);
  }

  private async _regist() {
    const newRinban = this._getNewRinban();
    try {
      const docRef = await addDoc(collection(db, 'rinbans'), newRinban);
      console.log('Document written with ID: ', docRef.id);
      window.location.href = '/';
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  private async _update() {
    const newRinban = this._getNewRinban();
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, 'rinbans', this.rinban.id);
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists()) {
          throw 'Document does not exist!';
        }
        transaction.update(docRef, newRinban);
      });
      console.log('Document successfully updated!');
      window.location.href = '/';
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  private _getNewRinban() {
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
    return {
      name: name.value,
      members: members,
      repeatNumber: repeatNumber.value,
      repeatPeriod: repeatPeriod.value,
    };
  }

  private _toggleButton() {
    const submitButton = this.shadowRoot?.getElementById(
      'submitButton'
    ) as HTMLButtonElement;
    submitButton.disabled = !this._validate();
  }

  private _validate() {
    return (
      this._validateTitle() &&
      this._validateMembers() &&
      this._validateRepeatNumber() &&
      this._validateRepeatPeriod()
    );
  }

  private _validateTitle() {
    const name = this.shadowRoot?.getElementById('name') as HTMLInputElement;
    console.log(name.reportValidity());
    return name.reportValidity();
  }

  private _validateMembers() {
    const membersString = this.shadowRoot?.getElementById(
      'members'
    ) as HTMLInputElement;
    return membersString.reportValidity();
  }

  private _validateRepeatNumber() {
    const repeatNumber = this.shadowRoot?.getElementById(
      'repeatNumber'
    ) as HTMLInputElement;
    return repeatNumber.reportValidity();
  }

  private _validateRepeatPeriod() {
    const repeatPeriod = this.shadowRoot?.getElementById(
      'repeatPeriod'
    ) as HTMLInputElement;
    return repeatPeriod.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rinban-regist': RinbanRegist;
  }
}
