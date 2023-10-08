import '@material/web/button/filled-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/menu/menu-item.js';
import '@material/web/menu/menu.js';
import { MdMenu } from '@material/web/menu/menu.js';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * メニュー コンポーネント
 *
 */
@customElement('rinban-menu')
export class RinbanMenu extends LitElement {
  static override styles = css`
    .menu {
      border-bottom: solid 1px gray;
    }
    .title {
      font-size: 1.2rem;
      vertical-align: text-bottom;
    }
    a {
      color: black;
      text-decoration: none;
    }
  `;

  constructor() {
    super();
  }

  override render() {
    return html`
      <div style="position: relative" class="menu">
        <md-icon-button id="rinban-anchor" @click="${this._toggleMenu}">
          <md-icon>menu</md-icon>
        </md-icon-button>
        <md-menu id="rinban-menu" anchor="rinban-anchor">
          <md-menu-item><a href="/regist.html">輪番登録</a></md-menu-item>
          <md-menu-item><a href="/">輪番一覧</a></md-menu-item>
        </md-menu>
        <a class="title" href="/">輪番</a>
      </div>
    `;
  }

  private _toggleMenu() {
    const menuEl = this.shadowRoot?.getElementById('rinban-menu') as MdMenu;
    menuEl.open = !menuEl.open;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rinban-menu': RinbanMenu;
  }
}
