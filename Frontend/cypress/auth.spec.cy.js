describe('User Registration Test', () => {
    it('should register a new user successfully', () => {
      // Visit the registration page
      cy.visit('pages/registration.html');
      
      // Fill in the registration form
      cy.get('#fullName').type('John Doe5');
      cy.get('#regEmail').type('john.doe000@example.com');
      cy.get('#regPassword').type('password123');
      cy.get('#confirmPassword').type('password123');
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
      });
  
      cy.get('form#registrationForm').submit();
  
      cy.get('@alert').should('have.been.calledWith', 'Registration successful! Please log in.');
      cy.url().should('include', 'pages/login.html');
    });
  
    it('should show an error when passwords do not match', () => {
      // Visit the registration page
      cy.visit('pages/registration.html');
      
      // Fill in the registration form with non-matching passwords
      cy.get('#fullName').type('John Doe4');
      cy.get('#regEmail').type('john.doe200@example.com');
      cy.get('#regPassword').type('password123');
      cy.get('#confirmPassword').type('password321');
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
      });
  
      cy.get('form#registrationForm').submit();
  
      cy.get('@alert').should('have.been.calledWith', 'Passwords do not match');
    });
})

  describe('User Login Test', () => {
    it('should log in successfully with valid credentials', () => {
      // Visit the login page
      cy.visit('pages/login.html');
      
      // Fill in the login form with valid credentials
      cy.get('#loginEmail').type('john.doe200@example.com');
      cy.get('#loginPassword').type('password123');
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
      });
  
      cy.get('form#loginForm').submit();
  
      cy.get('@alert').should('have.been.calledWith', 'Login successful!');
      cy.url().should('include', 'pages/index.html');
    });
    
    it('should show an error for invalid login credentials', () => {
      // Visit the login page
      cy.visit('pages/login.html');
      
      // Fill in the login form with invalid credentials
      cy.get('#loginEmail').type('wrong.email@example.com');
      cy.get('#loginPassword').type('wrongpassword');
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
      });
  
      cy.get('form#loginForm').submit();
  
      cy.get('@alert').should('have.been.calledWith', 'Login failed: Invalid email or password');
    });
  
  });
  