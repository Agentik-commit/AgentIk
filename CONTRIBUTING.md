# Contributing to Agentik

Thank you for your interest in contributing to Agentik! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **pnpm**: Package manager
- **Git**: Version control
- **Code Editor**: VS Code recommended with TypeScript support

### Local Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/amorphous-fortress.git
   cd amorphous-fortress
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd agentik && npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend server
   npm run dev
   
   # Terminal 2: Frontend development
   cd agentik && npm run dev
   ```

5. **Verify setup**
   - Backend: http://localhost:5001
   - Frontend: http://localhost:5173

## Development Workflow

### Branch Strategy

We use a simplified Git flow:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Feature development branches
- **`hotfix/*`**: Critical bug fixes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards below
   - Write tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new simulation feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

5. **Code review**
   - Address review comments
   - Ensure CI checks pass
   - Get approval from maintainers

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(simulation): add agent memory system"
git commit -m "fix(api): resolve CORS issue with iframe embedding"
git commit -m "docs: update API documentation"
```

## Code Standards

### TypeScript (Frontend)

- **Strict Mode**: Always enabled
- **Type Safety**: Explicit types for all functions and variables
- **Interfaces**: Use interfaces over types for object shapes
- **Imports**: Use named imports, avoid `import *`

```typescript
// Good
interface AgentState {
  id: string;
  position: Vector2;
  needs: Needs;
}

export function updateAgent(agent: AgentState): void {
  // Implementation
}

// Avoid
export function updateAgent(agent: any): any {
  // Implementation
}
```

### JavaScript (Backend)

- **ES6+**: Use modern JavaScript features
- **Async/Await**: Prefer over callbacks
- **Error Handling**: Always handle errors explicitly
- **Validation**: Validate all input parameters

```javascript
// Good
async function createTemplate(template) {
  if (!template.name || !template.world) {
    throw new Error('Missing required fields');
  }
  
  try {
    const result = await upsertTemplate('anon', template);
    return result;
  } catch (error) {
    logger.error('Failed to create template:', error);
    throw error;
  }
}

// Avoid
function createTemplate(template) {
  upsertTemplate('anon', template, (err, result) => {
    // Callback hell
  });
}
```

### CSS/Styling

- **BEM Methodology**: Use Block__Element--Modifier naming
- **CSS Variables**: Use custom properties for theming
- **Responsive Design**: Mobile-first approach
- **Performance**: Minimize CSS-in-JS usage

```css
/* Good */
.simulation-canvas {
  --canvas-bg: #0f0f0f;
  --canvas-border: #334155;
}

.simulation-canvas__controls {
  background: var(--canvas-bg);
  border: 1px solid var(--canvas-border);
}

.simulation-canvas__controls--active {
  background: #1a1a1a;
}

/* Avoid */
.simulation-canvas .controls {
  background: #0f0f0f;
}
```

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Writing Tests

- **Test Naming**: Descriptive test names that explain the scenario
- **Arrange-Act-Assert**: Clear test structure
- **Mocking**: Mock external dependencies
- **Edge Cases**: Test error conditions and edge cases

```javascript
describe('Template Management', () => {
  describe('createTemplate', () => {
    it('should create a template with valid data', async () => {
      // Arrange
      const template = {
        name: 'Test World',
        world: { tiles: [] },
        agents: [],
        story: 'Test story',
        model: { provider: 'ollama' }
      };

      // Act
      const result = await createTemplate(template);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(template.name);
    });

    it('should throw error for missing required fields', async () => {
      // Arrange
      const invalidTemplate = { name: 'Test' };

      // Act & Assert
      await expect(createTemplate(invalidTemplate))
        .rejects.toThrow('Missing required fields');
    });
  });
});
```

## Performance Guidelines

### Frontend

- **Bundle Size**: Keep bundle under 500KB gzipped
- **Lazy Loading**: Implement code splitting for routes
- **Asset Optimization**: Compress images and use WebP format
- **Memory Management**: Avoid memory leaks in Phaser scenes

### Backend

- **Database Queries**: Use indexes and avoid N+1 queries
- **Caching**: Implement Redis for frequently accessed data
- **Rate Limiting**: Protect APIs from abuse
- **Connection Pooling**: Reuse database connections

## Documentation

### Code Documentation

- **JSDoc**: Document all public functions and classes
- **README Updates**: Update relevant documentation for new features
- **API Documentation**: Keep OpenAPI spec up to date
- **Inline Comments**: Explain complex logic with clear comments

### Example

```javascript
/**
 * Creates a new simulation template
 * @param {string} owner - The owner of the template
 * @param {Object} template - Template data
 * @param {string} template.name - Template name
 * @param {Object} template.world - World configuration
 * @param {Array} template.agents - Agent definitions
 * @param {string} template.story - Story description
 * @param {Object} template.model - AI model configuration
 * @returns {Promise<Object>} Created template
 * @throws {Error} When required fields are missing
 */
async function createTemplate(owner, template) {
  // Implementation
}
```

## Review Process

### What We Look For

- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code readable and maintainable?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the code well-documented?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security vulnerabilities?

### Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log or debug code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Security implications considered

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code review and feedback

### Resources

- [Project README](./README.md)
- [API Documentation](./docs/reference/api.md)
- [Architecture Guide](./docs/guide/architecture.md)
- [Troubleshooting Guide](./docs/guide/troubleshooting.md)

## Recognition

Contributors are recognized in:
- Project README
- Release notes
- Contributor hall of fame

Thank you for contributing to Agentik! Your contributions help make artificial life simulation accessible to everyone.
