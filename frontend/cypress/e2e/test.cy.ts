import { expect } from 'chai';

const stubAppApis = (isAdmin: boolean) => {
  cy.intercept('GET', '**/api/user', {
    statusCode: 200,
    body: { data: { name: isAdmin ? 'Cypress Admin' : 'Cypress User' } },
  });
  cy.intercept('GET', '**/api/guest/user', { statusCode: 200, body: false });
  cy.intercept('GET', '**/api/admin', { statusCode: 200, body: isAdmin });
  cy.intercept('GET', '**/api/boxer*', {
    statusCode: 200,
    body: { data: { boxers: [], count: 0 } },
  });
  cy.intercept('GET', '**/api/match*', { statusCode: 200, body: { data: [] } });
};

describe('Header navigation', () => {
  it('PC adminは2段ヘッダー、padding、sticky offsetを表示する', () => {
    stubAppApis(true);
    cy.viewport(1024, 800);
    cy.visit('/admin/match_edit');

    cy.get('header').should('have.css', 'height', '132px');
    cy.get('nav[aria-label="管理ページ"] a').should('have.length', 4);
    cy.get('button[aria-label="管理メニューを開閉"]').should('not.exist');
    cy.get('main').should(($main) => {
      expect(parseFloat($main.css('padding-top'))).to.be.at.least(132);
    });
    cy.get('.sticky').should(($sticky) => {
      expect(parseFloat($sticky.css('top'))).to.be.at.least(132);
    });
  });

  it('PC non-adminは管理導線を表示しない', () => {
    stubAppApis(false);
    cy.viewport(1024, 800);
    cy.visit('/');

    cy.get('header').should('have.css', 'height', '80px');
    cy.get('nav[aria-label="管理ページ"]').should('not.exist');
    cy.get('button[aria-label="一般ページを開閉"]').should('not.exist');
  });

  it('767pxはSP、768pxと769pxはPCとして切り替わる', () => {
    stubAppApis(true);
    [
      { width: 767, height: '126px' },
      { width: 768, height: '132px' },
      { width: 769, height: '132px' },
    ].forEach(({ width, height }) => {
      cy.viewport(width, 800);
      cy.visit('/');
      cy.get('header').should('have.css', 'height', height);
    });
  });

  it('320pxのSP adminヘッダーが5セル内に収まり、一般ページパネルがヘッダー直下に開く', () => {
    stubAppApis(true);
    cy.viewport(320, 800);
    cy.visit('/admin/match_edit');

    cy.get('nav[aria-label="管理ページ"] a')
      .should('have.length', 4)
      .each(($link) => {
        const rect = $link[0].getBoundingClientRect();
        expect(rect.width).to.be.at.least(44);
        expect(rect.height).to.be.at.least(44);

        const label = $link.find('span')[0];
        expect(label.scrollWidth).to.be.at.most(label.clientWidth);
      });
    cy.window().then((window) => {
      expect(window.document.documentElement.scrollWidth).to.be.at.most(window.innerWidth);
    });

    cy.get('button[aria-label="一般ページを開閉"]')
      .should('have.attr', 'aria-expanded', 'false')
      .click()
      .should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-testid="sp-common-menu-popover"]').should(($panel) => {
      expect($panel[0].getBoundingClientRect().top).to.be.at.least(120);
      expect($panel[0].getBoundingClientRect().top).to.be.lessThan(140);
    });
    cy.contains('a', 'Schedule').should('be.visible');
    cy.contains('a', 'Match Result').should('be.visible');
  });
});
