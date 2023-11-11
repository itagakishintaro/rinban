import '@material/web/button/filled-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/menu/menu-item.js';
import '@material/web/menu/menu.js';
import {MdMenu} from '@material/web/menu/menu.js';
import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {commonStyles} from './rinban-common-styles';

/**
 * メニュー コンポーネント
 *
 */
@customElement('rinban-menu')
export class RinbanMenu extends LitElement {
  static override styles = [
    commonStyles,
    css`
      .menu {
        border-bottom: solid 1px gray;
        background-color: white;
      }
      .title {
        font-size: 1.2rem;
        vertical-align: text-bottom;
      }
    `,
  ];

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
          <a href="/regist.html"><md-menu-item>輪番登録</md-menu-item></a>
          <a href="/"><md-menu-item>輪番一覧</md-menu-item></a>
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
