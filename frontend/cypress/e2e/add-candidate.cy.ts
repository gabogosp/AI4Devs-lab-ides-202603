describe('Add candidate flow', () => {
  it('navigates from dashboard to form and shows identity fields', () => {
    cy.visit('/');
    cy.contains('Add candidate').click();
    cy.url().should('include', '/candidates/new');
    cy.contains('Add candidate', { matchCase: false });
    cy.get('#firstName').should('be.visible');
  });

  it('submits minimal candidate with stubbed API', () => {
    cy.intercept('POST', '**/candidates', {
      statusCode: 201,
      body: {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
      },
    }).as('createCandidate');

    cy.visit('/candidates/new');
    cy.get('#firstName').type('Test');
    cy.get('#lastName').type('User');
    cy.get('#email').type('test.user@example.com');
    cy.contains('button', 'Save candidate').click();
    cy.wait('@createCandidate');
    cy.contains('Candidate added successfully').should('be.visible');
  });
});
