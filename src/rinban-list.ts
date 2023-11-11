import '@material/web/divider/divider.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import {collection, getDocs} from 'firebase/firestore';
import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {commonStyles} from './rinban-common-styles';
import {db} from './rinban-firestore';

/**
 * 一覧画面
 *
 */
@customElement('rinban-list')
export class RinbanList extends LitElement {
  static override styles = [
    commonStyles,
    css`
      :host {
        --md-list-container-color: white;
      }
      [slot='headline'] {
        font-weight: bold;
      }
      .member {
        margin-right: 0.5em;
      }
      .supporting-text {
        width: 85vw;
      }
    `,
  ];

  @property({type: Array})
  rinbans: Rinban[];

  override render() {
    return html`
      <div>
        <h1>輪番一覧</h1>
        <md-list>
          <md-divider></md-divider>
          ${this.rinbans.map(
            (rinban) =>
              html`
              <a href="/regist.html?id=${rinban.id}">
                <md-list-item>
                  <div slot="headline">${rinban.name}</div slot="headline">
                  <div slot="supporting-text" class="supporting-text">
                    ${rinban.members.map(
                      (member) => html`<span class="member">${member}</span>`
                    )}
                  </div>
                  <div slot="trailing-supporting-text">
                    <span>${rinban.repeatNumber}</span>
                    <span>${rinban.repeatPeriod}</span>
                  </div>
                </md-list-item>
                <md-divider></md-divider>
              </a>
            `
          )}
        </md-list>
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
    const querySnapshot = await getDocs(collection(db, 'rinbans'));
    querySnapshot.forEach((doc) => {
      const rinban = doc.data() as Rinban;
      rinban.id = doc.id;
      console.log(rinban);
      newRinbans.push(rinban as Rinban);
    });
    this.rinbans = newRinbans;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rinban-list': RinbanList;
  }
}
