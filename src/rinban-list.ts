import { collection, getDocs } from "firebase/firestore";
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { db } from './rinban-firestore';

/**
 * 一覧画面
 *
 */
@customElement('rinban-list')
export class RinbanList extends LitElement {
  static override styles = css`
    :host {
      /* display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px; */
    }
  `;

  @property({ type: Array })
  rinbans: Rinban[];
  
  override render() {
    return html`
    <div>
      <h1>輪番一覧</h1>
      ${this.rinbans.map((rinban) => 
        html`
          <div>
            <span>${rinban.name}</span>
            <span>${rinban.members}</span>
            <span>${rinban.repeatNumber}</span>
            <span>${rinban.repeatPeriod}</span>
          </div>
        `
      )}
    </div>
    `;
  }

  constructor() {
    super();
    this.rinbans = [];
    this._fetchRinbans();
  }

  private async _fetchRinbans() {
    const newRinbans: Rinban[] = [];
    const querySnapshot = await getDocs(collection(db, "rinbans"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
      newRinbans.push(doc.data() as Rinban);
    });
    this.rinbans = newRinbans;
}
}

declare global {
  interface HTMLElementTagNameMap {
    list: RinbanList;
  }
}
