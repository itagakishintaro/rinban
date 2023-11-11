/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {RinbanRegist} from '../rinban-regist.js';

import {assert, fixture} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('rinban-regist', () => {
  test('is defined', () => {
    const el = document.createElement('rinban-regist');
    assert.instanceOf(el, RinbanRegist);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<rinban-regist />`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('renders with a set name', async () => {
    const el = await fixture(html`<regist name="Test"></rinban-regist>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('handles a click', async () => {
    const el = (await fixture(html`<rinban-regist />`)) as RinbanRegist;
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });

  test('styling applied', async () => {
    const el = (await fixture(html`<rinban-regist />`)) as RinbanRegist;
    await el.updateComplete;
    assert.equal(getComputedStyle(el).paddingTop, '16px');
  });
});
